-- CreateTable
CREATE TABLE "trial_demos" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT,
    "before_image_url" TEXT NOT NULL,
    "before_public_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "trial_demo_variants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trial_demo_id" TEXT NOT NULL,
    "style_name" TEXT NOT NULL,
    "after_image_url" TEXT NOT NULL,
    "after_public_id" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "trial_demo_variants_trial_demo_id_fkey" FOREIGN KEY ("trial_demo_id") REFERENCES "trial_demos" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "gallery_items" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT,
    "before_image_url" TEXT NOT NULL,
    "before_public_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "gallery_variants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "gallery_item_id" TEXT NOT NULL,
    "style_name" TEXT NOT NULL,
    "style_category" TEXT,
    "after_image_url" TEXT NOT NULL,
    "after_public_id" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "gallery_variants_gallery_item_id_fkey" FOREIGN KEY ("gallery_item_id") REFERENCES "gallery_items" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "trial_demo_variants_trial_demo_id_idx" ON "trial_demo_variants"("trial_demo_id");

-- CreateIndex
CREATE INDEX "gallery_items_is_active_idx" ON "gallery_items"("is_active");

-- CreateIndex
CREATE INDEX "gallery_variants_gallery_item_id_idx" ON "gallery_variants"("gallery_item_id");
