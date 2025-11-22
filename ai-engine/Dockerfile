# Gunakan image Python yang ringan
FROM python:3.10-slim

# Setup user non-root agar lebih aman (Security Best Practice)
RUN useradd -m aiuser
WORKDIR /app

# Install dependencies sistem yang mungkin dibutuhkan untuk psycopg2 (database)
RUN apt-get update && apt-get install -y \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements terlebih dahulu agar Docker bisa men-cache layer ini
COPY requirements.txt .

# Install library Python
RUN pip install --no-cache-dir -r requirements.txt

# Copy seluruh kode source code ke dalam container
COPY . .

# Ubah kepemilikan folder ke user non-root
RUN chown -R aiuser:aiuser /app

# Ganti user ke non-root
USER aiuser

# Command default (akan di-override oleh docker-compose)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
