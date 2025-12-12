import os
import time
import psycopg2
import uuid
from dotenv import load_dotenv

# Load environment
load_dotenv()

# Konfigurasi Database (Pastikan .env sudah berisi URL Supabase/Local yang benar)
DB_URL = os.getenv("DATABASE_URL")

def test_integration():
    print("🚀 Memulai Integration Test AI Engine...")

    try:
        conn = psycopg2.connect(DB_URL)
        cursor = conn.cursor()
    except Exception as e:
        print(f"❌ Gagal koneksi ke database: {e}")
        return

    # 1. SETUP: Buat Data Nasabah Dummy (Belum discoring)
    test_id = str(uuid.uuid4())
    print(f"[*] Membuat nasabah dummy dengan ID: {test_id}")

    try:
        # Insert data nasabah mentah
        # Asumsi: Tabel lookup (jenis_kelamin 'L', status_pernikahan 'BELUM_MENIKAH') sudah ada dari seed.js
        cursor.execute("""
            INSERT INTO public.nasabah
            (id_nasabah, nama, umur, pekerjaan, gaji, id_status_pernikahan, jenis_kelamin, last_scored_at, created_at, updated_at)
            VALUES
            (%s, 'Test Automation User', 29, 'Programmer', 15000000, 'BELUM_MENIKAH', 'L', NULL, NOW(), NOW())
        """, (test_id,))
        conn.commit()
        print(f"[+] Data berhasil diinsert. Menunggu AI Engine melakukan scoring...")
        print(f"    (Silakan jalankan perintah manual trigger di terminal lain sekarang!)")

    except Exception as e:
        print(f"❌ Gagal insert data test: {e}")
        conn.rollback()
        conn.close()
        return

    # 2. VERIFIKASI: Polling Database setiap detik
    try:
        start_time = time.time()
        timeout = 60 # Tunggu maksimal 60 detik

        while (time.time() - start_time) < timeout:
            # Cek apakah skor sudah masuk
            cursor.execute("SELECT skor_prediksi, last_scored_at FROM public.nasabah WHERE id_nasabah = %s", (test_id,))
            result = cursor.fetchone()

            if result and result[0] is not None:
                score = result[0]
                scored_at = result[1]

                print("\n✅ SUCCESS! Nasabah berhasil discoring.")
                print(f"   >> Skor Prediksi: {score}")
                print(f"   >> Waktu Scoring: {scored_at}")

                # 3. CLEANUP: Hapus data sampah
                cursor.execute("DELETE FROM public.nasabah WHERE id_nasabah = %s", (test_id,))
                conn.commit()
                print("[*] Data dummy telah dibersihkan dari database.")
                return

            # Print indikator loading
            print(".", end="", flush=True)
            time.sleep(2)

        print("\n❌ TIMEOUT: Scoring tidak terjadi dalam 60 detik.")
        print("   Kemungkinan worker error atau tidak jalan.")

        # Cleanup data jika timeout
        cursor.execute("DELETE FROM public.nasabah WHERE id_nasabah = %s", (test_id,))
        conn.commit()

    except KeyboardInterrupt:
        print("\nTest dibatalkan user.")
    finally:
        cursor.close()
        conn.close()

if __name__ == "__main__":
    test_integration()
