/*
  Warnings:

  - You are about to drop the column `institution` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `projectType` on the `Project` table. All the data in the column will be lost.
  - You are about to drop the column `skillLevel` on the `Project` table. All the data in the column will be lost.
  - Added the required column `key` to the `Media` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Media" ADD COLUMN     "key" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Project" DROP COLUMN "institution",
DROP COLUMN "projectType",
DROP COLUMN "skillLevel",
ALTER COLUMN "description" DROP NOT NULL;
