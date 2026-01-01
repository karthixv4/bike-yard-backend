-- DropForeignKey
ALTER TABLE "Inspection" DROP CONSTRAINT "Inspection_mechanicId_fkey";

-- AlterTable
ALTER TABLE "Inspection" ALTER COLUMN "mechanicId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Inspection" ADD CONSTRAINT "Inspection_mechanicId_fkey" FOREIGN KEY ("mechanicId") REFERENCES "MechanicProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
