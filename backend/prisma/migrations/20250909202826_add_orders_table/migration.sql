-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "product_id" TEXT NOT NULL,
    "customer_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
