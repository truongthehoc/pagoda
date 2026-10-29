/**
 * Script dọn dẹp dữ liệu mẫu / test của hệ thống Chùa Pagoda
 * Đưa toàn bộ Tâm nguyện Phật tử và Thống kê truy cập về 0 để chạy chính thức
 *
 * Chạy lệnh: node clean-data.js hoặc npm run clean-data
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('\n🧹 BẮT ĐẦU DỌN DẸP DỮ LIỆU MẪU ĐỂ CHUẨN BỊ CHẠY DỮ LIỆU THẬT...\n');

// 1. Dọn dẹp tệp public/local_data.json và dist/local_data.json
const publicDataPath = path.join(__dirname, 'public', 'local_data.json');
const distDataPath = path.join(__dirname, 'dist', 'local_data.json');

function cleanLocalJson(filePath) {
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(content);

      // Đặt lại danh sách tâm nguyện rỗng
      data.wishes = [];

      // Đặt lại danh sách nhạc thiền rỗng
      data.tracks = [];

      // Đặt lại số liệu thống kê về 0
      data.analytics = {
        totalVisits: 0,
        todayVisits: 0,
        totalOfferings: 0,
        totalBlessings: 0
      };

      data.stats = {
        totalVisits: 0,
        todayVisits: 0,
        totalOfferings: 0,
        todayOfferings: 0,
        totalBlessings: 0,
        todayBlessings: 0,
        history: [],
        recentLogs: []
      };

      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
      console.log(`✅ Đã reset dữ liệu tệp: ${path.relative(__dirname, filePath)}`);
    } catch (err) {
      console.warn(`⚠️ Lỗi khi cập nhật tệp ${filePath}:`, err.message);
    }
  }
}

cleanLocalJson(publicDataPath);
cleanLocalJson(distDataPath);

// 2. Dọn dẹp tệp nhạc test không sử dụng trong uploads (nếu có)
const testFilesToRemove = [
  path.join(__dirname, 'public', 'uploads', '1793179987563-602016617.mp3'),
  path.join(__dirname, 'dist', 'uploads', '1793179987563-602016617.mp3')
];

testFilesToRemove.forEach(f => {
  if (fs.existsSync(f)) {
    try {
      fs.unlinkSync(f);
      console.log(`🗑️ Đã xóa tệp test: ${path.basename(f)}`);
    } catch (_) {}
  }
});

// 3. Kết nối MySQL Database và TRUNCATE các bảng dữ liệu mẫu
const dbConfig = {
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
  database: process.env.DB_NAME || 'pagoda_db',
  charset: 'utf8mb4'
};

async function cleanMySql() {
  let conn = null;
  try {
    conn = await mysql.createConnection(dbConfig);
    console.log('✅ Đã kết nối MySQL Database thành công. Bắt đầu xóa bảng...');

    await conn.query('SET FOREIGN_KEY_CHECKS = 0');

    // Xóa tâm nguyện mẫu
    try {
      await conn.query('TRUNCATE TABLE prayers_wishes');
      console.log('✅ Đã dọn sạch bảng: prayers_wishes (Tâm nguyện Phật tử)');
    } catch (e) {
      await conn.query('DELETE FROM prayers_wishes');
      console.log('✅ Đã xóa toàn bộ bản ghi trong: prayers_wishes');
    }

    // Xóa nhạc thiền mẫu (để chuẩn bị chạy dữ liệu thật)
    try {
      await conn.query('TRUNCATE TABLE playlist_tracks');
      console.log('✅ Đã dọn sạch bảng: playlist_tracks (Danh sách nhạc thiền)');
    } catch (e) {
      try {
        await conn.query('DELETE FROM playlist_tracks');
        console.log('✅ Đã xóa toàn bộ bản ghi trong: playlist_tracks');
      } catch (_) {}
    }

    // Xóa nhật ký hoạt động mẫu
    try {
      await conn.query('TRUNCATE TABLE analytics_logs');
      console.log('✅ Đã dọn sạch bảng: analytics_logs (Nhật ký tương tác)');
    } catch (e) {
      await conn.query('DELETE FROM analytics_logs');
      console.log('✅ Đã xóa toàn bộ bản ghi trong: analytics_logs');
    }

    // Xóa số liệu thống kê ngày mẫu
    try {
      await conn.query('TRUNCATE TABLE analytics_daily_stats');
      console.log('✅ Đã dọn sạch bảng: analytics_daily_stats (Thống kê theo ngày)');
    } catch (e) {
      await conn.query('DELETE FROM analytics_daily_stats');
      console.log('✅ Đã xóa toàn bộ bản ghi trong: analytics_daily_stats');
    }

    await conn.query('SET FOREIGN_KEY_CHECKS = 1');
  } catch (err) {
    console.log(`ℹ️ Không thể kết nối MySQL (${err.message}). Nếu bạn đang ở môi trường local hoặc VPS chưa mở MySQL, hãy chạy file database/clean_data.sql trên phpMyAdmin hoặc MySQL CLI khi deploy.`);
  } finally {
    if (conn) await conn.end().catch(() => {});
  }
}

await cleanMySql();

console.log('\n🎉 HOÀN TẤT DỌN DẸP DỮ LIỆU! HỆ THỐNG ĐÃ SẴN SÀNG CHẠY DATA THẬT 100%.\n');
