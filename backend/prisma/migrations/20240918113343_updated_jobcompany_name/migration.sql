-- AlterTable
ALTER TABLE "Job" ADD COLUMN     "companyname" TEXT NOT NULL DEFAULT 'Unknown',
ADD COLUMN     "salary" INTEGER NOT NULL DEFAULT 0;
