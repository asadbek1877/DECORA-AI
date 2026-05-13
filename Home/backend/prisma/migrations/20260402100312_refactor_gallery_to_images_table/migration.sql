/*
  Warnings:

  - You are about to drop the `gallery_variants` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `before_image_url` on the `gallery_items` table. All the data in the column will be lost.
  - You are about to drop the column `before_public_id` on the `gallery_items` table. All the data in the column will be lost.
  - You are about to drop the column `is_active` on the `gallery_items` table. All the data in the column will be lost.
  - You are about to drop the column `order` on the `gallery_items` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "gallery_variants_gallery_item_id_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "gallery_variants";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "gallery_images" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "item_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "style" TEXT,
    "path" TEXT NOT NULL,
    "public_id" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "gallery_images_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "gallery_items" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_gallery_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
INSERT INTO "new_gallery_items" ("created_at", "id", "title", "updated_at") SELECT "created_at", "id", "title", "updated_at" FROM "gallery_items";
DROP TABLE "gallery_items";
ALTER TABLE "new_gallery_items" RENAME TO "gallery_items";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "gallery_images_item_id_idx" ON "gallery_images"("item_id");

-- CreateIndex
CREATE INDEX "gallery_images_item_id_type_style_idx" ON "gallery_images"("item_id", "type", "style");
