-- AlterTable
ALTER TABLE "Applicant" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "companyId" INTEGER,
ADD COLUMN     "profilePhoto" TEXT,
ADD COLUMN     "resumeOriginalName" TEXT,
ADD COLUMN     "skills" TEXT[];

-- CreateTable
CREATE TABLE "Company" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Applicant" ADD CONSTRAINT "Applicant_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
