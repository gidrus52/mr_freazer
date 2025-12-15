-- CreateTable
CREATE TABLE "advertisements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(10,2),
    "location" TEXT,
    "contact_info" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_premium" BOOLEAN NOT NULL DEFAULT false,
    "views" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "author_id" TEXT NOT NULL,
    "category_id" TEXT,

    CONSTRAINT "advertisements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advertisement_images" (
    "id" TEXT NOT NULL,
    "advertisement_id" TEXT NOT NULL,
    "url" TEXT,
    "data" TEXT,
    "type" TEXT,
    "alt" TEXT,
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "advertisement_images_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "sender_id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "advertisement_id" TEXT,
    "parent_message_id" TEXT,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "advertisements" ADD CONSTRAINT "advertisements_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advertisements" ADD CONSTRAINT "advertisements_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advertisement_images" ADD CONSTRAINT "advertisement_images_advertisement_id_fkey" FOREIGN KEY ("advertisement_id") REFERENCES "advertisements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_receiver_id_fkey" FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_advertisement_id_fkey" FOREIGN KEY ("advertisement_id") REFERENCES "advertisements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_parent_message_id_fkey" FOREIGN KEY ("parent_message_id") REFERENCES "messages"("id") ON DELETE SET NULL ON UPDATE CASCADE;
