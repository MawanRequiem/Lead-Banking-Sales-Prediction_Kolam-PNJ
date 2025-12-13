CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- CreateTable
CREATE TABLE "jenis_kelamin" (
    "id_jenis_kelamin" VARCHAR(10) NOT NULL,
    "nama_jenis_kelamin" VARCHAR(20) NOT NULL,

    CONSTRAINT "jenis_kelamin_pkey" PRIMARY KEY ("id_jenis_kelamin")
);

-- CreateTable
CREATE TABLE "status_pernikahan" (
    "id_status_pernikahan" VARCHAR(20) NOT NULL,
    "nama_status" VARCHAR(50) NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "status_pernikahan_pkey" PRIMARY KEY ("id_status_pernikahan")
);

-- CreateTable
CREATE TABLE "status_deposito" (
    "id_status_deposito" VARCHAR(20) NOT NULL,
    "nama_status" VARCHAR(50) NOT NULL,
    "deskripsi" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "status_deposito_pkey" PRIMARY KEY ("id_status_deposito")
);

-- CreateTable
CREATE TABLE "admin" (
    "id_admin" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "email_recovery" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "id_user" UUID NOT NULL,

    CONSTRAINT "admin_pkey" PRIMARY KEY ("id_admin")
);

-- CreateTable
CREATE TABLE "sales" (
    "id_sales" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "nama" VARCHAR(255) NOT NULL,
    "nomor_telepon" TEXT,
    "domisili" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "id_user" UUID NOT NULL,

    CONSTRAINT "sales_pkey" PRIMARY KEY ("id_sales")
);

-- CreateTable
CREATE TABLE "deposito" (
    "id_deposito" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "id_nasabah" UUID NOT NULL,
    "jenis_deposito" VARCHAR(50) NOT NULL,
    "status_deposito" VARCHAR(20) NOT NULL,
    "id_nasabah_ref" VARCHAR(255),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "deposito_pkey" PRIMARY KEY ("id_deposito")
);

-- CreateTable
CREATE TABLE "histori_telepon" (
    "id_histori" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "id_nasabah" UUID NOT NULL,
    "id_sales" UUID NOT NULL,
    "tanggal_telepon" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lama_telepon" INTEGER,
    "hasil_telepon" TEXT,
    "jumlah_telepon" INTEGER NOT NULL DEFAULT 1,
    "catatan" TEXT,
    "next_followup_date" DATE,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "histori_telepon_pkey" PRIMARY KEY ("id_histori"),
    CONSTRAINT "chk_histori_jumlah_telepon" CHECK ("jumlah_telepon" >= 1),
    CONSTRAINT "chk_histori_lama_telepon" CHECK ("lama_telepon" >= 0)
);

-- CreateTable
CREATE TABLE "sales_nasabah_assignment" (
    "id_assignment" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "id_sales" UUID NOT NULL,
    "id_nasabah" UUID NOT NULL,
    "tanggal_assignment" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "sales_nasabah_assignment_pkey" PRIMARY KEY ("id_assignment")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "token" UUID NOT NULL DEFAULT gen_random_uuid(),
    "expires_at" TIMESTAMP(6) NOT NULL,
    "revoked_at" TIMESTAMP(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "replaced_by" UUID,
    "id_user" UUID NOT NULL,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("token")
);

-- CreateTable
CREATE TABLE "user" (
    "id_user" UUID NOT NULL DEFAULT gen_random_uuid(),
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login" TIMESTAMP(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "modified_at" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "user_pkey" PRIMARY KEY ("id_user")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" VARCHAR(100) NOT NULL,
    "timestamp" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" UUID,
    "user_role" VARCHAR(50),
    "action_type" VARCHAR(100) NOT NULL,
    "resource_type" VARCHAR(100),
    "resource_id" VARCHAR(100),
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "request_method" VARCHAR(10),
    "request_path" TEXT,
    "status_code" INTEGER,
    "request_body" JSONB,
    "response_body" JSONB,
    "changes" JSONB,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_logs" (
    "id" VARCHAR(100) NOT NULL,
    "timestamp" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "event_type" VARCHAR(100) NOT NULL,
    "severity" VARCHAR(20) NOT NULL,
    "user_id" UUID,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "details" JSONB,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "security_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_verifications" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "id_user" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(6) NOT NULL,
    "used_at" TIMESTAMPTZ(6),

    CONSTRAINT "password_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nasabah" (
    "id_nasabah" UUID NOT NULL DEFAULT uuid_generate_v4(),
    "nama" VARCHAR(255) NOT NULL,
    "umur" SMALLINT,
    "pekerjaan" VARCHAR(255),
    "domisili" TEXT,
    "gaji" DECIMAL(15,2),
    "id_status_pernikahan" VARCHAR(20),
    "jenis_kelamin" VARCHAR(10),
    "skor_prediksi" DECIMAL(5,4),
    "last_scored_at" TIMESTAMPTZ(6),
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),
    "nomor_telepon" TEXT,

    CONSTRAINT "nasabah_pkey" PRIMARY KEY ("id_nasabah"),
    CONSTRAINT "chk_nasabah_gaji" CHECK ("gaji" >= 0::numeric),
    CONSTRAINT "chk_nasabah_skor" CHECK ("skor_prediksi" >= 0::numeric AND "skor_prediksi" <= 1::numeric),
    CONSTRAINT "chk_nasabah_umur" CHECK ("umur" >= 17 AND "umur" <= 120)
);

-- CreateIndex
CREATE UNIQUE INDEX "jenis_kelamin_nama_jenis_kelamin_key" ON "jenis_kelamin"("nama_jenis_kelamin");

-- CreateIndex
CREATE UNIQUE INDEX "status_pernikahan_nama_status_key" ON "status_pernikahan"("nama_status");

-- CreateIndex
CREATE UNIQUE INDEX "status_deposito_nama_status_key" ON "status_deposito"("nama_status");

-- CreateIndex
CREATE INDEX "idx_histori_nasabah" ON "histori_telepon"("id_nasabah");

-- CreateIndex
CREATE INDEX "idx_histori_nasabah_tanggal" ON "histori_telepon"("id_nasabah", "tanggal_telepon" DESC);

-- CreateIndex
CREATE INDEX "idx_histori_sales" ON "histori_telepon"("id_sales");

-- CreateIndex
CREATE INDEX "idx_histori_sales_tanggal" ON "histori_telepon"("id_sales", "tanggal_telepon" DESC);

-- CreateIndex
CREATE INDEX "idx_histori_tanggal" ON "histori_telepon"("tanggal_telepon" DESC);

-- CreateIndex
CREATE INDEX "idx_assignment_active" ON "sales_nasabah_assignment"("is_active", "tanggal_assignment" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "uq_sales_nasabah_active" ON "sales_nasabah_assignment"("id_sales", "id_nasabah", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE INDEX "idx_audit_logs_action_type" ON "audit_logs"("action_type");

-- CreateIndex
CREATE INDEX "idx_audit_logs_ip_address" ON "audit_logs"("ip_address");

-- CreateIndex
CREATE INDEX "idx_audit_logs_resource_id" ON "audit_logs"("resource_id");

-- CreateIndex
CREATE INDEX "idx_audit_logs_timestamp" ON "audit_logs"("timestamp" DESC);

-- CreateIndex
CREATE INDEX "idx_audit_logs_user_id" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "idx_security_logs_event_type" ON "security_logs"("event_type");

-- CreateIndex
CREATE INDEX "idx_security_logs_severity" ON "security_logs"("severity");

-- CreateIndex
CREATE INDEX "idx_security_logs_timestamp" ON "security_logs"("timestamp" DESC);

-- CreateIndex
CREATE INDEX "idx_security_logs_user_id" ON "security_logs"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "password_verifications_token_key" ON "password_verifications"("token");

-- CreateIndex
CREATE INDEX "idx_password_verifications_expires_at" ON "password_verifications"("expires_at");

-- CreateIndex
CREATE INDEX "idx_password_verifications_id_user" ON "password_verifications"("id_user");

-- AddForeignKey
ALTER TABLE "admin" ADD CONSTRAINT "admin_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "user"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "user"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deposito" ADD CONSTRAINT "fk_deposito_nasabah" FOREIGN KEY ("id_nasabah") REFERENCES "nasabah"("id_nasabah") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deposito" ADD CONSTRAINT "fk_deposito_status" FOREIGN KEY ("status_deposito") REFERENCES "status_deposito"("id_status_deposito") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "histori_telepon" ADD CONSTRAINT "fk_histori_nasabah" FOREIGN KEY ("id_nasabah") REFERENCES "nasabah"("id_nasabah") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "histori_telepon" ADD CONSTRAINT "fk_histori_sales" FOREIGN KEY ("id_sales") REFERENCES "sales"("id_sales") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_nasabah_assignment" ADD CONSTRAINT "fk_assignment_nasabah" FOREIGN KEY ("id_nasabah") REFERENCES "nasabah"("id_nasabah") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales_nasabah_assignment" ADD CONSTRAINT "fk_assignment_sales" FOREIGN KEY ("id_sales") REFERENCES "sales"("id_sales") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_id_user_fkey" FOREIGN KEY ("id_user") REFERENCES "user"("id_user") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_replaced_by_fkey" FOREIGN KEY ("replaced_by") REFERENCES "refresh_tokens"("token") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "password_verifications" ADD CONSTRAINT "fk_password_verifications_user" FOREIGN KEY ("id_user") REFERENCES "user"("id_user") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "nasabah" ADD CONSTRAINT "fk_nasabah_jenis_kelamin" FOREIGN KEY ("jenis_kelamin") REFERENCES "jenis_kelamin"("id_jenis_kelamin") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "nasabah" ADD CONSTRAINT "fk_nasabah_status_pernikahan" FOREIGN KEY ("id_status_pernikahan") REFERENCES "status_pernikahan"("id_status_pernikahan") ON DELETE SET NULL ON UPDATE CASCADE;
