-- AlterTable
ALTER TABLE "journal_entry_lines" ADD COLUMN     "vat_amount" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "vat_base" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "vat_rate" DECIMAL(5,2);
