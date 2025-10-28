-- Database: arsip_udinus
-- Optimized SQL structure with inline constraints
-- Struktur kolom tetap sama persis dengan aslinya

-- Drop database if exists and create new one
DROP DATABASE IF EXISTS arsip_udinus;
CREATE DATABASE arsip_udinus;
USE arsip_udinus;

-- Table: admin
CREATE TABLE `admin` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(100) NOT NULL,
  `last_login` datetime DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table: categories
CREATE TABLE `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table: subcategories
CREATE TABLE `subcategories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `category_id` int(11) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_subcategory_per_category` (`name`,`category_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `subcategories_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table: locations
CREATE TABLE `locations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `subcategory_id` int(11) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_location_per_subcategory` (`name`,`subcategory_id`),
  KEY `subcategory_id` (`subcategory_id`),
  CONSTRAINT `locations_ibfk_1` FOREIGN KEY (`subcategory_id`) REFERENCES `subcategories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table: cabinets
CREATE TABLE `cabinets` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `location_id` int(11) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_cabinet_per_location` (`name`,`location_id`),
  KEY `location_id` (`location_id`),
  CONSTRAINT `cabinets_ibfk_1` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table: shelves
CREATE TABLE `shelves` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `cabinet_id` int(11) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_shelf_per_cabinet` (`name`,`cabinet_id`),
  KEY `cabinet_id` (`cabinet_id`),
  CONSTRAINT `shelves_ibfk_1` FOREIGN KEY (`cabinet_id`) REFERENCES `cabinets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table: positions
CREATE TABLE `positions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `shelf_id` int(11) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_position_per_shelf` (`name`,`shelf_id`),
  KEY `shelf_id` (`shelf_id`),
  CONSTRAINT `positions_ibfk_1` FOREIGN KEY (`shelf_id`) REFERENCES `shelves` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table: education_levels
CREATE TABLE `education_levels` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table: faculties
CREATE TABLE `faculties` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table: programs
CREATE TABLE `programs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  `faculty_id` int(11) NOT NULL,
  `level_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `faculty_id` (`faculty_id`),
  KEY `level_id` (`level_id`),
  CONSTRAINT `programs_ibfk_1` FOREIGN KEY (`faculty_id`) REFERENCES `faculties` (`id`) ON DELETE CASCADE,
  CONSTRAINT `programs_ibfk_2` FOREIGN KEY (`level_id`) REFERENCES `education_levels` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table: letters
CREATE TABLE `letters` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `date` date NOT NULL,
  `sender` varchar(255) NOT NULL,
  `recipient` varchar(255) NOT NULL,
  `subject` varchar(255) NOT NULL,
  `letter_type` varchar(100) NOT NULL,
  `current_status` varchar(100) DEFAULT NULL,
  `file_path` varchar(500) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `letters_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `admin` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table: letter_details
CREATE TABLE `letter_details` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `letter_id` int(11) NOT NULL,
  `nim` varchar(255) DEFAULT NULL,
  `nama` varchar(255) DEFAULT NULL,
  `jenjang_pendidikan` varchar(255) DEFAULT NULL,
  `fakultas` varchar(10) DEFAULT NULL,
  `program_studi` varchar(255) DEFAULT NULL,
  `tanggal_lulus` date DEFAULT NULL,
  `no_seri` varchar(255) DEFAULT NULL,
  `nirl` varchar(255) DEFAULT NULL,
  `telepon` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `letter_id` (`letter_id`),
  CONSTRAINT `letter_details_ibfk_1` FOREIGN KEY (`letter_id`) REFERENCES `letters` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table: letter_status_history
CREATE TABLE `letter_status_history` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `letter_id` int(11) NOT NULL,
  `status` varchar(100) NOT NULL,
  `note` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `letter_id` (`letter_id`),
  CONSTRAINT `letter_status_history_ibfk_1` FOREIGN KEY (`letter_id`) REFERENCES `letters` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Table: archives
CREATE TABLE `archives` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `date` date DEFAULT NULL,
  `image` varchar(255) DEFAULT NULL,
  `status` enum('active','archived','deleted') DEFAULT 'active',
  `category_id` int(11) DEFAULT NULL,
  `subcategory_id` int(11) DEFAULT NULL,
  `location_id` int(11) DEFAULT NULL,
  `cabinet_id` int(11) DEFAULT NULL,
  `shelf_id` int(11) DEFAULT NULL,
  `position_id` int(11) DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_status_date` (`status`,`date`),
  KEY `idx_created_by` (`created_by`),
  KEY `idx_category` (`category_id`),
  KEY `idx_subcategory` (`subcategory_id`),
  KEY `idx_location` (`location_id`),
  KEY `idx_cabinet` (`cabinet_id`),
  KEY `idx_shelf` (`shelf_id`),
  KEY `idx_position` (`position_id`),
  FULLTEXT KEY `idx_search` (`title`,`description`),
  CONSTRAINT `archives_cabinet_fk` FOREIGN KEY (`cabinet_id`) REFERENCES `cabinets` (`id`) ON DELETE SET NULL,
  CONSTRAINT `archives_category_fk` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  CONSTRAINT `archives_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `admin` (`id`) ON DELETE SET NULL,
  CONSTRAINT `archives_location_fk` FOREIGN KEY (`location_id`) REFERENCES `locations` (`id`) ON DELETE SET NULL,
  CONSTRAINT `archives_position_fk` FOREIGN KEY (`position_id`) REFERENCES `positions` (`id`) ON DELETE SET NULL,
  CONSTRAINT `archives_shelf_fk` FOREIGN KEY (`shelf_id`) REFERENCES `shelves` (`id`) ON DELETE SET NULL,
  CONSTRAINT `archives_subcategory_fk` FOREIGN KEY (`subcategory_id`) REFERENCES `subcategories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert sample data
INSERT INTO `admin` VALUES (1,'admin','admin123','Vivian Prabaswara','2025-10-17 14:02:28');

INSERT INTO `education_levels` VALUES 
(1,'S1','2025-10-28 03:16:53','2025-10-28 03:16:53'),
(4,'D3','2025-10-28 03:17:01','2025-10-28 03:17:01'),
(5,'D4','2025-10-28 03:17:03','2025-10-28 03:17:03'),
(6,'Magister','2025-10-28 03:17:40','2025-10-28 03:17:40'),
(7,'Doktor','2025-10-28 03:17:50','2025-10-28 03:17:50');

INSERT INTO `faculties` VALUES 
(1,'Fakultas Ilmu Komputer','2025-10-28 03:17:58','2025-10-28 03:17:58'),
(2,'Fakultas Ekonomi & Bisnis','2025-10-28 03:18:07','2025-10-28 03:18:07'),
(3,'Fakultas Ilmu Budaya','2025-10-28 03:18:13','2025-10-28 03:18:13'),
(4,'Fakultas Kesehatan','2025-10-28 03:18:20','2025-10-28 03:18:20'),
(5,'Fakultas Teknik','2025-10-28 03:18:26','2025-10-28 03:18:26'),
(6,'Fakultas Kedokteran','2025-10-28 03:18:35','2025-10-28 03:18:35');
