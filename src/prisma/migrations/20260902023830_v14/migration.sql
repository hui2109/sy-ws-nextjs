/*
  Warnings:

  - You are about to drop the column `currentUserId` on the `LeaveApply` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "LeaveApply" DROP CONSTRAINT "LeaveApply_currentUserId_fkey";

-- AlterTable
ALTER TABLE "LeaveApply" DROP COLUMN "currentUserId",
ADD COLUMN     "applyUserId" INTEGER NOT NULL DEFAULT 19;

-- AddForeignKey
ALTER TABLE "LeaveApply" ADD CONSTRAINT "LeaveApply_applyUserId_fkey" FOREIGN KEY ("applyUserId") REFERENCES "Person"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
