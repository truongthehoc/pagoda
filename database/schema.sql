-- ========================================================
-- THIẾT KẾ CƠ SỞ DỮ LIỆU MYSQL - CHÍNH ĐIỆN TAM BẢO
-- ========================================================

CREATE DATABASE IF NOT EXISTS pagoda_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pagoda_db;

-- 1. BẢNG TÀI KHOẢN QUẢN TRỊ VIÊN
CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  fullname VARCHAR(100) NOT NULL,
  email VARCHAR(100) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tạo tài khoản quản trị mặc định: admin / admin123
INSERT INTO admin_users (username, password, fullname, email)
VALUES ('admin', 'admin123', 'Quản Trị Viên', 'admin@pagoda.vn')
ON DUPLICATE KEY UPDATE fullname = VALUES(fullname);

-- 2. BẢNG CÀI ĐẶT HÌNH ẢNH & HIỆU ỨNG TAM BẢO
CREATE TABLE IF NOT EXISTS altar_settings (
  id INT PRIMARY KEY DEFAULT 1,
  bg_image_url TEXT NOT NULL,
  flare_x FLOAT DEFAULT 50.0,
  flare_y FLOAT DEFAULT 26.5,
  flare_opacity FLOAT DEFAULT 70.0,
  flare_size FLOAT DEFAULT 480.0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO altar_settings (id, bg_image_url, flare_x, flare_y, flare_opacity, flare_size)
VALUES (1, '/images/tam-bao-main.jpg', 50.0, 26.5, 70.0, 480.0)
ON DUPLICATE KEY UPDATE id = 1;

-- 3. BẢNG DANH SÁCH NHẠC THIỀN PHÁT LẦN LƯỢT
CREATE TABLE IF NOT EXISTS playlist_tracks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  track_id VARCHAR(64) NOT NULL UNIQUE,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'url', -- 'url' hoặc 'synth'
  url MEDIUMTEXT DEFAULT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO playlist_tracks (track_id, title, type, url, sort_order) VALUES
('track-1', 'Tiếng Trúc & Suối Nước Chốn Thiền Môn', 'url', 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_db6591201e.mp3?filename=meditation-flute-22533.mp3', 1),
('track-2', 'Nhạc Thiền An Lạc Thư Thái', 'url', 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=relaxing-meditation-10940.mp3', 2),
('track-synth', 'Sóng Âm Thiền Định & Bát Xoay Tây Tạng (Tự Nhiên)', 'synth', '', 3)
ON DUPLICATE KEY UPDATE title = VALUES(title);

-- 4. BẢNG CẤU HÌNH CHUÔNG CHÙA
CREATE TABLE IF NOT EXISTS bell_settings (
  id INT PRIMARY KEY DEFAULT 1,
  custom_url MEDIUMTEXT DEFAULT NULL,
  auto_play TINYINT(1) DEFAULT 1,
  interval_seconds INT DEFAULT 60,
  volume FLOAT DEFAULT 0.85,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO bell_settings (id, custom_url, auto_play, interval_seconds, volume)
VALUES (1, '', 1, 60, 0.85)
ON DUPLICATE KEY UPDATE id = 1;

-- 5. BẢNG NHẬT KÝ HOẠT ĐỘNG THỜI GIAN THỰC
CREATE TABLE IF NOT EXISTS analytics_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  action_type VARCHAR(30) NOT NULL, -- 'visit', 'offering', 'blessing'
  ip_address VARCHAR(45) DEFAULT NULL,
  label VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. BẢNG THỐNG KÊ TỔNG HỢP THEO NGÀY
CREATE TABLE IF NOT EXISTS analytics_daily_stats (
  stat_date DATE PRIMARY KEY,
  visits_count INT DEFAULT 0,
  offerings_count INT DEFAULT 0,
  blessings_count INT DEFAULT 0,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dữ liệu mẫu 7 ngày gần nhất để biểu đồ hiển thị trực quan
INSERT INTO analytics_daily_stats (stat_date, visits_count, offerings_count, blessings_count) VALUES
(CURDATE() - INTERVAL 6 DAY, 38, 14, 9),
(CURDATE() - INTERVAL 5 DAY, 45, 18, 12),
(CURDATE() - INTERVAL 4 DAY, 52, 21, 15),
(CURDATE() - INTERVAL 3 DAY, 60, 24, 16),
(CURDATE() - INTERVAL 2 DAY, 58, 20, 14),
(CURDATE() - INTERVAL 1 DAY, 64, 23, 15),
(CURDATE(), 72, 26, 19)
ON DUPLICATE KEY UPDATE visits_count = VALUES(visits_count);

-- Nhật ký mẫu ban đầu
INSERT INTO analytics_logs (action_type, label, created_at) VALUES
('visit', 'Khách thập phương viếng thăm Chính Điện Tam Bảo', NOW() - INTERVAL 12 MINUTE),
('offering', 'Phật tử thành kính dâng 3 nén tâm hương thơm', NOW() - INTERVAL 8 MINUTE),
('blessing', 'Phật tử rút thẻ Cầu Gia Đạo Bình An', NOW() - INTERVAL 4 MINUTE);
