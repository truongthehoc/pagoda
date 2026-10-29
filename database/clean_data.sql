-- ========================================================
-- SCRIPT DỌN DẸP SẠCH DỮ LIỆU MẪU ĐỂ CHẠY CHÍNH THỨC
-- Thực hiện trên MySQL Database: pagoda_db
-- ========================================================

USE pagoda_db;

SET FOREIGN_KEY_CHECKS = 0;

-- 1. Xóa toàn bộ danh sách tâm nguyện mẫu, đặt lại id tự tăng về 1
TRUNCATE TABLE prayers_wishes;

-- 2. Xóa toàn bộ nhật ký tương tác thời gian thực
TRUNCATE TABLE analytics_logs;

-- 3. Xóa toàn bộ số liệu thống kê lịch sử 7 ngày mẫu
TRUNCATE TABLE analytics_daily_stats;

SET FOREIGN_KEY_CHECKS = 1;

-- Thông báo hoàn tất
SELECT 'Đã dọn sạch toàn bộ dữ liệu mẫu thành công! Hệ thống sẵn sàng chạy dữ liệu thật.' AS thong_bao;
