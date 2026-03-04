/*
  Warnings:

  - You are about to drop the column `chamberType` on the `BoardMember` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `BoardMember` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BoardMember" DROP COLUMN "chamberType",
DROP COLUMN "order";
