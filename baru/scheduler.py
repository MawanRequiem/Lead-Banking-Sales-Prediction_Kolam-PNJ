import logging
import sys
from apscheduler.schedulers.blocking import BlockingScheduler
from batch_scoring import run_batch_scoring

# Setup Logger agar output terlihat di Docker logs
logging.basicConfig(
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    level=logging.INFO,
    stream=sys.stdout
)
logger = logging.getLogger("ai-scheduler")

def scheduled_job():
    logger.info("Trigger: Memulai Job Skoring Harian...")
    try:
        run_batch_scoring()
        logger.info("Job Skoring Selesai.")
    except Exception as e:
        logger.error(f"Job Skoring Gagal: {e}")

if __name__ == "__main__":
    scheduler = BlockingScheduler()

    # Jadwalkan setiap hari jam 02:00 Server Time
    scheduler.add_job(scheduled_job, 'cron', hour=2, minute=0)

    logger.info("AI Worker Scheduler Berjalan.")
    logger.info("Menunggu jadwal eksekusi berikutnya: Jam 02:00")

    try:
        scheduler.start()
    except (KeyboardInterrupt, SystemExit):
        pass
