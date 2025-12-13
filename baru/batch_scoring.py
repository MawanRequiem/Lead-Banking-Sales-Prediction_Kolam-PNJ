import os
import logging
import joblib
import pandas as pd
import psycopg2
import re
from decimal import Decimal
from psycopg2.extras import execute_values
from dotenv import load_dotenv

# Import Feature Engineering
from prediction_feature_engineering import apply_feature_engineering

load_dotenv()

logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO
)
logger = logging.getLogger("batch-scorer")

DB_URL = os.getenv("DATABASE_URL")
MODEL_PATH = "model.pkl"
PREPROCESSOR_PATH = "preprocessor.pkl"
BATCH_SIZE = 1000

def get_db_connection():
    try:
        return psycopg2.connect(DB_URL)
    except Exception as e:
        logger.critical(f"Gagal koneksi ke Database: {e}")
        raise e

def load_artifacts():
    model = None
    preprocessor = None
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
    if os.path.exists(PREPROCESSOR_PATH):
        preprocessor = joblib.load(PREPROCESSOR_PATH)
    return model, preprocessor

def detect_contact_type(nomor: str | None) -> str:
    if not nomor:
        return "unknown"
    nomor = str(nomor).replace(" ", "").replace("-", "")
    if re.match(r"^(?:\+?628|08)\d+$", nomor):
        return "cellular"
    if re.match(r"^0[2-9]\d{7,11}$", nomor):
        return "telephone"
    return "unknown"

def prepare_features_from_db(rows):
    """
    Mapping hasil Query Database Kompleks ke Format DataFrame Model.
    """

    # Mapping
    job_map = {
        "PNS": "admin.", "Wiraswasta": "entrepreneur", "Ibu Rumah Tangga": "housemaid",
        "Manager": "management", "Pensiunan": "retired", "Mahasiswa": "student",
        "Buruh": "blue-collar", "Tidak Bekerja": "unemployed"
    }
    marital_map = {
        "MENIKAH": "married", "BELUM MENIKAH": "single",
        "CERAI-HIDUP": "divorced", "CERAI-MATI": "divorced",
        "Menikah": "married", "Belum Menikah": "single", "Cerai": "divorced"
    }
    month_map = {
        1: "jan", 2: "feb", 3: "mar", 4: "apr",
        5: "may", 6: "jun", 7: "jul", 8: "aug",
        9: "sep", 10: "oct", 11: "nov", 12: "dec"
    }
    education_map = {
        "SD": "primary", "SMP": "secondary", "SMA": "secondary",
        "S1": "tertiary", "S2": "tertiary", "S3": "tertiary",
    }
    poutcome_map = {
        "Tertarik": "success", "Tidak Tertarik": "failure",
    }

    data = []
    for row in rows:
        # Unpack tuple (Perhatikan urutan SELECT di query bawah)
        # Saya menambahkan 'nama' di index ke-1
        (
            id_nasabah, nama, umur, pekerjaan, pendidikan, id_status_pernikahan,
            saldo, has_kpr, has_pinjaman, has_defaulted,
            nomor_telepon,
            last_call_date, campaign, previous, pdays, poutcome
        ) = row

        # --- safe casting ---
        saldo_val = float(saldo) if isinstance(saldo, (float, int, Decimal)) else 0.0
        campaign_val = int(campaign or 0)
        previous_val = int(previous or 0)
        pdays_val = int(pdays) if pdays is not None else -1

        # --- date handling ---
        if last_call_date:
            day = last_call_date.day
            month = month_map.get(last_call_date.month, "may")
        else:
            day = 15
            month = "may"

        contact_type = detect_contact_type(nomor_telepon)

        data.append({
            "age": int(umur or 0),
            "job": job_map.get(pekerjaan, "unknown"),
            "marital": marital_map.get(id_status_pernikahan, "single"),
            "balance": saldo_val,
            "education": education_map.get(pendidikan, "unknown"),
            "default": "yes" if has_defaulted else "no",
            "housing": "yes" if has_kpr else "no",
            "loan": "yes" if has_pinjaman else "no",
            "contact": contact_type,
            "day": day,
            "month": month,
            "campaign": campaign_val,
            "pdays": pdays_val,
            "previous": previous_val,
            "poutcome": poutcome_map.get(poutcome, "unknown")
        })

    return pd.DataFrame(data)

def run_batch_scoring():
    logger.info("🚀 Memulai Batch Scoring (Logic Database Baru)...")

    model, preprocessor = load_artifacts()
    if not model or not preprocessor:
        logger.critical("STOP: Model/Preprocessor tidak ditemukan.")
        return

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
    except Exception as e:
        logger.critical(f"DB Connection failed: {e}")
        return

    total_processed = 0

    try:
        while True:
            # Query Kompleks (CTE)
            # Perubahan: Menambahkan n.nama di SELECT agar bisa di-log
            query = """
                WITH histo AS (
                    SELECT
                        n.id_nasabah,
                        n.umur,
                        n.nomor_telepon,
                        n.pekerjaan,
                        n.pendidikan,
                        n.id_status_pernikahan,
                        n.saldo,
                        n.has_kpr,
                        n.has_pinjaman,
                        n.has_defaulted,
                        h.tanggal_telepon
                    FROM nasabah n
                    LEFT JOIN histori_telepon h ON n.id_nasabah = h.id_nasabah
                    WHERE n.last_scored_at IS NULL AND n.deleted_at IS NULL
                ),

                last_call AS (
                    SELECT
                        id_nasabah,
                        MAX(tanggal_telepon) AS last_call_date
                    FROM histo
                    GROUP BY id_nasabah
                ),

                campaign_counts AS (
                    SELECT
                        h.id_nasabah,
                        COUNT(*) AS campaign
                    FROM histo h
                    JOIN last_call lc ON h.id_nasabah = lc.id_nasabah
                    WHERE DATE_TRUNC('month', h.tanggal_telepon)
                          = DATE_TRUNC('month', lc.last_call_date)
                    GROUP BY h.id_nasabah
                ),

                previous_calls AS (
                    SELECT
                        h.id_nasabah,
                        COUNT(*) AS previous
                    FROM histo h
                    JOIN last_call lc ON h.id_nasabah = lc.id_nasabah
                    WHERE h.tanggal_telepon < lc.last_call_date
                    GROUP BY h.id_nasabah
                ),

                pdays_calc AS (
                    SELECT DISTINCT ON (h.id_nasabah)
                        h.id_nasabah,
                        EXTRACT(DAY FROM (CURRENT_DATE - h.tanggal_telepon)) AS pdays
                    FROM histo h
                    JOIN last_call lc ON h.id_nasabah = lc.id_nasabah
                    WHERE h.tanggal_telepon < lc.last_call_date
                    ORDER BY h.id_nasabah, h.tanggal_telepon DESC
                )

                SELECT
                    n.id_nasabah,
                    n.nama,            -- <--- DITAMBAHKAN: Untuk Logging
                    n.umur,
                    n.pekerjaan,
                    n.pendidikan,
                    n.id_status_pernikahan,
                    n.saldo,
                    n.has_kpr,
                    n.has_pinjaman,
                    n.has_defaulted,
                    n.nomor_telepon,

                    lc.last_call_date,
                    COALESCE(cc.campaign, 0) AS campaign,
                    COALESCE(pc.previous, 0) AS previous,
                    COALESCE(p.pdays, -1) AS pdays,

                    (
                        SELECT h2.hasil_telepon
                        FROM histori_telepon h2
                        WHERE h2.id_nasabah = n.id_nasabah
                        ORDER BY h2.tanggal_telepon DESC
                        OFFSET 1 LIMIT 1
                    ) AS poutcome

                FROM nasabah n
                LEFT JOIN last_call lc ON n.id_nasabah = lc.id_nasabah
                LEFT JOIN campaign_counts cc ON n.id_nasabah = cc.id_nasabah
                LEFT JOIN previous_calls pc ON n.id_nasabah = pc.id_nasabah
                LEFT JOIN pdays_calc p ON n.id_nasabah = p.id_nasabah
                WHERE n.last_scored_at IS NULL AND n.deleted_at IS NULL
                LIMIT %s;
            """

            cursor.execute(query, (BATCH_SIZE,))
            rows = cursor.fetchall()

            if not rows:
                logger.info("✅ Tidak ada data baru.")
                break

            logger.info(f"🔄 Memproses {len(rows)} data...")

            try:
                # 1. Pipeline Data & FE
                df_raw = prepare_features_from_db(rows)
                df_fe = apply_feature_engineering(df_raw)

                # 2. Preprocess & Predict
                X_processed = preprocessor.transform(df_fe)
                probabilities = model.predict_proba(X_processed)[:, 1]

            except Exception as e:
                logger.error(f"❌ Error Pipeline: {e}")
                if 'df_raw' in locals() and not df_raw.empty:
                     logger.error(f"Sample data: {df_raw.iloc[0].to_dict()}")
                break

            # 3. Update DB & Logging Per Line
            update_values = []
            for i, prob in enumerate(probabilities):
                skor_final = float(prob)
                id_nsb = rows[i][0]
                nama_nsb = rows[i][1] # Ambil nama dari index 1

                # --- LOGGER PER LINE ---
                logger.info(f"👤 Nasabah: {nama_nsb} | Skor: {skor_final:.4f}")

                update_values.append((skor_final, id_nsb))

            update_query = """
                UPDATE public.nasabah AS n
                SET skor_prediksi = v.skor,
                    last_scored_at = NOW(),
                    updated_at = NOW()
                FROM (VALUES %s) AS v(skor, id)
                WHERE n.id_nasabah = v.id::uuid
            """
            execute_values(cursor, update_query, update_values)
            conn.commit()

            total_processed += len(rows)
            logger.info(f"✨ Batch selesai. Total: {total_processed}")

    except Exception as e:
        conn.rollback()
        logger.error(f"❌ Critical Error: {e}")
    finally:
        if cursor: cursor.close()
        if conn: conn.close()
        logger.info("🔌 Koneksi database ditutup.")

if __name__ == "__main__":
    run_batch_scoring()
