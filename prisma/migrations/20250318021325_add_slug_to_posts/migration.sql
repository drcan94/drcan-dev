/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `BlogPost` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slug` to the `BlogPost` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
-- Önce NULL olarak ekliyoruz
ALTER TABLE "BlogPost" ADD COLUMN "slug" TEXT;

-- Mevcut yazılar için başlıklarını kullanarak slug oluşturuyoruz
UPDATE "BlogPost" SET "slug" = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(title, '[^a-zA-Z0-9]+', '-', 'g'), '^-|-$', '', 'g'));

-- Tekrarlanan slugları önlemek için blog ID'lerini ekleyelim
UPDATE "BlogPost" SET "slug" = CONCAT("slug", '-', id) WHERE id IN (
    SELECT id FROM "BlogPost" WHERE "slug" IN (
        SELECT "slug" FROM "BlogPost" GROUP BY "slug" HAVING COUNT(*) > 1
    )
);

-- Şimdi NOT NULL kısıtı ekleyelim
ALTER TABLE "BlogPost" ALTER COLUMN "slug" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");

-- CreateIndex
CREATE INDEX "BlogPost_slug_idx" ON "BlogPost"("slug");
