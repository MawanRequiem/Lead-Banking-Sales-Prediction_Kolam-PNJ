import os
import logging
import joblib
import pandas as pd
import psycopg2
from psycopg2.extras import execute_values
from dotenv import load_dotenv

# Load environment
load_dotenv()

# Setup Logger
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO
)
logger = logging.getLogger("batch-scorer")

# Konfigurasi
DB_URL = os.getenv("DATABASE_URL")
MODEL_PATH = "bank_deposit_recommender_bundle.pkl"
BATCH_SIZE = 1000

def get_db_connection():
    try:
        return psycopg2.connect(DB_URL)
    except Exception as e:
        logger.critical(f"Gagal koneksi ke Database: {e}")
        raise e

def load_bundle():
    """Load seluruh isi pickle"""
    if os.path.exists(MODEL_PATH):
        try:
            logger.info(f"Loading bundle from {MODEL_PATH}...")
            bundle = joblib.load(MODEL_PATH)

            # Debug: Log keys untuk memastikan struktur
            if isinstance(bundle, dict):
                logger.info(f"Bundle keys detected: {list(bundle.keys())}")
            else:
                logger.info("Bundle is not a dict (Direct object).")

            return bundle
        except Exception as e:
            logger.error(f"Gagal load pickle: {e}")
    else:
        logger.error(f"File {MODEL_PATH} tidak ditemukan.")
    return None

def prepare_features_from_db(rows):
    # Mapping manual
    job_map = {
        "PNS": "admin.", "Wiraswasta": "entrepreneur", "Ibu Rumah Tangga": "housemaid",
        "Manager": "management", "Pensiunan": "retired", "Mahasiswa": "student",
        "Buruh": "blue-collar", "Tidak Bekerja": "unemployed"
    }
    marital_map = { "Menikah": "married", "Belum Menikah": "single", "Cerai": "divorced" }

    data = []
    for row in rows:
        # row: 0=id, 1=umur, 2=pekerjaan, 3=gaji, 4=status_pernikahan
        status_text = row[4] if row[4] else "single"

        data.append({
            "age": row[1],
            "job": job_map.get(row[2], "unknown"),
            "marital": marital_map.get(status_text, "single"),
            "balance": float(row[3] or 0) * 5,
            "education": "secondary",
            "default": "no",
            "housing": "yes",
            "loan": "no",
            "contact": "cellular",
            "day": 15,
            "month": "may",
            "duration": 0,
            "campaign": 1,
            "pdays": -1,
            "previous": 0,
            "poutcome": "unknown"
        })

    return pd.DataFrame(data)

def run_batch_scoring():
    bundle = load_bundle()
    if not bundle:
        return

    # STRATEGI EKSTRAKSI MODEL & PREPROCESSOR
    model = None
    preprocessor = None

    if isinstance(bundle, dict):
        # Coba ambil model
        model = bundle.get('model_cat') or bundle.get('model')

        # Coba ambil preprocessor (nama umum: preprocessor, scaler, encoder, pipeline)
        # Urutan prioritas pengecekan
        for key in ['preprocessor', 'transformer', 'pipeline', 'scaler']:
            if key in bundle:
                preprocessor = bundle[key]
                logger.info(f"Preprocessor found with key: '{key}'")
                break
    else:
        # Jika bundle langsung berupa objek model/pipeline
        model = bundle

    if not model:
        logger.critical("Model object not found in bundle!")
        return

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
    except Exception:
        return

    total_processed = 0

    try:
        while True:
            # 1. Query Data
            query = """
                SELECT n.id_nasabah, n.umur, n.pekerjaan, n.gaji, sp.nama_status
                FROM public.nasabah n
                LEFT JOIN public.status_pernikahan sp ON n.id_status_pernikahan = sp.id_status_pernikahan
                WHERE n.last_scored_at IS NULL AND n.deleted_at IS NULL
                LIMIT %s
            """
            cursor.execute(query, (BATCH_SIZE,))
            rows = cursor.fetchall()

            if not rows:
                logger.info("✅ Tidak ada data baru.")
                break

            logger.info(f"🔄 Memproses {len(rows)} data nasabah...")

            # 2. Preprocessing & Prediksi
            try:
                features_df = prepare_features_from_db(rows)

                # STEP PENTING: Jalankan Preprocessor jika ada
                if preprocessor:
                    # Transformasi data string -> angka
                    X_processed = preprocessor.transform(features_df)
                else:
                    # Jika tidak ada preprocessor, asumsi model terima raw data
                    X_processed = features_df

                # Prediksi
                probabilities = model.predict_proba(X_processed)[:, 1]

            except Exception as e:
                logger.error(f"❌ Error saat prediksi model: {e}")
                # Log struktur data untuk debugging
                if 'features_df' in locals():
                    logger.error(f"Contoh data input: {features_df.iloc[0].to_dict()}")
                break

            # 3. Update DB
            update_values = []
            for i, prob in enumerate(probabilities):
                update_values.append((float(prob), rows[i][0]))

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
        logger.error(f"❌ Critical error: {e}")
    finally:
        if cursor: cursor.close()
        if conn: conn.close()
        logger.info("🔌 Koneksi database ditutup.")

if __name__ == "__main__":
    run_batch_scoring()
