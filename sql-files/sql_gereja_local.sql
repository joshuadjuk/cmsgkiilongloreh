-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Mar 29, 2026 at 01:30 AM
-- Server version: 10.11.10-MariaDB-log
-- PHP Version: 8.3.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sql_gereja_local`
--

-- --------------------------------------------------------

--
-- Table structure for table `jemaat`
--

CREATE TABLE `jemaat` (
  `id` int(11) NOT NULL,
  `no_kk` varchar(20) NOT NULL,
  `nama_lengkap` varchar(100) NOT NULL,
  `hubungan_keluarga` enum('Kepala Keluarga','Istri','Anak','Famili Lain') DEFAULT 'Kepala Keluarga',
  `tempat_lahir` varchar(50) DEFAULT NULL,
  `tanggal_lahir` date DEFAULT NULL,
  `jenis_kelamin` enum('Laki-Laki','Perempuan') DEFAULT NULL,
  `status_pernikahan` enum('Sudah Menikah','Belum Menikah','Janda','Duda') DEFAULT NULL,
  `tanggal_perkawinan` date DEFAULT NULL,
  `status_babtis` enum('Sudah Babtis','Belum Babtis') DEFAULT NULL,
  `anggota_jemaat` enum('Tetap','Simpatisan') DEFAULT 'Tetap',
  `seksi` enum('Sekolah Minggu','Remaja','Perkauan','Perkaria','Lansia','Pemuda') DEFAULT NULL,
  `alamat` text DEFAULT NULL,
  `kelompok_doa` enum('Kalvari','Efesus','Filipi','Imanuel','Galatia') DEFAULT 'Kalvari',
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `jemaat`
--

INSERT INTO `jemaat` (`id`, `no_kk`, `nama_lengkap`, `hubungan_keluarga`, `tempat_lahir`, `tanggal_lahir`, `jenis_kelamin`, `status_pernikahan`, `tanggal_perkawinan`, `status_babtis`, `anggota_jemaat`, `seksi`, `alamat`, `kelompok_doa`, `created_at`) VALUES
(13, '6502062510210001', 'Sumantri', 'Kepala Keluarga', 'Long Loreh', '1992-05-15', 'Laki-Laki', 'Sudah Menikah', '2021-07-17', 'Sudah Babtis', 'Tetap', 'Perkaria', '', 'Imanuel', '2026-03-10 11:19:44'),
(14, '6502062510210001', 'Della Okta Vinata', 'Istri', 'Setarap', '1998-10-22', 'Perempuan', 'Sudah Menikah', '2021-07-17', 'Sudah Babtis', 'Tetap', 'Perkauan', 'RT 07 no 29 Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau', 'Imanuel', '2026-03-10 11:22:03'),
(15, '6406061805090002', 'Lajan', 'Kepala Keluarga', 'MIRI MALAYSIA', '1984-03-29', 'Laki-Laki', 'Sudah Menikah', '2008-12-12', 'Sudah Babtis', 'Tetap', 'Perkaria', 'RT 7 Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau', 'Filipi', '2026-03-10 11:24:05'),
(16, '6473012208080110', 'Apui Lian', 'Kepala Keluarga', 'Long Lat', '1962-12-22', 'Laki-Laki', 'Sudah Menikah', '2001-12-19', 'Sudah Babtis', 'Tetap', 'Perkaria', 'RT 01, Desa wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara', 'Kalvari', '2026-03-10 11:29:21'),
(17, '6473012208080110', 'Ulau Jalung', 'Istri', 'Long Liyo', '1981-04-18', 'Perempuan', 'Sudah Menikah', '2001-12-19', 'Sudah Babtis', 'Tetap', 'Perkauan', 'RT 1 Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara', 'Kalvari', '2026-03-10 11:31:04'),
(18, '6473012208080110', 'Dema Ulinda', 'Anak', 'Tarakan', '2004-03-07', 'Perempuan', 'Belum Menikah', NULL, 'Belum Babtis', 'Tetap', 'Pemuda', 'RT 1 Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara', 'Kalvari', '2026-03-10 11:33:26'),
(19, '6473012208080110', 'Katan Apui', 'Anak', '', NULL, 'Laki-Laki', 'Belum Menikah', NULL, 'Sudah Babtis', 'Tetap', 'Pemuda', 'RT 1 Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara', 'Kalvari', '2026-03-10 11:34:52'),
(20, '650206110820001', 'Robert Krisfarely', 'Kepala Keluarga', 'Long Belua', '1991-12-23', 'Laki-Laki', 'Sudah Menikah', '2019-06-21', 'Sudah Babtis', 'Tetap', 'Perkaria', 'RT 01 Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara', 'Kalvari', '2026-03-10 11:37:20'),
(21, '650206110820001', 'Layang Bintang Purnama', 'Istri', 'Long Loreh', '1993-03-13', 'Perempuan', 'Sudah Menikah', '2019-06-21', 'Sudah Babtis', 'Tetap', 'Perkauan', 'RT 01 Desa Wisata Long Loreh', 'Kalvari', '2026-03-10 13:29:11'),
(22, '650206110820001', 'Lawing Kole', 'Anak', 'Long Loreh', '2019-10-02', 'Laki-Laki', 'Belum Menikah', NULL, 'Belum Babtis', 'Tetap', 'Sekolah Minggu', '', 'Kalvari', '2026-03-10 13:30:35'),
(23, '650206110820001', 'Adjang Kole', 'Anak', 'Long Loreh', '2023-02-17', 'Laki-Laki', 'Belum Menikah', NULL, 'Belum Babtis', 'Tetap', 'Sekolah Minggu', '', 'Kalvari', '2026-03-10 13:31:33'),
(24, '650262805190001', 'Francis Laing', 'Kepala Keluarga', 'Long Loreh', '1973-09-12', 'Laki-Laki', 'Sudah Menikah', '2018-11-10', 'Sudah Babtis', 'Tetap', 'Perkaria', 'RT 1 Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara', 'Kalvari', '2026-03-10 13:37:49'),
(25, '650262805190001', 'Kristina Marlinda', 'Istri', 'Tanjung Selor', '1992-12-23', 'Perempuan', 'Sudah Menikah', '2018-11-10', 'Sudah Babtis', 'Tetap', 'Perkauan', 'RT 1 Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara', 'Kalvari', '2026-03-10 13:39:32'),
(26, '6502062510210001', 'Lionel Xavier Lian', 'Anak', 'Malinau', '2022-05-27', 'Laki-Laki', 'Belum Menikah', NULL, 'Belum Babtis', 'Tetap', 'Sekolah Minggu', 'RT 07, No. 29 Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara', 'Imanuel', '2026-03-11 11:13:16'),
(27, '6502062510210001', 'Ludwig Xander', 'Anak', 'Malinau', '2023-12-16', 'Laki-Laki', 'Belum Menikah', NULL, 'Belum Babtis', 'Tetap', 'Sekolah Minggu', 'RT 07, No. 29, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara', 'Imanuel', '2026-03-11 11:14:42'),
(28, '6406061805090002', 'Saripa', 'Istri', 'Long Loreh', '1985-02-28', 'Perempuan', 'Belum Menikah', '2008-12-12', 'Sudah Babtis', 'Tetap', 'Perkauan', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara', 'Filipi', '2026-03-11 11:23:17'),
(29, '6406061805090002', 'Rosalinda Lajan', 'Anak', 'Malinau', '2005-01-04', 'Perempuan', 'Belum Menikah', NULL, 'Sudah Babtis', 'Tetap', 'Pemuda', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara', 'Filipi', '2026-03-11 11:24:50'),
(30, '6406061805090002', 'Cosmas Wan Lajan', 'Anak', 'Malinau', '2014-08-08', 'Laki-Laki', 'Belum Menikah', NULL, 'Belum Babtis', 'Tetap', 'Sekolah Minggu', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara', 'Filipi', '2026-03-11 11:27:05'),
(31, '6406061805090002', 'Calisto Lalo Lajan', 'Anak', 'Malinau', '2017-01-01', 'Laki-Laki', 'Belum Menikah', NULL, 'Belum Babtis', 'Tetap', 'Sekolah Minggu', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara', 'Filipi', '2026-03-11 11:27:56'),
(32, '650262805190001', 'Liam Defavo', 'Anak', 'Long Loreh', NULL, 'Laki-Laki', 'Belum Menikah', NULL, 'Belum Babtis', 'Tetap', 'Sekolah Minggu', 'RT 01, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara', 'Kalvari', '2026-03-11 11:31:23'),
(33, '6502062307190001', 'Jangin Iyang', 'Kepala Keluarga', 'Long Kemuat', '1988-07-04', 'Laki-Laki', 'Sudah Menikah', '2014-11-18', 'Sudah Babtis', 'Tetap', 'Perkaria', 'RT 01, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara', 'Kalvari', '2026-03-11 11:33:16'),
(34, '6502062307190001', 'Eva Kristiani', 'Istri', 'Lokasi', '1995-11-29', 'Perempuan', 'Sudah Menikah', '2014-11-18', 'Sudah Babtis', 'Tetap', 'Perkauan', 'RT 01, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara', 'Kalvari', '2026-03-11 11:34:48'),
(35, '6502062307190001', 'Evin Risky', 'Anak', 'Nunukan', '2016-02-11', 'Laki-Laki', 'Belum Menikah', NULL, 'Belum Babtis', 'Tetap', 'Sekolah Minggu', 'RT 01, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara', 'Kalvari', '2026-03-11 11:36:56'),
(36, '6502062307190001', 'Evan Christian', 'Anak', 'Nunukan', '2019-03-01', 'Laki-Laki', 'Belum Menikah', NULL, 'Belum Babtis', 'Tetap', 'Sekolah Minggu', 'RT 01, Desa wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara', 'Kalvari', '2026-03-11 11:38:19'),
(37, '6502062307190001', 'Jeslin Veronika', 'Anak', 'Nunukan', '2024-02-12', 'Perempuan', 'Belum Menikah', NULL, 'Belum Babtis', 'Tetap', 'Sekolah Minggu', 'RT 01, Desa wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara', 'Kalvari', '2026-03-11 11:39:04'),
(38, '6502061410190001', 'Siaputra Njuk', 'Kepala Keluarga', 'Long Loreh', '1994-09-06', 'Laki-Laki', 'Sudah Menikah', '2019-08-10', 'Sudah Babtis', 'Tetap', 'Perkaria', 'RT 01, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara', 'Kalvari', '2026-03-11 11:52:06'),
(39, '6502061410190001', 'Kristin Asung', 'Istri', 'Long Loreh', '1999-01-09', 'Perempuan', 'Sudah Menikah', '2019-08-10', 'Sudah Babtis', 'Tetap', 'Perkauan', 'RT 01, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara', 'Kalvari', '2026-03-11 11:53:27'),
(40, '6502061410190001', 'Sansan Christoper Mattew', 'Anak', 'Malinau', '2019-12-20', 'Laki-Laki', 'Belum Menikah', NULL, 'Belum Babtis', 'Tetap', 'Sekolah Minggu', 'RT 01, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara', 'Kalvari', '2026-03-11 11:55:16'),
(41, '6502061410190001', 'Liam Carlito Usat', 'Anak', 'Malinau', '2021-07-15', 'Laki-Laki', 'Belum Menikah', NULL, 'Belum Babtis', 'Tetap', 'Sekolah Minggu', 'RT 01, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara', 'Kalvari', '2026-03-11 11:56:02'),
(42, '6502061410190001', 'Elenio Darien Usat', 'Anak', 'Malinau', '2024-09-20', 'Laki-Laki', 'Belum Menikah', NULL, 'Belum Babtis', 'Tetap', 'Sekolah Minggu', 'RT 01, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara', 'Kalvari', '2026-03-11 11:56:48'),
(43, '6502081810210002', 'Hengki Deskadel Ablelo', 'Kepala Keluarga', 'Tanjung Lapang', '1994-12-01', 'Laki-Laki', 'Sudah Menikah', '2021-09-11', 'Sudah Babtis', 'Tetap', 'Perkaria', 'RT 01, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinisi Kalimantan Utara', 'Kalvari', '2026-03-11 11:59:07'),
(44, '6502081810210002', 'Oktaviani Desi', 'Istri', 'Long Loreh', '1996-10-26', 'Perempuan', 'Sudah Menikah', '2021-09-11', 'Sudah Babtis', 'Tetap', 'Perkauan', 'RT 01, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara', 'Kalvari', '2026-03-11 12:01:40'),
(45, '6502081810210002', 'Zionathan Septiano Ablelo', 'Anak', 'Malinau', '2023-08-15', 'Laki-Laki', 'Belum Menikah', NULL, 'Belum Babtis', 'Tetap', 'Sekolah Minggu', 'RT 01, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Kalimantan Utara', 'Kalvari', '2026-03-11 12:03:06'),
(46, '6406061507070016', 'Maria', 'Kepala Keluarga', 'Long Lat', '1967-02-20', 'Perempuan', 'Janda', NULL, 'Sudah Babtis', 'Tetap', 'Lansia', 'RT 01, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara', 'Kalvari', '2026-03-11 12:05:48'),
(47, '6406061307070008', 'Asung Laing', 'Kepala Keluarga', 'Long alango', '1965-09-06', 'Perempuan', 'Janda', NULL, 'Sudah Babtis', 'Tetap', 'Lansia', 'RT 01, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara', 'Kalvari', '2026-03-11 13:03:41'),
(48, '6406061307070008', 'Njau', 'Anak', 'Long Loreh', '1987-08-30', 'Laki-Laki', 'Belum Menikah', NULL, 'Sudah Babtis', 'Tetap', 'Pemuda', 'RT 01, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara', 'Kalvari', '2026-03-11 13:05:42'),
(49, '6406061307070008', 'Buring', 'Anak', 'Long Loreh', '1997-01-30', 'Perempuan', 'Belum Menikah', NULL, 'Sudah Babtis', 'Tetap', 'Pemuda', 'RT 01, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara', 'Kalvari', '2026-03-11 13:06:46'),
(50, '6406061307070008', 'Ngau', 'Anak', 'Long Loreh', '2002-08-14', 'Laki-Laki', 'Belum Menikah', NULL, 'Sudah Babtis', 'Tetap', 'Pemuda', 'RT 01, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara', 'Kalvari', '2026-03-11 13:07:32'),
(51, '6406060707090001', 'Agus Welly', 'Kepala Keluarga', 'Long Loreh', '1979-08-18', 'Laki-Laki', 'Sudah Menikah', '2016-05-23', 'Sudah Babtis', 'Tetap', 'Perkaria', 'RT 01 Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara', 'Kalvari', '2026-03-11 13:12:28'),
(52, '6406060707090001', 'Lery Berin', 'Istri', 'Batu Kajang', '1988-08-25', 'Perempuan', 'Sudah Menikah', '2016-05-23', 'Sudah Babtis', 'Tetap', 'Perkauan', 'RT 01 Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara', 'Kalvari', '2026-03-11 13:14:36'),
(53, '6406060707090001', 'Effraim Marcelllino', 'Anak', 'Malinau', '2010-03-06', 'Laki-Laki', 'Belum Menikah', NULL, 'Belum Babtis', 'Tetap', 'Pemuda', 'RT 01 Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara', 'Kalvari', '2026-03-11 13:15:55'),
(54, '6406061607070000', 'Bat Jalung', 'Kepala Keluarga', 'Long Lat', '1948-04-24', 'Laki-Laki', 'Sudah Menikah', '1982-05-28', 'Sudah Babtis', 'Tetap', 'Lansia', 'RT 7, Nomor 29, Desa Wisata Long Loreh, Kecamatan Malinau, Kabupaten Malinau, Provinsi Kalimantan Timur', 'Imanuel', '2026-03-27 11:52:27'),
(55, '6406061607070000', 'Rostina Lian', 'Istri', 'Long Lat', '1959-08-20', 'Perempuan', 'Sudah Menikah', '1982-05-28', 'Sudah Babtis', 'Tetap', 'Lansia', 'RT 7, No. 29, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara', 'Imanuel', '2026-03-27 11:54:28'),
(56, '6406061607070000', 'Alvian Gunestia Gunawan', 'Famili Lain', 'Malinau', '2007-04-12', 'Perempuan', 'Belum Menikah', NULL, 'Belum Babtis', 'Tetap', 'Pemuda', 'RT 7, No. 29, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara', 'Imanuel', '2026-03-27 11:55:20'),
(57, '6406061607070000', 'Desnatalia Gunawan', 'Famili Lain', 'Malinau', '2008-12-27', 'Perempuan', 'Belum Menikah', NULL, 'Sudah Babtis', 'Tetap', 'Pemuda', 'RT 7, No. 29, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara', 'Imanuel', '2026-03-27 11:56:04'),
(58, '6406061607070000', 'Febzuan Gunawan', 'Famili Lain', 'Long Loreh', NULL, 'Laki-Laki', 'Belum Menikah', NULL, 'Sudah Babtis', 'Tetap', 'Pemuda', 'RT 7, No. 29, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara', 'Imanuel', '2026-03-27 11:56:45'),
(59, '6404070406070015', 'Aran Lian', 'Kepala Keluarga', 'Long Lat', '1952-05-28', 'Laki-Laki', 'Duda', NULL, 'Sudah Babtis', 'Tetap', 'Lansia', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara', 'Imanuel', '2026-03-27 11:59:38'),
(60, '6404070406070015', 'Mediwan Aran', 'Anak', 'Lepak Aru', NULL, 'Laki-Laki', 'Belum Menikah', NULL, 'Sudah Babtis', 'Tetap', 'Pemuda', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara', 'Imanuel', '2026-03-27 12:00:36'),
(61, '640606247070013', 'Ding Lenjau', 'Kepala Keluarga', 'Long Alango', '1967-06-09', 'Laki-Laki', 'Sudah Menikah', NULL, 'Sudah Babtis', 'Tetap', 'Perkaria', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara', 'Imanuel', '2026-03-27 12:03:47'),
(62, '640606247070013', 'Dorti Lawai', 'Istri', 'Long Lat', '1972-04-26', 'Perempuan', 'Sudah Menikah', NULL, 'Sudah Babtis', 'Tetap', 'Perkauan', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara', 'Imanuel', '2026-03-27 12:04:54'),
(63, '640606247070013', 'Marterkiu', 'Anak', 'Malinau', '2003-05-18', 'Laki-Laki', 'Belum Menikah', NULL, 'Sudah Babtis', 'Tetap', 'Pemuda', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara', 'Imanuel', '2026-03-27 12:06:36'),
(64, '6406112503140001', 'Apui Jalung', 'Kepala Keluarga', 'Apau Pinig', '1987-05-02', 'Laki-Laki', 'Sudah Menikah', NULL, 'Sudah Babtis', 'Tetap', 'Perkaria', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara', 'Imanuel', '2026-03-27 12:08:06'),
(65, '6406112503140001', 'Limbang Usat', 'Istri', 'Long Tebulo', '1987-06-04', 'Perempuan', 'Sudah Menikah', NULL, 'Sudah Babtis', 'Tetap', 'Perkauan', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara', 'Imanuel', '2026-03-27 12:09:15'),
(66, '6406112503140001', 'Christian Apui', 'Anak', 'Malinau', '2014-12-06', 'Laki-Laki', 'Belum Menikah', NULL, 'Belum Babtis', 'Tetap', 'Sekolah Minggu', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara', 'Imanuel', '2026-03-27 12:10:38'),
(67, '6406112503140001', 'Via Keyla Apui', 'Anak', 'Malinau', '2018-10-28', 'Perempuan', 'Belum Menikah', NULL, 'Belum Babtis', 'Tetap', 'Sekolah Minggu', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara', 'Imanuel', '2026-03-27 12:12:06'),
(68, '6406112503140001', 'Bai Jalung', 'Famili Lain', 'Long Lat', '1969-03-10', 'Perempuan', 'Janda', NULL, 'Sudah Babtis', 'Tetap', 'Lansia', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara', 'Imanuel', '2026-03-27 12:13:33'),
(69, '6406060804130001', 'Doni Stepanus', 'Kepala Keluarga', 'Laha Datu', '1988-06-05', 'Laki-Laki', 'Sudah Menikah', '2011-06-28', 'Sudah Babtis', 'Tetap', 'Perkaria', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara\n', 'Imanuel', '2026-03-27 12:15:00'),
(70, '6406060804130001', 'Mardini Ding', 'Istri', 'Pujungan', '1992-03-16', 'Perempuan', 'Sudah Menikah', '2011-06-28', 'Sudah Babtis', 'Tetap', 'Perkauan', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara\n', 'Imanuel', '2026-03-27 12:16:00'),
(71, '6406060804130001', 'Aurel Shinta', 'Anak', 'Malinau', '2010-04-01', 'Laki-Laki', 'Belum Menikah', NULL, 'Sudah Babtis', 'Tetap', 'Remaja', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara\n', 'Imanuel', '2026-03-27 12:16:59'),
(72, '6406060804130001', 'Keyzea Angel', 'Anak', 'Malinau', '2012-05-12', 'Perempuan', 'Belum Menikah', NULL, 'Belum Babtis', 'Tetap', 'Remaja', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara\n', 'Imanuel', '2026-03-27 12:17:49'),
(73, '6406060804130001', 'Elsa Aquaina', 'Anak', 'Malinau', '2015-12-25', 'Perempuan', 'Belum Menikah', NULL, 'Belum Babtis', 'Tetap', 'Sekolah Minggu', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara\n', 'Imanuel', '2026-03-27 12:18:55'),
(74, '6406060212100001', 'Apui Lian', 'Kepala Keluarga', 'Long Pengayan', '1971-08-07', 'Laki-Laki', 'Sudah Menikah', NULL, 'Sudah Babtis', 'Tetap', 'Perkaria', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara\n', 'Imanuel', '2026-03-27 12:23:47'),
(75, '6406060212100001', 'Martina Irang', 'Istri', 'Apau Ping', '1987-05-04', 'Perempuan', 'Sudah Menikah', NULL, 'Sudah Babtis', 'Tetap', 'Perkauan', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara\n', 'Imanuel', '2026-03-27 12:26:25'),
(76, '6406060212100001', 'Wing Apui', 'Anak', 'Malinau', '2010-12-02', 'Perempuan', 'Belum Menikah', NULL, 'Belum Babtis', 'Tetap', 'Remaja', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara\n', 'Imanuel', '2026-03-27 12:29:02'),
(77, '6406060212100001', 'Juliyus Apui', 'Anak', 'Malinau', '2017-07-25', 'Laki-Laki', 'Belum Menikah', NULL, 'Belum Babtis', 'Tetap', 'Sekolah Minggu', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara\n', 'Imanuel', '2026-03-27 12:29:56'),
(78, '650262310180001', 'Desem Suman', 'Kepala Keluarga', 'Long Lama', '1993-12-24', 'Laki-Laki', 'Sudah Menikah', NULL, 'Sudah Babtis', 'Tetap', 'Perkaria', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara\n', 'Imanuel', '2026-03-27 12:31:47'),
(79, '650262310180001', 'Stevia', 'Istri', 'Long Loreh', '1992-04-02', 'Perempuan', 'Sudah Menikah', NULL, 'Sudah Babtis', 'Tetap', 'Perkauan', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara\n', 'Imanuel', '2026-03-27 12:32:46'),
(80, '650262310180001', 'Jalung Aldo Desem', 'Anak', 'Long Lama', '2019-11-14', 'Laki-Laki', 'Belum Menikah', NULL, 'Belum Babtis', 'Tetap', 'Sekolah Minggu', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara\n', 'Imanuel', '2026-03-27 12:33:51'),
(81, '650262310180001', 'Jayden Usat', 'Anak', 'Malinau', NULL, 'Laki-Laki', 'Belum Menikah', NULL, 'Belum Babtis', 'Tetap', 'Sekolah Minggu', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara\n', 'Imanuel', '2026-03-27 12:34:28'),
(82, '650262310180001', 'Lazarus Suman', 'Famili Lain', 'Long Lama', '2003-03-24', 'Laki-Laki', 'Belum Menikah', NULL, 'Sudah Babtis', 'Tetap', 'Pemuda', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara\n', 'Imanuel', '2026-03-27 12:35:13'),
(83, '6406062307130002', 'Lawai', 'Kepala Keluarga', 'Long Lama', '1986-12-10', 'Laki-Laki', 'Sudah Menikah', NULL, 'Sudah Babtis', 'Tetap', 'Perkaria', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara\n', 'Imanuel', '2026-03-27 12:36:36'),
(84, '6406062307130002', 'Marda Gung', 'Istri', 'Long Lebusan', '1991-03-02', 'Perempuan', 'Sudah Menikah', NULL, 'Sudah Babtis', 'Tetap', 'Perkauan', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara\n', 'Imanuel', '2026-03-27 12:37:25'),
(85, '6406062307130002', 'Sinan', 'Anak', 'Malinau', '2011-10-20', 'Perempuan', 'Belum Menikah', NULL, 'Belum Babtis', 'Tetap', 'Remaja', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara\n', 'Imanuel', '2026-03-27 12:38:14'),
(86, '6406062307130002', 'Jimani', 'Anak', 'Malinau', '2014-04-18', 'Laki-Laki', 'Belum Menikah', NULL, 'Belum Babtis', 'Tetap', 'Remaja', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara\n', 'Imanuel', '2026-03-27 12:38:56'),
(87, '6406060504100001', 'Bilung Apui', 'Kepala Keluarga', 'Long Loreh', '1985-08-10', 'Laki-Laki', 'Sudah Menikah', '2009-02-07', 'Sudah Babtis', 'Tetap', 'Perkaria', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara\n', 'Imanuel', '2026-03-27 12:40:48'),
(88, '6406060504100001', 'Rita Savira', 'Istri', 'Tarakan', '1990-10-25', 'Perempuan', 'Sudah Menikah', '2009-02-07', 'Sudah Babtis', 'Tetap', 'Perkauan', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara\n', 'Imanuel', '2026-03-27 12:41:42'),
(89, '6406060504100001', 'Keysia Olivia', 'Anak', 'Malinau', '2009-10-20', 'Perempuan', 'Belum Menikah', NULL, 'Sudah Babtis', 'Tetap', 'Pemuda', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara\n', 'Imanuel', '2026-03-27 12:42:30'),
(90, '6406060504100001', 'Rio Christian', 'Anak', 'Malinau', '2017-09-21', 'Laki-Laki', 'Belum Menikah', NULL, 'Belum Babtis', 'Tetap', 'Sekolah Minggu', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara\n', 'Imanuel', '2026-03-27 12:43:34'),
(91, '6406060504100001', 'Andrew Dean Saputra', 'Anak', 'Malinau', '2021-10-01', 'Laki-Laki', 'Belum Menikah', NULL, 'Belum Babtis', 'Tetap', 'Sekolah Minggu', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara\n', 'Imanuel', '2026-03-27 12:44:51'),
(92, '6406062208080008', 'Lawai Bilung', 'Kepala Keluarga', 'Long Lat', '1950-05-20', 'Laki-Laki', 'Sudah Menikah', NULL, 'Sudah Babtis', 'Tetap', 'Lansia', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara\n', 'Imanuel', '2026-03-27 13:15:46'),
(93, '6406062208080008', 'Unjung Bilung', 'Istri', 'Long Lat', '1951-08-10', 'Perempuan', 'Sudah Menikah', NULL, 'Sudah Babtis', 'Tetap', 'Lansia', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara\n', 'Imanuel', '2026-03-27 13:16:56'),
(94, '6502060712183006', 'Bilung Lian', 'Kepala Keluarga', 'Apau Ping', '1993-12-27', 'Laki-Laki', 'Sudah Menikah', '2017-09-29', 'Sudah Babtis', 'Tetap', 'Perkaria', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara\n', 'Imanuel', '2026-03-27 13:19:03'),
(95, '6502060712183006', 'Vemi Varalena', 'Istri', 'Long Loreh', '1999-02-13', 'Perempuan', 'Sudah Menikah', '2017-09-29', 'Sudah Babtis', 'Tetap', 'Perkauan', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara\n', 'Imanuel', '2026-03-27 13:20:35'),
(96, '6502060712183006', 'Viola', 'Anak', 'Malinau', '2018-01-18', 'Perempuan', 'Sudah Menikah', NULL, 'Sudah Babtis', 'Tetap', 'Sekolah Minggu', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara', 'Imanuel', '2026-03-27 13:22:27'),
(97, '6502060712183006', 'Yerikho Imanuel', 'Anak', 'Malinau', '2020-07-27', 'Laki-Laki', 'Belum Menikah', NULL, 'Belum Babtis', 'Tetap', 'Sekolah Minggu', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara', 'Imanuel', '2026-03-27 13:23:54'),
(98, '6502060712183006', 'Florine Bilung', 'Anak', 'Malinau', '2023-09-25', 'Perempuan', 'Belum Menikah', NULL, 'Belum Babtis', 'Tetap', 'Sekolah Minggu', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara', 'Imanuel', '2026-03-27 13:24:45'),
(99, '6406062407070000', 'Daud Bilung', 'Kepala Keluarga', 'Long Liyo', '1969-07-27', 'Laki-Laki', 'Sudah Menikah', '2003-04-05', 'Sudah Babtis', 'Tetap', 'Perkaria', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara\n', 'Imanuel', '2026-03-27 13:27:29'),
(100, '6406062407070000', 'Setiati', 'Istri', 'Pa\'Padi', '1979-10-09', 'Perempuan', 'Sudah Menikah', '2003-04-05', 'Sudah Babtis', 'Tetap', 'Perkauan', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara\n', 'Imanuel', '2026-03-27 13:28:34'),
(101, '6406062407070000', 'Lerry Daud', 'Anak', 'Long Loreh', '2004-02-18', 'Laki-Laki', 'Belum Menikah', NULL, 'Sudah Babtis', 'Tetap', 'Pemuda', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara\n', 'Imanuel', '2026-03-27 13:54:52'),
(102, '6406062407070000', 'Luhat', 'Anak', 'Malinau', '2010-08-12', 'Laki-Laki', 'Belum Menikah', NULL, 'Sudah Babtis', 'Tetap', 'Pemuda', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara\n', 'Imanuel', '2026-03-27 13:55:43'),
(103, '6406061707070001', 'Matius B. Yus', 'Kepala Keluarga', 'Long Loreh', '1977-03-26', 'Laki-Laki', 'Sudah Menikah', '2006-09-23', 'Sudah Babtis', 'Tetap', 'Perkaria', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara\n', 'Imanuel', '2026-03-27 14:00:45'),
(104, '6406061707070001', 'Bendelina', 'Istri', 'Sabu', '1983-10-05', 'Perempuan', 'Sudah Menikah', '2006-09-23', 'Sudah Babtis', 'Tetap', 'Perkauan', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara\n', 'Imanuel', '2026-03-27 14:02:07'),
(105, '6406061707070001', 'Setyawan', 'Anak', 'Malinau', '2007-03-06', 'Laki-Laki', 'Belum Menikah', NULL, 'Sudah Babtis', 'Tetap', 'Pemuda', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara\n', 'Imanuel', '2026-03-27 14:04:05'),
(106, '6406061707070001', 'Setyadi', 'Anak', 'Malinau', '2008-09-25', 'Laki-Laki', 'Belum Menikah', NULL, 'Sudah Babtis', 'Tetap', 'Remaja', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara\n', 'Imanuel', '2026-03-27 14:04:53'),
(107, '6406061707070001', 'Selviani', 'Anak', 'Malinau', '2012-09-06', 'Perempuan', 'Belum Menikah', NULL, 'Belum Babtis', 'Tetap', 'Remaja', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara\n', 'Imanuel', '2026-03-27 14:06:02'),
(108, '640606265100001', 'Poltak Halasan Simanjuntak', 'Kepala Keluarga', 'Magelang', '1976-12-08', 'Laki-Laki', 'Sudah Menikah', '2006-10-28', 'Sudah Babtis', 'Tetap', 'Perkaria', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara\n', 'Imanuel', '2026-03-27 14:08:17'),
(109, '640606265100001', 'Imawati', 'Istri', 'Long Loreh', '1987-02-06', 'Perempuan', 'Sudah Menikah', '2006-10-28', 'Sudah Babtis', 'Tetap', 'Perkauan', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara\n', 'Imanuel', '2026-03-27 14:09:45'),
(110, '640606265100001', 'Daniel Aprilenzeo Simanjuntak', 'Anak', 'Malinau', '2009-04-09', 'Laki-Laki', 'Belum Menikah', NULL, 'Sudah Babtis', 'Tetap', 'Pemuda', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara\n', 'Imanuel', '2026-03-27 14:11:03'),
(111, '640606265100001', 'Yoellavaro Simanjuntak', 'Anak', 'Malinau', '2012-10-12', 'Laki-Laki', 'Belum Menikah', NULL, 'Belum Babtis', 'Tetap', 'Remaja', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara\n', 'Imanuel', '2026-03-27 14:12:11'),
(112, '640606265100001', 'Nathanael Trianda Simanjuntak ', 'Anak', 'Malinau', '2019-08-09', 'Laki-Laki', 'Belum Menikah', NULL, 'Belum Babtis', 'Tetap', 'Sekolah Minggu', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara\n', 'Imanuel', '2026-03-27 14:13:12'),
(113, '6406061805110001', 'Hendrik Purba', 'Kepala Keluarga', 'Sibolga', '1979-02-19', 'Laki-Laki', 'Sudah Menikah', '2010-10-16', 'Sudah Babtis', 'Tetap', 'Perkaria', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara\n', 'Imanuel', '2026-03-27 14:15:05'),
(114, '6406061805110001', 'karmila Wan', 'Istri', 'Long Lama', '1988-06-20', 'Perempuan', 'Sudah Menikah', '2010-10-16', 'Sudah Babtis', 'Tetap', 'Perkauan', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara\n', 'Imanuel', '2026-03-27 14:16:39'),
(115, '6406061805110001', 'David Sandi Raja Purba', 'Anak', 'Malinau', '2016-06-28', 'Laki-Laki', 'Belum Menikah', NULL, 'Belum Babtis', 'Tetap', 'Sekolah Minggu', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara\n', 'Imanuel', '2026-03-27 14:17:56'),
(116, '6406061805110001', 'William Purba', 'Anak', 'Malinau', '2018-07-03', 'Laki-Laki', 'Belum Menikah', NULL, 'Belum Babtis', 'Tetap', 'Sekolah Minggu', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara\n', 'Imanuel', '2026-03-27 14:18:48'),
(117, '6502061206230000', 'Bebi Dores', 'Kepala Keluarga', 'Apau Ping', '1990-02-26', 'Laki-Laki', 'Sudah Menikah', '2022-05-28', 'Sudah Babtis', 'Tetap', 'Perkaria', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara\n', 'Imanuel', '2026-03-27 14:23:34'),
(118, '6502061206230000', 'Ayu', 'Istri', 'Malinau', '2003-04-14', 'Perempuan', 'Sudah Menikah', '2022-05-28', 'Sudah Babtis', 'Tetap', 'Perkauan', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara\n', 'Imanuel', '2026-03-27 14:24:48'),
(119, '6502061206230000', 'Dylen Zefandri Joerly', 'Anak', 'Malinau', '2021-07-26', 'Laki-Laki', 'Belum Menikah', NULL, 'Belum Babtis', 'Tetap', 'Sekolah Minggu', 'RT 07, Desa Wisata Long Loreh, Kecamatan Malinau Selatan, Kabupaten Malinau, Provinsi Kalimantan Utara\n', 'Imanuel', '2026-03-27 14:26:02'),
(120, '6406061010120001', 'Siang Jalung', 'Kepala Keluarga', 'Long Tebulo', '1979-07-22', 'Laki-Laki', 'Sudah Menikah', '2009-10-10', 'Sudah Babtis', 'Tetap', 'Perkaria', '', 'Imanuel', '2026-03-27 14:27:25'),
(121, '6406061010120001', 'Jumida Siri', 'Istri', 'Long Lejuh', '1988-10-08', 'Perempuan', 'Sudah Menikah', '2009-10-10', 'Sudah Babtis', 'Tetap', 'Perkauan', '', 'Imanuel', '2026-03-27 14:29:14'),
(122, '6406061010120001', 'David Afrian', 'Anak', 'Malinau', '2010-04-16', 'Laki-Laki', 'Belum Menikah', NULL, 'Belum Babtis', 'Tetap', 'Remaja', '', 'Imanuel', '2026-03-27 14:30:06'),
(123, '6406061010120001', 'Deo Rafael', 'Anak', 'Malinau', '2015-11-23', 'Laki-Laki', 'Belum Menikah', NULL, 'Belum Babtis', 'Tetap', 'Sekolah Minggu', '', 'Imanuel', '2026-03-27 14:31:06'),
(124, '6406061010120001', 'Delzea Ura', 'Kepala Keluarga', 'Bulungan', '2021-01-11', 'Perempuan', 'Belum Menikah', NULL, 'Belum Babtis', 'Tetap', 'Sekolah Minggu', '', 'Imanuel', '2026-03-27 14:33:23'),
(125, '6406062407070002', 'Lerang Ungau', 'Kepala Keluarga', 'Long Liyo', '1959-03-22', 'Laki-Laki', 'Sudah Menikah', NULL, 'Sudah Babtis', 'Tetap', 'Lansia', '', 'Imanuel', '2026-03-27 14:38:53'),
(126, '6406062407070002', 'Bai Lenggang', 'Istri', 'Long Pengayan', '1959-06-07', 'Perempuan', 'Sudah Menikah', NULL, 'Sudah Babtis', 'Tetap', 'Lansia', '', 'Imanuel', '2026-03-27 14:39:40'),
(127, '6406062407070002', 'Jeri Amika', 'Anak', 'Long Pengayan', '1986-01-26', 'Laki-Laki', 'Belum Menikah', NULL, 'Sudah Babtis', 'Tetap', 'Pemuda', '', 'Imanuel', '2026-03-27 14:40:25'),
(128, '6406062407070002', 'Petrus', 'Anak', 'Marudi', '1988-12-10', 'Laki-Laki', 'Belum Menikah', NULL, 'Sudah Babtis', 'Tetap', 'Pemuda', '', 'Imanuel', '2026-03-27 14:41:03'),
(129, '6406062407070002', 'Natanael', 'Anak', 'Apau Ping', '1997-01-06', 'Laki-Laki', 'Belum Menikah', NULL, 'Sudah Babtis', 'Tetap', 'Pemuda', '', 'Imanuel', '2026-03-27 14:41:49'),
(130, '6406062407070002', 'Parel Lerang', 'Anak', 'Apau Ping', '2001-04-28', 'Laki-Laki', 'Belum Menikah', NULL, 'Belum Babtis', 'Tetap', 'Pemuda', '', 'Imanuel', '2026-03-27 14:42:34'),
(131, '6406062407070002', 'Jonias Lerang', 'Anak', 'Jonias Lerang', '2003-06-26', 'Laki-Laki', 'Belum Menikah', NULL, 'Belum Babtis', 'Tetap', 'Pemuda', '', 'Imanuel', '2026-03-27 14:46:09'),
(132, '6406062407070033', 'Jalung Lawing', 'Kepala Keluarga', 'Long Tekula', '1972-12-24', 'Laki-Laki', 'Sudah Menikah', '2003-02-14', 'Sudah Babtis', 'Tetap', 'Perkaria', '', 'Imanuel', '2026-03-27 19:25:24'),
(133, '6406062407070033', 'Tuyan Sika', 'Istri', 'Apau Ping', '1984-06-10', 'Perempuan', 'Sudah Menikah', '2003-02-14', 'Sudah Babtis', 'Tetap', 'Perkauan', '', 'Imanuel', '2026-03-27 19:26:20'),
(134, '6406062407070033', 'Orva', 'Anak', 'Long Loreh', '2005-07-08', 'Perempuan', 'Belum Menikah', NULL, 'Sudah Babtis', 'Tetap', 'Pemuda', '', 'Imanuel', '2026-03-27 19:27:08'),
(135, '6406062407070033', 'Agustina', 'Anak', 'Long Loreh', '2008-08-19', 'Laki-Laki', 'Belum Menikah', NULL, 'Sudah Babtis', 'Tetap', 'Pemuda', '', 'Imanuel', '2026-03-27 19:27:58'),
(136, '6406062407070033', 'Yeskel', 'Anak', 'Long Loreh', '2020-03-26', 'Laki-Laki', 'Belum Menikah', NULL, 'Belum Babtis', 'Tetap', 'Sekolah Minggu', '', 'Imanuel', '2026-03-27 19:28:39'),
(137, '6502061810170001', 'Lerang Balan', 'Kepala Keluarga', 'Long Loreh', '1992-08-11', 'Laki-Laki', 'Sudah Menikah', '2017-10-06', 'Sudah Babtis', 'Tetap', 'Perkaria', '', 'Imanuel', '2026-03-27 19:30:41'),
(138, '6502061810170001', 'Agustina Balan', 'Istri', 'Long Metun', '1993-08-26', 'Laki-Laki', 'Sudah Menikah', '2017-10-06', 'Sudah Babtis', 'Tetap', 'Perkauan', '', 'Imanuel', '2026-03-27 19:31:33'),
(139, '6502061810170001', 'Ino\' Liora Meyri', 'Anak', 'Malinau', '2020-05-05', 'Perempuan', 'Belum Menikah', NULL, 'Belum Babtis', 'Tetap', 'Sekolah Minggu', '', 'Imanuel', '2026-03-27 19:32:24'),
(140, '6502061810170001', 'Lambang Caren Livana Lerang', 'Anak', 'Malinau', '2022-02-08', 'Perempuan', 'Belum Menikah', NULL, 'Belum Babtis', 'Tetap', 'Sekolah Minggu', '', 'Imanuel', '2026-03-27 19:33:22'),
(141, '6406061502080002', 'Laing Lawing', 'Kepala Keluarga', 'Long Pengayan', '1962-05-25', 'Laki-Laki', 'Sudah Menikah', '1979-06-08', 'Sudah Babtis', 'Tetap', 'Lansia', '', 'Imanuel', '2026-03-28 14:18:21'),
(142, '6406061502080002', 'Ura Lian', 'Istri', 'Long Pengayan', '1965-08-17', 'Perempuan', 'Sudah Menikah', '1979-06-08', 'Sudah Babtis', 'Tetap', 'Lansia', '', 'Imanuel', '2026-03-28 14:19:13'),
(143, '6406061502080002', 'Daniel Lawing', 'Anak', 'Apau Ping', '1985-06-13', 'Laki-Laki', 'Belum Menikah', NULL, 'Sudah Babtis', 'Tetap', 'Pemuda', '', 'Imanuel', '2026-03-28 14:20:06'),
(144, '6406061502080002', 'Elisa Lawing', 'Anak', 'Apau Ping', '1999-02-17', 'Laki-Laki', 'Belum Menikah', NULL, 'Sudah Babtis', 'Tetap', 'Pemuda', '', 'Imanuel', '2026-03-28 14:20:47'),
(145, '6406062208080006', 'Daniel Lenjau', 'Kepala Keluarga', 'Long Pengayan', '1970-07-21', 'Laki-Laki', 'Sudah Menikah', '1994-06-20', 'Sudah Babtis', 'Tetap', 'Perkaria', '', 'Imanuel', '2026-03-28 14:27:46'),
(146, '6406062208080006', 'Dim Kiring', 'Istri', 'Long Aking', '1975-12-13', 'Perempuan', 'Sudah Menikah', '1994-06-20', 'Sudah Babtis', 'Tetap', 'Perkauan', '', 'Imanuel', '2026-03-28 14:28:28'),
(147, '6406062208080006', 'Ariati Daniel', 'Anak', 'Apau Ping', '1996-10-04', 'Perempuan', 'Belum Menikah', NULL, 'Sudah Babtis', 'Tetap', 'Pemuda', '', 'Imanuel', '2026-03-28 14:29:07'),
(148, '6406062208080006', 'Andarias Daniel', 'Anak', 'Apau Ping', '2000-11-02', 'Laki-Laki', 'Belum Menikah', NULL, 'Sudah Babtis', 'Tetap', 'Pemuda', '', 'Imanuel', '2026-03-28 14:29:41'),
(149, '6406062208080006', 'Andiprin Daniel', 'Anak', 'Malinau', '2003-08-28', 'Laki-Laki', 'Belum Menikah', NULL, 'Sudah Babtis', 'Tetap', 'Pemuda', '', 'Imanuel', '2026-03-28 14:30:20'),
(150, '6406062208080006', 'Andrison Daniel', 'Anak', 'Malinau', '2006-10-01', 'Laki-Laki', 'Belum Menikah', NULL, 'Sudah Babtis', 'Tetap', 'Pemuda', '', 'Imanuel', '2026-03-28 14:31:04'),
(151, '6406062407070015', 'Merang Apui', 'Kepala Keluarga', 'Long Pengayan', '1972-06-26', 'Laki-Laki', 'Sudah Menikah', NULL, 'Sudah Babtis', 'Tetap', 'Perkaria', '', 'Imanuel', '2026-03-28 14:33:55'),
(152, '6406062407070015', 'Suling Jalung', 'Istri', 'Long Pengayan', '1979-05-02', 'Perempuan', 'Sudah Menikah', NULL, 'Sudah Babtis', 'Tetap', 'Perkauan', '', 'Imanuel', '2026-03-28 14:34:36'),
(153, '6406062407070015', 'Oktomersuli', 'Anak', 'Apau Ping', '1999-10-08', 'Laki-Laki', 'Belum Menikah', NULL, 'Sudah Babtis', 'Tetap', 'Pemuda', '', 'Imanuel', '2026-03-28 14:35:35'),
(154, '6406062407070015', 'Kule Merang', 'Anak', 'Apau Ping', '1997-05-02', 'Laki-Laki', 'Belum Menikah', NULL, 'Sudah Babtis', 'Tetap', 'Pemuda', '', 'Imanuel', '2026-03-28 14:36:07'),
(155, '6406062407070015', 'Sigau Merang', 'Anak', 'Malinau', '2011-09-16', 'Laki-Laki', 'Belum Menikah', NULL, 'Belum Babtis', 'Tetap', 'Remaja', '', 'Imanuel', '2026-03-28 14:36:51'),
(156, '6406060808080002', 'Bilung Liran', 'Kepala Keluarga', 'Long Lat', '1952-07-01', 'Laki-Laki', 'Sudah Menikah', NULL, 'Sudah Babtis', 'Tetap', 'Lansia', '', 'Imanuel', '2026-03-28 14:39:58'),
(157, '6406060808080002', 'Embang Njuk', 'Istri', 'Long Lat', '1958-07-01', 'Perempuan', 'Sudah Menikah', NULL, 'Sudah Babtis', 'Tetap', 'Lansia', '', 'Imanuel', '2026-03-28 14:40:35'),
(158, '6406062406080001', 'Wan Lian', 'Kepala Keluarga', 'Long Pengayan', '1960-07-01', 'Laki-Laki', 'Sudah Menikah', '1984-05-05', 'Sudah Babtis', 'Tetap', 'Lansia', '', 'Imanuel', '2026-03-28 14:41:46'),
(159, '6406062406080001', 'Ben Apui', 'Istri', 'Long Pengayan', '1967-06-10', 'Perempuan', 'Sudah Menikah', '1984-05-05', 'Sudah Babtis', 'Tetap', 'Lansia', '', 'Imanuel', '2026-03-28 14:42:28'),
(160, '6406062406080001', 'Novin Wan', 'Anak', 'Apau Ping', '1995-11-24', 'Laki-Laki', 'Belum Menikah', NULL, 'Belum Babtis', 'Tetap', 'Pemuda', '', 'Imanuel', '2026-03-28 14:43:16'),
(161, '6406062406080001', 'Septiana', 'Anak', 'Apau Ping', '2002-09-02', 'Perempuan', 'Belum Menikah', NULL, 'Sudah Babtis', 'Tetap', 'Pemuda', '', 'Imanuel', '2026-03-28 14:43:59');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `nama_lengkap` varchar(100) NOT NULL,
  `role` enum('admin','bendahara','sekretaris') NOT NULL DEFAULT 'sekretaris',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `nama_lengkap`, `role`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'sekretaris', '$2y$10$Ouec6fGDjK.mcOQJqxNC5uI.u0hU.z4MFeTjwU/mu1DBpa0Q4lSYO', 'Sekretaris GKII Longloreh', 'sekretaris', 1, '2026-03-28 17:27:15', '2026-03-28 17:27:15'),
(2, 'admin', '$2y$10$Ouec6fGDjK.mcOQJqxNC5uI.u0hU.z4MFeTjwU/mu1DBpa0Q4lSYO', 'Admin GKII Longloreh', 'admin', 1, '2026-03-28 17:27:15', '2026-03-28 17:27:15'),
(3, 'bendahara', '$2y$10$Ouec6fGDjK.mcOQJqxNC5uI.u0hU.z4MFeTjwU/mu1DBpa0Q4lSYO', 'Bendahara GKII Longloreh', 'bendahara', 1, '2026-03-28 17:27:15', '2026-03-28 17:27:15');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `jemaat`
--
ALTER TABLE `jemaat`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `jemaat`
--
ALTER TABLE `jemaat`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=162;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
