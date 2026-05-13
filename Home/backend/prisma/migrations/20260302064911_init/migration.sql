-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "avatar_url" TEXT,
    "credits" INTEGER NOT NULL DEFAULT 3,
    "role" TEXT NOT NULL DEFAULT 'USER',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "original_image_url" TEXT NOT NULL,
    "original_public_id" TEXT,
    "style" TEXT,
    "room_type" TEXT,
    "status" TEXT NOT NULL DEFAULT 'UPLOADED',
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "share_token" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "generated_images" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "project_id" TEXT NOT NULL,
    "style_name" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "public_id" TEXT,
    "imageType" TEXT NOT NULL DEFAULT 'PREVIEW',
    "prompt" TEXT,
    "model_used" TEXT,
    "analysis" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "generated_images_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "projects_share_token_key" ON "projects"("share_token");

-- CreateIndex
CREATE INDEX "projects_user_id_idx" ON "projects"("user_id");

-- CreateIndex
CREATE INDEX "projects_is_public_idx" ON "projects"("is_public");

-- CreateIndex
CREATE INDEX "generated_images_project_id_idx" ON "generated_images"("project_id");

-- CreateIndex
CREATE INDEX "generated_images_imageType_idx" ON "generated_images"("imageType");
