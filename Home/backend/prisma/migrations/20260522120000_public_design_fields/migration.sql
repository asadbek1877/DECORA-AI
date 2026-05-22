-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_projects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT,
    "original_image_url" TEXT NOT NULL,
    "original_public_id" TEXT,
    "style" TEXT,
    "style_name" TEXT,
    "prompt" TEXT,
    "room_type" TEXT,
    "status" TEXT NOT NULL DEFAULT 'UPLOADED',
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "share_token" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_projects" ("created_at", "deleted_at", "id", "is_deleted", "is_public", "original_image_url", "original_public_id", "room_type", "share_token", "status", "style", "updated_at", "user_id") SELECT "created_at", "deleted_at", "id", "is_deleted", "is_public", "original_image_url", "original_public_id", "room_type", "share_token", "status", "style", "updated_at", "user_id" FROM "projects";
DROP TABLE "projects";
ALTER TABLE "new_projects" RENAME TO "projects";
CREATE UNIQUE INDEX "projects_share_token_key" ON "projects"("share_token");
CREATE INDEX "projects_user_id_idx" ON "projects"("user_id");
CREATE INDEX "projects_is_public_idx" ON "projects"("is_public");
CREATE INDEX "projects_is_deleted_idx" ON "projects"("is_deleted");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;