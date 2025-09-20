/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `AnonMapping` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[anonName]` on the table `AnonMapping` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "AnonMapping_userId_key" ON "public"."AnonMapping"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "AnonMapping_anonName_key" ON "public"."AnonMapping"("anonName");
