/*
  Warnings:

  - Added the required column `competencyId` to the `Case` table without a default value. This is not possible if the table is not empty.
  - Added the required column `learningObjectivesJson` to the `Case` table without a default value. This is not possible if the table is not empty.

*/

-- CreateTable
CREATE TABLE "Competency" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "desc" TEXT NOT NULL,

    CONSTRAINT "Competency_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Competency_name_key" ON "Competency"("name");

-- Insert default competencies
INSERT INTO "Competency" ("id", "name", "desc") VALUES 
('cmg7ah5900011c9gl7z9lperd', 'Engagement', 'Building relationships and establishing rapport with clients'),
('cmg7ah5900011c9gl7z9lperf', 'Ethics', 'Understanding and applying professional ethical standards'),
('cmg7ah5900011c9gl7z9lperg', 'Diversity', 'Working effectively with diverse populations and cultural contexts');

-- AlterTable - Add columns with default values first
ALTER TABLE "Case" ADD COLUMN "competencyId" TEXT,
ADD COLUMN "learningObjectivesJson" JSONB;

-- Update existing cases to have default competency and learning objectives
UPDATE "Case" SET 
  "competencyId" = 'cmg7ah5900011c9gl7z9lperd',
  "learningObjectivesJson" = '["Develop effective communication skills", "Practice active listening", "Build rapport with clients"]'
WHERE "competencyId" IS NULL;

-- Now make the columns NOT NULL
ALTER TABLE "Case" ALTER COLUMN "competencyId" SET NOT NULL;
ALTER TABLE "Case" ALTER COLUMN "learningObjectivesJson" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Case_competencyId_idx" ON "Case"("competencyId");

-- AddForeignKey
ALTER TABLE "Case" ADD CONSTRAINT "Case_competencyId_fkey" FOREIGN KEY ("competencyId") REFERENCES "Competency"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
