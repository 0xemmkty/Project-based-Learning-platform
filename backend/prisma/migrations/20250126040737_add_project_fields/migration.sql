/*
  Warnings:

  - The primary key for the `_ProjectCollaborators` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `_ProjectToTag` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[A,B]` on the table `_ProjectCollaborators` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[A,B]` on the table `_ProjectToTag` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `institution` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `projectType` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Added the required column `skillLevel` to the `Project` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `Project` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Project" ADD COLUMN     "institution" TEXT NOT NULL,
ADD COLUMN     "projectType" TEXT NOT NULL,
ADD COLUMN     "skillLevel" TEXT NOT NULL,
ALTER COLUMN "description" SET NOT NULL;

-- AlterTable
ALTER TABLE "_ProjectCollaborators" DROP CONSTRAINT "_ProjectCollaborators_AB_pkey";

-- AlterTable
ALTER TABLE "_ProjectToTag" DROP CONSTRAINT "_ProjectToTag_AB_pkey";

-- CreateIndex
CREATE UNIQUE INDEX "_ProjectCollaborators_AB_unique" ON "_ProjectCollaborators"("A", "B");

-- CreateIndex
CREATE UNIQUE INDEX "_ProjectToTag_AB_unique" ON "_ProjectToTag"("A", "B");
