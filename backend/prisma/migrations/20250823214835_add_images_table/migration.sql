/*
  Warnings:

  - You are about to drop the column `image_data` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `image_type` on the `products` table. All the data in the column will be lost.
  - You are about to drop the column `image_url` on the `products` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "products" DROP COLUMN "image_data",
DROP COLUMN "image_type",
DROP COLUMN "image_url";

-- CreateTable
CREATE TABLE "images" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "url" TEXT,
    "data" TEXT,
    "type" TEXT,
    "alt" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "images_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "images" ADD CONSTRAINT "images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
