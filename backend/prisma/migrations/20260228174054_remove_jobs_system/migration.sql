/*
  Warnings:

  - You are about to drop the `JobApplication` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `JobOpportunity` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "JobApplication" DROP CONSTRAINT "JobApplication_jobOpportunityId_fkey";

-- DropTable
DROP TABLE "JobApplication";

-- DropTable
DROP TABLE "JobOpportunity";

-- DropEnum
DROP TYPE "ApplicationStatus";
