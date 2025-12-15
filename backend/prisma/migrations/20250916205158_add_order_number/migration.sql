/*
  Warnings:

  - A unique constraint covering the columns `[order_number]` on the table `orders` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `order_number` to the table `orders` table without a default value. This is not possible if the table is not empty.

*/

-- Добавляем колонку order_number как nullable сначала
ALTER TABLE "orders" ADD COLUMN "order_number" TEXT;

-- Заполняем существующие записи уникальными номерами
-- Используем подзапрос для генерации порядкового номера
UPDATE "orders" 
SET "order_number" = CONCAT(
  TO_CHAR("created_at", 'DDMMYYYY'),
  TO_CHAR("created_at", 'HH24MISS'),
  '_',
  LPAD(
    (SELECT COUNT(*) + 1 
     FROM "orders" o2 
     WHERE o2."created_at" <= "orders"."created_at" 
     AND o2."id" != "orders"."id"
    )::TEXT, 
    4, '0'
  )
)
WHERE "order_number" IS NULL;

-- Делаем колонку NOT NULL
ALTER TABLE "orders" ALTER COLUMN "order_number" SET NOT NULL;

-- Создаем уникальный индекс
CREATE UNIQUE INDEX "orders_order_number_key" ON "orders"("order_number");