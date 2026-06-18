/*
  Warnings:

  - A unique constraint covering the columns `[banName]` on the table `BanType` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "BanType_banName_key" ON "BanType"("banName");
