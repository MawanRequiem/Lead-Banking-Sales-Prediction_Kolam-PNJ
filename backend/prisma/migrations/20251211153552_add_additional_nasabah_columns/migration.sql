-- AlterTable
ALTER TABLE "nasabah" ADD COLUMN     "has_pinjaman" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pendidikan" TEXT,
ADD COLUMN     "saldo" DECIMAL(15,2);
