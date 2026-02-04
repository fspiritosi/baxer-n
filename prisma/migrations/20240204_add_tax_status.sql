-- CreateEnum
CREATE TYPE "tax_status" AS ENUM ('RESPONSABLE_INSCRIPTO', 'MONOTRIBUTO', 'EXENTO');

-- AlterTable
ALTER TABLE "companies" ADD COLUMN "tax_status" "tax_status";
