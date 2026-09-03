-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3307
-- Generation Time: Sep 03, 2026 at 10:59 AM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.2.4

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `schoolcms_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `academic_years`
--

CREATE TABLE `academic_years` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(20) NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `academic_years`
--

INSERT INTO `academic_years` (`id`, `name`, `start_date`, `end_date`, `is_active`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, '2024/2025', NULL, NULL, 1, '2026-08-25 05:16:15', '2026-08-27 14:07:17', NULL),
(2, '2025/2026', NULL, NULL, 1, '2026-08-25 05:16:15', '2026-08-25 05:16:15', NULL),
(3, '2026/2027', NULL, NULL, 1, '2026-08-25 05:16:15', '2026-08-27 14:07:13', NULL),
(4, '2027/2029', NULL, NULL, 1, '2026-08-27 14:05:34', '2026-08-27 14:06:34', '2026-08-27 07:06:34'),
(5, '2028/2029', NULL, NULL, 1, '2026-08-27 14:18:10', '2026-08-27 14:27:53', '2026-08-27 07:27:53'),
(6, '2029/2030', NULL, NULL, 1, '2026-08-27 14:31:58', '2026-08-27 14:41:23', NULL),
(7, '2023/2024', NULL, NULL, 1, '2026-08-27 14:40:13', '2026-08-27 14:48:54', '2026-08-27 07:48:54'),
(8, '2032/2033', NULL, NULL, 0, '2026-08-27 14:48:48', '2026-08-27 14:53:30', '2026-08-27 07:53:30'),
(9, '2031/2032', NULL, NULL, 0, '2026-08-27 14:54:12', '2026-08-27 14:54:16', '2026-08-27 07:54:16');

-- --------------------------------------------------------

--
-- Table structure for table `achievements`
--

CREATE TABLE `achievements` (
  `id` int(10) UNSIGNED NOT NULL,
  `student_id` int(10) UNSIGNED NOT NULL,
  `title` varchar(200) NOT NULL,
  `level` enum('sekolah','kecamatan','kota','provinsi','nasional','internasional') NOT NULL DEFAULT 'sekolah',
  `organizer` varchar(150) DEFAULT NULL,
  `achievement_date` date DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `achievements`
--

INSERT INTO `achievements` (`id`, `student_id`, `title`, `level`, `organizer`, `achievement_date`, `description`, `created_at`, `updated_at`) VALUES
(101, 52, 'Juara 1 Olimpiade Matematika', 'nasional', 'Kemendikbudristek', '2026-05-10', 'Tingkat nasional di Jakarta.', '2026-08-25 07:07:54', '2026-08-25 07:07:54'),
(102, 53, 'Juara 2 Lomba Pidato', 'provinsi', 'Dinas Pendidikan Provinsi', '2026-04-18', NULL, '2026-08-25 07:07:54', '2026-08-25 07:07:54'),
(103, 54, 'Juara 3 Fisika Tingkat Kota', 'kota', 'Dinas Pendidikan Kota', '2026-03-22', NULL, '2026-08-25 07:07:54', '2026-08-25 07:07:54'),
(104, 55, 'Harapan 1 Lomba Cerdas Cermat', 'kecamatan', 'Kecamatan Sukamaju', '2026-02-14', NULL, '2026-08-25 07:07:54', '2026-08-25 07:07:54'),
(105, 56, 'Juara 1 Lomba Poster Lingkungan', 'sekolah', 'SMA Negeri 1 Contoh', '2026-01-20', NULL, '2026-08-25 07:07:54', '2026-08-25 07:07:54');

-- --------------------------------------------------------

--
-- Table structure for table `alumni`
--

CREATE TABLE `alumni` (
  `id` int(10) UNSIGNED NOT NULL,
  `student_id` int(10) UNSIGNED DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `graduation_year` int(10) UNSIGNED NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `occupation` varchar(100) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `alumni`
--

INSERT INTO `alumni` (`id`, `student_id`, `name`, `graduation_year`, `phone`, `email`, `occupation`, `created_at`, `updated_at`) VALUES
(101, NULL, 'Rudi Hartono', 2024, '081300000001', 'rudi@example.com', 'Mahasiswa', '2026-08-25 07:07:54', '2026-08-25 07:07:54'),
(102, NULL, 'Maya Anggraini', 2025, '081300000002', 'maya@example.com', 'Mahasiswa', '2026-08-25 07:07:54', '2026-08-25 07:07:54'),
(103, 60, 'Andi Kurniawan', 2025, '081300000003', NULL, 'Wirausaha', '2026-08-25 07:07:54', '2026-08-25 07:07:54'),
(104, 61, 'Putri Ramadhani', 2025, '081300000004', NULL, NULL, '2026-08-25 07:07:54', '2026-08-25 07:07:54');

-- --------------------------------------------------------

--
-- Table structure for table `announcements`
--

CREATE TABLE `announcements` (
  `id` int(10) UNSIGNED NOT NULL,
  `title` varchar(200) NOT NULL,
  `content` text NOT NULL,
  `category` enum('umum','guru','siswa') NOT NULL DEFAULT 'umum',
  `attachment` varchar(255) DEFAULT NULL,
  `publish_date` date DEFAULT NULL,
  `expired_date` date DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `announcements`
--

INSERT INTO `announcements` (`id`, `title`, `content`, `category`, `attachment`, `publish_date`, `expired_date`, `created_at`, `updated_at`, `deleted_at`) VALUES
(101, 'Pembagian Rapor Semester Ganjil', 'Rapor semester ganjil dibagikan kepada siswa melalui wali kelas.', 'umum', NULL, '2026-06-20', NULL, '2026-09-03 15:50:55', '2026-09-03 15:50:55', NULL),
(102, 'Pengumuman MPLS', 'Masa Pengenalan Lingkungan Sekolah untuk siswa baru dimulai pekan pertama.', 'siswa', NULL, '2026-07-06', '2026-07-10', '2026-09-03 15:50:55', '2026-09-03 15:50:55', NULL),
(103, 'Rapat Koordinasi Dewan Guru', 'Rapat koordinasi dewan guru membahas jadwal ujian tengah semester.', 'guru', NULL, '2026-08-25', NULL, '2026-09-03 15:50:55', '2026-09-03 15:50:55', NULL),
(104, 'Jadwal PTS Semester Ganjil', 'Jadwal penilaian tengah semester ganjil telah diterbitkan.', 'siswa', NULL, '2026-09-10', '2026-09-20', '2026-09-03 15:50:55', '2026-09-03 15:50:55', NULL),
(105, 'Libur Hari Raya', 'Kegiatan belajar mengajar ditiadakan selama libur hari raya.', 'umum', NULL, '2026-09-15', '2026-09-17', '2026-09-03 15:50:55', '2026-09-03 15:50:55', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `assets`
--

CREATE TABLE `assets` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(20) NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `category` enum('electronics','furniture','lab_equipment','sports','teaching_aids','office','other') NOT NULL,
  `quantity` int(10) UNSIGNED NOT NULL DEFAULT 1,
  `condition` enum('good','fair','poor','damaged') NOT NULL,
  `location` varchar(150) DEFAULT NULL,
  `room_id` int(10) UNSIGNED DEFAULT NULL,
  `purchase_date` date DEFAULT NULL,
  `purchase_price` decimal(12,2) DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `assets`
--

INSERT INTO `assets` (`id`, `code`, `name`, `description`, `category`, `quantity`, `condition`, `location`, `room_id`, `purchase_date`, `purchase_price`, `status`, `created_at`, `updated_at`, `deleted_at`) VALUES
(101, 'AST-001', 'Proyektor Epson EB-X51', 'Proyektor kelas untuk pembelajaran.', 'electronics', 2, 'good', 'Ruang Kelas X-A', 1, '2025-01-15', 6500000.00, 'active', '2026-08-25 12:43:56', '2026-08-25 12:43:56', NULL),
(102, 'AST-002', 'Laptop Asus Vivobook', 'Laptop guru untuk administrasi.', 'electronics', 5, 'good', 'Ruang Guru', 1, '2024-08-10', 7500000.00, 'active', '2026-08-25 12:43:56', '2026-08-25 12:43:56', NULL),
(103, 'AST-003', 'Meja Praktikum Fisika', 'Meja tahan asam untuk laboratorium.', 'furniture', 10, 'fair', 'Lab Fisika', 1, '2023-02-20', 400000.00, 'active', '2026-08-25 12:43:56', '2026-08-25 12:43:56', NULL),
(104, 'AST-004', 'Mikroskop Binokuler', 'Mikroskop pengamatan sel.', 'lab_equipment', 8, 'poor', 'Lab Biologi', 1, '2022-07-11', 2500000.00, 'inactive', '2026-08-25 12:43:56', '2026-08-25 12:43:56', NULL),
(105, 'AST-005', 'Bola Futsal', 'Bola futsal ukuran 4.', 'sports', 6, 'good', 'Gudang Olahraga', NULL, '2025-09-01', 350000.00, 'active', '2026-08-25 12:43:56', '2026-08-25 12:43:56', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `assignments`
--

CREATE TABLE `assignments` (
  `id` int(10) UNSIGNED NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `subject_id` int(10) UNSIGNED NOT NULL,
  `class_id` int(10) UNSIGNED NOT NULL,
  `teacher_id` int(10) UNSIGNED DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `academic_year_id` int(10) UNSIGNED NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `assignments`
--

INSERT INTO `assignments` (`id`, `title`, `description`, `subject_id`, `class_id`, `teacher_id`, `due_date`, `academic_year_id`, `created_at`, `updated_at`) VALUES
(101, 'Latihan Aljabar Bab 1', 'Kerjakan soal halaman 12 nomor 1-10.', 3, 1, 136, '2026-09-01', 2, '2026-08-25 05:39:12', '2026-08-25 05:39:12'),
(102, 'Esai Teks Eksplanasi', 'Tulis esai 500 kata tentang bencana alam.', 4, 1, 144, '2026-09-02', 2, '2026-08-25 05:39:12', '2026-08-25 05:39:12'),
(103, 'Laporan Praktikum Ohm', 'Lengkapi tabel pengukuran dan kesimpulan.', 6, 1, 145, '2026-09-03', 2, '2026-08-25 05:39:12', '2026-08-25 05:39:12'),
(104, 'Resume Ikatan Kimia', 'Ringkas materi ion dan kovalen.', 7, 1, 146, '2026-09-04', 2, '2026-08-25 05:39:12', '2026-08-25 05:39:12'),
(105, 'Gambar Struktur Sel', 'Buat sketsa sel tumbuhan berlabel.', 8, 1, 147, '2026-09-05', 2, '2026-08-25 05:39:12', '2026-08-25 05:39:12');

-- --------------------------------------------------------

--
-- Table structure for table `attendances`
--

CREATE TABLE `attendances` (
  `id` int(10) UNSIGNED NOT NULL,
  `student_id` int(10) UNSIGNED NOT NULL,
  `class_id` int(10) UNSIGNED NOT NULL,
  `date` date NOT NULL,
  `status` enum('hadir','sakit','izin','alpa') NOT NULL DEFAULT 'hadir',
  `note` text DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `attendances`
--

INSERT INTO `attendances` (`id`, `student_id`, `class_id`, `date`, `status`, `note`, `created_at`, `updated_at`) VALUES
(2, 102, 1, '2026-08-27', 'hadir', NULL, '2026-08-27 18:17:33', '2026-08-27 18:17:33');

-- --------------------------------------------------------

--
-- Table structure for table `audit_logs`
--

CREATE TABLE `audit_logs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `action` varchar(50) NOT NULL,
  `model` varchar(100) DEFAULT NULL,
  `model_id` int(10) UNSIGNED DEFAULT NULL,
  `description` text NOT NULL,
  `ip_address` varchar(45) NOT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `audit_logs`
--

INSERT INTO `audit_logs` (`id`, `user_id`, `action`, `model`, `model_id`, `description`, `ip_address`, `user_agent`, `created_at`) VALUES
(1, 2, 'update', 'users', 1, 'Akun \"Admin\" diperbarui', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-18 16:40:50'),
(2, 2, 'update', 'users', 2, 'Akun \"Super Admin\" diperbarui', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-18 16:40:57'),
(3, 1, 'update', 'users', 2, 'Akun \"Super Admin\" diperbarui', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-18 19:32:49'),
(4, 1, 'update', 'users', 1, 'Akun \"Administrator\" diperbarui', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-18 19:33:20'),
(5, 2, 'create', 'users', 3, 'Akun \"siswa 01\" dibuat', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-18 19:41:17'),
(6, 2, 'create', 'users', 4, 'Akun \"Guru 01\" dibuat', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-18 19:42:24'),
(7, 2, 'delete', 'users', 3, 'Akun \"siswa 01\" dihapus', '::1', 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/151.0.0.0 Safari/537.36', '2026-08-18 19:43:18'),
(11, 2, 'student_created_from_ppdb', 'Student', 103, '{\"registration_number\":\"PPDB-INT-648378\",\"student_id\":103}', '127.0.0.1', 'Symfony', '2026-08-28 16:58:51'),
(16, 2, 'student_created_from_ppdb', 'Student', 104, '{\"registration_number\":\"PPDB-INT-463545\",\"student_id\":104}', '127.0.0.1', 'Symfony', '2026-08-28 16:58:52'),
(21, 2, 'student_created_from_ppdb', 'Student', 105, '{\"registration_number\":\"PPDB-INT-835456\",\"student_id\":105}', '127.0.0.1', 'Symfony', '2026-08-28 16:59:12'),
(26, 2, 'student_created_from_ppdb', 'Student', 106, '{\"registration_number\":\"PPDB-INT-635776\",\"student_id\":106}', '127.0.0.1', 'Symfony', '2026-08-28 16:59:12'),
(34, 2, 'registration_verified', 'Registrant', 10, '{\"registration_number\":\"PPDB-2026-000001\",\"from_status\":\"draft\",\"to_status\":\"verified\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-08-31 15:43:37'),
(35, 2, 'registration_selected', 'Registrant', 10, '{\"registration_number\":\"PPDB-2026-000001\",\"from_status\":\"verified\",\"to_status\":\"selected\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-08-31 15:44:01'),
(36, 2, 'registration_re_registered', 'Registrant', 10, '{\"registration_number\":\"PPDB-2026-000001\",\"from_status\":\"selected\",\"to_status\":\"re_registered\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-08-31 15:44:07'),
(37, 2, 'student_created_from_ppdb', 'Student', 108, '{\"registration_number\":\"PPDB-2026-000001\",\"student_id\":108}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-08-31 15:44:17'),
(38, 2, 'registration_re_registration_verified', 'Registrant', 10, '{\"registration_number\":\"PPDB-2026-000001\",\"status\":\"re_registered\",\"student_id\":108}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-08-31 15:44:17'),
(39, 2, 'registration_selected', 'Registrant', 4, '{\"registration_number\":\"PPDB-2026-000004\",\"from_status\":\"active\",\"to_status\":\"selected\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-08-31 16:01:24'),
(40, 2, 'registration_re_registered', 'Registrant', 4, '{\"registration_number\":\"PPDB-2026-000004\",\"from_status\":\"selected\",\"to_status\":\"re_registered\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-08-31 16:10:34'),
(41, 2, 'registration_selected', 'Registrant', 2, '{\"registration_number\":\"PPDB-2026-000002\",\"from_status\":\"active\",\"to_status\":\"selected\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-08-31 16:46:33'),
(42, 2, 'registration_re_registration_verified', 'Registrant', 4, '{\"registration_number\":\"PPDB-2026-000004\",\"status\":\"re_registered\",\"student_id\":null}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-08-31 16:46:45'),
(43, 2, 'student_created_from_ppdb', 'Student', 122, '{\"registration_number\":\"PPDB-2026-000002\",\"student_id\":122}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-08-31 17:08:24'),
(44, 2, 'registration_re_registered', 'Registrant', 2, '{\"registration_number\":\"PPDB-2026-000002\",\"from_status\":\"selected\",\"to_status\":\"re_registered\",\"student_id\":122}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-08-31 17:08:24'),
(45, 2, 'registration_selected', 'Registrant', 1, '{\"registration_number\":\"PPDB-2026-000001\",\"from_status\":\"active\",\"to_status\":\"selected\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-08-31 17:08:43'),
(46, 2, 'student_created_from_ppdb', 'Student', 123, '{\"registration_number\":\"PPDB-2026-000005\",\"student_id\":123}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-08-31 17:51:09'),
(47, 2, 'registration_verified', 'Registrant', 5, '{\"registration_number\":\"PPDB-2026-000005\",\"from_status\":\"draft\",\"to_status\":\"verified\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-08-31 17:51:09'),
(48, 2, 'registration_verified', 'Registrant', 5, '{\"registration_number\":\"PPDB-2026-000005\",\"from_status\":\"active\",\"to_status\":\"verified\"}', '127.0.0.1', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1', '2026-08-31 18:20:32'),
(49, 2, 'registration_verified', 'Registrant', 4, '{\"registration_number\":\"PPDB-2026-000004\",\"from_status\":\"active\",\"to_status\":\"verified\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-08-31 18:27:18'),
(50, 2, 'registration_data_completed', 'ReRegistrant', 2, '{\"registration_number\":\"PPDB-2026-000004\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-08-31 18:27:23'),
(51, 2, 'registration_data_completed', 'ReRegistrant', 1, '{\"registration_number\":\"PPDB-2026-000005\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-08-31 18:27:25'),
(52, 2, 'registration_verified', 'Registrant', 3, '{\"registration_number\":\"PPDB-2026-000003\",\"from_status\":\"active\",\"to_status\":\"verified\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-08-31 18:28:21'),
(53, 2, 'registration_verified', 'Registrant', 2, '{\"registration_number\":\"PPDB-2026-000002\",\"from_status\":\"active\",\"to_status\":\"verified\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-01 13:51:47'),
(54, 2, 'registration_data_completed', 'ReRegistrant', 3, '{\"registration_number\":\"PPDB-2026-000003\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-01 13:52:08'),
(55, 2, 'registration_data_completed', 'ReRegistrant', 4, '{\"registration_number\":\"PPDB-2026-000002\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-01 13:55:27'),
(56, 2, 'registration_verified', 'Registrant', 1, '{\"registration_number\":\"PPDB-2026-000001\",\"from_status\":\"active\",\"to_status\":\"verified\"}', '127.0.0.1', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/152.0.0.0 Safari/537.36', '2026-09-01 13:55:47');

-- --------------------------------------------------------

--
-- Table structure for table `billings`
--

CREATE TABLE `billings` (
  `id` int(10) UNSIGNED NOT NULL,
  `student_id` int(10) UNSIGNED NOT NULL,
  `fee_type_id` int(10) UNSIGNED NOT NULL,
  `academic_year_id` int(10) UNSIGNED NOT NULL,
  `semester_id` int(10) UNSIGNED DEFAULT NULL,
  `period_start` date DEFAULT NULL,
  `period_end` date DEFAULT NULL,
  `uniq_key` varchar(255) DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `due_date` date DEFAULT NULL,
  `status` enum('unpaid','partial','paid','cancelled') NOT NULL DEFAULT 'unpaid',
  `notes` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `billings`
--

INSERT INTO `billings` (`id`, `student_id`, `fee_type_id`, `academic_year_id`, `semester_id`, `period_start`, `period_end`, `uniq_key`, `amount`, `due_date`, `status`, `notes`, `created_at`, `updated_at`, `deleted_at`) VALUES
(101, 52, 101, 2, 103, '2026-08-01', '2026-08-31', '52|101|2026-08-01|2026-08-31', 350000.00, '2026-08-10', 'paid', 'SPP Agustus 2025/2026.', '2026-08-25 18:31:02', '2026-08-25 18:31:02', NULL),
(102, 53, 101, 2, 103, '2026-08-01', '2026-08-31', '53|101|2026-08-01|2026-08-31', 350000.00, '2026-08-10', 'partial', 'SPP Agustus - cicilan pertama.', '2026-08-25 18:31:02', '2026-08-25 18:31:02', NULL),
(103, 54, 102, 2, NULL, NULL, NULL, '54|102||', 150000.00, '2026-09-15', 'unpaid', NULL, '2026-08-25 18:31:02', '2026-08-25 18:31:02', NULL),
(104, 55, 101, 2, 103, '2026-08-01', '2026-08-31', '55|101|2026-08-01|2026-08-31', 350000.00, '2026-08-10', 'paid', 'SPP Agustus 2025/2026.', '2026-08-25 18:31:02', '2026-08-25 18:31:02', NULL),
(105, 56, 103, 2, NULL, NULL, NULL, NULL, 450000.00, '2026-07-20', 'cancelled', 'Peserta membeli seragam sendiri.', '2026-08-25 18:31:02', '2026-08-25 18:31:02', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `cache`
--

CREATE TABLE `cache` (
  `key` varchar(255) NOT NULL,
  `value` mediumtext NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `cache`
--

INSERT INTO `cache` (`key`, `value`, `expiration`) VALUES
('laravel-cache-356a192b7913b04c54574d18c28d46e6395428ab', 'i:3;', 1787936792),
('laravel-cache-356a192b7913b04c54574d18c28d46e6395428ab:timer', 'i:1787936792;', 1787936792),
('laravel-cache-da4b9237bacccdf19c0760cab7aec4a8359010b0', 'i:14;', 1788425608),
('laravel-cache-da4b9237bacccdf19c0760cab7aec4a8359010b0:timer', 'i:1788425608;', 1788425608);

-- --------------------------------------------------------

--
-- Table structure for table `cache_locks`
--

CREATE TABLE `cache_locks` (
  `key` varchar(255) NOT NULL,
  `owner` varchar(255) NOT NULL,
  `expiration` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `calendars`
--

CREATE TABLE `calendars` (
  `id` int(10) UNSIGNED NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `event_date` date NOT NULL,
  `type` enum('umum','ujian','libur','kegiatan','rapat') NOT NULL DEFAULT 'umum',
  `academic_year_id` int(10) UNSIGNED DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `calendars`
--

INSERT INTO `calendars` (`id`, `title`, `description`, `event_date`, `type`, `academic_year_id`, `created_at`, `updated_at`) VALUES
(101, 'Ujian Quiz Fisika', 'Quiz hukum Ohm untuk kelas X.', '2026-08-29', 'ujian', 2, '2026-08-25 17:22:41', '2026-08-25 17:22:41'),
(102, 'Rapat Dewan Guru', 'Evaluasi bulanan dewan guru.', '2026-09-01', 'rapat', 2, '2026-08-25 17:22:41', '2026-08-25 17:22:41'),
(103, 'Libur Hari Raya', 'Libur bersama hari raya.', '2026-09-15', 'libur', NULL, '2026-08-25 17:22:41', '2026-08-25 17:22:41'),
(104, 'Pentas Seni Sekolah', 'Pentas seni tahunan siswa.', '2026-09-20', 'kegiatan', 2, '2026-08-25 17:22:41', '2026-08-25 17:22:41'),
(105, 'UAS Semester Ganjil', 'Ujian akhir semester ganjil.', '2026-12-01', 'ujian', 2, '2026-08-25 17:22:41', '2026-08-25 17:22:41');

-- --------------------------------------------------------

--
-- Table structure for table `classes`
--

CREATE TABLE `classes` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(50) NOT NULL,
  `teacher_id` int(10) UNSIGNED DEFAULT NULL,
  `level` varchar(10) DEFAULT NULL,
  `academic_year` varchar(20) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `classes`
--

INSERT INTO `classes` (`id`, `name`, `teacher_id`, `level`, `academic_year`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'Socius', 136, '10', '2026/2027', '2026-08-18 20:00:17', '2026-08-19 10:25:07', NULL),
(2, 'Eunoia', 159, '11', '2026/2027', '2026-08-18 20:00:55', '2026-08-19 10:25:20', NULL),
(3, 'Sapientia', 147, '12', '2026/2027', '2026-08-18 20:01:17', '2026-08-19 10:25:30', NULL),
(4, 'Class Test Patch', 136, '12', '2026/2027', '2026-08-21 12:00:49', '2026-08-21 12:05:22', '2026-08-21 12:05:22');

-- --------------------------------------------------------

--
-- Table structure for table `class_students`
--

CREATE TABLE `class_students` (
  `id` int(10) UNSIGNED NOT NULL,
  `class_id` int(10) UNSIGNED NOT NULL,
  `student_id` int(10) UNSIGNED NOT NULL,
  `academic_year_id` int(10) UNSIGNED NOT NULL,
  `status` enum('active','moved','graduated') NOT NULL DEFAULT 'active',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `class_students`
--

INSERT INTO `class_students` (`id`, `class_id`, `student_id`, `academic_year_id`, `status`, `created_at`, `updated_at`) VALUES
(101, 1, 52, 2, 'active', '2026-08-25 05:39:12', '2026-08-25 05:39:12'),
(102, 1, 53, 2, 'active', '2026-08-25 05:39:12', '2026-08-25 05:39:12'),
(103, 1, 54, 2, 'active', '2026-08-25 05:39:12', '2026-08-25 05:39:12'),
(104, 1, 55, 2, 'active', '2026-08-25 05:39:12', '2026-08-25 05:39:12'),
(105, 1, 56, 2, 'active', '2026-08-25 05:39:12', '2026-08-25 05:39:12'),
(106, 1, 52, 1, 'active', '2026-08-24 22:45:12', '2026-08-24 22:45:12');

-- --------------------------------------------------------

--
-- Table structure for table `class_subjects`
--

CREATE TABLE `class_subjects` (
  `id` int(10) UNSIGNED NOT NULL,
  `class_id` int(10) UNSIGNED NOT NULL,
  `subject_id` int(10) UNSIGNED NOT NULL,
  `teacher_id` int(10) UNSIGNED DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `class_subjects`
--

INSERT INTO `class_subjects` (`id`, `class_id`, `subject_id`, `teacher_id`, `created_at`, `updated_at`) VALUES
(101, 1, 3, NULL, '2026-08-25 04:44:36', '2026-08-25 04:44:36'),
(102, 1, 4, NULL, '2026-08-25 04:44:36', '2026-08-25 04:44:36'),
(103, 1, 6, NULL, '2026-08-25 04:44:36', '2026-08-25 04:44:36'),
(104, 1, 7, NULL, '2026-08-25 04:44:36', '2026-08-25 04:44:36'),
(105, 1, 8, NULL, '2026-08-25 04:44:36', '2026-08-25 04:44:36'),
(106, 3, 8, 161, '2026-08-28 09:55:18', '2026-08-28 09:55:18');

-- --------------------------------------------------------

--
-- Table structure for table `counselings`
--

CREATE TABLE `counselings` (
  `id` int(10) UNSIGNED NOT NULL,
  `student_id` int(10) UNSIGNED NOT NULL,
  `counselor_id` int(10) UNSIGNED NOT NULL,
  `counseling_date` date NOT NULL,
  `topic` varchar(200) NOT NULL,
  `notes` text DEFAULT NULL,
  `follow_up` text DEFAULT NULL,
  `status` enum('terjadwal','selesai','dibatalkan') NOT NULL DEFAULT 'terjadwal',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `counselings`
--

INSERT INTO `counselings` (`id`, `student_id`, `counselor_id`, `counseling_date`, `topic`, `notes`, `follow_up`, `status`, `created_at`, `updated_at`) VALUES
(101, 52, 136, '2026-08-20', 'Manajemen waktu belajar', 'Siswa kesulitan membagi waktu antara latihan dan belajar.', 'Evaluasi dua minggu lagi.', 'selesai', '2026-08-25 18:06:13', '2026-08-25 18:06:13'),
(102, 53, 136, '2026-08-22', 'Komunikasi dengan teman', 'Konflik ringan dengan teman sebangku.', 'Mediasi bersama wali kelas.', 'selesai', '2026-08-25 18:06:13', '2026-08-25 18:06:13'),
(103, 54, 144, '2026-08-25', 'Persiapan olimpiade', 'Pendampingan mental menjelang lomba.', NULL, 'terjadwal', '2026-08-25 18:06:13', '2026-08-25 18:06:13'),
(104, 55, 144, '2026-08-27', 'Motivasi belajar', 'Semangat menurun setelah remedial.', 'Libatkan orang tua.', 'terjadwal', '2026-08-25 18:06:13', '2026-08-25 18:06:13'),
(105, 56, 136, '2026-08-10', 'Kehadiran', 'Diskusi pola keterlambatan.', 'Pantau kehadiran harian.', 'dibatalkan', '2026-08-25 18:06:13', '2026-08-25 18:06:13');

-- --------------------------------------------------------

--
-- Table structure for table `curriculums`
--

CREATE TABLE `curriculums` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `curriculums`
--

INSERT INTO `curriculums` (`id`, `name`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(101, 'Kurikulum Merdeka', 'Kurikulum nasional generasi baru', 1, '2026-08-25 05:39:12', '2026-08-25 05:39:12'),
(102, 'Kurikulum K13', 'Kurikulum 2013 revisi', 0, '2026-08-25 05:39:12', '2026-08-25 05:39:12');

-- --------------------------------------------------------

--
-- Table structure for table `dispositions`
--

CREATE TABLE `dispositions` (
  `id` int(10) UNSIGNED NOT NULL,
  `incoming_letter_id` int(10) UNSIGNED NOT NULL,
  `assigned_to` varchar(150) NOT NULL,
  `instruction` text DEFAULT NULL,
  `due_date` date DEFAULT NULL,
  `status` enum('belum','proses','selesai') NOT NULL DEFAULT 'belum',
  `completed_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `dispositions`
--

INSERT INTO `dispositions` (`id`, `incoming_letter_id`, `assigned_to`, `instruction`, `due_date`, `status`, `completed_at`, `created_at`, `updated_at`) VALUES
(101, 102, 'Wakil Kurikulum', 'Siapkan pelaksanaan ANBK dan kirim jadwalnya.', '2026-09-05', 'proses', NULL, '2026-08-25 20:02:19', '2026-08-25 20:02:19'),
(102, 103, 'Kepala TU', 'Tindak lanjuti permohonan kerja sama.', '2026-09-02', 'selesai', '2026-09-01 10:00:00', '2026-08-25 20:02:19', '2026-08-25 20:02:19'),
(103, 104, 'Operator Sekolah', 'Kaji penawaran dan buat perbandingan harga.', NULL, 'belum', NULL, '2026-08-25 20:02:19', '2026-08-25 20:02:19'),
(104, 105, 'Wakil Kesiswaan', 'Koordinasi jadwal sosialisasi dengan wali kelas.', '2026-09-03', 'belum', NULL, '2026-08-25 20:02:19', '2026-08-25 20:02:19');

-- --------------------------------------------------------

--
-- Table structure for table `documents`
--

CREATE TABLE `documents` (
  `id` int(10) UNSIGNED NOT NULL,
  `title` varchar(200) NOT NULL,
  `document_number` varchar(50) DEFAULT NULL,
  `category` enum('sk','peraturan','sop','laporan','formulir','lainnya') NOT NULL DEFAULT 'lainnya',
  `file_path` varchar(255) DEFAULT NULL,
  `document_date` date DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `documents`
--

INSERT INTO `documents` (`id`, `title`, `document_number`, `category`, `file_path`, `document_date`, `description`, `created_at`, `updated_at`) VALUES
(101, 'SK Pembagian Tugas Mengajar 2026/2027', 'DOC-SK-001', 'sk', NULL, '2026-07-15', 'SK internal pembagian beban mengajar.', '2026-08-25 20:02:19', '2026-08-25 20:02:19'),
(102, 'Peraturan Tata Tertib Siswa', 'DOC-PR-002', 'peraturan', NULL, '2025-07-01', 'Tata tertib berlaku satu tahun ajaran.', '2026-08-25 20:02:19', '2026-08-25 20:02:19'),
(103, 'SOP Penerimaan Peserta Didik Baru', 'DOC-SOP-003', 'sop', NULL, '2025-06-01', 'Alur PPDB tahunan.', '2026-08-25 20:02:19', '2026-08-25 20:02:19'),
(104, 'Laporan Bulanan Agustus', 'DOC-LP-004', 'laporan', NULL, '2026-08-31', NULL, '2026-08-25 20:02:19', '2026-08-25 20:02:19'),
(105, 'Formulir Permohonan Izin Guru', 'DOC-FR-005', 'formulir', NULL, '2025-01-10', 'Formulir standar izin dan cuti.', '2026-08-25 20:02:19', '2026-08-25 20:02:19');

-- --------------------------------------------------------

--
-- Table structure for table `exams`
--

CREATE TABLE `exams` (
  `id` int(10) UNSIGNED NOT NULL,
  `subject_id` int(10) UNSIGNED NOT NULL,
  `title` varchar(200) NOT NULL,
  `description` text DEFAULT NULL,
  `duration_minutes` int(10) UNSIGNED NOT NULL DEFAULT 60,
  `total_questions` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `passing_score` int(10) UNSIGNED NOT NULL DEFAULT 70,
  `max_attempts` int(10) UNSIGNED NOT NULL DEFAULT 1,
  `shuffle_questions` tinyint(1) NOT NULL DEFAULT 1,
  `shuffle_options` tinyint(1) NOT NULL DEFAULT 1,
  `show_result` tinyint(1) NOT NULL DEFAULT 0,
  `status` enum('draft','published','ongoing','completed','archived') NOT NULL DEFAULT 'draft',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `exams`
--

INSERT INTO `exams` (`id`, `subject_id`, `title`, `description`, `duration_minutes`, `total_questions`, `passing_score`, `max_attempts`, `shuffle_questions`, `shuffle_options`, `show_result`, `status`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 1, 'Ujian Matematika Semester 1', 'Ujian akhir semester mata pelajaran Matematika', 90, 20, 75, 1, 1, 1, 0, 'draft', '2026-08-24 18:35:21', '2026-08-24 18:36:25', '2026-08-24 18:36:25'),
(2, 1, 'Ujian PAI Semester 1', 'Ujian mata pelajaran Pendidikan Agama dan Budi Pekerti.', 60, 20, 70, 1, 1, 1, 1, 'draft', '2026-08-24 19:03:41', '2026-08-24 19:03:41', NULL),
(3, 1, 'Ujian PAI Testing', 'Ujian untuk testing API.', 90, 30, 75, 2, 1, 1, 1, 'draft', '2026-08-24 21:09:43', '2026-08-24 21:09:43', NULL),
(101, 3, 'Ujian Harian Matematika Kelas X', 'Bab aljabar dasar: suku sejenis dan faktorisasi.', 60, 10, 70, 1, 1, 1, 0, 'draft', '2026-08-25 04:18:25', '2026-08-25 04:18:25', NULL),
(102, 4, 'UAS Bahasa Indonesia', 'Ujian akhir semester: pemahaman teks dan menulis esai.', 90, 40, 75, 2, 1, 1, 1, 'published', '2026-08-25 04:18:25', '2026-08-25 04:18:25', NULL),
(103, 6, 'Quiz Fisika Listrik', 'Quiz singkat hukum Ohm dan rangkaian listrik.', 30, 15, 65, 1, 0, 1, 0, 'ongoing', '2026-08-25 04:18:25', '2026-08-25 04:18:25', NULL),
(104, 7, 'UTS Kimia Dasar', 'Ujian tengah semester: stoikiometri dan ikatan kimia.', 75, 25, 70, 1, 1, 0, 0, 'published', '2026-08-25 04:18:25', '2026-08-25 04:18:25', NULL),
(105, 8, 'Ujian Praktik Biologi', 'Praktikum observasi sel tumbuhan.', 120, 5, 80, 1, 0, 0, 1, 'completed', '2026-08-25 04:18:25', '2026-08-25 04:18:25', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `exam_answers`
--

CREATE TABLE `exam_answers` (
  `id` int(10) UNSIGNED NOT NULL,
  `participant_id` int(10) UNSIGNED NOT NULL,
  `question_id` int(10) UNSIGNED NOT NULL,
  `selected_option_id` int(10) UNSIGNED DEFAULT NULL,
  `essay_answer` text DEFAULT NULL,
  `is_correct` tinyint(1) DEFAULT NULL,
  `answered_at` datetime NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `exam_answers`
--

INSERT INTO `exam_answers` (`id`, `participant_id`, `question_id`, `selected_option_id`, `essay_answer`, `is_correct`, `answered_at`, `created_at`, `updated_at`) VALUES
(101, 102, 101, 202, NULL, 1, '2026-08-26 08:06:00', '2026-08-25 04:18:25', '2026-08-25 04:18:25'),
(102, 102, 102, 206, NULL, 0, '2026-08-26 08:12:00', '2026-08-25 04:18:25', '2026-08-25 04:18:25'),
(103, 103, 103, 210, NULL, 1, '2026-08-26 11:05:00', '2026-08-25 04:18:25', '2026-08-25 04:18:25'),
(104, 103, 105, NULL, 'Fotosintesis adalah proses tumbuhan membuat makanan menggunakan cahaya matahari, air, dan karbon dioksida menghasilkan glukosa dan oksigen.', 1, '2026-08-26 11:30:00', '2026-08-25 04:18:25', '2026-08-25 04:18:25'),
(105, 103, 104, 214, NULL, 0, '2026-08-26 11:20:00', '2026-08-25 04:18:25', '2026-08-25 04:18:25'),
(106, 104, 101, 201, NULL, 0, '2026-08-27 13:04:00', '2026-08-25 04:18:25', '2026-08-25 04:18:25'),
(107, 104, 102, 205, NULL, 1, '2026-08-27 13:10:00', '2026-08-25 04:18:25', '2026-08-25 04:18:25'),
(108, 104, 104, 215, NULL, 1, '2026-08-27 13:18:00', '2026-08-25 04:18:25', '2026-08-25 04:18:25'),
(109, 105, 101, 203, NULL, 0, '2026-08-25 15:01:00', '2026-08-25 04:18:25', '2026-08-25 04:18:25'),
(110, 105, 104, 213, NULL, 0, '2026-08-25 15:07:00', '2026-08-25 04:18:25', '2026-08-25 04:18:25');

-- --------------------------------------------------------

--
-- Table structure for table `exam_instructions`
--

CREATE TABLE `exam_instructions` (
  `id` int(10) UNSIGNED NOT NULL,
  `title` varchar(150) NOT NULL,
  `content` text NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `exam_instructions`
--

INSERT INTO `exam_instructions` (`id`, `title`, `content`, `is_active`, `created_at`, `updated_at`) VALUES
(101, 'Petunjuk Umum Ujian', 'Peserta wajib hadir 15 menit sebelum ujian dimulai dan membawa kartu ujian.', 1, '2026-08-25 04:18:25', '2026-08-25 04:18:25'),
(102, 'Petunjuk Soal Pilihan Ganda', 'Pilih satu jawaban yang paling tepat. Tidak ada pengurangan nilai untuk jawaban salah.', 1, '2026-08-25 04:18:25', '2026-08-25 04:18:25'),
(103, 'Petunjuk Soal Esai', 'Tuliskan jawaban dengan bahasa sendiri, minimal 3 paragraf.', 1, '2026-08-25 04:18:25', '2026-08-25 04:18:25'),
(104, 'Larangan Kecurangan', 'Dilarang membuka alat komunikasi atau berbicara dengan peserta lain selama ujian.', 1, '2026-08-25 04:18:25', '2026-08-25 04:18:25'),
(105, 'Prosedur Keberatan Soal', 'Keberatan atas soal diajukan tertulis maksimal 1x24 jam setelah ujian berakhir.', 0, '2026-08-25 04:18:25', '2026-08-25 04:18:25');

-- --------------------------------------------------------

--
-- Table structure for table `exam_participants`
--

CREATE TABLE `exam_participants` (
  `id` int(10) UNSIGNED NOT NULL,
  `exam_id` int(10) UNSIGNED NOT NULL,
  `student_id` int(10) UNSIGNED NOT NULL,
  `exam_card_number` varchar(30) NOT NULL,
  `status` enum('registered','started','completed','blocked') NOT NULL DEFAULT 'registered',
  `started_at` datetime DEFAULT NULL,
  `completed_at` datetime DEFAULT NULL,
  `is_blocked` tinyint(1) NOT NULL DEFAULT 0,
  `blocked_reason` text DEFAULT NULL,
  `login_allowed` tinyint(1) DEFAULT 0,
  `current_session_id` int(10) UNSIGNED DEFAULT NULL,
  `last_activity_at` datetime DEFAULT NULL,
  `ip_address` varchar(45) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `exam_participants`
--

INSERT INTO `exam_participants` (`id`, `exam_id`, `student_id`, `exam_card_number`, `status`, `started_at`, `completed_at`, `is_blocked`, `blocked_reason`, `login_allowed`, `current_session_id`, `last_activity_at`, `ip_address`, `created_at`, `updated_at`) VALUES
(101, 101, 51, 'KARTU-DUMMY-001', 'registered', NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, '2026-08-25 04:18:25', '2026-08-25 04:18:25'),
(102, 102, 52, 'KARTU-DUMMY-002', 'started', '2026-08-26 08:05:00', NULL, 0, NULL, 1, 102, '2026-08-26 08:20:00', '192.168.1.11', '2026-08-25 04:18:25', '2026-08-25 04:18:25'),
(103, 103, 53, 'KARTU-DUMMY-003', 'completed', '2026-08-26 11:00:00', '2026-08-26 11:42:00', 0, NULL, 1, 103, '2026-08-26 11:42:00', '192.168.1.12', '2026-08-25 04:18:25', '2026-08-25 04:18:25'),
(104, 104, 54, 'KARTU-DUMMY-004', 'completed', '2026-08-27 13:02:00', '2026-08-27 13:55:00', 0, NULL, 1, 104, '2026-08-27 13:55:00', '192.168.1.13', '2026-08-25 04:18:25', '2026-08-25 04:18:25'),
(105, 105, 55, 'KARTU-DUMMY-005', 'blocked', NULL, NULL, 1, 'Terindikasi kecurangan pada ujian sebelumnya', 0, NULL, NULL, NULL, '2026-08-25 04:18:25', '2026-08-25 04:18:25');

-- --------------------------------------------------------

--
-- Table structure for table `exam_results`
--

CREATE TABLE `exam_results` (
  `id` int(10) UNSIGNED NOT NULL,
  `participant_id` int(10) UNSIGNED NOT NULL,
  `total_score` decimal(5,2) NOT NULL DEFAULT 0.00,
  `correct_count` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `wrong_count` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `unanswered_count` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `grade` varchar(5) DEFAULT NULL,
  `status` enum('pending','graded') NOT NULL DEFAULT 'pending',
  `graded_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `exam_results`
--

INSERT INTO `exam_results` (`id`, `participant_id`, `total_score`, `correct_count`, `wrong_count`, `unanswered_count`, `grade`, `status`, `graded_at`, `created_at`, `updated_at`) VALUES
(101, 101, 0.00, 0, 0, 10, NULL, 'pending', NULL, '2026-08-25 04:18:25', '2026-08-25 04:18:25'),
(102, 102, 0.00, 0, 0, 8, NULL, 'pending', NULL, '2026-08-25 04:18:25', '2026-08-25 04:18:25'),
(103, 103, 35.00, 2, 1, 2, 'B', 'graded', '2026-08-26 12:00:00', '2026-08-25 04:18:25', '2026-08-25 04:18:25'),
(104, 104, 20.00, 2, 1, 2, 'C', 'graded', '2026-08-27 14:10:00', '2026-08-25 04:18:25', '2026-08-25 04:18:25'),
(105, 105, 0.00, 0, 0, 5, NULL, 'pending', NULL, '2026-08-25 04:18:25', '2026-08-25 04:18:25');

-- --------------------------------------------------------

--
-- Table structure for table `exam_schedules`
--

CREATE TABLE `exam_schedules` (
  `id` int(10) UNSIGNED NOT NULL,
  `exam_id` int(10) UNSIGNED NOT NULL,
  `room_id` int(10) UNSIGNED NOT NULL,
  `session_id` int(10) UNSIGNED NOT NULL,
  `exam_date` date NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `exam_schedules`
--

INSERT INTO `exam_schedules` (`id`, `exam_id`, `room_id`, `session_id`, `exam_date`, `created_at`, `updated_at`) VALUES
(101, 101, 1, 101, '2026-08-27', '2026-08-25 04:18:25', '2026-08-25 04:18:25'),
(102, 102, 1, 102, '2026-08-28', '2026-08-25 04:18:25', '2026-08-25 04:18:25'),
(103, 103, 1, 103, '2026-08-29', '2026-08-25 04:18:25', '2026-08-25 04:18:25'),
(104, 104, 1, 104, '2026-08-31', '2026-08-25 04:18:25', '2026-08-25 04:18:25'),
(105, 105, 1, 105, '2026-09-01', '2026-08-25 04:18:25', '2026-08-25 04:18:25');

-- --------------------------------------------------------

--
-- Table structure for table `exam_sessions`
--

CREATE TABLE `exam_sessions` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `exam_sessions`
--

INSERT INTO `exam_sessions` (`id`, `name`, `start_time`, `end_time`, `created_at`, `updated_at`) VALUES
(1, 'Sesi Pagi', '08:00:00', '10:00:00', '2026-08-24 18:59:22', '2026-08-24 18:59:22'),
(101, 'Sesi Pagi 1', '07:00:00', '08:30:00', '2026-08-25 04:18:25', '2026-08-25 04:18:25'),
(102, 'Sesi Pagi 2', '09:00:00', '10:30:00', '2026-08-25 04:18:25', '2026-08-25 04:18:25'),
(103, 'Sesi Siang 1', '11:00:00', '12:30:00', '2026-08-25 04:18:25', '2026-08-25 04:18:25'),
(104, 'Sesi Siang 2', '13:00:00', '14:30:00', '2026-08-25 04:18:25', '2026-08-25 04:18:25'),
(105, 'Sesi Sore', '15:00:00', '16:30:00', '2026-08-25 04:18:25', '2026-08-25 04:18:25');

-- --------------------------------------------------------

--
-- Table structure for table `extracurriculums`
--

CREATE TABLE `extracurriculums` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `supervisor_id` int(10) UNSIGNED DEFAULT NULL,
  `schedule_day` enum('senin','selasa','rabu','kamis','jumat','sabtu') DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `extracurriculums`
--

INSERT INTO `extracurriculums` (`id`, `name`, `description`, `supervisor_id`, `schedule_day`, `is_active`, `created_at`, `updated_at`) VALUES
(101, 'Pramuka', 'Ekstrakurikuler wajib kepanduan.', 136, 'jumat', 1, '2026-08-25 18:06:13', '2026-08-25 18:06:13'),
(102, 'Futsal', 'Klub olahraga futsal.', 144, 'sabtu', 1, '2026-08-25 18:06:13', '2026-08-25 18:06:13'),
(103, 'English Club', 'Praktik percakapan bahasa Inggris.', 145, 'rabu', 1, '2026-08-25 18:06:13', '2026-08-25 18:06:13'),
(104, 'Paskibra', 'Pasukan pengibar bendera.', 146, 'selasa', 1, '2026-08-25 18:06:13', '2026-08-25 18:06:13'),
(105, 'Robotik', 'Klub robotik dan coding.', 147, 'kamis', 0, '2026-08-25 18:06:13', '2026-08-25 18:06:13');

-- --------------------------------------------------------

--
-- Table structure for table `failed_jobs`
--

CREATE TABLE `failed_jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `uuid` varchar(255) NOT NULL,
  `connection` text NOT NULL,
  `queue` text NOT NULL,
  `payload` longtext NOT NULL,
  `exception` longtext NOT NULL,
  `failed_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `fee_types`
--

CREATE TABLE `fee_types` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `description` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `fee_types`
--

INSERT INTO `fee_types` (`id`, `name`, `amount`, `description`, `is_active`, `created_at`, `updated_at`) VALUES
(101, 'SPP Bulanan', 350000.00, 'Sumbangan pendidikan per bulan.', 1, '2026-08-25 18:31:02', '2026-08-25 18:31:02'),
(102, 'Biaya Ujian', 150000.00, 'Biaya ujian tengah dan akhir semester.', 1, '2026-08-25 18:31:02', '2026-08-25 18:31:02'),
(103, 'Seragam Sekolah', 450000.00, 'Satu set seragam lengkap.', 1, '2026-08-25 18:31:02', '2026-08-25 18:31:02'),
(104, 'Kegiatan Ekstrakurikuler', 200000.00, 'Per semester.', 1, '2026-08-25 18:31:02', '2026-08-25 18:31:02'),
(105, 'Dana Buku', 125000.00, 'Pinjaman buku paket.', 1, '2026-08-25 18:31:02', '2026-08-25 18:31:02');

-- --------------------------------------------------------

--
-- Table structure for table `financial_reports`
--

CREATE TABLE `financial_reports` (
  `id` int(10) UNSIGNED NOT NULL,
  `title` varchar(200) NOT NULL,
  `report_type` enum('harian','bulanan','semester','tahunan','custom') NOT NULL DEFAULT 'bulanan',
  `period_start` date NOT NULL,
  `period_end` date NOT NULL,
  `total_billed` decimal(14,2) NOT NULL DEFAULT 0.00,
  `total_paid` decimal(14,2) NOT NULL DEFAULT 0.00,
  `total_outstanding` decimal(14,2) NOT NULL DEFAULT 0.00,
  `generated_by` int(10) UNSIGNED DEFAULT NULL,
  `source_fingerprint` varchar(64) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `financial_reports`
--

INSERT INTO `financial_reports` (`id`, `title`, `report_type`, `period_start`, `period_end`, `total_billed`, `total_paid`, `total_outstanding`, `generated_by`, `source_fingerprint`, `notes`, `created_at`, `updated_at`) VALUES
(101, 'Laporan Pembayaran Agustus 2026', 'bulanan', '2026-08-01', '2026-08-31', 1300000.00, 900000.00, 400000.00, 1, NULL, 'Snapshot manual untuk testing.', '2026-08-25 18:31:02', '2026-08-25 18:31:02'),
(102, 'Rekap Semester Ganjil 2025/2026', 'semester', '2026-07-01', '2026-12-31', 2600000.00, 1750000.00, 850000.00, 1, NULL, NULL, '2026-08-25 18:31:02', '2026-08-25 18:31:02'),
(103, 'Laporan Tahunan 2025/2026', 'tahunan', '2025-07-01', '2026-06-30', 5200000.00, 4900000.00, 300000.00, 1, NULL, NULL, '2026-08-25 18:31:02', '2026-08-25 18:31:02');

-- --------------------------------------------------------

--
-- Table structure for table `grades`
--

CREATE TABLE `grades` (
  `id` int(10) UNSIGNED NOT NULL,
  `student_id` int(10) UNSIGNED NOT NULL,
  `subject_id` int(10) UNSIGNED NOT NULL,
  `class_id` int(10) UNSIGNED NOT NULL,
  `type` enum('tugas','uts','uas') NOT NULL,
  `score` decimal(5,2) NOT NULL DEFAULT 0.00,
  `semester` varchar(10) NOT NULL,
  `academic_year` varchar(20) NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `grades`
--

INSERT INTO `grades` (`id`, `student_id`, `subject_id`, `class_id`, `type`, `score`, `semester`, `academic_year`, `created_at`, `updated_at`) VALUES
(101, 52, 3, 1, 'tugas', 85.00, '1', '2025/2026', '2026-08-25 04:44:36', '2026-08-25 04:44:36'),
(102, 53, 4, 1, 'tugas', 78.50, '1', '2025/2026', '2026-08-25 04:44:36', '2026-08-25 04:44:36'),
(103, 54, 6, 1, 'uts', 90.00, '1', '2025/2026', '2026-08-25 04:44:36', '2026-08-25 04:44:36'),
(104, 55, 7, 1, 'uas', 88.00, '2', '2025/2026', '2026-08-25 04:44:36', '2026-08-25 04:44:36'),
(105, 56, 8, 1, 'uts', 92.25, '2', '2025/2026', '2026-08-25 04:44:36', '2026-08-25 04:44:36');

-- --------------------------------------------------------

--
-- Table structure for table `guardians`
--

CREATE TABLE `guardians` (
  `id` int(10) UNSIGNED NOT NULL,
  `student_id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `nik` varchar(20) DEFAULT NULL,
  `birth_year` smallint(5) UNSIGNED DEFAULT NULL,
  `education` varchar(100) DEFAULT NULL,
  `relation` enum('ayah','ibu','kakek','nenek','paman','bibi','lainnya') NOT NULL DEFAULT 'lainnya',
  `phone` varchar(20) DEFAULT NULL,
  `occupation` varchar(100) DEFAULT NULL,
  `income` varchar(100) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `guardians`
--

INSERT INTO `guardians` (`id`, `student_id`, `name`, `nik`, `birth_year`, `education`, `relation`, `phone`, `occupation`, `income`, `address`, `created_at`, `updated_at`) VALUES
(101, 52, 'Bapak Ahmad Setiawan', NULL, NULL, NULL, 'ayah', '081200000001', 'Petani', NULL, NULL, '2026-08-25 07:07:53', '2026-08-25 07:07:53'),
(102, 52, 'Ibu Siti Rahayu', NULL, NULL, NULL, 'ibu', '081200000001', 'Ibu Rumah Tangga', NULL, NULL, '2026-08-25 07:07:53', '2026-08-25 07:07:53'),
(103, 53, 'Bapak Karta Wijaya', NULL, NULL, NULL, 'kakek', '081200000006', 'Pensiunan', NULL, NULL, '2026-08-25 07:07:53', '2026-08-25 07:07:53'),
(104, 54, 'Ibu Larasati', NULL, NULL, NULL, 'bibi', '081200000007', 'Guru', NULL, NULL, '2026-08-25 07:07:53', '2026-08-25 07:07:53'),
(105, 55, 'Bapak Wartono', NULL, NULL, NULL, 'paman', '081200000008', 'Buruh', NULL, NULL, '2026-08-25 07:07:53', '2026-08-25 07:07:53'),
(106, 102, 'assa', NULL, NULL, NULL, 'ayah', '2323', 'assa', NULL, 'desss', '2026-08-27 16:34:37', '2026-08-27 16:34:37');

-- --------------------------------------------------------

--
-- Table structure for table `incoming_letters`
--

CREATE TABLE `incoming_letters` (
  `id` int(10) UNSIGNED NOT NULL,
  `letter_number` varchar(50) NOT NULL,
  `sender` varchar(150) NOT NULL,
  `subject` varchar(200) NOT NULL,
  `received_date` date NOT NULL,
  `letter_date` date DEFAULT NULL,
  `category` enum('undangan','permohonan','pemberitahuan','lainnya') NOT NULL DEFAULT 'lainnya',
  `is_important` tinyint(1) NOT NULL DEFAULT 0,
  `status` enum('baru','diproses','selesai','diarsipkan') NOT NULL DEFAULT 'baru',
  `file_path` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `incoming_letters`
--

INSERT INTO `incoming_letters` (`id`, `letter_number`, `sender`, `subject`, `received_date`, `letter_date`, `category`, `is_important`, `status`, `file_path`, `notes`, `created_at`, `updated_at`) VALUES
(101, 'SM-2026-001', 'Dinas Pendidikan Provinsi', 'Undangan rapat koordinasi kepala sekolah', '2026-08-20', '2026-08-18', 'undangan', 1, 'diproses', NULL, NULL, '2026-08-25 20:02:19', '2026-08-25 20:02:19'),
(102, 'SM-2026-002', 'Kemendikbudristek', 'Pemberitahuan jadwal ANBK 2026', '2026-08-22', '2026-08-20', 'pemberitahuan', 1, 'baru', NULL, NULL, '2026-08-25 20:02:19', '2026-08-25 20:02:19'),
(103, 'SM-2026-003', 'Pemerintah Desa Sukamaju', 'Permohonan kerja sama program belajar', '2026-08-24', '2026-08-23', 'permohonan', 0, 'selesai', NULL, NULL, '2026-08-25 20:02:19', '2026-08-25 20:02:19'),
(104, 'SM-2026-004', 'PT Telkom Indonesia', 'Penawaran internet dedicated', '2026-08-26', '2026-08-25', 'lainnya', 0, 'baru', NULL, NULL, '2026-08-25 20:02:19', '2026-08-25 20:02:19'),
(105, 'SM-2026-005', 'Polsek Sukamaju', 'Pemberitahuan jadwal sosialisasi', '2026-08-27', '2026-08-26', 'pemberitahuan', 0, 'diarsipkan', NULL, NULL, '2026-08-25 20:02:19', '2026-08-25 20:02:19');

-- --------------------------------------------------------

--
-- Table structure for table `inventories`
--

CREATE TABLE `inventories` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(20) NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `category` enum('stationery','electronics_supplies','cleaning','lab_supplies','office_supplies','other') NOT NULL,
  `unit` varchar(20) NOT NULL,
  `quantity` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `minimum_stock` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `location` varchar(150) DEFAULT NULL,
  `room_id` int(10) UNSIGNED DEFAULT NULL,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `jobs`
--

CREATE TABLE `jobs` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `queue` varchar(255) NOT NULL,
  `payload` longtext NOT NULL,
  `attempts` tinyint(3) UNSIGNED NOT NULL,
  `reserved_at` int(10) UNSIGNED DEFAULT NULL,
  `available_at` int(10) UNSIGNED NOT NULL,
  `created_at` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `job_batches`
--

CREATE TABLE `job_batches` (
  `id` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `total_jobs` int(11) NOT NULL,
  `pending_jobs` int(11) NOT NULL,
  `failed_jobs` int(11) NOT NULL,
  `failed_job_ids` longtext NOT NULL,
  `options` mediumtext DEFAULT NULL,
  `cancelled_at` int(11) DEFAULT NULL,
  `created_at` int(11) NOT NULL,
  `finished_at` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `maintenance`
--

CREATE TABLE `maintenance` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(20) NOT NULL,
  `title` varchar(150) NOT NULL,
  `description` text DEFAULT NULL,
  `asset_id` bigint(20) UNSIGNED DEFAULT NULL,
  `room_id` int(10) UNSIGNED DEFAULT NULL,
  `reported_by` varchar(100) DEFAULT NULL,
  `maintenance_type` enum('corrective','preventive','emergency','inspection') NOT NULL,
  `priority` enum('low','medium','high','urgent') NOT NULL DEFAULT 'medium',
  `status` enum('pending','in_progress','completed','cancelled') NOT NULL DEFAULT 'pending',
  `scheduled_date` date DEFAULT NULL,
  `started_date` date DEFAULT NULL,
  `completed_date` date DEFAULT NULL,
  `estimated_cost` decimal(12,2) DEFAULT NULL,
  `actual_cost` decimal(12,2) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `resolution` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `maintenance`
--

INSERT INTO `maintenance` (`id`, `code`, `title`, `description`, `asset_id`, `room_id`, `reported_by`, `maintenance_type`, `priority`, `status`, `scheduled_date`, `started_date`, `completed_date`, `estimated_cost`, `actual_cost`, `notes`, `resolution`, `created_at`, `updated_at`, `deleted_at`) VALUES
(101, 'MTC-001', 'Perbaikan lampu proyektor AST-001', 'Lampu proyektor redup dan mati sendiri.', 101, 1, 'Rina Marlina', 'corrective', 'high', 'completed', '2026-06-10', '2026-06-10', '2026-06-11', 500000.00, 450000.00, 'Dikerjakan teknisi sekolah.', 'Lampu proyektor diganti baru.', '2026-08-25 12:43:56', '2026-08-25 12:43:56', NULL),
(102, 'MTC-002', 'Servis rutin AC ruang komputer', 'Pembersihan dan isi freon AC lab.', NULL, 1, 'Agus Salim', 'preventive', 'medium', 'in_progress', '2026-08-30', '2026-08-30', NULL, 300000.00, NULL, NULL, NULL, '2026-08-25 12:43:56', '2026-08-25 12:43:56', NULL),
(103, 'MTC-003', 'Kalibrasi mikroskop binokuler', 'Kalibrasi tahunan peralatan biologi.', 104, 1, 'Darmawan', 'preventive', 'low', 'pending', '2026-09-15', NULL, NULL, 600000.00, NULL, NULL, NULL, '2026-08-25 12:43:56', '2026-08-25 12:43:56', NULL),
(104, 'MTC-004', 'Kerusakan laptop AST-002 unit 3', 'Laptop tidak menyala sama sekali.', 102, 1, 'Rina Marlina', 'emergency', 'urgent', 'completed', '2026-07-05', '2026-07-05', '2026-07-06', 800000.00, 750000.00, 'Dibawa ke service center resmi.', 'Mainboard diganti garansi.', '2026-08-25 12:43:56', '2026-08-25 12:43:56', NULL),
(105, 'MTC-005', 'Inspeksi meja praktikum', 'Pengecekan berkala kondisi meja lab.', NULL, 1, 'Agus Salim', 'inspection', 'low', 'cancelled', '2026-08-01', NULL, NULL, NULL, NULL, 'Dibatalkan karena ujian semester.', 'Dijadwalkan ulang setelah ujian.', '2026-08-25 12:43:56', '2026-08-25 12:43:56', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `migration` varchar(255) NOT NULL,
  `batch` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '0001_01_01_000000_create_users_table', 1),
(2, '0001_01_01_000001_create_cache_table', 1),
(3, '0001_01_01_000002_create_jobs_table', 1),
(4, '2026_08_20_145152_create_personal_access_tokens_table', 1),
(5, '2026_08_25_000000_create_assets_table', 2),
(6, '2026_08_26_000000_create_maintenance_table', 2),
(7, '2026_08_27_000000_create_inventories_table', 2),
(8, '2026_08_27_000001_create_stock_movements_table', 2),
(9, '2026_08_27_100001_create_permissions_tables', 2),
(10, '2026_08_27_100002_create_settings_table', 2),
(11, '2026_08_27_100003_create_academic_years_table', 2),
(12, '2026_08_27_100004_create_academic_modules_tables', 2),
(13, '2026_08_27_100005_create_student_modules_tables', 2),
(14, '2026_08_27_100006_create_counseling_extracurricular_tables', 2),
(15, '2026_08_27_100007_create_teacher_modules_tables', 2),
(16, '2026_08_27_100008_create_notification_calendar_tables', 2),
(17, '2026_08_27_100009_create_finance_modules_tables', 2),
(18, '2026_08_28_000001_create_administration_tables', 3),
(19, '2026_08_28_000001_alter_registrants_table', 4),
(20, '2026_08_26_000001_add_soft_deletes_to_academic_years_table', 5),
(21, '2026_08_28_000000_add_dates_to_academic_years_table', 6),
(22, '2026_08_27_100002_5_create_base_tables', 7),
(23, '2026_08_30_000001_create_grades_table', 7),
(24, '2026_08_31_000001_add_period_and_softdelete_to_billings_table', 7),
(25, '2026_08_31_000002_add_ref_key_and_softdelete_to_payments_table', 7),
(26, '2026_08_31_000003_add_softdelete_to_payment_transactions_table', 7),
(27, '2026_08_31_000004_add_source_fingerprint_to_financial_reports_table', 7),
(28, '2026_08_31_000005_add_softdelete_to_scholarships_table', 7),
(29, '2026_08_31_000006_backfill_billings_periods_and_uniq_keys', 7),
(30, '2026_08_31_000007_sign_refund_transactions', 7),
(31, '2026_08_31_000008_backfill_payments_ref_keys', 7),
(32, '2026_08_31_000009_secure_students_user_link', 7),
(34, '2026_08_31_170110_add_student_id_to_registrants_table', 8),
(35, '2026_08_31_172635_add_data_completed_to_registrants_table', 9),
(36, '2026_08_31_175503_create_re_registrants_table', 10),
(37, '2026_09_01_000001_create_examination_tables', 11),
(38, '2026_09_01_000002_align_rooms_table_with_api_contract', 11),
(39, '2026_09_02_000001_create_announcements_table', 11),
(40, '2026_09_03_000001_extend_settings_for_configuration_management', 11),
(41, '2026_09_03_000002_create_permission_user_table', 11);

-- --------------------------------------------------------

--
-- Table structure for table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL,
  `title` varchar(200) NOT NULL,
  `message` text NOT NULL,
  `type` varchar(50) NOT NULL DEFAULT 'info',
  `is_read` tinyint(1) NOT NULL DEFAULT 0,
  `read_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `notifications`
--

INSERT INTO `notifications` (`id`, `user_id`, `title`, `message`, `type`, `is_read`, `read_at`, `created_at`, `updated_at`) VALUES
(101, 1, 'Ujian Baru Dibuat', 'Quiz Fisika Listrik dijadwalkan 2026-08-29 pada Sesi Siang 1.', 'exam', 0, NULL, '2026-08-25 17:22:41', '2026-08-25 17:22:41'),
(102, 2, 'Tugas Baru', 'Latihan Aljabar Bab 1 diberikan untuk kelas X.', 'assignment', 0, NULL, '2026-08-25 17:22:41', '2026-08-25 17:22:41'),
(103, 4, 'Rapor Semester Diterbitkan', 'Rapor semester 1 tahun ajaran 2025/2026 sudah tersedia.', 'info', 1, '2026-08-20 10:00:00', '2026-08-25 17:22:41', '2026-08-25 17:22:41'),
(104, 55, 'Pelanggaran Dicatat', 'Poin pelanggaran ditambahkan: terlambat masuk sekolah.', 'violation', 0, NULL, '2026-08-25 17:22:41', '2026-08-25 17:22:41'),
(105, 70, 'Beasiswa Aktif', 'Beasiswa PIP Anda aktif untuk tahun ajaran 2025/2026.', 'info', 0, NULL, '2026-08-25 17:22:41', '2026-08-25 17:22:41');

-- --------------------------------------------------------

--
-- Table structure for table `outgoing_letters`
--

CREATE TABLE `outgoing_letters` (
  `id` int(10) UNSIGNED NOT NULL,
  `letter_number` varchar(50) NOT NULL,
  `recipient` varchar(150) NOT NULL,
  `subject` varchar(200) NOT NULL,
  `letter_date` date NOT NULL,
  `sent_date` date DEFAULT NULL,
  `category` enum('undangan','permohonan','pemberitahuan','lainnya') NOT NULL DEFAULT 'lainnya',
  `status` enum('draft','terkirim','diarsipkan') NOT NULL DEFAULT 'draft',
  `file_path` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `outgoing_letters`
--

INSERT INTO `outgoing_letters` (`id`, `letter_number`, `recipient`, `subject`, `letter_date`, `sent_date`, `category`, `status`, `file_path`, `notes`, `created_at`, `updated_at`) VALUES
(101, 'SK-2026-001', 'Dinas Pendidikan Provinsi', 'Laporan bulanan kegiatan sekolah', '2026-08-05', '2026-08-05', 'pemberitahuan', 'terkirim', NULL, NULL, '2026-08-25 20:02:19', '2026-08-25 20:02:19'),
(102, 'SK-2026-002', 'Orang Tua/Wali Siswa Kelas X', 'Undangan sosialisasi kurikulum', '2026-08-15', '2026-08-16', 'undangan', 'terkirim', NULL, NULL, '2026-08-25 20:02:19', '2026-08-25 20:02:19'),
(103, 'SK-2026-003', 'Kemendikbudristek', 'Permohonan bantuan laboratorium komputer', '2026-08-20', NULL, 'permohonan', 'draft', NULL, NULL, '2026-08-25 20:02:19', '2026-08-25 20:02:19'),
(104, 'SK-2026-004', 'Polsek Sukamaju', 'Surat tugas pendampingan sosialisasi', '2026-08-28', '2026-08-28', 'lainnya', 'terkirim', NULL, NULL, '2026-08-25 20:02:19', '2026-08-25 20:02:19'),
(105, 'SK-2026-005', 'Yayasan Pendidikan', 'Laporan pencairan beasiswa semester 1', '2026-08-29', NULL, 'pemberitahuan', 'diarsipkan', NULL, NULL, '2026-08-25 20:02:19', '2026-08-25 20:02:19');

-- --------------------------------------------------------

--
-- Table structure for table `parents`
--

CREATE TABLE `parents` (
  `id` int(10) UNSIGNED NOT NULL,
  `student_id` int(10) UNSIGNED NOT NULL,
  `father_name` varchar(100) NOT NULL,
  `father_birth_year` smallint(5) UNSIGNED DEFAULT NULL,
  `father_education` varchar(100) DEFAULT NULL,
  `mother_name` varchar(100) NOT NULL,
  `mother_birth_year` smallint(5) UNSIGNED DEFAULT NULL,
  `mother_education` varchar(100) DEFAULT NULL,
  `father_occupation` varchar(100) DEFAULT NULL,
  `father_income` varchar(100) DEFAULT NULL,
  `father_nik` varchar(20) DEFAULT NULL,
  `mother_occupation` varchar(100) DEFAULT NULL,
  `mother_income` varchar(100) DEFAULT NULL,
  `mother_nik` varchar(20) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `parents`
--

INSERT INTO `parents` (`id`, `student_id`, `father_name`, `father_birth_year`, `father_education`, `mother_name`, `mother_birth_year`, `mother_education`, `father_occupation`, `father_income`, `father_nik`, `mother_occupation`, `mother_income`, `mother_nik`, `phone`, `address`, `created_at`, `updated_at`) VALUES
(101, 52, 'Bapak Ahmad Setiawan', NULL, NULL, 'Ibu Siti Rahayu', NULL, NULL, 'Petani', NULL, NULL, 'Ibu Rumah Tangga', NULL, NULL, '081200000001', 'Jl. Melati No. 1', '2026-08-25 07:07:53', '2026-08-25 07:07:53'),
(102, 53, 'Bapak Budi Santoso', NULL, NULL, 'Ibu Dewi Lestari', NULL, NULL, 'Wiraswasta', NULL, NULL, 'Guru', NULL, NULL, '081200000002', 'Jl. Mawar No. 2', '2026-08-25 07:07:53', '2026-08-25 07:07:53'),
(103, 54, 'Bapak Eko Prasetyo', NULL, NULL, 'Ibu Rina Wulandari', NULL, NULL, 'Karyawan Swasta', NULL, NULL, 'Pedagang', NULL, NULL, '081200000003', 'Jl. Anggrek No. 3', '2026-08-25 07:07:53', '2026-08-25 07:07:53'),
(104, 55, 'Bapak Hendra Gunawan', NULL, NULL, 'Ibu Yuni Astuti', NULL, NULL, 'PNS', NULL, NULL, 'Ibu Rumah Tangga', NULL, NULL, '081200000004', 'Jl. Kenanga No. 4', '2026-08-25 07:07:53', '2026-08-25 07:07:53'),
(105, 56, 'Bapak Joko Susilo Bambang Yudoyono', NULL, NULL, 'Ibu Sri Handayani', NULL, NULL, 'Nelayan', NULL, NULL, 'Penjahit', NULL, NULL, '081200000005', 'Jl. Dahlia No. 5', '2026-08-25 07:07:53', '2026-08-27 16:16:33'),
(107, 102, 'messi', NULL, NULL, 'freya', NULL, NULL, 'CEO', NULL, NULL, 'CEO', NULL, NULL, '121234567', 'dasdasdasdas', '2026-08-27 18:46:58', '2026-08-27 18:46:58'),
(113, 108, 'dadasdas', NULL, 'smp', 'adads', NULL, 'sma', 'dsa', NULL, '1234123412341111', 'adsdas', NULL, '1234512341122112', '085868749808', 'Larangan, Maduretno, Kalikajar', '2026-08-31 15:44:17', '2026-08-31 15:44:17'),
(114, 122, 'Joko Santoso', NULL, 'SMA', 'Rina Wati', NULL, 'SMA', 'Pedagang', '4000000.00', '3372010101010003', 'Wiraswasta', '3500000.00', '3372010101010004', '081234567802', 'Jl. Diponegoro No. 21', '2026-08-31 17:08:24', '2026-08-31 17:08:24'),
(115, 123, 'Hendra Putra', NULL, 'SMA', 'Maya Putri', NULL, 'SMA', 'Karyawan Swasta', '4000000.00', '3372010101010009', 'Guru', '4500000.00', NULL, '081234567805', 'Jl. Pemuda No. 30', '2026-08-31 17:51:09', '2026-08-31 17:51:09');

-- --------------------------------------------------------

--
-- Table structure for table `payments`
--

CREATE TABLE `payments` (
  `id` int(10) UNSIGNED NOT NULL,
  `billing_id` int(10) UNSIGNED NOT NULL,
  `student_id` int(10) UNSIGNED NOT NULL,
  `payment_date` date NOT NULL,
  `amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `method` enum('cash','transfer','qris','lainnya') NOT NULL DEFAULT 'cash',
  `reference_number` varchar(50) DEFAULT NULL,
  `ref_key` varchar(50) DEFAULT NULL,
  `received_by` int(10) UNSIGNED DEFAULT NULL,
  `notes` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payments`
--

INSERT INTO `payments` (`id`, `billing_id`, `student_id`, `payment_date`, `amount`, `method`, `reference_number`, `ref_key`, `received_by`, `notes`, `created_at`, `updated_at`, `deleted_at`) VALUES
(101, 101, 52, '2026-08-05', 350000.00, 'cash', 'KWT-001', 'KWT-001', 1, 'Lunas SPP Agustus.', '2026-08-25 18:31:02', '2026-08-25 18:31:02', NULL),
(102, 102, 53, '2026-08-06', 200000.00, 'transfer', 'TRF-889', 'TRF-889', 1, 'Cicilan pertama.', '2026-08-25 18:31:02', '2026-08-25 18:31:02', NULL),
(103, 104, 55, '2026-08-04', 350000.00, 'qris', 'QR-771', 'QR-771', 1, NULL, '2026-08-25 18:31:02', '2026-08-25 18:31:02', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `payment_transactions`
--

CREATE TABLE `payment_transactions` (
  `id` int(10) UNSIGNED NOT NULL,
  `payment_id` int(10) UNSIGNED NOT NULL,
  `transaction_code` varchar(50) NOT NULL,
  `type` enum('payment','refund','adjustment') NOT NULL DEFAULT 'payment',
  `amount` decimal(12,2) NOT NULL DEFAULT 0.00,
  `method` enum('cash','transfer','qris','lainnya') NOT NULL DEFAULT 'cash',
  `status` enum('success','pending','failed') NOT NULL DEFAULT 'success',
  `transaction_date` datetime NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `payment_transactions`
--

INSERT INTO `payment_transactions` (`id`, `payment_id`, `transaction_code`, `type`, `amount`, `method`, `status`, `transaction_date`, `created_at`, `updated_at`, `deleted_at`) VALUES
(101, 101, 'TRX-2026-0001', 'payment', 350000.00, 'cash', 'success', '2026-08-05 09:00:00', '2026-08-25 18:31:02', '2026-08-25 18:31:02', NULL),
(102, 102, 'TRX-2026-0002', 'payment', 200000.00, 'transfer', 'success', '2026-08-06 10:30:00', '2026-08-25 18:31:02', '2026-08-25 18:31:02', NULL),
(103, 103, 'TRX-2026-0003', 'payment', 350000.00, 'qris', 'success', '2026-08-04 14:15:00', '2026-08-25 18:31:02', '2026-08-25 18:31:02', NULL),
(104, 102, 'TRX-2026-0004', 'refund', -50000.00, 'transfer', 'pending', '2026-08-07 11:00:00', '2026-08-25 18:31:02', '2026-08-25 18:31:02', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `periods`
--

CREATE TABLE `periods` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(50) NOT NULL,
  `start_time` time NOT NULL,
  `end_time` time NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `periods`
--

INSERT INTO `periods` (`id`, `name`, `start_time`, `end_time`, `created_at`, `updated_at`) VALUES
(101, 'Jam ke-1', '07:00:00', '07:40:00', '2026-08-25 05:39:12', '2026-08-25 05:39:12'),
(102, 'Jam ke-2', '07:40:00', '08:20:00', '2026-08-25 05:39:12', '2026-08-25 05:39:12'),
(103, 'Jam ke-3', '08:20:00', '09:00:00', '2026-08-25 05:39:12', '2026-08-25 05:39:12'),
(104, 'Jam ke-4', '09:20:00', '10:00:00', '2026-08-25 05:39:12', '2026-08-25 05:39:12'),
(105, 'Jam ke-5', '10:00:00', '10:40:00', '2026-08-25 05:39:12', '2026-08-25 05:39:12'),
(106, 'Jam ke-6', '10:40:00', '11:20:00', '2026-08-25 05:39:12', '2026-08-25 05:39:12'),
(107, 'Jam ke-7', '12:30:00', '13:10:00', '2026-08-25 05:39:12', '2026-08-25 05:39:12'),
(108, 'Jam ke-8', '13:10:00', '13:50:00', '2026-08-25 05:39:12', '2026-08-25 05:39:12');

-- --------------------------------------------------------

--
-- Table structure for table `permissions`
--

CREATE TABLE `permissions` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `permissions`
--

INSERT INTO `permissions` (`id`, `name`, `description`, `created_at`, `updated_at`) VALUES
(1, 'manage-exams', 'Kelola ujian dan jadwalnya', '2026-08-24 20:13:25', '2026-08-24 20:14:41'),
(2, 'manage-users', 'Kelola data pengguna', '2026-08-24 20:46:07', '2026-08-24 20:46:07');

-- --------------------------------------------------------

--
-- Table structure for table `permission_role`
--

CREATE TABLE `permission_role` (
  `permission_id` int(10) UNSIGNED NOT NULL,
  `role_id` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `permission_role`
--

INSERT INTO `permission_role` (`permission_id`, `role_id`) VALUES
(2, 6);

-- --------------------------------------------------------

--
-- Table structure for table `permission_user`
--

CREATE TABLE `permission_user` (
  `permission_id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `personal_access_tokens`
--

CREATE TABLE `personal_access_tokens` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `tokenable_type` varchar(255) NOT NULL,
  `tokenable_id` bigint(20) UNSIGNED NOT NULL,
  `name` text NOT NULL,
  `token` varchar(64) NOT NULL,
  `abilities` text DEFAULT NULL,
  `last_used_at` timestamp NULL DEFAULT NULL,
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `personal_access_tokens`
--

INSERT INTO `personal_access_tokens` (`id`, `tokenable_type`, `tokenable_id`, `name`, `token`, `abilities`, `last_used_at`, `expires_at`, `created_at`, `updated_at`) VALUES
(1, 'App\\Models\\User', 2, 'schoolcms', '27fc1eb415c93ee0a9bbd6f2da17f884364fb13c7eccc38c034f63cdc3ff94a7', '[\"*\"]', NULL, NULL, '2026-08-20 08:05:48', '2026-08-20 08:05:48'),
(2, 'App\\Models\\User', 2, 'schoolcms', 'e3f0e877ded9eb22758e45daafb41caa31a1fa57e637aa85b8f0a3ab7a4a9d2c', '[\"*\"]', NULL, NULL, '2026-08-20 08:07:02', '2026-08-20 08:07:02'),
(3, 'App\\Models\\User', 2, 'schoolcms', '772d38012d78cd7cb59a52033f04aeafbaf702b05384343e4d63bba659deca19', '[\"*\"]', NULL, NULL, '2026-08-20 08:07:53', '2026-08-20 08:07:53'),
(6, 'App\\Models\\User', 2, 'schoolcms', 'b6b5a72403056dcf2bdd274f696096985398ac2b32eae5457807cf0a57a33d8d', '[\"*\"]', '2026-08-21 01:42:39', NULL, '2026-08-21 01:42:16', '2026-08-21 01:42:39'),
(7, 'App\\Models\\User', 2, 'schoolcms', '7a053f750e73e96fa0b20b64aae76024b079a13efb0b472261f19641b43ed1ea', '[\"*\"]', '2026-08-21 02:17:41', NULL, '2026-08-21 02:11:30', '2026-08-21 02:17:41'),
(8, 'App\\Models\\User', 2, 'schoolcms', '65f5180f7decd2201d300ba1506b82456c3bae0cfac39d8a23d5e3c54c1bc498', '[\"*\"]', '2026-08-21 02:21:39', NULL, '2026-08-21 02:17:50', '2026-08-21 02:21:39'),
(9, 'App\\Models\\User', 2, 'schoolcms', '7576841302d7bc57f573fae651369769f4dada9fb2b03f9d209bb746b63ceaf8', '[\"*\"]', '2026-08-21 02:47:23', NULL, '2026-08-21 02:21:52', '2026-08-21 02:47:23'),
(10, 'App\\Models\\User', 2, 'schoolcms', 'afa91f8b410364ec68ae6338b8a851639609783e6be476eba3fa3a3df961bed3', '[\"*\"]', '2026-08-21 05:05:22', NULL, '2026-08-21 03:36:47', '2026-08-21 05:05:22'),
(11, 'App\\Models\\User', 2, 'schoolcms', '3bf937b480e12e8ae5b73f83da47141cdde88bc39b22658d968a42a6b7907219', '[\"*\"]', '2026-08-25 06:13:40', NULL, '2026-08-24 11:26:08', '2026-08-25 06:13:40'),
(12, 'App\\Models\\User', 2, 'schoolcms', '587241159d4796e6b22c3126a9c7ebbc8d6f93415ec75a1143fb562b9ad0cf4b', '[\"*\"]', NULL, NULL, '2026-08-24 13:18:40', '2026-08-24 13:18:40'),
(17, 'App\\Models\\User', 2, 'schoolcms', '7e08328e3cf6f1d2320fc11ecf298af3bdbe9f9fe52e1655562ce0efd6039e8c', '[\"*\"]', '2026-08-26 03:54:37', NULL, '2026-08-26 03:48:49', '2026-08-26 03:54:37'),
(18, 'App\\Models\\User', 2, 'schoolcms', '0d196ec5c348a47d40347644efc96912e46e81666db9b11df87289fff903b454', '[\"*\"]', '2026-08-26 04:05:55', NULL, '2026-08-26 03:55:02', '2026-08-26 04:05:55'),
(19, 'App\\Models\\System\\User', 2, 'schoolcms', '5d10adff356d8e2f2765fa7a9be1218a4f66367e44d26555d8c35ee8c3ecf192', '[\"*\"]', NULL, NULL, '2026-08-26 04:55:36', '2026-08-26 04:55:36'),
(20, 'App\\Models\\System\\User', 2, 'schoolcms', '2cf68ce9d8e1ec74ecdd593e16463cd6a6f053f4ec5ed4314ce232c3a427fb3f', '[\"*\"]', '2026-08-26 06:52:36', NULL, '2026-08-26 05:13:22', '2026-08-26 06:52:36'),
(27, 'App\\Models\\System\\User', 2, 'schoolcms', '793a7a645250bc484aa0ce62809b9943349deebdfd7274ca9ed9c8c37330ea68', '[\"*\"]', '2026-08-28 06:11:08', NULL, '2026-08-26 06:54:13', '2026-08-28 06:11:08'),
(28, 'App\\Models\\System\\User', 2, 'schoolcms', '198c8f238e96062b0d587d21c0a915c283732af9013a1cb7c613aa77b835cf80', '[\"*\"]', NULL, NULL, '2026-08-27 05:53:57', '2026-08-27 05:53:57'),
(29, 'App\\Models\\System\\User', 2, 'schoolcms', 'f5baf698a01b115dc268f1a3bb1862322c7550a142aff79e34a62922e06cfb0d', '[\"*\"]', NULL, NULL, '2026-08-27 05:55:49', '2026-08-27 05:55:49'),
(30, 'App\\Models\\System\\User', 2, 'schoolcms', '099a5ef64256d831023dfe2a56063c1935353bd45a4c9f02818067c392ceeb93', '[\"*\"]', NULL, NULL, '2026-08-27 05:56:23', '2026-08-27 05:56:23'),
(31, 'App\\Models\\System\\User', 2, 'schoolcms', '1fe3f393592fdb0961a6c55b41d0031552fd7da682d4d29a1fc61d8fc1578183', '[\"*\"]', NULL, NULL, '2026-08-27 06:00:00', '2026-08-27 06:00:00'),
(32, 'App\\Models\\System\\User', 2, 'schoolcms', 'fb495871b78f7830db5f6ac36c3a17d2369a2db5aab42de5b84ad4c88d355f34', '[\"*\"]', NULL, NULL, '2026-08-27 06:00:37', '2026-08-27 06:00:37'),
(33, 'App\\Models\\System\\User', 2, 'schoolcms', '356e1a4bb168ca2906f8af35ef9c1f64e57718e21fd6fc58844ac8f1668267e8', '[\"*\"]', NULL, NULL, '2026-08-27 06:01:29', '2026-08-27 06:01:29'),
(34, 'App\\Models\\System\\User', 2, 'schoolcms', '5d6de897cb602b1a9bf69bc7be8de92311c49b45f58a20c385aa5cc18e74d82b', '[\"*\"]', NULL, NULL, '2026-08-27 06:07:19', '2026-08-27 06:07:19'),
(35, 'App\\Models\\System\\User', 2, 'schoolcms', 'fa429df5a60e1418f8fa0ed9c8dedef386cb24bf54d61d62cdb86d24a247045e', '[\"*\"]', NULL, NULL, '2026-08-27 06:10:14', '2026-08-27 06:10:14'),
(36, 'App\\Models\\System\\User', 2, 'schoolcms', 'd101ba73eddfaecd6ccdaa166b963ff0f80c328c65a67e0721390bdc0d2f9e00', '[\"*\"]', NULL, NULL, '2026-08-27 06:10:36', '2026-08-27 06:10:36'),
(37, 'App\\Models\\System\\User', 2, 'schoolcms', '42cd69b95f73eb0b77613361e60de0f29ccfce64fd8f16b199467dcccb4956bf', '[\"*\"]', NULL, NULL, '2026-08-27 06:12:09', '2026-08-27 06:12:09'),
(38, 'App\\Models\\System\\User', 2, 'schoolcms', '8c14b51bc948cde56be8c178185adda0a1e492143fa018cd6f5ac28b533aec2c', '[\"*\"]', NULL, NULL, '2026-08-27 06:14:33', '2026-08-27 06:14:33'),
(39, 'App\\Models\\System\\User', 2, 'schoolcms', '2000bab0ac6fbd20361db944775cc7070bbd26f01bcc43359324bde3c99220ad', '[\"*\"]', NULL, NULL, '2026-08-27 06:24:07', '2026-08-27 06:24:07'),
(40, 'App\\Models\\System\\User', 2, 'schoolcms', '862b72c6dacf398f301f7090165f042d07b29d9343d34eee6849a60de173d738', '[\"*\"]', NULL, NULL, '2026-08-27 06:29:49', '2026-08-27 06:29:49'),
(41, 'App\\Models\\System\\User', 2, 'schoolcms', 'd79da3301cb481639c20faaf3550549e64da26dd47e24dbef2b84fb9ade53465', '[\"*\"]', NULL, NULL, '2026-08-27 06:29:56', '2026-08-27 06:29:56'),
(42, 'App\\Models\\System\\User', 2, 'schoolcms', 'c855c441aee34a15414dca6f5af41781a884cbcca340935b89c3c0f81a2bcd9a', '[\"*\"]', NULL, NULL, '2026-08-27 06:31:36', '2026-08-27 06:31:36'),
(43, 'App\\Models\\System\\User', 2, 'schoolcms', 'ebe4aee7d19bb71083bf14c4bfd3cfd85f02e3548995739e4255cd606d0ed30e', '[\"*\"]', NULL, NULL, '2026-08-27 06:37:08', '2026-08-27 06:37:08'),
(44, 'App\\Models\\System\\User', 2, 'schoolcms', '22ef7d8231e8ae73afea578cad5ef8ce7fcf1617e8df3e62a5d8c2bf8236a095', '[\"*\"]', NULL, NULL, '2026-08-27 06:37:18', '2026-08-27 06:37:18'),
(45, 'App\\Models\\System\\User', 2, 'schoolcms', 'd7e8ae35be5a11a3e70ff0935e3cf4294b25b74f8007a4e1f5cc206e73de632b', '[\"*\"]', NULL, NULL, '2026-08-27 06:37:31', '2026-08-27 06:37:31'),
(46, 'App\\Models\\System\\User', 2, 'schoolcms', '9657dc38473629067c7ad837b9dec512bf02f4cd2af0f4b67d40d9e101d22c8f', '[\"*\"]', NULL, NULL, '2026-08-27 06:37:45', '2026-08-27 06:37:45'),
(47, 'App\\Models\\System\\User', 2, 'schoolcms', '7b7ce57ba3202c203938e0dc6b941a10ee21cd671a9c3921b17da5d988cd7c9e', '[\"*\"]', NULL, NULL, '2026-08-27 06:37:58', '2026-08-27 06:37:58'),
(48, 'App\\Models\\System\\User', 2, 'schoolcms', 'f49aa5a2ebf71bfb5a9feb4cf39d5ce8e807c070f13e526e23cf1f7ea0c28479', '[\"*\"]', NULL, NULL, '2026-08-27 06:39:21', '2026-08-27 06:39:21'),
(49, 'App\\Models\\System\\User', 2, 'schoolcms', 'a8d24f924aeec17190594fb0fd58d5692fbcd451772e3967dd00d35f489eb0c9', '[\"*\"]', NULL, NULL, '2026-08-27 06:39:37', '2026-08-27 06:39:37'),
(50, 'App\\Models\\System\\User', 2, 'schoolcms', '6fe8b53726ca9d9804c729d17eb297dceeccd5bbf0b03b1c68b13aa6123aa113', '[\"*\"]', NULL, NULL, '2026-08-27 06:39:42', '2026-08-27 06:39:42'),
(51, 'App\\Models\\System\\User', 2, 'schoolcms', 'ca5f66f7e4dce6825f70a70dc9b1a8a849e64fe8ab1a476daaebab4ece5fbae2', '[\"*\"]', NULL, NULL, '2026-08-27 06:42:49', '2026-08-27 06:42:49'),
(52, 'App\\Models\\System\\User', 2, 'schoolcms', '2cfd873b35a34f36cf4c2e64aa66f49064160ef8d859988edecf49c488ff0bca', '[\"*\"]', NULL, NULL, '2026-08-27 06:44:41', '2026-08-27 06:44:41'),
(53, 'App\\Models\\System\\User', 2, 'schoolcms', '673ff744467f84e6ccd5ccdea29bcf6dde6e5ef46b7a20e2b1b0a8436210c3fb', '[\"*\"]', NULL, NULL, '2026-08-27 06:45:12', '2026-08-27 06:45:12'),
(54, 'App\\Models\\System\\User', 2, 'schoolcms', 'd7405157d969edcbbf3d9cc4faebcac1a23e0df52d6fba5e72abf4f2fac0acb8', '[\"*\"]', NULL, NULL, '2026-08-27 06:45:32', '2026-08-27 06:45:32'),
(55, 'App\\Models\\System\\User', 2, 'schoolcms', 'f2d4701029b1bf2771904bef84792554467cb0ed78b79c7e4cd2ce564a16c477', '[\"*\"]', NULL, NULL, '2026-08-27 06:46:09', '2026-08-27 06:46:09'),
(56, 'App\\Models\\System\\User', 2, 'schoolcms', 'bb09508a4fc442222fbc147d1fcf7f2b55f29f722eb16d13d078b28485cf4a77', '[\"*\"]', NULL, NULL, '2026-08-27 06:47:00', '2026-08-27 06:47:00'),
(57, 'App\\Models\\System\\User', 2, 'schoolcms', '25c4486a4dbee570e15d3d8a884db0fe0b8d424fc0188e3b60b9329e912ecc9c', '[\"*\"]', NULL, NULL, '2026-08-27 06:47:30', '2026-08-27 06:47:30'),
(58, 'App\\Models\\System\\User', 2, 'schoolcms', '6d1c28ff7ca2fc1b92f7abe47561335e15869782aa3ed764e6959bb5e6451c9b', '[\"*\"]', NULL, NULL, '2026-08-27 06:48:42', '2026-08-27 06:48:42'),
(59, 'App\\Models\\System\\User', 2, 'schoolcms', 'c20c0080375940285f30d19d69a0c7ca9c8c41759fa671ba413c73c88c007d4c', '[\"*\"]', NULL, NULL, '2026-08-27 06:48:51', '2026-08-27 06:48:51'),
(60, 'App\\Models\\System\\User', 2, 'schoolcms', '54d8324c3eb770f147de71f97db8bfb45e0e3ddc9e22cc432823e252c36c9c64', '[\"*\"]', NULL, NULL, '2026-08-27 06:48:59', '2026-08-27 06:48:59'),
(61, 'App\\Models\\System\\User', 2, 'schoolcms', '67bd3f285b961032ce872c829b70c0f47cfe4cfe7d2f42cee053eb79132bf0ce', '[\"*\"]', NULL, NULL, '2026-08-27 06:49:30', '2026-08-27 06:49:30'),
(62, 'App\\Models\\System\\User', 2, 'schoolcms', '7e13d96afd37d356c8a9c4d7cfe8a113a3a306c250f3ac0c501104d615971ec6', '[\"*\"]', NULL, NULL, '2026-08-27 06:49:40', '2026-08-27 06:49:40'),
(63, 'App\\Models\\System\\User', 2, 'schoolcms', '657448ecdeb423a2eec3cb54bd3e9d867da126f2ddc0ec1786ab6fe97714083d', '[\"*\"]', NULL, NULL, '2026-08-27 06:51:32', '2026-08-27 06:51:32'),
(64, 'App\\Models\\System\\User', 2, 'schoolcms', 'f925d3031d3b406f6266af691dad6e622cbf8bd54f35c1fdca85df8760621cc5', '[\"*\"]', NULL, NULL, '2026-08-27 06:52:11', '2026-08-27 06:52:11'),
(65, 'App\\Models\\System\\User', 2, 'schoolcms', 'c8b54270925551308f767465759201a12613e6e72de000174088abd4909c82a2', '[\"*\"]', NULL, NULL, '2026-08-27 06:52:20', '2026-08-27 06:52:20'),
(66, 'App\\Models\\System\\User', 2, 'schoolcms', '66a4b4f52e58dad584ba063cec6b716507c9c7810ea208f0b6e1b31845387b75', '[\"*\"]', NULL, NULL, '2026-08-27 06:52:37', '2026-08-27 06:52:37'),
(67, 'App\\Models\\System\\User', 2, 'schoolcms', 'de9456f9b272a500c7de998549103a0259785d28d1c1bd41af46ce6a21a3da4c', '[\"*\"]', NULL, NULL, '2026-08-27 06:53:42', '2026-08-27 06:53:42'),
(68, 'App\\Models\\System\\User', 2, 'schoolcms', '8b2a45a59a9297800cfce3692768c2db23a2596e812a2428fc8d0b21275dad50', '[\"*\"]', NULL, NULL, '2026-08-27 06:53:53', '2026-08-27 06:53:53'),
(69, 'App\\Models\\System\\User', 2, 'schoolcms', '349b00be0facf50483a57db5ed53f58bd178aa78bc1663371f3a34defa1b0fbe', '[\"*\"]', NULL, NULL, '2026-08-27 06:54:01', '2026-08-27 06:54:01'),
(70, 'App\\Models\\System\\User', 2, 'schoolcms', '4237916f5ac5080be72f018b3a449eb692b5d7041a3d553c3f0a73934d9edf65', '[\"*\"]', NULL, NULL, '2026-08-27 06:54:11', '2026-08-27 06:54:11'),
(71, 'App\\Models\\System\\User', 2, 'schoolcms', '08fb9ba7793fa7356006fd267868d0622632d697566ef19bf2050cca19aa69b5', '[\"*\"]', NULL, NULL, '2026-08-27 06:54:25', '2026-08-27 06:54:25'),
(72, 'App\\Models\\System\\User', 2, 'schoolcms', 'b3af2adcfeb2ab534df93727b601ce2cf40292f9bc0c1ebfd82e811558ef834d', '[\"*\"]', NULL, NULL, '2026-08-27 06:56:01', '2026-08-27 06:56:01'),
(73, 'App\\Models\\System\\User', 2, 'schoolcms', 'e77d4ab23af2a1a27d2b3a306d1ee77eea0bc56c7aeede59287fb666a0282083', '[\"*\"]', NULL, NULL, '2026-08-27 06:56:22', '2026-08-27 06:56:22'),
(74, 'App\\Models\\System\\User', 2, 'schoolcms', 'bc888fe2cbc55d07451a06fb2868f868cc6a496469c1d47ada1df02b6e979d69', '[\"*\"]', NULL, NULL, '2026-08-27 06:57:51', '2026-08-27 06:57:51'),
(75, 'App\\Models\\System\\User', 2, 'schoolcms', 'acd01b42729b61dfc4f9a808b53f188f1e0877ed8a484d99f3d6dbc4c4d75b3d', '[\"*\"]', NULL, NULL, '2026-08-27 06:58:02', '2026-08-27 06:58:02'),
(76, 'App\\Models\\System\\User', 2, 'schoolcms', '514be81ba925ad414dda37eeb9da7fdd989556b0cf0312e6261cb3689f8c7819', '[\"*\"]', NULL, NULL, '2026-08-27 07:00:08', '2026-08-27 07:00:08'),
(77, 'App\\Models\\System\\User', 2, 'schoolcms', 'efe39f6d9a27b828ad1d27393aa1929a15c4a189205218397483460f6af584ff', '[\"*\"]', NULL, NULL, '2026-08-27 07:01:14', '2026-08-27 07:01:14'),
(78, 'App\\Models\\System\\User', 2, 'schoolcms', 'a4d9fb7f3ec7364133deb8778c79208b864b68e61548cb8c96078c43f7390065', '[\"*\"]', '2026-08-27 11:12:06', NULL, '2026-08-27 07:01:56', '2026-08-27 11:12:06'),
(79, 'App\\Models\\System\\User', 2, 'schoolcms', '70ee24094cc3bd19ca4f199b86686c3a2d7d7d876e6c94c641fb834156b6e193', '[\"*\"]', '2026-08-27 12:59:13', NULL, '2026-08-27 11:12:45', '2026-08-27 12:59:13'),
(80, 'App\\Models\\System\\User', 2, 'schoolcms', '9f39d7afa6cae264b971482657f621dc4e0ba0d10728bbf18de8f10752abf49f', '[\"*\"]', '2026-08-28 01:30:00', NULL, '2026-08-27 12:59:22', '2026-08-28 01:30:00'),
(81, 'App\\Models\\System\\User', 2, 'schoolcms', 'b4e8d742f503fba6dff2c5f86175170aa291599ca2c41656e83299ef5b3cb6b4', '[\"*\"]', '2026-09-02 03:01:24', NULL, '2026-08-28 01:30:18', '2026-09-02 03:01:24'),
(82, 'App\\Models\\System\\User', 1, 'schoolcms', 'df7d0cb3335feda0aae258e56df23c8aa09a21c8d58fb13f9abf0cb9b8c227a5', '[\"*\"]', '2026-08-28 10:05:59', NULL, '2026-08-28 10:02:33', '2026-08-28 10:05:59'),
(83, 'App\\Models\\System\\User', 2, 'schoolcms', 'e7d5fe78ee6bd84ecbec47520a27cea6ed1d18ebba1b6f46894c387936a923e8', '[\"*\"]', '2026-09-01 10:04:13', NULL, '2026-09-01 06:47:30', '2026-09-01 10:04:13'),
(84, 'App\\Models\\System\\User', 2, 'schoolcms', '1fc76ca088246d3ffe53ad9914be7c69e85a3138f02e9a653e777e2c52a1084b', '[\"*\"]', NULL, NULL, '2026-09-02 04:17:39', '2026-09-02 04:17:39'),
(85, 'App\\Models\\System\\User', 2, 'schoolcms', '5cc076b8fe388a5c53a862dca7259e1226fd9dd18761fbf559f750107ea3e981', '[\"*\"]', NULL, NULL, '2026-09-02 04:30:31', '2026-09-02 04:30:31'),
(86, 'App\\Models\\System\\User', 2, 'schoolcms', '8793e56ab30acd3ec1466117e0edbb9e0ba561ea4875322fd1fea1707358f137', '[\"*\"]', NULL, NULL, '2026-09-02 04:35:22', '2026-09-02 04:35:22'),
(87, 'App\\Models\\System\\User', 2, 'schoolcms', '7a98550816f1d444bdaa3cb6a6f058884092d42333b8b24a1e6df0b08ae09374', '[\"*\"]', NULL, NULL, '2026-09-02 04:35:29', '2026-09-02 04:35:29'),
(88, 'App\\Models\\System\\User', 2, 'schoolcms', '300e69df78c22b34c36c86001219a70349ab3fc331fae547a9a07f2f19bec30c', '[\"*\"]', NULL, NULL, '2026-09-02 04:35:37', '2026-09-02 04:35:37'),
(89, 'App\\Models\\System\\User', 2, 'schoolcms', '4493f3f7b0d80d759960c9a0229622af2918bb3f3b8d1b6e74e98b725687b5b4', '[\"*\"]', NULL, NULL, '2026-09-02 04:37:18', '2026-09-02 04:37:18'),
(90, 'App\\Models\\System\\User', 2, 'schoolcms', 'e361738de5d75fcca86f29a4b8c214e7e6ba1652dc64919f6ba916293b0f5c9f', '[\"*\"]', NULL, NULL, '2026-09-02 04:37:30', '2026-09-02 04:37:30'),
(91, 'App\\Models\\System\\User', 2, 'schoolcms', 'ce956412c0d946939ab160ea792a36a39483ab51d364958f6da50fee73906c64', '[\"*\"]', NULL, NULL, '2026-09-02 05:06:51', '2026-09-02 05:06:51'),
(92, 'App\\Models\\System\\User', 91, 'schoolcms', '09990f2624469169dd15c14b842dc3f78a6d526990125680bf8e38b983a7b1ba', '[\"*\"]', '2026-09-02 05:14:42', NULL, '2026-09-02 05:08:22', '2026-09-02 05:14:42'),
(93, 'App\\Models\\System\\User', 2, 'schoolcms', 'f03d3586d9d01668aff13cfcbbb292222fef7e86113a8333e2ce69d414b947a6', '[\"*\"]', NULL, NULL, '2026-09-02 05:11:28', '2026-09-02 05:11:28'),
(94, 'App\\Models\\System\\User', 2, 'schoolcms', '1c44a0ba4442e0209a6d6737fa38b542c88adbe511f297332afca7e393bc0e9a', '[\"*\"]', NULL, NULL, '2026-09-02 05:11:50', '2026-09-02 05:11:50'),
(95, 'App\\Models\\System\\User', 2, 'schoolcms', '39adeffcccec500c02630e463a44716a1c2936034bc3a28fe672eebfc4a8144f', '[\"*\"]', NULL, NULL, '2026-09-02 05:12:09', '2026-09-02 05:12:09'),
(96, 'App\\Models\\System\\User', 2, 'schoolcms', 'c2afbb19cd11e7bf0882e89bd7c890bcfec07e63214cfc6ebbf0e1f2a586411a', '[\"*\"]', '2026-09-02 05:46:06', NULL, '2026-09-02 05:12:21', '2026-09-02 05:46:06'),
(97, 'App\\Models\\System\\User', 94, 'schoolcms', '0fb6b557ed651d8604db3827b10c84336bac0b3e14246afc3923097e094c855a', '[\"*\"]', '2026-09-02 05:46:14', NULL, '2026-09-02 05:18:35', '2026-09-02 05:46:14'),
(98, 'App\\Models\\System\\User', 94, 'schoolcms', '9a75f6dffc0651bb2a5fada697334f9ec2f5107a1729811a932d898e6c61f85f', '[\"*\"]', '2026-09-02 05:49:15', NULL, '2026-09-02 05:49:08', '2026-09-02 05:49:15'),
(99, 'App\\Models\\System\\User', 2, 'schoolcms', 'dfa43e5b97bceb5a8a8627a135fd48144fc621b64ece89de3bbf4c2a3f2b245b', '[\"*\"]', '2026-09-02 05:49:51', NULL, '2026-09-02 05:49:44', '2026-09-02 05:49:51'),
(100, 'App\\Models\\System\\User', 94, 'schoolcms', 'a4e5c5f22a6ebff64168b71ec5db0a79d39662caf7c56194e75f24c242673587', '[\"*\"]', '2026-09-02 20:16:59', NULL, '2026-09-02 20:16:45', '2026-09-02 20:16:59'),
(101, 'App\\Models\\System\\User', 94, 'schoolcms', '9d5ae9124129517c9243c41c5755e934ff007eb5ef436a4d37057a8536ff33a9', '[\"*\"]', '2026-09-02 22:41:43', NULL, '2026-09-02 22:41:39', '2026-09-02 22:41:43'),
(102, 'App\\Models\\System\\User', 94, 'schoolcms', 'df8bb24d3b6f9ce81fa7dca4696a0971a7a98c7e19a62d3ac55ed8c68aebf279', '[\"*\"]', '2026-09-02 22:52:23', NULL, '2026-09-02 22:50:25', '2026-09-02 22:52:23'),
(103, 'App\\Models\\System\\User', 2, 'schoolcms', '341d61deab440f55d3925dd64522c2322c1d375fc45390b29addac6bcec3d927', '[\"*\"]', '2026-09-02 22:55:35', NULL, '2026-09-02 22:51:28', '2026-09-02 22:55:35'),
(104, 'App\\Models\\System\\User', 94, 'schoolcms', '334bbcb76018090b6208384f2ddede2f69ba55b65648940999367de290060064', '[\"*\"]', '2026-09-02 22:52:31', NULL, '2026-09-02 22:52:29', '2026-09-02 22:52:31'),
(105, 'App\\Models\\System\\User', 94, 'schoolcms', '6e70064973d68232136e538a6efe3e79a0637c70531f2a79d307b3786fad58d7', '[\"*\"]', '2026-09-02 22:54:48', NULL, '2026-09-02 22:52:42', '2026-09-02 22:54:48'),
(106, 'App\\Models\\System\\User', 94, 'schoolcms', 'd5fb76479eafd8216170445426acf66d921eddd9945a30400c3b59d6e3682e68', '[\"*\"]', '2026-09-03 00:05:47', NULL, '2026-09-02 22:56:35', '2026-09-03 00:05:47'),
(107, 'App\\Models\\System\\User', 94, 'schoolcms', '350e78d730240cb9723c1d06ddc15fe5d4c7df960c1cbc215912807d4bdbcfe6', '[\"*\"]', '2026-09-02 22:56:46', NULL, '2026-09-02 22:56:43', '2026-09-02 22:56:46'),
(108, 'App\\Models\\System\\User', 94, 'schoolcms', '4b76ec916b056999061c7072ea0f361b341ea5df9d39f14e614bed7f57336754', '[\"*\"]', '2026-09-02 22:57:08', NULL, '2026-09-02 22:57:05', '2026-09-02 22:57:08'),
(109, 'App\\Models\\System\\User', 2, 'schoolcms', 'e78adae5b18b765fe907e6604b81f53205ba0d330cffdc876149bc7dfdb81ab6', '[\"*\"]', '2026-09-02 22:59:44', NULL, '2026-09-02 22:59:43', '2026-09-02 22:59:44'),
(110, 'App\\Models\\System\\User', 2, 'schoolcms', '7ce1e1b59f503647cd190aa7a73555feccbb342bfb8c5a4ad0cfc9de186eaf97', '[\"*\"]', '2026-09-03 01:53:10', NULL, '2026-09-02 23:02:44', '2026-09-03 01:53:10'),
(111, 'App\\Models\\System\\User', 94, 'schoolcms', 'd368bc924efd2278817069d1dd1b7d62b2b5f7ce5739c81fbca41fe57f99bad1', '[\"*\"]', '2026-09-03 00:07:25', NULL, '2026-09-03 00:06:03', '2026-09-03 00:07:25'),
(112, 'App\\Models\\System\\User', 94, 'schoolcms', 'cc014791aec0d3854800759014cb4afbc95226c0f29f0ac14f2688f97bfe2604', '[\"*\"]', '2026-09-03 01:41:44', NULL, '2026-09-03 00:07:36', '2026-09-03 01:41:44'),
(113, 'App\\Models\\System\\User', 94, 'schoolcms', 'f222f5465febbd5f2924cde65a72879601fdc37b535d0e9a2d92c6efb3a444b4', '[\"*\"]', '2026-09-03 01:54:33', NULL, '2026-09-03 01:43:29', '2026-09-03 01:54:33'),
(114, 'App\\Models\\System\\User', 94, 'schoolcms', 'c015f0cad146d9df5c05de675814cf04f53da7e2e2689493172d5fc1860b2c39', '[\"*\"]', '2026-09-03 01:59:07', NULL, '2026-09-03 01:59:05', '2026-09-03 01:59:07');

-- --------------------------------------------------------

--
-- Table structure for table `question_banks`
--

CREATE TABLE `question_banks` (
  `id` int(10) UNSIGNED NOT NULL,
  `subject_id` int(10) UNSIGNED NOT NULL,
  `instruction_id` int(10) UNSIGNED DEFAULT NULL,
  `question_text` text NOT NULL,
  `question_image` varchar(255) DEFAULT NULL,
  `type` enum('multiple_choice','true_false','essay') NOT NULL DEFAULT 'multiple_choice',
  `difficulty` enum('easy','medium','hard') NOT NULL DEFAULT 'medium',
  `explanation` text DEFAULT NULL,
  `points` int(10) UNSIGNED NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `question_banks`
--

INSERT INTO `question_banks` (`id`, `subject_id`, `instruction_id`, `question_text`, `question_image`, `type`, `difficulty`, `explanation`, `points`, `created_at`, `updated_at`, `deleted_at`) VALUES
(101, 3, 101, 'Hasil dari 2x + 3x adalah ...', NULL, 'multiple_choice', 'easy', 'Gabungkan koefisien suku sejenis: 2+3 = 5.', 10, '2026-08-25 04:18:25', '2026-08-25 04:18:25', NULL),
(102, 3, 101, 'Faktorisasi dari x2 - 9 adalah ...', NULL, 'multiple_choice', 'medium', 'Gunakan pola selisih dua kuadrat: (a-b)(a+b).', 10, '2026-08-25 04:18:25', '2026-08-25 04:18:25', NULL),
(103, 4, 102, 'Ide pokok sebuah paragraf umumnya terdapat pada ...', NULL, 'multiple_choice', 'easy', 'Ide pokok biasanya berada pada kalimat utama.', 10, '2026-08-25 04:18:25', '2026-08-25 04:18:25', NULL),
(104, 6, 103, 'Satuan daya listrik dalam sistem SI adalah ...', NULL, 'multiple_choice', 'easy', 'Daya diukur dalam Watt (J/s).', 10, '2026-08-25 04:18:25', '2026-08-25 04:18:25', NULL),
(105, 7, 104, 'Jelaskan proses fotosintesis pada tumbuhan!', NULL, 'essay', 'hard', 'Jawaban mencakup reaksi, bahan, dan hasil fotosintesis.', 25, '2026-08-25 04:18:25', '2026-08-25 04:18:25', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `question_options`
--

CREATE TABLE `question_options` (
  `id` int(10) UNSIGNED NOT NULL,
  `question_id` int(10) UNSIGNED NOT NULL,
  `option_text` text NOT NULL,
  `option_image` varchar(255) DEFAULT NULL,
  `is_correct` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `question_options`
--

INSERT INTO `question_options` (`id`, `question_id`, `option_text`, `option_image`, `is_correct`, `created_at`, `updated_at`) VALUES
(201, 101, '5x', NULL, 1, '2026-08-25 04:18:25', '2026-08-25 04:18:25'),
(202, 101, '6x', NULL, 0, '2026-08-25 04:18:25', '2026-08-25 04:18:25'),
(203, 101, '23x', NULL, 0, '2026-08-25 04:18:25', '2026-08-25 04:18:25'),
(204, 101, '5xy', NULL, 0, '2026-08-25 04:18:25', '2026-08-25 04:18:25'),
(205, 102, '(x - 3)(x + 3)', NULL, 1, '2026-08-25 04:18:25', '2026-08-25 04:18:25'),
(206, 102, '(x + 3)^2', NULL, 0, '2026-08-25 04:18:25', '2026-08-25 04:18:25'),
(207, 102, '(x - 9)(x + 1)', NULL, 0, '2026-08-25 04:18:25', '2026-08-25 04:18:25'),
(208, 102, 'x^2 - 3', NULL, 0, '2026-08-25 04:18:25', '2026-08-25 04:18:25'),
(209, 103, 'Kalimat utama', NULL, 1, '2026-08-25 04:18:25', '2026-08-25 04:18:25'),
(210, 103, 'Kalimat penjelas', NULL, 0, '2026-08-25 04:18:25', '2026-08-25 04:18:25'),
(211, 103, 'Judul paragraf', NULL, 0, '2026-08-25 04:18:25', '2026-08-25 04:18:25'),
(212, 103, 'Konjungsi antarkalimat', NULL, 0, '2026-08-25 04:18:25', '2026-08-25 04:18:25'),
(213, 104, 'Joule', NULL, 0, '2026-08-25 04:18:25', '2026-08-25 04:18:25'),
(214, 104, 'Ampere', NULL, 0, '2026-08-25 04:18:25', '2026-08-25 04:18:25'),
(215, 104, 'Watt', NULL, 1, '2026-08-25 04:18:25', '2026-08-25 04:18:25'),
(216, 104, 'Newton', NULL, 0, '2026-08-25 04:18:25', '2026-08-25 04:18:25');

-- --------------------------------------------------------

--
-- Table structure for table `registrants`
--

CREATE TABLE `registrants` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `registration_number` varchar(50) NOT NULL,
  `nik` varchar(20) NOT NULL,
  `nisn` varchar(20) DEFAULT NULL,
  `full_name` varchar(150) NOT NULL,
  `nickname` varchar(100) DEFAULT NULL,
  `gender` enum('L','P') NOT NULL,
  `religion` varchar(30) DEFAULT NULL,
  `birth_place` varchar(100) DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `rt` varchar(5) DEFAULT NULL,
  `rw` varchar(5) DEFAULT NULL,
  `village` varchar(100) DEFAULT NULL,
  `district` varchar(100) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `province` varchar(100) DEFAULT NULL,
  `postal_code` varchar(10) DEFAULT NULL,
  `previous_school` varchar(150) DEFAULT NULL,
  `previous_school_npsn` varchar(30) DEFAULT NULL,
  `graduation_year` year(4) DEFAULT NULL,
  `father_name` varchar(150) DEFAULT NULL,
  `father_nik` varchar(20) DEFAULT NULL,
  `father_education` varchar(100) DEFAULT NULL,
  `father_occupation` varchar(100) DEFAULT NULL,
  `father_income` decimal(15,2) DEFAULT NULL,
  `father_phone` varchar(30) DEFAULT NULL,
  `mother_name` varchar(150) DEFAULT NULL,
  `mother_nik` varchar(20) DEFAULT NULL,
  `mother_education` varchar(100) DEFAULT NULL,
  `mother_occupation` varchar(100) DEFAULT NULL,
  `mother_income` decimal(15,2) DEFAULT NULL,
  `mother_phone` varchar(30) DEFAULT NULL,
  `academic_year_id` bigint(20) UNSIGNED DEFAULT NULL,
  `registration_path` varchar(50) DEFAULT NULL,
  `program_choice` varchar(100) DEFAULT NULL,
  `registration_date` date DEFAULT NULL,
  `document_kk` varchar(255) DEFAULT NULL,
  `document_birth_certificate` varchar(255) DEFAULT NULL,
  `document_diploma` varchar(255) DEFAULT NULL,
  `document_parent_ktp` varchar(255) DEFAULT NULL,
  `document_photo` varchar(255) DEFAULT NULL,
  `verification_status` enum('pending','verified','rejected') DEFAULT 'pending',
  `verification_notes` text DEFAULT NULL,
  `verified_by` bigint(20) UNSIGNED DEFAULT NULL,
  `verified_at` datetime DEFAULT NULL,
  `selection_score` decimal(5,2) DEFAULT NULL,
  `selection_status` enum('pending','selected','not_selected') DEFAULT 'pending',
  `selection_notes` text DEFAULT NULL,
  `selected_at` datetime DEFAULT NULL,
  `re_registration_status` enum('pending','completed','cancelled') DEFAULT 'pending',
  `re_registration_date` datetime DEFAULT NULL,
  `re_registration_notes` text DEFAULT NULL,
  `re_registration_verified_by` bigint(20) UNSIGNED DEFAULT NULL,
  `re_registration_verified_at` datetime DEFAULT NULL,
  `declaration` tinyint(1) DEFAULT 0,
  `photo` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` varchar(30) DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `registrants`
--

INSERT INTO `registrants` (`id`, `registration_number`, `nik`, `nisn`, `full_name`, `nickname`, `gender`, `religion`, `birth_place`, `birth_date`, `email`, `phone`, `address`, `rt`, `rw`, `village`, `district`, `city`, `province`, `postal_code`, `previous_school`, `previous_school_npsn`, `graduation_year`, `father_name`, `father_nik`, `father_education`, `father_occupation`, `father_income`, `father_phone`, `mother_name`, `mother_nik`, `mother_education`, `mother_occupation`, `mother_income`, `mother_phone`, `academic_year_id`, `registration_path`, `program_choice`, `registration_date`, `document_kk`, `document_birth_certificate`, `document_diploma`, `document_parent_ktp`, `document_photo`, `verification_status`, `verification_notes`, `verified_by`, `verified_at`, `selection_score`, `selection_status`, `selection_notes`, `selected_at`, `re_registration_status`, `re_registration_date`, `re_registration_notes`, `re_registration_verified_by`, `re_registration_verified_at`, `declaration`, `photo`, `notes`, `status`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'PPDB-2026-000001', '1122334455667788', '1234123455', 'Agil Febri Pradana', 'Agil', 'L', 'islam', 'Wonosobo', '2008-05-12', 'agil@example.com', '081234567801', 'Jl. Merdeka No. 10', '02', '16', 'Maduretno', 'Kalikajar', 'Wonosobo', 'Jawa Tengah', '56372', 'SMP Negeri 1 Wonosobo', '20300001', '2026', 'Budi Pradana', '3372010101010001', 'SMA', 'Wiraswasta', 5000000.00, '081234567811', 'Siti Aminah', '3372010101010002', 'SMA', 'Guru', 4500000.00, '081234567812', 1, 'reguler', 'IPA', '2026-08-25', NULL, NULL, NULL, NULL, NULL, 'verified', NULL, 2, '2026-09-01 13:55:47', NULL, 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 1, NULL, NULL, 'verified', '2026-08-31 18:15:05', '2026-09-01 06:55:47', NULL),
(2, 'PPDB-2026-000002', '1122334455667789', '1234123456', 'Budi Santoso', 'Budi', 'L', 'islam', 'Temanggung', '2008-03-20', 'budi@example.com', '081234567802', 'Jl. Diponegoro No. 21', '03', '05', 'Kowangan', 'Temanggung', 'Temanggung', 'Jawa Tengah', '56218', 'SMP Negeri 2 Temanggung', '20300002', '2026', 'Joko Santoso', '3372010101010003', 'SMA', 'Pedagang', 4000000.00, '081234567813', 'Rina Wati', '3372010101010004', 'SMA', 'Wiraswasta', 3500000.00, '081234567814', 1, 'prestasi', 'IPS', '2026-08-26', NULL, NULL, NULL, NULL, NULL, 'verified', NULL, 2, '2026-09-01 13:51:47', NULL, 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 1, NULL, NULL, 'verified', '2026-08-31 18:15:05', '2026-09-01 06:51:47', NULL),
(3, 'PPDB-2026-000003', '1122334455667790', '1234123457', 'Citra Lestari', 'Citra', 'P', 'islam', 'Magelang', '2008-07-15', 'citra@example.com', '081234567803', 'Jl. Ahmad Yani No. 15', '04', '08', 'Muntilan', 'Muntilan', 'Magelang', 'Jawa Tengah', '56415', 'SMP Negeri 1 Magelang', '20300003', '2026', 'Andi Lestari', '3372010101010005', 'SMA', 'Karyawan Swasta', 4500000.00, '081234567815', 'Dewi Lestari', '3372010101010006', 'SMA', 'Ibu Rumah Tangga', 0.00, '081234567816', 1, 'reguler', 'IPA', '2026-08-27', NULL, NULL, NULL, NULL, NULL, 'verified', NULL, 2, '2026-08-31 18:28:21', NULL, 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 1, NULL, NULL, 'verified', '2026-08-31 18:15:05', '2026-08-31 11:28:21', NULL),
(4, 'PPDB-2026-000004', '1122334455667791', '1234123458', 'Dimas Saputra', 'Dimas', 'L', 'islam', 'Banjarnegara', '2008-01-10', 'dimas@example.com', '081234567804', 'Jl. Kartini No. 8', '01', '03', 'Krendetan', 'Purwanegara', 'Banjarnegara', 'Jawa Tengah', '53472', 'SMP Negeri 3 Banjarnegara', '20300004', '2026', 'Eko Saputra', '3372010101010007', 'SMA', 'Wiraswasta', 5500000.00, '081234567817', 'Lina Saputra', '3372010101010008', 'SMA', 'Pedagang', 3000000.00, '081234567818', 1, 'afirmasi', 'IPS', '2026-08-28', NULL, NULL, NULL, NULL, NULL, 'verified', NULL, 2, '2026-08-31 18:27:18', NULL, 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 1, NULL, NULL, 'verified', '2026-08-31 18:15:05', '2026-08-31 11:27:18', NULL),
(5, 'PPDB-2026-000005', '1122334455667792', '1234123459', 'Eka Putri', 'Eka', 'P', 'islam', 'Kebumen', '2008-11-25', 'eka@example.com', '081234567805', 'Jl. Pemuda No. 30', '05', '07', 'Kebumen', 'Kebumen', 'Kebumen', 'Jawa Tengah', '54311', 'SMP Negeri 1 Kebumen', '20300005', '2026', 'Hendra Putra', '3372010101010009', 'SMA', 'Karyawan Swasta', 4000000.00, '081234567819', 'Maya Putri', '3372010101010010', 'SMA', 'Guru', 4500000.00, '081234567820', 1, 'reguler', 'Bahasa', '2026-08-29', NULL, NULL, NULL, NULL, NULL, 'verified', NULL, 2, '2026-08-31 18:20:32', NULL, 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 1, NULL, NULL, 'verified', '2026-08-31 18:15:05', '2026-08-31 11:20:32', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `report_cards`
--

CREATE TABLE `report_cards` (
  `id` int(10) UNSIGNED NOT NULL,
  `student_id` int(10) UNSIGNED NOT NULL,
  `class_id` int(10) UNSIGNED NOT NULL,
  `academic_year_id` int(10) UNSIGNED NOT NULL,
  `semester_id` int(10) UNSIGNED NOT NULL,
  `teacher_notes` text DEFAULT NULL,
  `status` enum('draft','published') NOT NULL DEFAULT 'draft',
  `published_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `report_cards`
--

INSERT INTO `report_cards` (`id`, `student_id`, `class_id`, `academic_year_id`, `semester_id`, `teacher_notes`, `status`, `published_at`, `created_at`, `updated_at`) VALUES
(101, 52, 1, 2, 103, NULL, 'draft', NULL, '2026-08-25 05:39:12', '2026-08-25 05:39:12'),
(102, 53, 1, 2, 103, NULL, 'draft', NULL, '2026-08-25 05:39:12', '2026-08-25 05:39:12'),
(103, 54, 1, 2, 103, 'Pertahankan prestasinya.', 'published', '2026-08-25 10:00:00', '2026-08-25 05:39:12', '2026-08-25 05:39:12'),
(104, 55, 1, 2, 103, NULL, 'draft', NULL, '2026-08-25 05:39:12', '2026-08-25 05:39:12'),
(105, 56, 1, 2, 103, NULL, 'draft', NULL, '2026-08-25 05:39:12', '2026-08-25 05:39:12');

-- --------------------------------------------------------

--
-- Table structure for table `re_registrants`
--

CREATE TABLE `re_registrants` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `student_id` bigint(20) UNSIGNED DEFAULT NULL,
  `registration_number` varchar(50) NOT NULL,
  `nik` varchar(20) NOT NULL,
  `nisn` varchar(20) DEFAULT NULL,
  `full_name` varchar(150) NOT NULL,
  `nickname` varchar(100) DEFAULT NULL,
  `gender` enum('L','P') NOT NULL,
  `religion` varchar(30) DEFAULT NULL,
  `birth_place` varchar(100) DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `phone` varchar(30) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `rt` varchar(5) DEFAULT NULL,
  `rw` varchar(5) DEFAULT NULL,
  `village` varchar(100) DEFAULT NULL,
  `district` varchar(100) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `province` varchar(100) DEFAULT NULL,
  `postal_code` varchar(10) DEFAULT NULL,
  `previous_school` varchar(150) DEFAULT NULL,
  `previous_school_npsn` varchar(30) DEFAULT NULL,
  `graduation_year` year(4) DEFAULT NULL,
  `father_name` varchar(150) DEFAULT NULL,
  `father_nik` varchar(20) DEFAULT NULL,
  `father_education` varchar(100) DEFAULT NULL,
  `father_occupation` varchar(100) DEFAULT NULL,
  `father_income` decimal(15,2) DEFAULT NULL,
  `father_phone` varchar(30) DEFAULT NULL,
  `mother_name` varchar(150) DEFAULT NULL,
  `mother_nik` varchar(20) DEFAULT NULL,
  `mother_education` varchar(100) DEFAULT NULL,
  `mother_occupation` varchar(100) DEFAULT NULL,
  `mother_income` decimal(15,2) DEFAULT NULL,
  `mother_phone` varchar(30) DEFAULT NULL,
  `academic_year_id` bigint(20) UNSIGNED DEFAULT NULL,
  `registration_path` varchar(50) DEFAULT NULL,
  `program_choice` varchar(100) DEFAULT NULL,
  `registration_date` date DEFAULT NULL,
  `document_kk` varchar(255) DEFAULT NULL,
  `document_birth_certificate` varchar(255) DEFAULT NULL,
  `document_diploma` varchar(255) DEFAULT NULL,
  `document_parent_ktp` varchar(255) DEFAULT NULL,
  `document_photo` varchar(255) DEFAULT NULL,
  `verification_status` enum('pending','verified','rejected') NOT NULL DEFAULT 'pending',
  `verification_notes` text DEFAULT NULL,
  `verified_by` bigint(20) UNSIGNED DEFAULT NULL,
  `verified_at` datetime DEFAULT NULL,
  `selection_score` decimal(5,2) DEFAULT NULL,
  `selection_status` enum('pending','selected','not_selected') NOT NULL DEFAULT 'pending',
  `selection_notes` text DEFAULT NULL,
  `selected_at` datetime DEFAULT NULL,
  `re_registration_status` enum('pending','completed','cancelled') NOT NULL DEFAULT 'pending',
  `re_registration_date` datetime DEFAULT NULL,
  `re_registration_notes` text DEFAULT NULL,
  `re_registration_verified_by` bigint(20) UNSIGNED DEFAULT NULL,
  `re_registration_verified_at` datetime DEFAULT NULL,
  `data_completed` tinyint(1) NOT NULL DEFAULT 0,
  `data_completed_at` datetime DEFAULT NULL,
  `declaration` tinyint(1) NOT NULL DEFAULT 0,
  `photo` varchar(255) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` varchar(30) NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `deleted_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `re_registrants`
--

INSERT INTO `re_registrants` (`id`, `student_id`, `registration_number`, `nik`, `nisn`, `full_name`, `nickname`, `gender`, `religion`, `birth_place`, `birth_date`, `email`, `phone`, `address`, `rt`, `rw`, `village`, `district`, `city`, `province`, `postal_code`, `previous_school`, `previous_school_npsn`, `graduation_year`, `father_name`, `father_nik`, `father_education`, `father_occupation`, `father_income`, `father_phone`, `mother_name`, `mother_nik`, `mother_education`, `mother_occupation`, `mother_income`, `mother_phone`, `academic_year_id`, `registration_path`, `program_choice`, `registration_date`, `document_kk`, `document_birth_certificate`, `document_diploma`, `document_parent_ktp`, `document_photo`, `verification_status`, `verification_notes`, `verified_by`, `verified_at`, `selection_score`, `selection_status`, `selection_notes`, `selected_at`, `re_registration_status`, `re_registration_date`, `re_registration_notes`, `re_registration_verified_by`, `re_registration_verified_at`, `data_completed`, `data_completed_at`, `declaration`, `photo`, `notes`, `status`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, NULL, 'PPDB-2026-000005', '1122334455667792', '1234123459', 'Eka Putri', 'Eka', 'P', 'islam', 'Kebumen', '2008-11-25', 'eka@example.com', '081234567805', 'Jl. Pemuda No. 30', '05', '07', 'Kebumen', 'Kebumen', 'Kebumen', 'Jawa Tengah', '54311', 'SMP Negeri 1 Kebumen', '20300005', '2026', 'Hendra Putra', '3372010101010009', 'SMA', 'Karyawan Swasta', 4000000.00, '081234567819', 'Maya Putri', '3372010101010010', 'SMA', 'Guru', 4500000.00, '081234567820', 1, 'reguler', 'Bahasa', '2026-08-29', NULL, NULL, NULL, NULL, NULL, 'verified', NULL, 2, '2026-08-31 18:20:32', NULL, 'pending', NULL, NULL, 'completed', '2026-08-31 18:27:25', NULL, NULL, NULL, 1, '2026-08-31 18:27:25', 1, NULL, NULL, 'active', '2026-08-31 11:20:32', '2026-08-31 11:27:25', NULL),
(2, NULL, 'PPDB-2026-000004', '1122334455667791', '1234123458', 'Dimas Saputra', 'Dimas', 'L', 'islam', 'Banjarnegara', '2008-01-10', 'dimas@example.com', '081234567804', 'Jl. Kartini No. 8', '01', '03', 'Krendetan', 'Purwanegara', 'Banjarnegara', 'Jawa Tengah', '53472', 'SMP Negeri 3 Banjarnegara', '20300004', '2026', 'Eko Saputra', '3372010101010007', 'SMA', 'Wiraswasta', 5500000.00, '081234567817', 'Lina Saputra', '3372010101010008', 'SMA', 'Pedagang', 3000000.00, '081234567818', 1, 'afirmasi', 'IPS', '2026-08-28', NULL, NULL, NULL, NULL, NULL, 'verified', NULL, 2, '2026-08-31 18:27:18', NULL, 'pending', NULL, NULL, 'completed', '2026-08-31 18:27:23', NULL, NULL, NULL, 1, '2026-08-31 18:27:23', 1, NULL, NULL, 'active', '2026-08-31 11:27:18', '2026-08-31 11:27:23', NULL),
(3, NULL, 'PPDB-2026-000003', '1122334455667790', '1234123457', 'Citra Lestari', 'Citra', 'P', 'islam', 'Magelang', '2008-07-15', 'citra@example.com', '081234567803', 'Jl. Ahmad Yani No. 15', '04', '08', 'Muntilan', 'Muntilan', 'Magelang', 'Jawa Tengah', '56415', 'SMP Negeri 1 Magelang', '20300003', '2026', 'Andi Lestari', '3372010101010005', 'SMA', 'Karyawan Swasta', 4500000.00, '081234567815', 'Dewi Lestari', '3372010101010006', 'SMA', 'Ibu Rumah Tangga', 0.00, '081234567816', 1, 'reguler', 'IPA', '2026-08-27', NULL, NULL, NULL, NULL, NULL, 'verified', NULL, 2, '2026-08-31 18:28:21', NULL, 'pending', NULL, NULL, 'completed', '2026-09-01 13:52:08', NULL, NULL, NULL, 1, '2026-09-01 13:52:08', 1, NULL, NULL, 'active', '2026-08-31 11:28:21', '2026-09-01 06:52:08', NULL),
(4, NULL, 'PPDB-2026-000002', '1122334455667789', '1234123456', 'Budi Santoso', 'Budi', 'L', 'islam', 'Temanggung', '2008-03-20', 'budi@example.com', '081234567802', 'Jl. Diponegoro No. 21', '03', '05', 'Kowangan', 'Temanggung', 'Temanggung', 'Jawa Tengah', '56218', 'SMP Negeri 2 Temanggung', '20300002', '2026', 'Joko Santoso', '3372010101010003', 'SMA', 'Pedagang', 4000000.00, '081234567813', 'Rina Wati', '3372010101010004', 'SMA', 'Wiraswasta', 3500000.00, '081234567814', 1, 'prestasi', 'IPS', '2026-08-26', NULL, NULL, NULL, NULL, NULL, 'verified', NULL, 2, '2026-09-01 13:51:47', NULL, 'pending', NULL, NULL, 'completed', '2026-09-01 13:55:27', NULL, NULL, NULL, 1, '2026-09-01 13:55:27', 1, NULL, NULL, 'active', '2026-09-01 06:51:47', '2026-09-01 06:55:27', NULL),
(5, NULL, 'PPDB-2026-000001', '1122334455667788', '1234123455', 'Agil Febri Pradana', 'Agil', 'L', 'islam', 'Wonosobo', '2008-05-12', 'agil@example.com', '081234567801', 'Jl. Merdeka No. 10', '02', '16', 'Maduretno', 'Kalikajar', 'Wonosobo', 'Jawa Tengah', '56372', 'SMP Negeri 1 Wonosobo', '20300001', '2026', 'Budi Pradana', '3372010101010001', 'SMA', 'Wiraswasta', 5000000.00, '081234567811', 'Siti Aminah', '3372010101010002', 'SMA', 'Guru', 4500000.00, '081234567812', 1, 'reguler', 'IPA', '2026-08-25', NULL, NULL, NULL, NULL, NULL, 'verified', NULL, 2, '2026-09-01 13:55:47', NULL, 'pending', NULL, NULL, 'pending', NULL, NULL, NULL, NULL, 0, NULL, 1, NULL, NULL, 'active', '2026-09-01 06:55:47', '2026-09-01 06:55:47', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int(10) UNSIGNED NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`, `description`, `created_at`, `updated_at`) VALUES
(1, 'Admin', NULL, '2026-08-17 13:23:50', '2026-08-17 13:23:50'),
(2, 'Guru', NULL, '2026-08-17 13:23:50', '2026-08-17 13:23:50'),
(4, 'Administrator', NULL, '2026-08-18 16:29:34', '2026-08-18 16:29:34'),
(5, 'Siswa', NULL, '2026-08-18 16:29:34', '2026-08-18 16:29:34'),
(6, 'Test Role Updated', 'Role untuk testing yang sudah diperbarui', '2026-08-24 20:44:53', '2026-08-24 20:45:40');

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--

CREATE TABLE `rooms` (
  `id` int(10) UNSIGNED NOT NULL,
  `code` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `capacity` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `location` varchar(150) DEFAULT NULL,
  `has_computer` tinyint(1) NOT NULL DEFAULT 0,
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rooms`
--

INSERT INTO `rooms` (`id`, `code`, `name`, `capacity`, `location`, `has_computer`, `status`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'R-01', 'Lab Komputer', 25, '', 1, 'active', '2026-08-19 10:35:06', '2026-08-19 10:35:06', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `schedules`
--

CREATE TABLE `schedules` (
  `id` int(10) UNSIGNED NOT NULL,
  `class_id` int(10) UNSIGNED NOT NULL,
  `subject_id` int(10) UNSIGNED NOT NULL,
  `teacher_id` int(10) UNSIGNED DEFAULT NULL,
  `day` enum('senin','selasa','rabu','kamis','jumat','sabtu') NOT NULL,
  `period_id` int(10) UNSIGNED NOT NULL,
  `academic_year_id` int(10) UNSIGNED NOT NULL,
  `semester_id` int(10) UNSIGNED DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `schedules`
--

INSERT INTO `schedules` (`id`, `class_id`, `subject_id`, `teacher_id`, `day`, `period_id`, `academic_year_id`, `semester_id`, `created_at`, `updated_at`) VALUES
(101, 1, 3, 136, 'senin', 101, 2, 103, '2026-08-25 05:39:12', '2026-08-25 05:39:12'),
(102, 1, 4, 144, 'selasa', 102, 2, 103, '2026-08-25 05:39:12', '2026-08-25 05:39:12'),
(103, 1, 6, 145, 'rabu', 103, 2, 103, '2026-08-25 05:39:12', '2026-08-25 05:39:12'),
(104, 1, 7, 146, 'kamis', 104, 2, 103, '2026-08-25 05:39:12', '2026-08-25 05:39:12'),
(105, 1, 8, 147, 'jumat', 105, 2, 103, '2026-08-25 05:39:12', '2026-08-25 05:39:12');

-- --------------------------------------------------------

--
-- Table structure for table `scholarships`
--

CREATE TABLE `scholarships` (
  `id` int(10) UNSIGNED NOT NULL,
  `student_id` int(10) UNSIGNED NOT NULL,
  `name` varchar(150) NOT NULL,
  `provider` varchar(150) DEFAULT NULL,
  `amount` decimal(12,2) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL,
  `status` enum('aktif','selesai','dibatalkan') NOT NULL DEFAULT 'aktif',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `scholarships`
--

INSERT INTO `scholarships` (`id`, `student_id`, `name`, `provider`, `amount`, `start_date`, `end_date`, `status`, `created_at`, `updated_at`, `deleted_at`) VALUES
(101, 52, 'Beasiswa PIP', 'Kemendikbudristek', 600000.00, '2026-07-01', '2027-06-30', 'aktif', '2026-08-25 07:07:54', '2026-08-25 07:07:54', NULL),
(102, 53, 'Beasiswa Prestasi Nasional', 'Yayasan Pendidikan', 1200000.00, '2026-07-01', '2027-06-30', 'aktif', '2026-08-25 07:07:54', '2026-08-25 07:07:54', NULL),
(103, 54, 'Beasiswa KIP', 'Pemerintah Desa', 300000.00, '2025-07-01', '2026-06-30', 'selesai', '2026-08-25 07:07:54', '2026-08-25 07:07:54', NULL),
(104, 55, 'Beasiswa BUMN', 'PT Listrik Negara', 500000.00, '2026-07-01', NULL, 'aktif', '2026-08-25 07:07:54', '2026-08-25 07:07:54', NULL),
(105, 56, 'Beasiswa Tahfidz', 'Yayasan Al-Hidayah', 400000.00, '2026-01-01', NULL, 'aktif', '2026-08-25 07:07:54', '2026-08-25 07:07:54', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `semesters`
--

CREATE TABLE `semesters` (
  `id` int(10) UNSIGNED NOT NULL,
  `academic_year_id` int(10) UNSIGNED NOT NULL,
  `name` enum('1','2') NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `semesters`
--

INSERT INTO `semesters` (`id`, `academic_year_id`, `name`, `is_active`, `created_at`, `updated_at`) VALUES
(101, 1, '1', 0, '2026-08-25 05:39:12', '2026-08-25 05:39:12'),
(102, 1, '2', 0, '2026-08-25 05:39:12', '2026-08-25 05:39:12'),
(103, 2, '1', 1, '2026-08-25 05:39:12', '2026-08-25 05:39:12'),
(104, 2, '2', 0, '2026-08-25 05:39:12', '2026-08-25 05:39:12'),
(105, 3, '1', 0, '2026-08-25 05:39:12', '2026-08-25 05:39:12');

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` int(10) UNSIGNED NOT NULL,
  `key` varchar(100) NOT NULL,
  `group` varchar(50) DEFAULT NULL,
  `value` text DEFAULT NULL,
  `type` varchar(30) NOT NULL DEFAULT 'string',
  `is_encrypted` tinyint(1) NOT NULL DEFAULT 0,
  `is_public` tinyint(1) NOT NULL DEFAULT 0,
  `sort_order` int(11) NOT NULL DEFAULT 0,
  `description` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `key`, `group`, `value`, `type`, `is_encrypted`, `is_public`, `sort_order`, `description`, `created_at`, `updated_at`) VALUES
(1, 'app_name', 'general', 'SchoolCMS', 'string', 0, 0, 10, 'Nama aplikasi', '2026-08-25 06:45:14', '2026-08-25 06:45:14'),
(2, 'school_name', 'general', 'SMA Negeri 1 Contoh', 'string', 0, 0, 20, 'Nama sekolah', '2026-08-25 06:45:14', '2026-08-25 06:45:14'),
(3, 'timezone', 'general', 'Asia/Jakarta', 'timezone', 0, 0, 30, 'Zona waktu aplikasi', '2026-08-25 06:45:14', '2026-08-25 06:45:14'),
(4, 'current_academic_year', NULL, '2025/2026', 'string', 0, 0, 0, 'Tahun ajaran berjalan', '2026-08-25 06:45:14', '2026-08-25 06:45:14');

-- --------------------------------------------------------

--
-- Table structure for table `staff`
--

CREATE TABLE `staff` (
  `id` int(10) UNSIGNED NOT NULL,
  `staff_number` varchar(30) NOT NULL,
  `name` varchar(100) NOT NULL,
  `position` varchar(100) NOT NULL,
  `department` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `staff`
--

INSERT INTO `staff` (`id`, `staff_number`, `name`, `position`, `department`, `phone`, `email`, `is_active`, `created_at`, `updated_at`) VALUES
(101, 'STF-001', 'Rina Marlina', 'Operator Sekolah', 'Tata Usaha', '081400000001', 'rina@sekolah.sch.id', 1, '2026-08-25 16:36:14', '2026-08-25 16:36:14'),
(102, 'STF-002', 'Agus Salim', 'Kepala Tata Usaha', 'Tata Usaha', '081400000002', 'agus@sekolah.sch.id', 1, '2026-08-25 16:36:14', '2026-08-25 16:36:14'),
(103, 'STF-003', 'Lilis Suryani', 'Pustakawan', 'Perpustakaan', '081400000003', NULL, 1, '2026-08-25 16:36:14', '2026-08-25 16:36:14'),
(104, 'STF-004', 'Darmawan', 'Laboran', 'Laboratorium', '081400000004', NULL, 1, '2026-08-25 16:36:14', '2026-08-25 16:36:14'),
(105, 'STF-005', 'Sukron', 'Petugas Keamanan', 'Umum', NULL, NULL, 0, '2026-08-25 16:36:14', '2026-08-25 16:36:14');

-- --------------------------------------------------------

--
-- Table structure for table `stock_movements`
--

CREATE TABLE `stock_movements` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `inventory_id` bigint(20) UNSIGNED NOT NULL,
  `type` enum('stock_in','stock_out','adjustment') NOT NULL,
  `quantity` int(10) UNSIGNED NOT NULL,
  `adjustment_type` enum('increase','decrease') DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_by` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `students`
--

CREATE TABLE `students` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `class_id` int(10) UNSIGNED DEFAULT NULL,
  `nisn` varchar(20) NOT NULL,
  `nis` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `nik` varchar(20) DEFAULT NULL,
  `religion` varchar(50) DEFAULT NULL,
  `gender` enum('L','P') NOT NULL,
  `birth_place` varchar(100) NOT NULL,
  `birth_date` date NOT NULL,
  `address` text NOT NULL,
  `rt` varchar(5) DEFAULT NULL,
  `rw` varchar(5) DEFAULT NULL,
  `hamlet` varchar(100) DEFAULT NULL,
  `village` varchar(100) DEFAULT NULL,
  `district` varchar(100) DEFAULT NULL,
  `postal_code` varchar(10) DEFAULT NULL,
  `residence_type` varchar(100) DEFAULT NULL,
  `transportation` varchar(100) DEFAULT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `family_card_number` varchar(30) DEFAULT NULL,
  `birth_certificate_registration_number` varchar(100) DEFAULT NULL,
  `skhun` varchar(100) DEFAULT NULL,
  `previous_school` varchar(150) DEFAULT NULL,
  `national_exam_number` varchar(50) DEFAULT NULL,
  `diploma_serial_number` varchar(100) DEFAULT NULL,
  `special_needs` varchar(150) DEFAULT NULL,
  `birth_order` smallint(5) UNSIGNED DEFAULT NULL,
  `sibling_count` smallint(5) UNSIGNED DEFAULT NULL,
  `weight` decimal(5,2) DEFAULT NULL,
  `height` decimal(5,2) DEFAULT NULL,
  `head_circumference` decimal(5,2) DEFAULT NULL,
  `school_distance` decimal(8,2) DEFAULT NULL,
  `latitude` decimal(10,7) DEFAULT NULL,
  `longitude` decimal(10,7) DEFAULT NULL,
  `kps_recipient` tinyint(1) NOT NULL DEFAULT 0,
  `kps_number` varchar(50) DEFAULT NULL,
  `kip_recipient` tinyint(1) NOT NULL DEFAULT 0,
  `kip_number` varchar(50) DEFAULT NULL,
  `kip_name` varchar(150) DEFAULT NULL,
  `kks_number` varchar(50) DEFAULT NULL,
  `pip_eligible` tinyint(1) NOT NULL DEFAULT 0,
  `pip_reason` text DEFAULT NULL,
  `bank_name` varchar(100) DEFAULT NULL,
  `bank_account_number` varchar(50) DEFAULT NULL,
  `bank_account_holder` varchar(150) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `students`
--

INSERT INTO `students` (`id`, `user_id`, `class_id`, `nisn`, `nis`, `name`, `nik`, `religion`, `gender`, `birth_place`, `birth_date`, `address`, `rt`, `rw`, `hamlet`, `village`, `district`, `postal_code`, `residence_type`, `transportation`, `telephone`, `family_card_number`, `birth_certificate_registration_number`, `skhun`, `previous_school`, `national_exam_number`, `diploma_serial_number`, `special_needs`, `birth_order`, `sibling_count`, `weight`, `height`, `head_circumference`, `school_distance`, `latitude`, `longitude`, `kps_recipient`, `kps_number`, `kip_recipient`, `kip_number`, `kip_name`, `kks_number`, `pip_eligible`, `pip_reason`, `bank_name`, `bank_account_number`, `bank_account_holder`, `phone`, `email`, `photo`, `created_at`, `updated_at`, `deleted_at`) VALUES
(51, NULL, NULL, '3953104853', '2026001', 'Budi Pangestu', NULL, NULL, 'L', 'Bandung', '2009-04-02', 'Jl. Ahmad Yani No. 27', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '08826600539', NULL, NULL, '2026-08-19 10:23:50', '2026-08-19 10:24:44', '2026-08-19 10:24:44'),
(52, NULL, 1, '1341263960', '2026002', 'Putra Nugroho', NULL, NULL, 'L', 'Wonosobo', '2008-07-10', 'Jl. Gatot Subroto No. 130', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '08746412689', NULL, NULL, '2026-08-19 10:23:50', '2026-08-27 16:08:48', NULL),
(53, NULL, 1, '8688202048', '2026003', 'Eka Kusuma', NULL, NULL, 'L', 'Medan', '2010-05-09', 'Jl. Mawar No. 151', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '08398704996', NULL, NULL, '2026-08-19 10:23:50', '2026-08-19 12:12:00', NULL),
(54, NULL, 1, '5537787565', '2026004', 'Dika Pangestu', NULL, NULL, 'L', 'Bandung', '2009-07-23', 'Jl. Gatot Subroto No. 196', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '08461415646', NULL, NULL, '2026-08-19 10:23:50', '2026-08-19 12:12:06', NULL),
(55, NULL, 1, '2038484215', '2026005', 'Ahmad Nugroho', NULL, NULL, 'L', 'Palembang', '2009-12-05', 'Jl. Diponegoro No. 12', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '08883543540', NULL, NULL, '2026-08-19 10:23:50', '2026-08-19 12:12:14', NULL),
(56, NULL, 1, '5064481961', '2026006', 'Rika Saputra', NULL, NULL, 'P', 'Bekasi', '2009-08-23', 'Jl. Pemuda No. 159', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '08488302652', NULL, NULL, '2026-08-19 10:23:50', '2026-08-19 12:12:20', NULL),
(57, NULL, 1, '8100260863', '2026007', 'Ahmad Pratama', NULL, NULL, 'L', 'Surabaya', '2009-08-15', 'Jl. Gatot Subroto No. 26', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '08508157429', NULL, NULL, '2026-08-19 10:23:50', '2026-08-19 12:12:27', NULL),
(58, NULL, 1, '9956192555', '2026008', 'Nurul Mahendra', NULL, NULL, 'P', 'Yogyakarta', '2008-11-29', 'Jl. Pahlawan No. 54', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '08819595113', NULL, NULL, '2026-08-19 10:23:50', '2026-08-19 12:12:34', NULL),
(59, NULL, 1, '7818027442', '2026009', 'Putri Wahyudi', NULL, NULL, 'P', 'Depok', '2010-12-29', 'Jl. Gatot Subroto No. 42', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '08596348124', NULL, NULL, '2026-08-19 10:23:50', '2026-08-19 12:12:43', NULL),
(60, NULL, 1, '7871945068', '2026010', 'Lestari Firmansyah', NULL, NULL, 'P', 'Bogor', '2009-03-25', 'Jl. Pahlawan No. 197', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '08933223566', NULL, NULL, '2026-08-19 10:23:50', '2026-08-19 12:12:49', NULL),
(61, NULL, 1, '1344673685', '2026011', 'Fajar Ramadhan', NULL, NULL, 'L', 'Semarang', '2010-04-01', 'Jl. Thamrin No. 55', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '08709004943', NULL, NULL, '2026-08-19 10:23:50', '2026-08-19 12:12:55', NULL),
(62, NULL, 1, '6360454846', '2026012', 'Dina Mahendra', NULL, NULL, 'P', 'Bandung', '2010-07-28', 'Jl. Diponegoro No. 36', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '08364814270', NULL, NULL, '2026-08-19 10:23:50', '2026-08-19 12:13:51', NULL),
(63, NULL, 1, '7265637086', '2026013', 'Mega Nugroho', NULL, NULL, 'P', 'Medan', '2010-01-11', 'Jl. Merdeka No. 131', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '08629908599', NULL, NULL, '2026-08-19 10:23:50', '2026-08-19 12:14:03', NULL),
(64, NULL, 2, '2177348612', '2026014', 'Andi Ramadhan', NULL, NULL, 'L', 'Tangerang', '2008-11-23', 'Jl. Pemuda No. 109', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '08740389325', NULL, NULL, '2026-08-19 10:23:50', '2026-08-19 12:26:18', NULL),
(65, NULL, 2, '7398303227', '2026015', 'Ilham Nugroho', NULL, NULL, 'L', 'Semarang', '2010-12-19', 'Jl. Anggrek No. 3', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '08830448745', NULL, NULL, '2026-08-19 10:23:50', '2026-08-19 12:36:56', NULL),
(66, NULL, NULL, '3865013625', '2026016', 'Eka Sanjaya', NULL, NULL, 'L', 'Semarang', '2008-08-16', 'Jl. Melati No. 41', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '08587182120', NULL, NULL, '2026-08-19 10:23:50', '2026-08-19 10:23:50', NULL),
(67, NULL, NULL, '9181506832', '2026017', 'Gilang Lubis', NULL, NULL, 'L', 'Surabaya', '2010-11-05', 'Jl. Pemuda No. 77', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '08786066793', NULL, NULL, '2026-08-19 10:23:50', '2026-08-19 10:23:50', NULL),
(68, NULL, NULL, '9187397362', '2026018', 'Rizky Setiawan', NULL, NULL, 'L', 'Jakarta', '2010-12-22', 'Jl. Kenangan No. 83', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '08624636385', NULL, NULL, '2026-08-19 10:23:50', '2026-08-19 10:23:50', NULL),
(69, NULL, NULL, '4897476294', '2026019', 'Reza Firmansyah', NULL, NULL, 'L', 'Jakarta', '2009-05-05', 'Jl. Gatot Subroto No. 146', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '08184564737', NULL, NULL, '2026-08-19 10:23:50', '2026-08-19 10:23:50', NULL),
(70, NULL, NULL, '1743163708', '2026020', 'Arya Ramadhan', NULL, NULL, 'L', 'Bandung', '2008-09-14', 'Jl. Pemuda No. 122', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '08690347116', NULL, NULL, '2026-08-19 10:23:50', '2026-08-19 10:23:50', NULL),
(71, NULL, NULL, '7513252576', '2026021', 'Gilang Lubis', NULL, NULL, 'L', 'Makassar', '2009-03-09', 'Jl. Veteran No. 187', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '08840739735', NULL, NULL, '2026-08-19 10:23:50', '2026-08-19 10:23:50', NULL),
(72, NULL, NULL, '8212183825', '2026022', 'Bayu Nugroho', NULL, NULL, 'L', 'Makassar', '2010-06-16', 'Jl. Mawar No. 31', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '08366186631', NULL, NULL, '2026-08-19 10:23:50', '2026-08-19 10:23:50', NULL),
(73, NULL, NULL, '1225853669', '2026023', 'Ahmad Setiawan', NULL, NULL, 'L', 'Palembang', '2009-04-16', 'Jl. Gatot Subroto No. 2', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '08176228245', NULL, NULL, '2026-08-19 10:23:50', '2026-08-19 10:23:50', NULL),
(74, NULL, NULL, '1337294065', '2026024', 'Fajar Saputra', NULL, NULL, 'L', 'Makassar', '2008-05-25', 'Jl. Gatot Subroto No. 72', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '08818309417', NULL, NULL, '2026-08-19 10:23:50', '2026-08-19 10:23:50', NULL),
(75, NULL, NULL, '2420687639', '2026025', 'Dina Lubis', NULL, NULL, 'P', 'Medan', '2010-08-26', 'Jl. Veteran No. 122', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '08967043303', NULL, NULL, '2026-08-19 10:23:50', '2026-08-19 10:23:50', NULL),
(76, NULL, NULL, '2040786666', '2026026', 'Dina Saputra', NULL, NULL, 'P', 'Malang', '2009-12-26', 'Jl. Melati No. 120', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '08882839238', NULL, NULL, '2026-08-19 10:23:50', '2026-08-19 10:23:50', NULL),
(77, NULL, NULL, '5323113105', '2026027', 'Reza Pratama', NULL, NULL, 'L', 'Medan', '2008-08-11', 'Jl. Gatot Subroto No. 49', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '08675832441', NULL, NULL, '2026-08-19 10:23:50', '2026-08-19 10:23:50', NULL),
(78, NULL, NULL, '2970187814', '2026028', 'Sari Nugroho', NULL, NULL, 'P', 'Medan', '2010-08-05', 'Jl. Thamrin No. 114', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '08967607278', NULL, NULL, '2026-08-19 10:23:50', '2026-08-19 10:23:50', NULL),
(79, NULL, NULL, '6804518720', '2026029', 'Andi Mahendra', NULL, NULL, 'L', 'Tangerang', '2008-07-10', 'Jl. Gatot Subroto No. 43', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '08536383774', NULL, NULL, '2026-08-19 10:23:50', '2026-08-19 10:23:50', NULL),
(80, NULL, NULL, '5306137290', '2026030', 'Citra Kusuma', NULL, NULL, 'P', 'Malang', '2008-12-03', 'Jl. Sudirman No. 100', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '08384759615', NULL, NULL, '2026-08-19 10:23:50', '2026-08-19 10:23:50', NULL),
(81, NULL, NULL, '8479594308', '2026031', 'Intan Nugroho', NULL, NULL, 'P', 'Bandung', '2010-09-23', 'Jl. Gatot Subroto No. 76', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '08333754555', NULL, NULL, '2026-08-19 10:23:50', '2026-08-19 10:23:50', NULL),
(82, NULL, NULL, '6821776680', '2026032', 'Putra Pangestu', NULL, NULL, 'L', 'Jakarta', '2009-10-04', 'Jl. Sudirman No. 150', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '08611947770', NULL, NULL, '2026-08-19 10:23:50', '2026-08-19 10:23:50', NULL),
(83, NULL, NULL, '1860190282', '2026033', 'Andi Lubis', NULL, NULL, 'L', 'Palembang', '2008-05-20', 'Jl. Thamrin No. 173', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '08352548261', NULL, NULL, '2026-08-19 10:23:50', '2026-08-19 10:23:50', NULL),
(84, NULL, NULL, '7116843183', '2026034', 'Dewi Firmansyah', NULL, NULL, 'P', 'Palembang', '2008-03-22', 'Jl. Thamrin No. 108', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '08805849060', NULL, NULL, '2026-08-19 10:23:50', '2026-08-19 10:23:50', NULL),
(85, NULL, NULL, '8191127905', '2026035', 'Lestari Kusuma', NULL, NULL, 'P', 'Semarang', '2009-05-03', 'Jl. Melati No. 34', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '08821221887', NULL, NULL, '2026-08-19 10:23:50', '2026-08-19 10:23:50', NULL),
(86, NULL, NULL, '9073083481', '2026036', 'Nurul Setiawan', NULL, NULL, 'P', 'Denpasar', '2008-01-20', 'Jl. Kenangan No. 145', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '08207354053', NULL, NULL, '2026-08-19 10:23:50', '2026-08-19 10:23:50', NULL),
(87, NULL, NULL, '6431895554', '2026037', 'Eka Kusuma', NULL, NULL, 'L', 'Yogyakarta', '2008-09-28', 'Jl. Thamrin No. 63', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '08496776692', NULL, NULL, '2026-08-19 10:23:50', '2026-08-19 10:23:50', NULL),
(88, NULL, NULL, '9952268288', '2026038', 'Rina Siregar', NULL, NULL, 'P', 'Palembang', '2009-09-11', 'Jl. Veteran No. 168', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '08667945747', NULL, NULL, '2026-08-19 10:23:50', '2026-08-19 10:23:50', NULL),
(89, NULL, NULL, '8123082091', '2026039', 'Eka Hidayat', NULL, NULL, 'L', 'Semarang', '2008-10-02', 'Jl. Thamrin No. 28', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '08897163846', NULL, NULL, '2026-08-19 10:23:50', '2026-08-19 10:23:50', NULL),
(90, NULL, NULL, '7494310823', '2026040', 'Gilang Hidayat', NULL, NULL, 'L', 'Medan', '2009-12-03', 'Jl. Pemuda No. 163', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '08383450553', NULL, NULL, '2026-08-19 10:23:50', '2026-08-19 10:23:50', NULL),
(91, NULL, NULL, '1545448991', '2026041', 'Lestari Firmansyah', NULL, NULL, 'P', 'Bekasi', '2010-05-17', 'Jl. Diponegoro No. 12', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '08103807155', NULL, NULL, '2026-08-19 10:23:50', '2026-08-19 10:23:50', NULL),
(92, NULL, NULL, '3812723272', '2026042', 'Sari Mahendra', NULL, NULL, 'P', 'Makassar', '2010-06-23', 'Jl. Ahmad Yani No. 110', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '08702269164', NULL, NULL, '2026-08-19 10:23:50', '2026-08-19 10:23:50', NULL),
(93, NULL, NULL, '8419766662', '2026043', 'Reza Saputra', NULL, NULL, 'L', 'Bekasi', '2008-03-14', 'Jl. Pahlawan No. 150', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '08693269304', NULL, NULL, '2026-08-19 10:23:50', '2026-08-19 10:23:50', NULL),
(94, NULL, NULL, '1449133994', '2026044', 'Kevin Wijaya', NULL, NULL, 'L', 'Tangerang', '2010-01-16', 'Jl. Sudirman No. 92', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '08325567963', NULL, NULL, '2026-08-19 10:23:50', '2026-08-19 10:23:50', NULL),
(95, NULL, NULL, '9376434398', '2026045', 'Reza Setiawan', NULL, NULL, 'L', 'Palembang', '2010-04-12', 'Jl. Ahmad Yani No. 40', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '08354194771', NULL, NULL, '2026-08-19 10:23:50', '2026-08-19 10:23:50', NULL),
(96, NULL, NULL, '5426977550', '2026046', 'Dika Firmansyah', NULL, NULL, 'L', 'Depok', '2009-01-02', 'Jl. Pahlawan No. 106', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '08961393416', NULL, NULL, '2026-08-19 10:23:50', '2026-08-19 10:23:50', NULL),
(97, NULL, NULL, '9454369431', '2026047', 'Gilang Wijaya', NULL, NULL, 'L', 'Bekasi', '2010-02-22', 'Jl. Sudirman No. 121', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '08338836384', NULL, NULL, '2026-08-19 10:23:50', '2026-08-19 10:23:50', NULL),
(98, NULL, NULL, '4276961983', '2026048', 'Wahyu Setiawan', NULL, NULL, 'L', 'Jakarta', '2009-04-01', 'Jl. Pemuda No. 50', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '08527849588', NULL, NULL, '2026-08-19 10:23:50', '2026-08-19 10:23:50', NULL),
(99, NULL, NULL, '1745399644', '2026049', 'Lestari Ramadhan', NULL, NULL, 'P', 'Bogor', '2009-12-20', 'Jl. Anggrek No. 103', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '08829627019', NULL, NULL, '2026-08-19 10:23:50', '2026-08-19 10:23:50', NULL),
(100, NULL, NULL, '3804776832', '2026050', 'Siti Saputra', NULL, NULL, 'P', 'Jakarta', '2009-06-27', 'Jl. Thamrin No. 153', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '08566609283', NULL, NULL, '2026-08-19 10:23:50', '2026-08-19 10:23:50', NULL),
(101, NULL, 1, '1234567890123456', '20260001', 'Agil Test Updated', NULL, NULL, 'L', 'Yogyakarta', '2010-01-01', 'Yogyakarta Updated', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '08123456789', NULL, NULL, '2026-08-21 09:12:58', '2026-08-21 09:28:07', '2026-08-21 09:28:07'),
(102, NULL, NULL, '132321321', '312123312', 'Agil Febri Pradana', NULL, NULL, 'L', 'Wonosobo', '2026-08-03', 'Larangan, Maduretno, Kalikajar', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '423234432432', NULL, NULL, '2026-08-27 16:18:25', '2026-08-27 16:18:25', NULL),
(108, 94, NULL, '1234123455', 'NIS-2026-000010', 'Agil Febri Pradana', '1122334455667788', 'islam', 'L', 'Wonosobo', '2026-08-31', 'Larangan, Maduretno, Kalikajar', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'adsdas', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '085868749808', 'agilfebripradana123@gmail.com', NULL, '2026-08-31 15:44:17', '2026-08-31 15:44:17', NULL),
(122, 108, NULL, '1234123456', 'NIS-2026-000002', 'Budi Santoso', '1122334455667789', 'islam', 'L', 'Temanggung', '2008-03-20', 'Jl. Diponegoro No. 21', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'SMP Negeri 2 Temanggung', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '081234567802', 'budi@example.com', NULL, '2026-08-31 17:08:24', '2026-08-31 17:08:24', NULL),
(123, 111, NULL, '1234123459', 'NIS-2026-000005', 'Eka Putri', '1122334455667792', 'islam', 'P', 'Kebumen', '2008-11-25', 'Jl. Pemuda No. 30', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'SMP Negeri 1 Kebumen', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, 0, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, '081234567805', 'eka@example.com', NULL, '2026-08-31 17:51:09', '2026-08-31 17:51:09', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `student_histories`
--

CREATE TABLE `student_histories` (
  `id` int(10) UNSIGNED NOT NULL,
  `student_id` int(10) UNSIGNED NOT NULL,
  `class_id` int(10) UNSIGNED NOT NULL,
  `academic_year_id` int(10) UNSIGNED NOT NULL,
  `status` enum('naik','tinggal','pindah','lulus','keluar') NOT NULL DEFAULT 'naik',
  `notes` text DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student_histories`
--

INSERT INTO `student_histories` (`id`, `student_id`, `class_id`, `academic_year_id`, `status`, `notes`, `created_at`, `updated_at`) VALUES
(101, 52, 1, 2, 'naik', 'Naik kelas dengan nilai baik.', '2026-08-25 07:07:54', '2026-08-25 07:07:54'),
(102, 53, 1, 2, 'naik', NULL, '2026-08-25 07:07:54', '2026-08-25 07:07:54'),
(103, 54, 1, 2, 'naik', NULL, '2026-08-25 07:07:54', '2026-08-25 07:07:54'),
(104, 55, 1, 2, 'tinggal', 'Wajib mengulang ujian remedial.', '2026-08-25 07:07:54', '2026-08-25 07:07:54'),
(105, 56, 1, 2, 'naik', NULL, '2026-08-25 07:07:54', '2026-08-25 07:07:54'),
(106, 102, 2, 6, 'naik', 'joss', '2026-08-27 18:32:05', '2026-08-27 18:43:22');

-- --------------------------------------------------------

--
-- Table structure for table `student_id_cards`
--

CREATE TABLE `student_id_cards` (
  `id` int(10) UNSIGNED NOT NULL,
  `student_id` int(10) UNSIGNED NOT NULL,
  `card_number` varchar(30) NOT NULL,
  `issued_date` date DEFAULT NULL,
  `valid_until` date DEFAULT NULL,
  `status` enum('aktif','hilang','rusak','nonaktif') NOT NULL DEFAULT 'aktif',
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `student_id_cards`
--

INSERT INTO `student_id_cards` (`id`, `student_id`, `card_number`, `issued_date`, `valid_until`, `status`, `created_at`, `updated_at`) VALUES
(101, 52, 'IDC-2026-0001', '2026-07-15', '2027-06-30', 'aktif', '2026-08-25 07:07:54', '2026-08-25 07:07:54'),
(102, 53, 'IDC-2026-0002', '2026-07-15', '2027-06-30', 'aktif', '2026-08-25 07:07:54', '2026-08-25 07:07:54'),
(103, 54, 'IDC-2026-0003', '2026-07-15', '2027-06-30', 'aktif', '2026-08-25 07:07:54', '2026-08-25 07:07:54'),
(104, 55, 'IDC-2026-0004', '2026-07-15', '2027-06-30', 'hilang', '2026-08-25 07:07:54', '2026-08-25 07:07:54'),
(105, 56, 'IDC-2026-0005', '2026-07-15', '2027-06-30', 'aktif', '2026-08-25 07:07:54', '2026-08-25 07:07:54');

-- --------------------------------------------------------

--
-- Table structure for table `subjects`
--

CREATE TABLE `subjects` (
  `id` int(10) UNSIGNED NOT NULL,
  `code` varchar(20) NOT NULL,
  `name` varchar(100) NOT NULL,
  `type` enum('wajib','pilihan') NOT NULL DEFAULT 'wajib',
  `description` text DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `subjects`
--

INSERT INTO `subjects` (`id`, `code`, `name`, `type`, `description`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 'PAI', 'Pendidikan Agama dan Budi Pekerti', 'wajib', 'Mempelajari ajaran agama dan pembentukan karakter.', '2026-08-19 10:33:22', '2026-08-19 10:33:22', NULL),
(2, 'PKN', 'Pendidikan Pancasila', 'wajib', 'Mempelajari nilai-nilai Pancasila dan kewarganegaraan.', '2026-08-19 10:33:22', '2026-08-19 10:33:22', NULL),
(3, 'IND', 'Bahasa Indonesia', 'wajib', 'Pengembangan kemampuan berbahasa dan sastra Indonesia.', '2026-08-19 10:33:22', '2026-08-19 10:33:22', NULL),
(4, 'MAT', 'Matematika', 'wajib', 'Mempelajari konsep angka, logika, dan pemecahan masalah.', '2026-08-19 10:33:22', '2026-08-19 10:33:22', NULL),
(5, 'SEA', 'Sejarah', 'wajib', 'Mempelajari peristiwa masa lalu dan kaitannya dengan masa kini.', '2026-08-19 10:33:22', '2026-08-19 10:33:22', NULL),
(6, 'BIN', 'Bahasa Inggris', 'wajib', 'Pengembangan keterampilan komunikasi dalam bahasa Inggris.', '2026-08-19 10:33:22', '2026-08-19 10:33:22', NULL),
(7, 'GEO', 'Geografi', 'wajib', 'Mempelajari fenomena alam dan interaksi manusia dengan lingkungan.', '2026-08-19 10:33:22', '2026-08-19 10:33:22', NULL),
(8, 'EKO', 'Ekonomi', 'wajib', 'Mempelajari perilaku ekonomi dan pengelolaan sumber daya.', '2026-08-19 10:33:22', '2026-08-19 10:33:22', NULL),
(9, 'SOS', 'Sosiologi', 'wajib', 'Mempelajari interaksi, struktur, dan dinamika sosial masyarakat.', '2026-08-19 10:33:22', '2026-08-19 10:33:22', NULL),
(10, 'SEJ', 'Sejarah (Peminatan)', 'wajib', 'Pendalaman materi sejarah untuk peminatan IPS.', '2026-08-19 10:33:22', '2026-08-19 10:33:22', NULL),
(11, 'SEN', 'Seni Budaya', 'wajib', 'Pengembangan ekspresi seni dan apresiasi budaya.', '2026-08-19 10:33:22', '2026-08-19 10:33:22', NULL),
(12, 'PEN', 'Pendidikan Jasmani, Olahraga, dan Kesehatan', 'wajib', 'Meningkatkan kebugaran fisik dan kesehatan tubuh.', '2026-08-19 10:33:22', '2026-08-19 10:33:22', NULL),
(13, 'TIK', 'Informatika', 'wajib', 'Mempelajari teknologi informasi dan pemrograman dasar.', '2026-08-19 10:33:22', '2026-08-19 10:33:22', NULL),
(14, 'ANT', 'Antropologi', 'pilihan', 'Mempelajari pola budaya dan keragaman manusia.', '2026-08-19 10:33:22', '2026-08-19 10:33:58', NULL),
(15, 'EKO-L', 'Ekonomi Lanjutan', 'pilihan', 'Pendalaman materi ekonomi untuk persiapan perguruan tinggi.', '2026-08-19 10:33:22', '2026-08-19 10:33:22', NULL),
(16, 'SOS-L', 'Sosiologi Lanjutan', 'pilihan', 'Analisis mendalam mengenai fenomena sosial.', '2026-08-19 10:33:22', '2026-08-19 10:33:22', NULL),
(17, 'GEO-L', 'Geografi Lanjutan', 'pilihan', 'Pendalaman analisis keruangan dan tata kelola wilayah.', '2026-08-19 10:33:22', '2026-08-19 10:33:22', NULL),
(18, 'MTK', 'Matematika Updated', 'pilihan', 'Mata pelajaran matematika setelah diperbarui', '2026-08-21 09:45:45', '2026-08-21 09:47:18', '2026-08-21 09:47:18');

-- --------------------------------------------------------

--
-- Table structure for table `teachers`
--

CREATE TABLE `teachers` (
  `id` int(10) UNSIGNED NOT NULL,
  `user_id` int(10) UNSIGNED DEFAULT NULL,
  `teacher_code` varchar(20) DEFAULT NULL,
  `nip` varchar(30) NOT NULL,
  `full_name` varchar(150) DEFAULT NULL,
  `prefix_title` varchar(50) DEFAULT NULL,
  `suffix_title` varchar(50) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `last_education` varchar(50) DEFAULT NULL,
  `major` varchar(100) DEFAULT NULL,
  `employment_status` varchar(50) DEFAULT NULL,
  `join_date` date DEFAULT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `address` text DEFAULT NULL,
  `gender` enum('L','P') DEFAULT 'L',
  `birth_place` varchar(100) DEFAULT NULL,
  `birth_date` date DEFAULT NULL,
  `religion` varchar(30) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `teachers`
--

INSERT INTO `teachers` (`id`, `user_id`, `teacher_code`, `nip`, `full_name`, `prefix_title`, `suffix_title`, `phone`, `email`, `last_education`, `major`, `employment_status`, `join_date`, `photo`, `is_active`, `address`, `gender`, `birth_place`, `birth_date`, `religion`, `created_at`, `updated_at`, `deleted_at`) VALUES
(136, 55, 'GR-001', '19840122201041617', 'Eko Nugroho', '', '', '081234567801', 'eko.nugroho@example.com', 'S1', 'Informatika', 'PNS', '2010-07-01', NULL, 1, 'Jl. Merdeka No. 12, Medan', 'L', 'Medan', '1984-01-22', 'Islam', '2026-08-19 00:21:14', '2026-08-19 00:22:57', NULL),
(144, 70, 'GR-002', '198104162015041653', 'Dedi Siregar', NULL, NULL, '08233625746', 'dedi.siregar@sekolah.sch.id', 'S2', 'Pendidikan Fisika', 'PNS', '2017-05-15', NULL, 1, 'Jl. Melati No. 120, Malang', 'L', 'Malang', '1988-12-10', 'Islam', '2026-08-19 00:22:00', '2026-08-19 00:22:00', NULL),
(145, 71, 'GR-003', '197707032017122685', 'Rini Saputra', NULL, NULL, '08946118977', 'rini.saputra@sekolah.sch.id', 'S1', 'Pendidikan Ekonomi', 'PNS', '2018-04-27', NULL, 1, 'Jl. Gatot Subroto No. 137, Malang', 'P', 'Malang', '1970-04-17', 'Hindu', '2026-08-19 00:22:01', '2026-08-19 00:22:01', NULL),
(146, 72, 'GR-004', '198803022018032285', 'Siti Setiawan', NULL, NULL, '08444516126', 'siti.setiawan@sekolah.sch.id', 'S2', 'Pendidikan Biologi', 'Honorer', '2021-06-13', NULL, 1, 'Jl. Veteran No. 146, Surabaya', 'P', 'Surabaya', '1976-10-06', 'Katolik', '2026-08-19 00:22:01', '2026-08-19 00:22:01', NULL),
(147, 73, 'GR-005', '199209222005022068', 'Nita Kusuma', NULL, NULL, '08381262777', 'nita.kusuma@sekolah.sch.id', 'S1', 'Pendidikan Jasmani', 'PPPK', '2014-01-04', NULL, 1, 'Jl. Kusuma Bangsa No. 114, Jakarta', 'P', 'Jakarta', '1995-10-28', 'Buddha', '2026-08-19 00:22:01', '2026-08-19 00:22:01', NULL),
(148, 74, 'GR-006', '198403032009051346', 'Wahyu Siregar', NULL, NULL, '0873971908', 'wahyu.siregar@sekolah.sch.id', 'S2', 'Pendidikan Matematika', 'PPPK', '2016-04-01', NULL, 1, 'Jl. Pemuda No. 90, Malang', 'L', 'Malang', '1973-01-11', 'Buddha', '2026-08-19 00:22:01', '2026-08-19 00:22:01', NULL),
(149, 75, 'GR-007', '197405152011072115', 'Sri Setiawan', NULL, NULL, '08272366191', 'sri.setiawan@sekolah.sch.id', 'S1', 'Pendidikan Matematika', 'Honorer', '2023-10-01', NULL, 1, 'Jl. Diponegoro No. 46, Makassar', 'P', 'Makassar', '1984-04-26', 'Islam', '2026-08-19 00:22:01', '2026-08-19 00:22:01', NULL),
(150, 76, 'GR-008', '197106082013082677', 'Kartika Lubis', NULL, NULL, '08646859674', 'kartika.lubis@sekolah.sch.id', 'S1', 'Pendidikan Biologi', 'Tetap', '2017-10-01', NULL, 1, 'Jl. Pahlawan No. 86, Medan', 'P', 'Medan', '1994-10-11', 'Buddha', '2026-08-19 00:22:02', '2026-08-19 00:22:02', NULL),
(151, 77, 'GR-010', '199106172022041131', 'Taufik Sanjaya', NULL, NULL, '08607117919', 'taufik.sanjaya@sekolah.sch.id', 'S2', 'Pendidikan Fisika', 'Honorer', '2014-07-26', NULL, 1, 'Jl. Diponegoro No. 78, Padang', 'L', 'Padang', '1994-06-27', 'Katolik', '2026-08-19 00:22:02', '2026-08-19 00:22:02', NULL),
(152, 78, 'GR-011', '197701192015122900', 'Ratna Pratama', NULL, NULL, '08725825759', 'ratna.pratama@sekolah.sch.id', 'S1', 'Pendidikan Matematika', 'Honorer', '2023-11-15', NULL, 1, 'Jl. Diponegoro No. 142, Padang', 'P', 'Padang', '1989-09-02', 'Islam', '2026-08-19 00:22:02', '2026-08-19 00:22:02', NULL),
(153, 79, 'GR-012', '198411092009081766', 'Budi Saputra', NULL, NULL, '0848230797', 'budi.saputra@sekolah.sch.id', 'S1', 'Pendidikan Jasmani', 'Tetap', '2021-09-03', NULL, 1, 'Jl. Ahmad Yani No. 32, Denpasar', 'L', 'Denpasar', '1972-10-05', 'Katolik', '2026-08-19 00:22:02', '2026-08-19 00:22:02', NULL),
(154, 80, 'GR-013', '199207042013011245', 'Hendra Wahyudi', NULL, NULL, '08701756110', 'hendra.wahyudi@sekolah.sch.id', 'S1', 'Pendidikan Biologi', 'PPPK', '2023-03-05', NULL, 1, 'Jl. Thamrin No. 60, Yogyakarta', 'L', 'Yogyakarta', '1979-09-22', 'Buddha', '2026-08-19 00:22:02', '2026-08-19 00:22:02', NULL),
(155, 81, 'GR-014', '197104172021041108', 'Dedi Kusuma', NULL, NULL, '0823259011', 'dedi.kusuma@sekolah.sch.id', 'S2', 'Pendidikan Biologi', 'PNS', '2012-06-24', NULL, 1, 'Jl. Pemuda No. 33, Palembang', 'L', 'Palembang', '1993-08-30', 'Katolik', '2026-08-19 00:22:02', '2026-08-19 00:22:02', NULL),
(156, 82, 'GR-015', '198812282007051413', 'Dedi Lubis', NULL, NULL, '08135014052', 'dedi.lubis@sekolah.sch.id', 'S1', 'Pendidikan Bahasa Inggris', 'Tetap', '2016-06-19', NULL, 1, 'Jl. Veteran No. 136, Bandung', 'L', 'Bandung', '1972-09-03', 'Katolik', '2026-08-19 00:22:03', '2026-08-19 00:22:03', NULL),
(157, 83, 'GR-016', '198211182017031816', 'Hendra Pangestu', NULL, NULL, '08758470107', 'hendra.pangestu@sekolah.sch.id', 'S2', 'Pendidikan Fisika', 'Honorer', '2015-06-16', NULL, 1, 'Jl. Gatot Subroto No. 79, Banjarmasin', 'L', 'Banjarmasin', '1984-12-01', 'Islam', '2026-08-19 00:22:03', '2026-08-19 00:22:03', NULL),
(158, 84, 'GR-017', '198903162019081948', 'Ahmad Kusuma', NULL, NULL, '08823626755', 'ahmad.kusuma@sekolah.sch.id', 'S1', 'Pendidikan Fisika', 'Tetap', '2021-10-16', NULL, 1, 'Jl. Gatot Subroto No. 85, Medan', 'L', 'Medan', '1982-04-13', 'Islam', '2026-08-19 00:22:03', '2026-08-19 00:22:03', NULL),
(159, 85, 'GR-018', '197405192016082632', 'Siti Saputra', NULL, NULL, '08496726261', 'siti.saputra@sekolah.sch.id', 'S1', 'Pendidikan Ekonomi', 'Honorer', '2011-01-02', NULL, 1, 'Jl. Thamrin No. 46, Semarang', 'P', 'Semarang', '1972-06-28', 'Katolik', '2026-08-19 00:22:03', '2026-08-19 00:22:03', NULL),
(160, 86, 'GR-019', '197104012017032501', 'Siti Nugroho', NULL, NULL, '08994403285', 'siti.nugroho@sekolah.sch.id', 'S2', 'Pendidikan Ekonomi', 'PPPK', '2023-05-16', NULL, 1, 'Jl. Melati No. 113, Malang', 'P', 'Malang', '1974-09-05', 'Kristen', '2026-08-19 00:22:03', '2026-08-19 00:22:03', NULL),
(161, 87, 'GR-020', '197403172020052942', 'Nita Saputra', NULL, NULL, '08952859052', 'nita.saputra@sekolah.sch.id', 'S1', 'Pendidikan Matematika', 'Honorer', '2016-06-01', NULL, 1, 'Jl. Sudirman No. 14, Medan', 'P', 'Medan', '1988-11-11', 'Buddha', '2026-08-19 00:22:03', '2026-08-19 00:22:03', NULL),
(162, NULL, 'GR-TEST-001', '1990010120260001', 'Agil Febri Pradana Update', NULL, 'S.Kom', '081234567891', 'agil.patch@sekolah.sch.id', 'S1', 'Informatika', 'Tetap', '2026-08-21', NULL, 1, 'Yogyakarta', 'L', 'Yogyakarta', '2000-01-01', 'Islam', '2026-08-21 10:44:13', '2026-08-21 10:48:06', '2026-08-21 10:48:06'),
(163, NULL, 'GR-TEST-002', '199001012020011002', 'Agil Test Updated', NULL, NULL, '081111111111', 'agil.updated@example.com', 'S1', 'Teknik Informatika', 'Tetap', '2026-08-26', NULL, 1, 'Yogyakarta', 'L', 'Yogyakarta', '2000-01-01', 'Islam', '2026-08-26 13:55:20', '2026-08-26 13:57:17', '2026-08-26 13:57:17'),
(164, NULL, 'grsrsrsrs', '211212121221', 'Agil Febri Pradana', 'King', 'S . Kom', '08123456', 'agilfebripradana123@gmail.com', 'S1', 'Informatika', 'PNS', '2026-08-28', NULL, 1, 'Larangan, Maduretno, Kalikajar update', 'L', 'Wonosobo', '2003-02-08', 'islam', '2026-08-28 10:03:17', '2026-08-28 10:07:36', NULL),
(165, NULL, 'GR-021', '998897', 'dfdfdf', 'fddf', 'dfdf', '33333', 'agilfebripradana123@gmail.com', 'S1', 'dasdas', 'honorer', '2026-08-28', NULL, 1, 'Larangan, Maduretno, Kalikajar', 'L', 'Wonosobo', '2026-08-28', 'islam', '2026-08-28 10:35:59', '2026-08-28 10:36:19', '2026-08-28 10:36:19');

-- --------------------------------------------------------

--
-- Table structure for table `teacher_assignments`
--

CREATE TABLE `teacher_assignments` (
  `id` int(10) UNSIGNED NOT NULL,
  `teacher_id` int(10) UNSIGNED NOT NULL,
  `class_id` int(10) UNSIGNED NOT NULL,
  `subject_id` int(10) UNSIGNED NOT NULL,
  `academic_year_id` int(10) UNSIGNED NOT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `teacher_assignments`
--

INSERT INTO `teacher_assignments` (`id`, `teacher_id`, `class_id`, `subject_id`, `academic_year_id`, `created_at`, `updated_at`) VALUES
(101, 136, 1, 3, 2, '2026-08-25 05:39:12', '2026-08-25 05:39:12'),
(102, 144, 1, 4, 2, '2026-08-25 05:39:12', '2026-08-25 05:39:12'),
(103, 145, 1, 6, 2, '2026-08-25 05:39:12', '2026-08-25 05:39:12'),
(104, 146, 1, 7, 2, '2026-08-25 05:39:12', '2026-08-25 05:39:12'),
(105, 147, 1, 8, 2, '2026-08-25 05:39:12', '2026-08-25 05:39:12'),
(106, 164, 1, 13, 2, '2026-08-28 10:54:04', '2026-08-28 10:54:13');

-- --------------------------------------------------------

--
-- Table structure for table `teacher_attendance`
--

CREATE TABLE `teacher_attendance` (
  `id` int(10) UNSIGNED NOT NULL,
  `teacher_id` int(10) UNSIGNED NOT NULL,
  `date` date NOT NULL,
  `status` enum('hadir','sakit','izin','alfa','terlambat') NOT NULL DEFAULT 'hadir',
  `check_in` time DEFAULT NULL,
  `check_out` time DEFAULT NULL,
  `notes` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `teacher_attendance`
--

INSERT INTO `teacher_attendance` (`id`, `teacher_id`, `date`, `status`, `check_in`, `check_out`, `notes`, `created_at`, `updated_at`) VALUES
(101, 136, '2026-08-24', 'hadir', '06:45:00', '15:30:00', NULL, '2026-08-25 16:36:14', '2026-08-25 16:36:14'),
(102, 144, '2026-08-25', 'terlambat', '07:35:00', '15:30:00', 'Terlambat 35 menit.', '2026-08-25 16:36:14', '2026-08-25 16:36:14'),
(103, 145, '2026-08-26', 'sakit', NULL, NULL, 'Surat dokter menyusul.', '2026-08-25 16:36:14', '2026-08-25 16:36:14'),
(104, 146, '2026-08-27', 'izin', '06:50:00', '12:00:00', 'Izin acara keluarga.', '2026-08-25 16:36:14', '2026-08-25 16:36:14'),
(106, 161, '2026-08-28', 'hadir', '16:38:00', '16:40:00', NULL, '2026-08-28 09:38:34', '2026-08-28 09:38:34');

-- --------------------------------------------------------

--
-- Table structure for table `teacher_documents`
--

CREATE TABLE `teacher_documents` (
  `id` int(10) UNSIGNED NOT NULL,
  `teacher_id` int(10) UNSIGNED NOT NULL,
  `title` varchar(150) NOT NULL,
  `document_type` enum('sk','sertifikat','ijazah','kontrak','lainnya') NOT NULL DEFAULT 'lainnya',
  `file_path` varchar(255) DEFAULT NULL,
  `issued_date` date DEFAULT NULL,
  `notes` varchar(255) DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `teacher_documents`
--

INSERT INTO `teacher_documents` (`id`, `teacher_id`, `title`, `document_type`, `file_path`, `issued_date`, `notes`, `created_at`, `updated_at`) VALUES
(101, 136, 'SK CPNS', 'sk', NULL, '2015-03-01', NULL, '2026-08-25 16:36:14', '2026-08-25 16:36:14'),
(102, 144, 'Sertifikat Pendidik', 'sertifikat', NULL, '2018-11-20', NULL, '2026-08-25 16:36:14', '2026-08-25 16:36:14'),
(103, 145, 'Ijazah S1 Pendidikan Fisika', 'ijazah', NULL, '2014-08-15', NULL, '2026-08-25 16:36:14', '2026-08-25 16:36:14'),
(104, 146, 'Kontrak Kerja 2026', 'kontrak', NULL, '2026-01-05', 'Periode satu tahun.', '2026-08-25 16:36:14', '2026-08-25 16:36:14'),
(105, 147, 'SK Kenaikan Pangkat', 'sk', NULL, '2025-04-01', 'update', '2026-08-25 16:36:14', '2026-08-28 11:04:39');

-- --------------------------------------------------------

--
-- Table structure for table `teacher_leave`
--

CREATE TABLE `teacher_leave` (
  `id` int(10) UNSIGNED NOT NULL,
  `teacher_id` int(10) UNSIGNED NOT NULL,
  `leave_type` enum('cuti','izin','sakit','dinas') NOT NULL DEFAULT 'izin',
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `reason` text DEFAULT NULL,
  `status` enum('menunggu','disetujui','ditolak') NOT NULL DEFAULT 'menunggu',
  `approved_by` int(10) UNSIGNED DEFAULT NULL,
  `approved_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `teacher_leave`
--

INSERT INTO `teacher_leave` (`id`, `teacher_id`, `leave_type`, `start_date`, `end_date`, `reason`, `status`, `approved_by`, `approved_at`, `created_at`, `updated_at`) VALUES
(101, 144, 'cuti', '2026-09-01', '2026-09-05', 'Cuti tahunan.', 'disetujui', 136, '2026-08-26 09:00:00', '2026-08-25 16:36:14', '2026-08-25 16:36:14'),
(102, 145, 'sakit', '2026-08-26', '2026-08-28', 'Demam berdarah.', 'disetujui', 136, '2026-08-29 09:00:00', '2026-08-25 16:36:14', '2026-08-25 09:42:00'),
(103, 164, 'dinas', '2026-09-10', '2026-09-11', 'Rapat dinas pendidikan provinsi.', 'disetujui', 136, '2026-08-27 10:00:00', '2026-08-25 16:36:14', '2026-08-28 10:56:31'),
(104, 157, 'izin', '2026-09-03', '2026-09-03', 'Acara pernikahan keluarga.', 'ditolak', 136, '2026-08-28 08:00:00', '2026-08-25 16:36:14', '2026-08-28 10:56:53'),
(105, 155, 'izin', '2026-08-28', '2026-08-29', 'adsdas', 'disetujui', NULL, NULL, '2026-08-28 10:59:58', '2026-08-28 10:59:58');

-- --------------------------------------------------------

--
-- Table structure for table `transfers`
--

CREATE TABLE `transfers` (
  `id` int(10) UNSIGNED NOT NULL,
  `student_id` int(10) UNSIGNED NOT NULL,
  `type` enum('masuk','keluar') NOT NULL,
  `from_school` varchar(150) DEFAULT NULL,
  `to_school` varchar(150) DEFAULT NULL,
  `transfer_date` date DEFAULT NULL,
  `reason` text DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `transfers`
--

INSERT INTO `transfers` (`id`, `student_id`, `type`, `from_school`, `to_school`, `transfer_date`, `reason`, `created_at`, `updated_at`) VALUES
(101, 52, 'keluar', 'SMA Negeri 1 Contoh', 'SMA Negeri 3 Bandung', '2026-08-10', 'Orang tua pindah tugas.', '2026-08-25 07:07:54', '2026-08-25 07:07:54'),
(102, 53, 'masuk', 'SMP Negeri 2 Sukamaju', 'SMA Negeri 1 Contoh', '2026-07-15', 'Lanjut pendidikan.', '2026-08-25 07:07:54', '2026-08-25 07:07:54'),
(103, 54, 'masuk', 'MTs Al-Hidayah', 'SMA Negeri 1 Contoh', '2026-07-16', NULL, '2026-08-25 07:07:54', '2026-08-25 07:07:54'),
(104, 55, 'keluar', 'SMA Negeri 1 Contoh', 'SMKN 1 Industri', '2026-08-12', 'Menyesuaikan minat.', '2026-08-25 07:07:54', '2026-08-25 07:07:54'),
(105, 102, 'keluar', 'SMA Negeri 1 Contoh', 'SMK n 1 Wonosobo', '2026-08-27', 'Ra betahh', '2026-08-27 18:28:39', '2026-08-27 18:29:40');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(10) UNSIGNED NOT NULL,
  `role_id` int(10) UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `username` varchar(100) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `photo` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL,
  `deleted_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `role_id`, `name`, `username`, `email`, `password`, `photo`, `is_active`, `created_at`, `updated_at`, `deleted_at`) VALUES
(1, 4, 'Administrator', 'administrator', 'administrator@schoolcms.local', '$2y$12$63d9frLpEps4DL4ZtcuxVevCvBFB2UZtODpet5Xv0De/RKq5b8NpC', NULL, 1, '2026-08-17 13:23:50', '2026-08-18 19:33:20', NULL),
(2, 1, 'Super Admin', 'superadmin', 'superadmin@schoolcms.local', '$2y$12$d3Dftfo/gV4.RQjANH5SxOMP.G3Kurg7jLkgzcownDMLNU/q3k/8a', NULL, 1, '2026-08-17 17:42:46', '2026-08-18 19:32:49', NULL),
(4, 2, 'Guru 01', 'guru01', 'guru01@gmail.com', '$2y$12$NMBsO5BMzIzISw54fZSRnuapT2o0ErBoo.lM6LUi.72f3v5u1YF1S', NULL, 1, '2026-08-18 19:42:24', '2026-08-18 19:42:24', NULL),
(55, 2, 'Eko Nugroho', '19840122201041617', 'eko.nugroho@example.com', '$2y$12$GIOfYXJJAkmpQJqiGhO4gOE.t9vc5FEkNjpSzsliG0Nx7ArhEE5iC', NULL, 1, '2026-08-19 00:21:14', '2026-08-19 00:22:57', NULL),
(70, 2, 'Dedi Siregar', '198104162015041653', 'dedi.siregar@sekolah.sch.id', '$2y$12$VD9qKHBt3WDj8zSSjDf2E.6OBRbJ1AtyGEYrVrhUJtBPNUtfKMg3a', NULL, 1, '2026-08-19 00:22:00', '2026-08-19 00:22:00', NULL),
(71, 2, 'Rini Saputra', '197707032017122685', 'rini.saputra@sekolah.sch.id', '$2y$12$N2QSzlXqqL9gi8XYspLa0.9U6NZR0tdZ/FH6RFZjMUvL99To.bjPy', NULL, 1, '2026-08-19 00:22:01', '2026-08-19 00:22:01', NULL),
(72, 2, 'Siti Setiawan', '198803022018032285', 'siti.setiawan@sekolah.sch.id', '$2y$12$29Mbwc.HK.5zMjRcog99NOBzNmN7lijfWVQedW9Iou.4nvoq4/GZC', NULL, 1, '2026-08-19 00:22:01', '2026-08-19 00:22:01', NULL),
(73, 2, 'Nita Kusuma', '199209222005022068', 'nita.kusuma@sekolah.sch.id', '$2y$12$x4AEAifOp5zTWowtnfRiqOUmrxQKqNClj.eTre3ZdIKNFpuEIBfv2', NULL, 1, '2026-08-19 00:22:01', '2026-08-19 00:22:01', NULL),
(74, 2, 'Wahyu Siregar', '198403032009051346', 'wahyu.siregar@sekolah.sch.id', '$2y$12$5lmMMHO4LZkF7IE6Hh1SmO7qmbN6jDFQE2H1z1f85sS6OCTcERCUW', NULL, 1, '2026-08-19 00:22:01', '2026-08-19 00:22:01', NULL),
(75, 2, 'Sri Setiawan', '197405152011072115', 'sri.setiawan@sekolah.sch.id', '$2y$12$fX2nMHzvT8XorHKc99cA0.TFot8jsW4lyAyd5KhTsZInihkzCYSLe', NULL, 1, '2026-08-19 00:22:01', '2026-08-19 00:22:01', NULL),
(76, 2, 'Kartika Lubis', '197106082013082677', 'kartika.lubis@sekolah.sch.id', '$2y$12$xKgR3plH29dpkFOtWP4NruyGcx/aSG9q/iYxoWmGzrkKQWZ1A6J3a', NULL, 1, '2026-08-19 00:22:02', '2026-08-19 00:22:02', NULL),
(77, 2, 'Taufik Sanjaya', '199106172022041131', 'taufik.sanjaya@sekolah.sch.id', '$2y$12$F5DaTxTvW8cSMhPwgFgphe6oJHihleK0fTAGUDXbB/KycCD3HpdLK', NULL, 1, '2026-08-19 00:22:02', '2026-08-19 00:22:02', NULL),
(78, 2, 'Ratna Pratama', '197701192015122900', 'ratna.pratama@sekolah.sch.id', '$2y$12$WGVIZPmGLl05XM8qwQ0f5OSuLFRXJv6LLjiHYkJsPrUKkK9w2hDdW', NULL, 1, '2026-08-19 00:22:02', '2026-08-19 00:22:02', NULL),
(79, 2, 'Budi Saputra', '198411092009081766', 'budi.saputra@sekolah.sch.id', '$2y$12$3aouK91mbOh70FTxWpywEO8tX0XF/5HPzksVsUVGEANhiEVA3iNzq', NULL, 1, '2026-08-19 00:22:02', '2026-08-19 00:22:02', NULL),
(80, 2, 'Hendra Wahyudi', '199207042013011245', 'hendra.wahyudi@sekolah.sch.id', '$2y$12$XjoJqcaJHdyjkArrOySy7O0Gl3acRVLa1tTT3/mnG672rfQcQsqRa', NULL, 1, '2026-08-19 00:22:02', '2026-08-19 00:22:02', NULL),
(81, 2, 'Dedi Kusuma', '197104172021041108', 'dedi.kusuma@sekolah.sch.id', '$2y$12$yG5GoM.zZnxtLgtnAWCLW.vkvducVFmuSqd1CxAT/zs31E1e3M3Yu', NULL, 1, '2026-08-19 00:22:02', '2026-08-19 00:22:02', NULL),
(82, 2, 'Dedi Lubis', '198812282007051413', 'dedi.lubis@sekolah.sch.id', '$2y$12$Bkeh7NL3UvfneEwuPcImS.xRtmqkGBMNOT8joBSajHbaCNrnfki5C', NULL, 1, '2026-08-19 00:22:03', '2026-08-19 00:22:03', NULL),
(83, 2, 'Hendra Pangestu', '198211182017031816', 'hendra.pangestu@sekolah.sch.id', '$2y$12$HJ2/OwGce6zhPr5nx560WeyE0XQwN6BzZEfjqCHYnZyONa4M5Pyu2', NULL, 1, '2026-08-19 00:22:03', '2026-08-19 00:22:03', NULL),
(84, 2, 'Ahmad Kusuma', '198903162019081948', 'ahmad.kusuma@sekolah.sch.id', '$2y$12$G1G62bXBuLEsTkHXbtGPRefVHabUVMGT8suSVeuRlI9aCxAmDprs2', NULL, 1, '2026-08-19 00:22:03', '2026-08-19 00:22:03', NULL),
(85, 2, 'Siti Saputra', '197405192016082632', 'siti.saputra@sekolah.sch.id', '$2y$12$8e2OfuKmiuaKtpSat4Sym.Il7kPC/0WI/Hl.Gc7RCwn6wfbEqmZc6', NULL, 1, '2026-08-19 00:22:03', '2026-08-19 00:22:03', NULL),
(86, 2, 'Siti Nugroho', '197104012017032501', 'siti.nugroho@sekolah.sch.id', '$2y$12$g6fa/S9x5MAxkkBgg4Bfd.n5P.PcXtbyCVQB6eKXWG1QrRluSdmUW', NULL, 1, '2026-08-19 00:22:03', '2026-08-19 00:22:03', NULL),
(87, 2, 'Nita Saputra', '197403172020052942', 'nita.saputra@sekolah.sch.id', '$2y$12$sIhj36z4TFxMaSSar.JeMe.TyFGGBe.HjNnz8XI70bSPuxjSeW3Qa', NULL, 1, '2026-08-19 00:22:03', '2026-08-19 00:22:03', NULL),
(88, 6, 'Budi Testing Updated', 'budi.testing', 'budi.updated@example.com', '$2y$12$nwD7u5e/RiyWo/cMn9u70O1HW/idvIQJpcG7gZsOO6xmGN0itbDwG', NULL, 0, '2026-08-24 20:47:53', '2026-08-24 20:49:09', NULL),
(89, 5, 'Integrasi Test 696', '9614355721582076', 'integrasi.350478@test.local', '$2y$04$smXBAPATIU9ixSITYd.92eE/BmLkmKW67ffRQFve7Qc5/lAwu6zm6', NULL, 1, '2026-08-28 16:58:51', '2026-08-28 16:58:51', NULL),
(90, 5, 'Integrasi Test 355', '9273248740494135', 'integrasi.607148@test.local', '$2y$04$bRoew8Y1ocmpAPuQQ/AhWOx4ShcAvbMnWzdqano1sWgPf1a3M2lBa', NULL, 1, '2026-08-28 16:58:52', '2026-08-28 16:58:52', NULL),
(91, 5, 'Integrasi Test 270', '9554836014005567', 'integrasi.227455@test.local', '$2y$04$.G81OImw2iTIEUG9tNcm6erwmzIwxTiRed6uQ42/YXEqfU4YvO9US', NULL, 1, '2026-08-28 16:59:12', '2026-08-28 16:59:12', NULL),
(92, 5, 'Integrasi Test 320', '9181536053073977', 'integrasi.567463@test.local', '$2y$04$/7YpHmFrzLwTFkMQFlPrn.QcPDfH9klF1qUDY7BPbUbrNdoQbuvKK', NULL, 1, '2026-08-28 16:59:12', '2026-08-28 16:59:12', NULL),
(94, 5, 'Agil Febri Pradana', '1234123455', 'agilfebripradana123@gmail.com', '$2y$12$X517nCLil8l0PAZcSValL.QKQRPw07XdZNNkOPCFBaPklEHhdIs4.', NULL, 1, '2026-08-31 15:44:17', '2026-08-31 15:44:17', NULL),
(108, 5, 'Budi Santoso', '1234123456', 'budi@example.com', '$2y$12$ysg1qArM16/yAC0gmCvCq.sJa0oqoHpxhKEMeRGe4bO2pcFRsmaxm', NULL, 1, '2026-08-31 17:08:24', '2026-08-31 17:08:24', NULL),
(111, 5, 'Eka Putri', '1234123459', 'eka@example.com', '$2y$12$.UqlJPZgXscRN9EcgFdRuu0Y.0Q0/f5jHTabliLKsqI3uDoogYnxi', NULL, 1, '2026-08-31 17:51:09', '2026-08-31 17:51:09', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `violations`
--

CREATE TABLE `violations` (
  `id` int(10) UNSIGNED NOT NULL,
  `student_id` int(10) UNSIGNED NOT NULL,
  `category` enum('ringan','sedang','berat') NOT NULL DEFAULT 'ringan',
  `description` varchar(255) NOT NULL,
  `points` int(10) UNSIGNED NOT NULL DEFAULT 0,
  `violated_at` date DEFAULT NULL,
  `handled_by` int(10) UNSIGNED DEFAULT NULL,
  `created_at` datetime DEFAULT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `violations`
--

INSERT INTO `violations` (`id`, `student_id`, `category`, `description`, `points`, `violated_at`, `handled_by`, `created_at`, `updated_at`) VALUES
(101, 52, 'ringan', 'Terlambat masuk sekolah.', 5, '2026-06-01', 136, '2026-08-25 07:07:54', '2026-08-25 07:07:54'),
(102, 53, 'ringan', 'Tidak membantu PR.', 5, '2026-06-15', 136, '2026-08-25 07:07:54', '2026-08-25 07:07:54'),
(103, 54, 'sedang', 'Membolos jam pelajaran.', 20, '2026-07-02', 144, '2026-08-25 07:07:54', '2026-08-25 07:07:54'),
(104, 55, 'berat', 'Melawan guru saat ditegur.', 50, '2026-07-20', 147, '2026-08-25 07:07:54', '2026-08-25 07:07:54'),
(105, 56, 'sedang', 'Merokok di area sekolah.', 30, '2026-08-01', 144, '2026-08-25 07:07:54', '2026-08-25 07:07:54');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `academic_years`
--
ALTER TABLE `academic_years`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_academic_years_name` (`name`);

--
-- Indexes for table `achievements`
--
ALTER TABLE `achievements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `achievements_student_idx` (`student_id`);

--
-- Indexes for table `alumni`
--
ALTER TABLE `alumni`
  ADD PRIMARY KEY (`id`),
  ADD KEY `alumni_student_idx` (`student_id`);

--
-- Indexes for table `announcements`
--
ALTER TABLE `announcements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category` (`category`),
  ADD KEY `deleted_at` (`deleted_at`);

--
-- Indexes for table `assets`
--
ALTER TABLE `assets`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `assets_code_unique` (`code`),
  ADD KEY `assets_room_id_index` (`room_id`),
  ADD KEY `assets_category_index` (`category`),
  ADD KEY `assets_status_index` (`status`),
  ADD KEY `assets_condition_index` (`condition`);

--
-- Indexes for table `assignments`
--
ALTER TABLE `assignments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `assignments_class_idx` (`class_id`),
  ADD KEY `fk_as_subject` (`subject_id`),
  ADD KEY `fk_as_ay` (`academic_year_id`);

--
-- Indexes for table `attendances`
--
ALTER TABLE `attendances`
  ADD PRIMARY KEY (`id`),
  ADD KEY `class_id_date` (`class_id`,`date`),
  ADD KEY `student_id_date` (`student_id`,`date`);

--
-- Indexes for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `action` (`action`),
  ADD KEY `created_at` (`created_at`);

--
-- Indexes for table `billings`
--
ALTER TABLE `billings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_billings_uniqkey` (`uniq_key`),
  ADD KEY `billings_fee_type_idx` (`fee_type_id`),
  ADD KEY `billings_student_idx` (`student_id`),
  ADD KEY `fk_bill_ay` (`academic_year_id`),
  ADD KEY `fk_bill_semester` (`semester_id`);

--
-- Indexes for table `cache`
--
ALTER TABLE `cache`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_expiration_index` (`expiration`);

--
-- Indexes for table `cache_locks`
--
ALTER TABLE `cache_locks`
  ADD PRIMARY KEY (`key`),
  ADD KEY `cache_locks_expiration_index` (`expiration`);

--
-- Indexes for table `calendars`
--
ALTER TABLE `calendars`
  ADD PRIMARY KEY (`id`),
  ADD KEY `calendars_event_date_idx` (`event_date`),
  ADD KEY `fk_cal_ay` (`academic_year_id`);

--
-- Indexes for table `classes`
--
ALTER TABLE `classes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_classes_teacher_id` (`teacher_id`);

--
-- Indexes for table `class_students`
--
ALTER TABLE `class_students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_class_students` (`class_id`,`student_id`,`academic_year_id`),
  ADD KEY `class_students_student_id_index` (`student_id`),
  ADD KEY `fk_cs_ay` (`academic_year_id`);

--
-- Indexes for table `class_subjects`
--
ALTER TABLE `class_subjects`
  ADD PRIMARY KEY (`id`),
  ADD KEY `class_subjects_class_id_foreign` (`class_id`),
  ADD KEY `class_subjects_subject_id_foreign` (`subject_id`),
  ADD KEY `class_subjects_teacher_id_foreign` (`teacher_id`);

--
-- Indexes for table `counselings`
--
ALTER TABLE `counselings`
  ADD PRIMARY KEY (`id`),
  ADD KEY `counselings_student_idx` (`student_id`),
  ADD KEY `counselings_counselor_idx` (`counselor_id`);

--
-- Indexes for table `curriculums`
--
ALTER TABLE `curriculums`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_curriculums_name` (`name`);

--
-- Indexes for table `dispositions`
--
ALTER TABLE `dispositions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `dispositions_letter_idx` (`incoming_letter_id`);

--
-- Indexes for table `documents`
--
ALTER TABLE `documents`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_documents_number` (`document_number`);

--
-- Indexes for table `exams`
--
ALTER TABLE `exams`
  ADD PRIMARY KEY (`id`),
  ADD KEY `subject_id` (`subject_id`),
  ADD KEY `status` (`status`);

--
-- Indexes for table `exam_answers`
--
ALTER TABLE `exam_answers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `participant_id_question_id` (`participant_id`,`question_id`),
  ADD KEY `exam_answers_selected_option_id_foreign` (`selected_option_id`),
  ADD KEY `participant_id` (`participant_id`),
  ADD KEY `question_id` (`question_id`);

--
-- Indexes for table `exam_instructions`
--
ALTER TABLE `exam_instructions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `exam_participants`
--
ALTER TABLE `exam_participants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `exam_card_number` (`exam_card_number`),
  ADD UNIQUE KEY `exam_id_student_id` (`exam_id`,`student_id`),
  ADD KEY `exam_id` (`exam_id`),
  ADD KEY `student_id` (`student_id`);

--
-- Indexes for table `exam_results`
--
ALTER TABLE `exam_results`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `participant_id` (`participant_id`);

--
-- Indexes for table `exam_schedules`
--
ALTER TABLE `exam_schedules`
  ADD PRIMARY KEY (`id`),
  ADD KEY `exam_id` (`exam_id`),
  ADD KEY `room_id` (`room_id`),
  ADD KEY `session_id` (`session_id`);

--
-- Indexes for table `exam_sessions`
--
ALTER TABLE `exam_sessions`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `extracurriculums`
--
ALTER TABLE `extracurriculums`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_extracurriculums_name` (`name`),
  ADD KEY `fk_exc_teacher` (`supervisor_id`);

--
-- Indexes for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `failed_jobs_uuid_unique` (`uuid`);

--
-- Indexes for table `fee_types`
--
ALTER TABLE `fee_types`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_fee_types_name` (`name`);

--
-- Indexes for table `financial_reports`
--
ALTER TABLE `financial_reports`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_fr_user` (`generated_by`);

--
-- Indexes for table `grades`
--
ALTER TABLE `grades`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `student_id_subject_id_class_id_type_semester_academic_year` (`student_id`,`subject_id`,`class_id`,`type`,`semester`,`academic_year`),
  ADD KEY `grades_subject_id_foreign` (`subject_id`),
  ADD KEY `grades_class_id_foreign` (`class_id`);

--
-- Indexes for table `guardians`
--
ALTER TABLE `guardians`
  ADD PRIMARY KEY (`id`),
  ADD KEY `guardians_student_idx` (`student_id`);

--
-- Indexes for table `incoming_letters`
--
ALTER TABLE `incoming_letters`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_incoming_letters_number` (`letter_number`);

--
-- Indexes for table `inventories`
--
ALTER TABLE `inventories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `inventories_code_unique` (`code`),
  ADD KEY `inventories_room_id_index` (`room_id`),
  ADD KEY `inventories_category_index` (`category`),
  ADD KEY `inventories_status_index` (`status`);

--
-- Indexes for table `jobs`
--
ALTER TABLE `jobs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `jobs_queue_index` (`queue`);

--
-- Indexes for table `job_batches`
--
ALTER TABLE `job_batches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `maintenance`
--
ALTER TABLE `maintenance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `maintenance_code_unique` (`code`),
  ADD KEY `maintenance_asset_id_index` (`asset_id`),
  ADD KEY `maintenance_room_id_index` (`room_id`),
  ADD KEY `maintenance_status_index` (`status`),
  ADD KEY `maintenance_priority_index` (`priority`),
  ADD KEY `maintenance_maintenance_type_index` (`maintenance_type`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_user_idx` (`user_id`);

--
-- Indexes for table `outgoing_letters`
--
ALTER TABLE `outgoing_letters`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_outgoing_letters_number` (`letter_number`);

--
-- Indexes for table `parents`
--
ALTER TABLE `parents`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_parents_student` (`student_id`);

--
-- Indexes for table `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_payments_refkey` (`ref_key`),
  ADD KEY `payments_billing_idx` (`billing_id`),
  ADD KEY `payments_student_idx` (`student_id`),
  ADD KEY `fk_pay_user` (`received_by`);

--
-- Indexes for table `payment_transactions`
--
ALTER TABLE `payment_transactions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_ptx_code` (`transaction_code`),
  ADD KEY `fk_ptx_payment` (`payment_id`);

--
-- Indexes for table `periods`
--
ALTER TABLE `periods`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_periods_name` (`name`);

--
-- Indexes for table `permissions`
--
ALTER TABLE `permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_permissions_name` (`name`);

--
-- Indexes for table `permission_role`
--
ALTER TABLE `permission_role`
  ADD PRIMARY KEY (`permission_id`,`role_id`),
  ADD KEY `permission_role_role_id_index` (`role_id`);

--
-- Indexes for table `permission_user`
--
ALTER TABLE `permission_user`
  ADD PRIMARY KEY (`permission_id`,`user_id`),
  ADD KEY `permission_user_user_id_index` (`user_id`);

--
-- Indexes for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `personal_access_tokens_token_unique` (`token`),
  ADD KEY `personal_access_tokens_tokenable_type_tokenable_id_index` (`tokenable_type`,`tokenable_id`);

--
-- Indexes for table `question_banks`
--
ALTER TABLE `question_banks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `question_banks_instruction_id_foreign` (`instruction_id`),
  ADD KEY `subject_id` (`subject_id`);

--
-- Indexes for table `question_options`
--
ALTER TABLE `question_options`
  ADD PRIMARY KEY (`id`),
  ADD KEY `question_id` (`question_id`);

--
-- Indexes for table `registrants`
--
ALTER TABLE `registrants`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `registration_number` (`registration_number`),
  ADD KEY `idx_nik` (`nik`),
  ADD KEY `idx_nisn` (`nisn`),
  ADD KEY `idx_academic_year` (`academic_year_id`),
  ADD KEY `idx_registration_path` (`registration_path`),
  ADD KEY `idx_verification_status` (`verification_status`),
  ADD KEY `idx_selection_status` (`selection_status`),
  ADD KEY `idx_re_registration_status` (`re_registration_status`);

--
-- Indexes for table `report_cards`
--
ALTER TABLE `report_cards`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_report_cards` (`student_id`,`class_id`,`academic_year_id`,`semester_id`),
  ADD KEY `fk_rc_class` (`class_id`),
  ADD KEY `fk_rc_ay` (`academic_year_id`),
  ADD KEY `fk_rc_semester` (`semester_id`);

--
-- Indexes for table `re_registrants`
--
ALTER TABLE `re_registrants`
  ADD PRIMARY KEY (`id`),
  ADD KEY `re_registrants_registration_number_index` (`registration_number`),
  ADD KEY `re_registrants_nik_index` (`nik`),
  ADD KEY `re_registrants_nisn_index` (`nisn`),
  ADD KEY `re_registrants_academic_year_id_index` (`academic_year_id`),
  ADD KEY `re_registrants_verification_status_index` (`verification_status`),
  ADD KEY `re_registrants_selection_status_index` (`selection_status`),
  ADD KEY `re_registrants_re_registration_status_index` (`re_registration_status`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`),
  ADD UNIQUE KEY `rooms_code_unique` (`code`);

--
-- Indexes for table `schedules`
--
ALTER TABLE `schedules`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_schedules_slot` (`class_id`,`day`,`period_id`,`academic_year_id`),
  ADD KEY `schedules_teacher_idx` (`teacher_id`),
  ADD KEY `fk_sc_subject` (`subject_id`),
  ADD KEY `fk_sc_period` (`period_id`),
  ADD KEY `fk_sc_ay` (`academic_year_id`),
  ADD KEY `fk_sc_semester` (`semester_id`);

--
-- Indexes for table `scholarships`
--
ALTER TABLE `scholarships`
  ADD PRIMARY KEY (`id`),
  ADD KEY `scholarships_student_idx` (`student_id`);

--
-- Indexes for table `semesters`
--
ALTER TABLE `semesters`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_semesters_ay_name` (`academic_year_id`,`name`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_settings_key` (`key`);

--
-- Indexes for table `staff`
--
ALTER TABLE `staff`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_staff_number` (`staff_number`);

--
-- Indexes for table `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `stock_movements_inventory_id_index` (`inventory_id`),
  ADD KEY `stock_movements_type_index` (`type`);

--
-- Indexes for table `students`
--
ALTER TABLE `students`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nisn` (`nisn`),
  ADD UNIQUE KEY `nis` (`nis`),
  ADD UNIQUE KEY `students_user_id_unique` (`user_id`),
  ADD KEY `students_user_id_foreign` (`user_id`),
  ADD KEY `students_class_id_foreign` (`class_id`);

--
-- Indexes for table `student_histories`
--
ALTER TABLE `student_histories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_student_histories` (`student_id`,`academic_year_id`),
  ADD KEY `fk_sh_class` (`class_id`),
  ADD KEY `fk_sh_ay` (`academic_year_id`);

--
-- Indexes for table `student_id_cards`
--
ALTER TABLE `student_id_cards`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_sidc_student` (`student_id`),
  ADD UNIQUE KEY `uniq_sidc_card_number` (`card_number`);

--
-- Indexes for table `subjects`
--
ALTER TABLE `subjects`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- Indexes for table `teachers`
--
ALTER TABLE `teachers`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nip` (`nip`),
  ADD UNIQUE KEY `kode_guru` (`teacher_code`),
  ADD UNIQUE KEY `teacher_code` (`teacher_code`),
  ADD KEY `teachers_user_id_foreign` (`user_id`);

--
-- Indexes for table `teacher_assignments`
--
ALTER TABLE `teacher_assignments`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_teacher_assignments` (`teacher_id`,`class_id`,`subject_id`,`academic_year_id`),
  ADD KEY `ta_class_subject_idx` (`class_id`,`subject_id`),
  ADD KEY `fk_ta_subject` (`subject_id`),
  ADD KEY `fk_ta_ay` (`academic_year_id`);

--
-- Indexes for table `teacher_attendance`
--
ALTER TABLE `teacher_attendance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_teacher_attendance` (`teacher_id`,`date`);

--
-- Indexes for table `teacher_documents`
--
ALTER TABLE `teacher_documents`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tdoc_teacher_idx` (`teacher_id`);

--
-- Indexes for table `teacher_leave`
--
ALTER TABLE `teacher_leave`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tleave_teacher_idx` (`teacher_id`),
  ADD KEY `fk_tleave_approver` (`approved_by`);

--
-- Indexes for table `transfers`
--
ALTER TABLE `transfers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `transfers_student_idx` (`student_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `username` (`username`),
  ADD KEY `users_role_id_foreign` (`role_id`);

--
-- Indexes for table `violations`
--
ALTER TABLE `violations`
  ADD PRIMARY KEY (`id`),
  ADD KEY `violations_student_idx` (`student_id`),
  ADD KEY `fk_vio_teacher` (`handled_by`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `academic_years`
--
ALTER TABLE `academic_years`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `achievements`
--
ALTER TABLE `achievements`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=106;

--
-- AUTO_INCREMENT for table `alumni`
--
ALTER TABLE `alumni`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=105;

--
-- AUTO_INCREMENT for table `announcements`
--
ALTER TABLE `announcements`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=106;

--
-- AUTO_INCREMENT for table `assets`
--
ALTER TABLE `assets`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=106;

--
-- AUTO_INCREMENT for table `assignments`
--
ALTER TABLE `assignments`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=106;

--
-- AUTO_INCREMENT for table `attendances`
--
ALTER TABLE `attendances`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `audit_logs`
--
ALTER TABLE `audit_logs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=57;

--
-- AUTO_INCREMENT for table `billings`
--
ALTER TABLE `billings`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=106;

--
-- AUTO_INCREMENT for table `calendars`
--
ALTER TABLE `calendars`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=106;

--
-- AUTO_INCREMENT for table `classes`
--
ALTER TABLE `classes`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `class_students`
--
ALTER TABLE `class_students`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=107;

--
-- AUTO_INCREMENT for table `class_subjects`
--
ALTER TABLE `class_subjects`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=107;

--
-- AUTO_INCREMENT for table `counselings`
--
ALTER TABLE `counselings`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=106;

--
-- AUTO_INCREMENT for table `curriculums`
--
ALTER TABLE `curriculums`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=103;

--
-- AUTO_INCREMENT for table `dispositions`
--
ALTER TABLE `dispositions`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=105;

--
-- AUTO_INCREMENT for table `documents`
--
ALTER TABLE `documents`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=106;

--
-- AUTO_INCREMENT for table `exams`
--
ALTER TABLE `exams`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=106;

--
-- AUTO_INCREMENT for table `exam_answers`
--
ALTER TABLE `exam_answers`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=111;

--
-- AUTO_INCREMENT for table `exam_instructions`
--
ALTER TABLE `exam_instructions`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=106;

--
-- AUTO_INCREMENT for table `exam_participants`
--
ALTER TABLE `exam_participants`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=106;

--
-- AUTO_INCREMENT for table `exam_results`
--
ALTER TABLE `exam_results`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=106;

--
-- AUTO_INCREMENT for table `exam_schedules`
--
ALTER TABLE `exam_schedules`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=106;

--
-- AUTO_INCREMENT for table `exam_sessions`
--
ALTER TABLE `exam_sessions`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=106;

--
-- AUTO_INCREMENT for table `extracurriculums`
--
ALTER TABLE `extracurriculums`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=106;

--
-- AUTO_INCREMENT for table `failed_jobs`
--
ALTER TABLE `failed_jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `fee_types`
--
ALTER TABLE `fee_types`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=106;

--
-- AUTO_INCREMENT for table `financial_reports`
--
ALTER TABLE `financial_reports`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=104;

--
-- AUTO_INCREMENT for table `grades`
--
ALTER TABLE `grades`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=107;

--
-- AUTO_INCREMENT for table `guardians`
--
ALTER TABLE `guardians`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=112;

--
-- AUTO_INCREMENT for table `incoming_letters`
--
ALTER TABLE `incoming_letters`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=106;

--
-- AUTO_INCREMENT for table `inventories`
--
ALTER TABLE `inventories`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `jobs`
--
ALTER TABLE `jobs`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `maintenance`
--
ALTER TABLE `maintenance`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=106;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=42;

--
-- AUTO_INCREMENT for table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=106;

--
-- AUTO_INCREMENT for table `outgoing_letters`
--
ALTER TABLE `outgoing_letters`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=106;

--
-- AUTO_INCREMENT for table `parents`
--
ALTER TABLE `parents`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=116;

--
-- AUTO_INCREMENT for table `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=104;

--
-- AUTO_INCREMENT for table `payment_transactions`
--
ALTER TABLE `payment_transactions`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=105;

--
-- AUTO_INCREMENT for table `periods`
--
ALTER TABLE `periods`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=109;

--
-- AUTO_INCREMENT for table `permissions`
--
ALTER TABLE `permissions`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `personal_access_tokens`
--
ALTER TABLE `personal_access_tokens`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=115;

--
-- AUTO_INCREMENT for table `question_banks`
--
ALTER TABLE `question_banks`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=106;

--
-- AUTO_INCREMENT for table `question_options`
--
ALTER TABLE `question_options`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=217;

--
-- AUTO_INCREMENT for table `registrants`
--
ALTER TABLE `registrants`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `report_cards`
--
ALTER TABLE `report_cards`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=106;

--
-- AUTO_INCREMENT for table `re_registrants`
--
ALTER TABLE `re_registrants`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `rooms`
--
ALTER TABLE `rooms`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `schedules`
--
ALTER TABLE `schedules`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=106;

--
-- AUTO_INCREMENT for table `scholarships`
--
ALTER TABLE `scholarships`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=106;

--
-- AUTO_INCREMENT for table `semesters`
--
ALTER TABLE `semesters`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=106;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `staff`
--
ALTER TABLE `staff`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=106;

--
-- AUTO_INCREMENT for table `stock_movements`
--
ALTER TABLE `stock_movements`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `students`
--
ALTER TABLE `students`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=124;

--
-- AUTO_INCREMENT for table `student_histories`
--
ALTER TABLE `student_histories`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=107;

--
-- AUTO_INCREMENT for table `student_id_cards`
--
ALTER TABLE `student_id_cards`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=106;

--
-- AUTO_INCREMENT for table `subjects`
--
ALTER TABLE `subjects`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `teachers`
--
ALTER TABLE `teachers`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=166;

--
-- AUTO_INCREMENT for table `teacher_assignments`
--
ALTER TABLE `teacher_assignments`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=107;

--
-- AUTO_INCREMENT for table `teacher_attendance`
--
ALTER TABLE `teacher_attendance`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=107;

--
-- AUTO_INCREMENT for table `teacher_documents`
--
ALTER TABLE `teacher_documents`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=106;

--
-- AUTO_INCREMENT for table `teacher_leave`
--
ALTER TABLE `teacher_leave`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=106;

--
-- AUTO_INCREMENT for table `transfers`
--
ALTER TABLE `transfers`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=106;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=112;

--
-- AUTO_INCREMENT for table `violations`
--
ALTER TABLE `violations`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=106;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `achievements`
--
ALTER TABLE `achievements`
  ADD CONSTRAINT `fk_ach_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `alumni`
--
ALTER TABLE `alumni`
  ADD CONSTRAINT `fk_alumni_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `assets`
--
ALTER TABLE `assets`
  ADD CONSTRAINT `assets_room_id_foreign` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `assignments`
--
ALTER TABLE `assignments`
  ADD CONSTRAINT `fk_as_ay` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_as_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_as_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `attendances`
--
ALTER TABLE `attendances`
  ADD CONSTRAINT `attendances_class_id_foreign` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `attendances_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `audit_logs`
--
ALTER TABLE `audit_logs`
  ADD CONSTRAINT `audit_logs_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE SET NULL;

--
-- Constraints for table `billings`
--
ALTER TABLE `billings`
  ADD CONSTRAINT `fk_bill_ay` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`),
  ADD CONSTRAINT `fk_bill_feetype` FOREIGN KEY (`fee_type_id`) REFERENCES `fee_types` (`id`),
  ADD CONSTRAINT `fk_bill_semester` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_bill_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`);

--
-- Constraints for table `calendars`
--
ALTER TABLE `calendars`
  ADD CONSTRAINT `fk_cal_ay` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `classes`
--
ALTER TABLE `classes`
  ADD CONSTRAINT `fk_classes_teacher_id` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `class_students`
--
ALTER TABLE `class_students`
  ADD CONSTRAINT `fk_cs_ay` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cs_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cs_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `class_subjects`
--
ALTER TABLE `class_subjects`
  ADD CONSTRAINT `class_subjects_class_id_foreign` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `class_subjects_subject_id_foreign` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `class_subjects_teacher_id_foreign` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE ON UPDATE SET NULL;

--
-- Constraints for table `counselings`
--
ALTER TABLE `counselings`
  ADD CONSTRAINT `fk_cou_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_cou_teacher` FOREIGN KEY (`counselor_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `dispositions`
--
ALTER TABLE `dispositions`
  ADD CONSTRAINT `fk_disp_letter` FOREIGN KEY (`incoming_letter_id`) REFERENCES `incoming_letters` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `exams`
--
ALTER TABLE `exams`
  ADD CONSTRAINT `exams_subject_id_foreign` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `exam_answers`
--
ALTER TABLE `exam_answers`
  ADD CONSTRAINT `exam_answers_participant_id_foreign` FOREIGN KEY (`participant_id`) REFERENCES `exam_participants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `exam_answers_question_id_foreign` FOREIGN KEY (`question_id`) REFERENCES `question_banks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `exam_answers_selected_option_id_foreign` FOREIGN KEY (`selected_option_id`) REFERENCES `question_options` (`id`) ON DELETE CASCADE ON UPDATE SET NULL;

--
-- Constraints for table `exam_participants`
--
ALTER TABLE `exam_participants`
  ADD CONSTRAINT `exam_participants_exam_id_foreign` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `exam_participants_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `exam_results`
--
ALTER TABLE `exam_results`
  ADD CONSTRAINT `exam_results_participant_id_foreign` FOREIGN KEY (`participant_id`) REFERENCES `exam_participants` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `exam_schedules`
--
ALTER TABLE `exam_schedules`
  ADD CONSTRAINT `exam_schedules_exam_id_foreign` FOREIGN KEY (`exam_id`) REFERENCES `exams` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `exam_schedules_room_id_foreign` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `exam_schedules_session_id_foreign` FOREIGN KEY (`session_id`) REFERENCES `exam_sessions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `extracurriculums`
--
ALTER TABLE `extracurriculums`
  ADD CONSTRAINT `fk_exc_teacher` FOREIGN KEY (`supervisor_id`) REFERENCES `teachers` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `financial_reports`
--
ALTER TABLE `financial_reports`
  ADD CONSTRAINT `fk_fr_user` FOREIGN KEY (`generated_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `grades`
--
ALTER TABLE `grades`
  ADD CONSTRAINT `grades_class_id_foreign` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `grades_student_id_foreign` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `grades_subject_id_foreign` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `guardians`
--
ALTER TABLE `guardians`
  ADD CONSTRAINT `fk_guardians_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `inventories`
--
ALTER TABLE `inventories`
  ADD CONSTRAINT `inventories_room_id_foreign` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `maintenance`
--
ALTER TABLE `maintenance`
  ADD CONSTRAINT `maintenance_asset_id_foreign` FOREIGN KEY (`asset_id`) REFERENCES `assets` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `maintenance_room_id_foreign` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `notifications`
--
ALTER TABLE `notifications`
  ADD CONSTRAINT `fk_notif_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `parents`
--
ALTER TABLE `parents`
  ADD CONSTRAINT `fk_parents_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `fk_pay_billing` FOREIGN KEY (`billing_id`) REFERENCES `billings` (`id`),
  ADD CONSTRAINT `fk_pay_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`),
  ADD CONSTRAINT `fk_pay_user` FOREIGN KEY (`received_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Constraints for table `payment_transactions`
--
ALTER TABLE `payment_transactions`
  ADD CONSTRAINT `fk_ptx_payment` FOREIGN KEY (`payment_id`) REFERENCES `payments` (`id`);

--
-- Constraints for table `permission_role`
--
ALTER TABLE `permission_role`
  ADD CONSTRAINT `fk_permission_role_permission` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_permission_role_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `permission_user`
--
ALTER TABLE `permission_user`
  ADD CONSTRAINT `fk_permission_user_permission` FOREIGN KEY (`permission_id`) REFERENCES `permissions` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_permission_user_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `question_banks`
--
ALTER TABLE `question_banks`
  ADD CONSTRAINT `question_banks_instruction_id_foreign` FOREIGN KEY (`instruction_id`) REFERENCES `exam_instructions` (`id`) ON DELETE CASCADE ON UPDATE SET NULL,
  ADD CONSTRAINT `question_banks_subject_id_foreign` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `question_options`
--
ALTER TABLE `question_options`
  ADD CONSTRAINT `question_options_question_id_foreign` FOREIGN KEY (`question_id`) REFERENCES `question_banks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `report_cards`
--
ALTER TABLE `report_cards`
  ADD CONSTRAINT `fk_rc_ay` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_rc_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_rc_semester` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_rc_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `schedules`
--
ALTER TABLE `schedules`
  ADD CONSTRAINT `fk_sc_ay` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_sc_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_sc_period` FOREIGN KEY (`period_id`) REFERENCES `periods` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_sc_semester` FOREIGN KEY (`semester_id`) REFERENCES `semesters` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_sc_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `scholarships`
--
ALTER TABLE `scholarships`
  ADD CONSTRAINT `fk_sch_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`);

--
-- Constraints for table `semesters`
--
ALTER TABLE `semesters`
  ADD CONSTRAINT `fk_semesters_ay` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD CONSTRAINT `stock_movements_inventory_id_foreign` FOREIGN KEY (`inventory_id`) REFERENCES `inventories` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `students`
--
ALTER TABLE `students`
  ADD CONSTRAINT `students_class_id_foreign` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE ON UPDATE SET NULL,
  ADD CONSTRAINT `students_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE SET NULL;

--
-- Constraints for table `student_histories`
--
ALTER TABLE `student_histories`
  ADD CONSTRAINT `fk_sh_ay` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_sh_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_sh_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `student_id_cards`
--
ALTER TABLE `student_id_cards`
  ADD CONSTRAINT `fk_sidc_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `teachers`
--
ALTER TABLE `teachers`
  ADD CONSTRAINT `teachers_user_id_foreign` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE SET NULL;

--
-- Constraints for table `teacher_assignments`
--
ALTER TABLE `teacher_assignments`
  ADD CONSTRAINT `fk_ta_ay` FOREIGN KEY (`academic_year_id`) REFERENCES `academic_years` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ta_class` FOREIGN KEY (`class_id`) REFERENCES `classes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ta_subject` FOREIGN KEY (`subject_id`) REFERENCES `subjects` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_ta_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `teacher_attendance`
--
ALTER TABLE `teacher_attendance`
  ADD CONSTRAINT `fk_tatt_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `teacher_documents`
--
ALTER TABLE `teacher_documents`
  ADD CONSTRAINT `fk_tdoc_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `teacher_leave`
--
ALTER TABLE `teacher_leave`
  ADD CONSTRAINT `fk_tleave_approver` FOREIGN KEY (`approved_by`) REFERENCES `teachers` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_tleave_teacher` FOREIGN KEY (`teacher_id`) REFERENCES `teachers` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `transfers`
--
ALTER TABLE `transfers`
  ADD CONSTRAINT `fk_trf_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_role_id_foreign` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `violations`
--
ALTER TABLE `violations`
  ADD CONSTRAINT `fk_vio_student` FOREIGN KEY (`student_id`) REFERENCES `students` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_vio_teacher` FOREIGN KEY (`handled_by`) REFERENCES `teachers` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
