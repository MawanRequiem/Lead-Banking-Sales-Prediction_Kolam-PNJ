import logging
import sys
from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.triggers.cron import CronTrigger
from batch_scoring import run_batch_scoring

# Setup Logger agar output terlihat di Docker logs (Azure)
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
    stream=sys.stdout
)
logger = logging.getLogger("ai-scheduler")

def scheduled_job():
    logger.info("⏰ Trigger: Memulai Job Skoring Harian (Jam 02:00 WIB)...")
    try:
        run_batch_scoring()
        logger.info("✅ Job Skoring Harian Selesai.")
    except Exception as e:
        logger.error(f"❌ Job Skoring Gagal: {e}")

if __name__ == "__main__":
    # Inisialisasi Scheduler
    scheduler = BlockingScheduler()

    trigger = CronTrigger(hour=2, minute=0, timezone='Asia/Jakarta')

    scheduler.add_job(scheduled_job, trigger)

    logger.info("🚀 AI Worker Scheduler Berjalan.")
    logger.info("📅 Menunggu jadwal eksekusi berikutnya: Jam 02:00 WIB")

    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        pass
