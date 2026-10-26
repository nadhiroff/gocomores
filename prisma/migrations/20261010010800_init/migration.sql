-- CreateTable
CREATE TABLE `islands` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(80) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `local_name` VARCHAR(120) NOT NULL,
    `color` VARCHAR(9) NOT NULL,

    UNIQUE INDEX `islands_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `categories` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(80) NOT NULL,
    `name` VARCHAR(120) NOT NULL,
    `icon` VARCHAR(60) NOT NULL,

    UNIQUE INDEX `categories_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `places` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `slug` VARCHAR(160) NOT NULL,
    `name` VARCHAR(200) NOT NULL,
    `summary` VARCHAR(400) NOT NULL,
    `history` TEXT NOT NULL,
    `practical_info` JSON NOT NULL,
    `lat` DOUBLE NOT NULL,
    `lng` DOUBLE NOT NULL,
    `google_maps_url` VARCHAR(500) NULL,
    `status` ENUM('VERIFIED', 'TO_CONFIRM') NOT NULL DEFAULT 'TO_CONFIRM',
    `verified_at` DATETIME(3) NULL,
    `cover_image` VARCHAR(500) NULL,
    `cover_alt` VARCHAR(300) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,
    `island_id` INTEGER NOT NULL,
    `category_id` INTEGER NOT NULL,

    UNIQUE INDEX `places_slug_key`(`slug`),
    INDEX `places_island_id_idx`(`island_id`),
    INDEX `places_category_id_idx`(`category_id`),
    INDEX `places_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `place_images` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `place_id` INTEGER NOT NULL,
    `url` VARCHAR(500) NOT NULL,
    `alt` VARCHAR(300) NOT NULL,
    `order` INTEGER NOT NULL DEFAULT 0,

    INDEX `place_images_place_id_idx`(`place_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `reviews` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `author_name` VARCHAR(60) NOT NULL,
    `rating` TINYINT NOT NULL,
    `comment` VARCHAR(1000) NOT NULL,
    `ip_hash` VARCHAR(64) NOT NULL,
    `place_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `reviews_place_id_idx`(`place_id`),
    INDEX `reviews_created_at_idx`(`created_at`),
    INDEX `reviews_ip_hash_created_at_idx`(`ip_hash`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `contact_messages` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(200) NOT NULL,
    `subject` VARCHAR(200) NOT NULL,
    `message` TEXT NOT NULL,
    `ip_hash` VARCHAR(64) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `contact_messages_ip_hash_created_at_idx`(`ip_hash`, `created_at`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `site_alerts` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `message` VARCHAR(400) NOT NULL,
    `link` VARCHAR(300) NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `guides` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(120) NOT NULL,
    `island_id` INTEGER NOT NULL,
    `phone` VARCHAR(40) NOT NULL,
    `languages` VARCHAR(200) NOT NULL,

    INDEX `guides_island_id_idx`(`island_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `places` ADD CONSTRAINT `places_island_id_fkey` FOREIGN KEY (`island_id`) REFERENCES `islands`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `places` ADD CONSTRAINT `places_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `place_images` ADD CONSTRAINT `place_images_place_id_fkey` FOREIGN KEY (`place_id`) REFERENCES `places`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_place_id_fkey` FOREIGN KEY (`place_id`) REFERENCES `places`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `guides` ADD CONSTRAINT `guides_island_id_fkey` FOREIGN KEY (`island_id`) REFERENCES `islands`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
