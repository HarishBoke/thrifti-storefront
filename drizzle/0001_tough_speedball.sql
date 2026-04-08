CREATE TABLE `wishlists` (
	`id` int AUTO_INCREMENT NOT NULL,
	`customerEmail` varchar(320) NOT NULL,
	`productHandle` varchar(255) NOT NULL,
	`productId` varchar(255) NOT NULL,
	`productTitle` text,
	`productImage` text,
	`productPrice` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `wishlists_id` PRIMARY KEY(`id`)
);
