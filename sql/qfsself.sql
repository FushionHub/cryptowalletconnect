-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
-- Host: 127.0.0.1
-- Generation Time: Aug 19, 2025 at 07:01 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------
-- Database: `qfsself`
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
 /*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
 /*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
 /*!40101 SET NAMES utf8mb4 */;

-- --------------------------------------------------------
-- Table structure for table `users`
-- --------------------------------------------------------

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `two_factor_secret` varchar(255) DEFAULT NULL,
  `failed_attempts` int(11) DEFAULT 0,
  `last_failed_login` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Data for table `users`
INSERT INTO `users` (`id`, `username`, `email`, `password_hash`, `created_at`, `two_factor_secret`, `failed_attempts`, `last_failed_login`) VALUES
(1, 'chinedujunia', 'admin@admin.com', '$2y$10$lGLFXLEX7kxnPdoSam7rJuP6M8yvauFaODHKgZ6nTcUaHfkFC/c3S', '2025-08-11 14:50:27', NULL, 0, NULL),
(2, 'admin', 'admin@me.com', '$2y$10$G82F0o0WHeP0e7lZngnkf.WXw7dAm5flenO7LPhnzvxB7bQ3svTi2', '2025-08-18 13:58:49', NULL, 0, NULL);

-- --------------------------------------------------------
-- Table structure for table `wallets`
-- --------------------------------------------------------

CREATE TABLE `wallets` (
  `id` int(11) NOT NULL,
  `NAME` varchar(100) NOT NULL,
  `image_url` varchar(255) NOT NULL,
  `description` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Data for table `wallets`
INSERT INTO `wallets` (`id`, `NAME`, `image_url`, `description`) VALUES
(1, 'Trust', 'https://qfsselfcustody.com/images/wallets/0_trust.png', NULL),
(2, 'Metamask', 'https://qfsselfcustody.com/images/wallets/1_metamask.png', NULL),
(3, 'Lobstr', 'https://qfsselfcustody.com/images/wallets/2_lobstr.png', NULL),
(4, 'Coinbase', 'https://qfsselfcustody.com/images/wallets/3_coinbase.png', NULL),
(42, 'Keplr', 'https://qfsselfcustody.com/images/wallets/keplr.png', NULL);

-- --------------------------------------------------------
-- Indexes and AUTO_INCREMENT
-- --------------------------------------------------------

ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`);

ALTER TABLE `wallets`
  ADD PRIMARY KEY (`id`);

-- AUTO_INCREMENT values
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

ALTER TABLE `wallets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=43;

COMMIT;

 /*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
 /*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
 /*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;