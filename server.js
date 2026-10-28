// Backend API Server kết nối MySQL Database (pagoda_db)
import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Cấu hình thư mục lưu trữ file tĩnh
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
// Phục vụ các file tĩnh trong thư mục uploads (ảnh, nhạc do người dùng tải lên)
app.use('/uploads', express.static(uploadsDir));

// Cấu hình Multer lưu file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + ext;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// Kết nối MySQL Database
const pool = mysql.createPool({
  host: '127.0.0.1',
  port: 3306,
  user: 'root',
  password: '',
  database: 'pagoda_db',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Kiểm tra kết nối cơ sở dữ liệu và khởi tạo các bảng cần thiết
pool.getConnection()
  .then(async conn => {
    console.log('✅ Đã kết nối thành công tới MySQL Database (pagoda_db)!');
    try {
      await conn.query(`
        CREATE TABLE IF NOT EXISTS button_settings (
          id INT PRIMARY KEY DEFAULT 1,
          incense_title VARCHAR(255) NOT NULL DEFAULT 'THẮP NÉN HƯƠNG THƠM',
          incense_subtitle VARCHAR(255) NOT NULL DEFAULT 'Cầm 3 nén tâm hương • Cung kính vái Tam Bảo',
          card_title VARCHAR(255) NOT NULL DEFAULT 'RÚT THẺ CẦU AN',
          card_subtitle VARCHAR(255) NOT NULL DEFAULT 'Lời dạy Đức Phật • Lời nguyện bình an',
          wish_title VARCHAR(255) NOT NULL DEFAULT 'GỬI TÂM NGUYỆN',
          buttons_order VARCHAR(255) NOT NULL DEFAULT 'incense,card,wish',
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      try {
        await conn.query("ALTER TABLE button_settings ADD COLUMN wish_title VARCHAR(255) NOT NULL DEFAULT 'GỬI TÂM NGUYỆN'");
      } catch (_) {}
      try {
        await conn.query("ALTER TABLE button_settings ADD COLUMN buttons_order VARCHAR(255) NOT NULL DEFAULT 'incense,card,wish'");
      } catch (_) {}
      await conn.query(`
        INSERT INTO button_settings (id, incense_title, incense_subtitle, card_title, card_subtitle, wish_title, buttons_order)
        VALUES (1, 'THẮP NÉN HƯƠNG THƠM', 'Cầm 3 nén tâm hương • Cung kính vái Tam Bảo', 'RÚT THẺ CẦU AN', 'Lời dạy Đức Phật • Lời nguyện bình an', 'GỬI TÂM NGUYỆN', 'incense,card,wish')
        ON DUPLICATE KEY UPDATE id = 1;
      `);
      await conn.query(`
        CREATE TABLE IF NOT EXISTS prayers_wishes (
          id INT AUTO_INCREMENT PRIMARY KEY,
          author_name VARCHAR(150) DEFAULT NULL,
          author_age VARCHAR(50) DEFAULT NULL,
          author_address VARCHAR(255) DEFAULT NULL,
          content TEXT NOT NULL,
          likes_count INT DEFAULT 1,
          is_approved TINYINT(1) DEFAULT 1,
          ip_address VARCHAR(45) DEFAULT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
    } catch (tblErr) {
      console.warn('Cảnh báo khởi tạo bảng database:', tblErr.message);
    }
    conn.release();
  })
  .catch(err => {
    console.error('❌ Lỗi kết nối MySQL:', err.message);
  });

// ========================================================
// 1. API XÁC THỰC ĐĂNG NHẬP (AUTH)
// ========================================================
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [rows] = await pool.query(
      'SELECT id, username, fullname, email FROM admin_users WHERE username = ? AND password = ?',
      [username, password]
    );

    if (rows.length > 0) {
      res.json({
        success: true,
        message: 'Đăng nhập thành công',
        user: rows[0]
      });
    } else {
      res.status(401).json({
        success: false,
        message: 'Tài khoản hoặc mật khẩu không chính xác'
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================================================
// 2. API CÀI ĐẶT HÌNH ẢNH & HIỆU ỨNG TAM BẢO
// ========================================================
app.get('/api/settings/altar', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM altar_settings WHERE id = 1');
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.json({
        bg_image_url: '/images/tam-bao-main.jpg',
        flare_x: 50.0,
        flare_y: 26.5,
        flare_opacity: 70.0,
        flare_size: 480.0
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/settings/altar', async (req, res) => {
  const { bg_image_url } = req.body;
  try {
    // 1. Kiểm tra ảnh cũ: nếu là file trong /uploads/ và khác ảnh mới, xóa file cũ để tránh chiếm bộ nhớ
    const [currentRows] = await pool.query('SELECT bg_image_url FROM altar_settings WHERE id = 1');
    if (currentRows.length > 0 && currentRows[0].bg_image_url) {
      const oldUrl = currentRows[0].bg_image_url;
      if (oldUrl.startsWith('/uploads/') && oldUrl !== bg_image_url) {
        const oldFilename = path.basename(oldUrl);
        const oldFilePath = path.join(uploadsDir, oldFilename);
        if (fs.existsSync(oldFilePath)) {
          await fs.promises.unlink(oldFilePath).catch(() => {});
          console.log('🗑️ Đã xóa ảnh bàn thờ cũ trên server để giải phóng dung lượng:', oldFilename);
        }
      }
    }

    await pool.query(
      'UPDATE altar_settings SET bg_image_url = ? WHERE id = 1',
      [bg_image_url]
    );
    res.json({ success: true, bg_image_url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/settings/flare', async (req, res) => {
  const { flare_x, flare_y, flare_opacity, flare_size } = req.body;
  try {
    await pool.query(
      'UPDATE altar_settings SET flare_x = ?, flare_y = ?, flare_opacity = ?, flare_size = ? WHERE id = 1',
      [flare_x, flare_y, flare_opacity, flare_size]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================================================
// 2.1 API CẤU HÌNH VĂN BẢN & VỊ TRÍ NÚT HÀNH ĐỘNG
// ========================================================
app.get('/api/settings/buttons', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM button_settings WHERE id = 1');
    if (rows.length > 0) {
      const row = rows[0];
      const rawOrder = row.buttons_order || 'incense,card,wish';
      const buttons_order = rawOrder.split(',').map(s => s.trim()).filter(Boolean);
      res.json({
        id: row.id,
        incense_title: row.incense_title || 'THẮP NÉN HƯƠNG THƠM',
        card_title: row.card_title || 'RÚT THẺ CẦU AN',
        wish_title: row.wish_title || 'GỬI TÂM NGUYỆN',
        buttons_order: buttons_order.length > 0 ? buttons_order : ['incense', 'card', 'wish'],
        updated_at: row.updated_at
      });
    } else {
      res.json({
        incense_title: 'THẮP NÉN HƯƠNG THƠM',
        card_title: 'RÚT THẺ CẦU AN',
        wish_title: 'GỬI TÂM NGUYỆN',
        buttons_order: ['incense', 'card', 'wish']
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/settings/buttons', async (req, res) => {
  const {
    incense_title = 'THẮP NÉN HƯƠNG THƠM',
    card_title = 'RÚT THẺ CẦU AN',
    wish_title = 'GỬI TÂM NGUYỆN',
    buttons_order = ['incense', 'card', 'wish']
  } = req.body;

  const orderStr = Array.isArray(buttons_order)
    ? buttons_order.join(',')
    : String(buttons_order || 'incense,card,wish');

  try {
    await pool.query(
      `INSERT INTO button_settings (id, incense_title, card_title, wish_title, buttons_order)
       VALUES (1, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         incense_title = VALUES(incense_title),
         card_title = VALUES(card_title),
         wish_title = VALUES(wish_title),
         buttons_order = VALUES(buttons_order)`,
      [
        String(incense_title).trim() || 'THẮP NÉN HƯƠNG THƠM',
        String(card_title).trim() || 'RÚT THẺ CẦU AN',
        String(wish_title).trim() || 'GỬI TÂM NGUYỆN',
        orderStr || 'incense,card,wish'
      ]
    );

    res.json({
      success: true,
      message: 'Cập nhật cấu hình nút bấm thành công',
      data: {
        incense_title,
        card_title,
        wish_title,
        buttons_order: orderStr.split(',').map(s => s.trim()).filter(Boolean)
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Tải tệp ảnh hoặc âm thanh lên server và tự động tối ưu dung lượng (không chiếm bộ nhớ)
app.post('/api/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'Không tìm thấy file tải lên' });
  }

  const originalPath = req.file.path;
  const originalSize = req.file.size;
  const ext = path.extname(req.file.originalname).toLowerCase();
  const isImage = req.file.mimetype.startsWith('image/') || ['.png', '.jpg', '.jpeg', '.webp', '.bmp', '.tiff'].includes(ext);

  if (isImage) {
    try {
      const optimizedFilename = `${Date.now()}-${Math.round(Math.random() * 1e9)}.webp`;
      const optimizedPath = path.join(uploadsDir, optimizedFilename);

      // Tối ưu hóa ảnh với sharp:
      // - Giới hạn kích thước tối đa 1920x1080 (không upscale)
      // - Nén sang định dạng WebP chất lượng cao (quality: 82)
      await sharp(originalPath)
        .rotate()
        .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82, effort: 4 })
        .toFile(optimizedPath);

      const optimizedStats = fs.statSync(optimizedPath);
      const optimizedSize = optimizedStats.size;

      // Xóa file gốc chưa tối ưu để không tốn bộ nhớ đĩa
      if (fs.existsSync(originalPath) && originalPath !== optimizedPath) {
        await fs.promises.unlink(originalPath).catch(() => {});
      }

      const savedPercent = Math.max(0, Math.round(((originalSize - optimizedSize) / originalSize) * 100));
      console.log(`⚡ [Tối ưu ảnh thành công] ${(originalSize / 1024).toFixed(1)} KB -> ${(optimizedSize / 1024).toFixed(1)} KB (tiết kiệm ${savedPercent}%)`);

      return res.json({
        success: true,
        url: '/uploads/' + optimizedFilename,
        originalSize,
        optimizedSize,
        savedPercent,
        type: 'image'
      });
    } catch (optErr) {
      console.warn('Cảnh báo nén ảnh, sử dụng file gốc:', optErr.message);
      return res.json({
        success: true,
        url: '/uploads/' + req.file.filename,
        originalSize,
        optimizedSize: originalSize,
        savedPercent: 0,
        type: 'image'
      });
    }
  }

  // Tệp âm thanh hoặc tệp khác tải lên folder trên dự án
  console.log(`🎵 [Tải tệp âm thanh] ${req.file.filename} (${(originalSize / (1024 * 1024)).toFixed(2)} MB)`);
  return res.json({
    success: true,
    url: '/uploads/' + req.file.filename,
    originalSize,
    optimizedSize: originalSize,
    savedPercent: 0,
    type: 'audio'
  });
});

// ========================================================
// 3. API QUẢN LÝ DANH SÁCH NHẠC THIỀN (PLAYLIST)
// ========================================================
app.get('/api/tracks', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM playlist_tracks ORDER BY sort_order ASC, id ASC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/tracks', async (req, res) => {
  const { title, type, url } = req.body;
  const track_id = 'track-' + Date.now();
  try {
    const [result] = await pool.query(
      'INSERT INTO playlist_tracks (track_id, title, type, url, sort_order) VALUES (?, ?, ?, ?, (SELECT IFNULL(MAX(sort_order), 0) + 1 FROM playlist_tracks AS t))',
      [track_id, title || 'Nhạc Thiền An Tịnh', type || 'url', url || '']
    );
    res.json({
      success: true,
      track: { id: result.insertId, track_id, title, type, url }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/tracks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Kiểm tra tệp vật lý lưu trong uploads để xóa giải phóng bộ nhớ ổ đĩa dự án
    const [rows] = await pool.query('SELECT url FROM playlist_tracks WHERE track_id = ? OR id = ?', [id, id]);
    if (rows.length > 0 && rows[0].url) {
      const trackUrl = rows[0].url;
      if (trackUrl.startsWith('/uploads/')) {
        const fileName = path.basename(trackUrl);
        const filePath = path.join(uploadsDir, fileName);
        if (fs.existsSync(filePath)) {
          await fs.promises.unlink(filePath).catch(() => {});
          console.log('🗑️ Đã xóa tệp nhạc khỏi thư mục uploads dự án để giải phóng bộ nhớ:', fileName);
        }
      }
    }

    // 2. Xóa dòng khỏi MySQL
    await pool.query('DELETE FROM playlist_tracks WHERE track_id = ? OR id = ?', [id, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================================================
// 4. API CÀI ĐẶT CHUÔNG CHÙA
// ========================================================
app.get('/api/bell', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM bell_settings WHERE id = 1');
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.json({
        custom_url: '',
        auto_play: 1,
        interval_seconds: 60,
        volume: 0.85
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/bell', async (req, res) => {
  const { custom_url, auto_play, interval_seconds, volume } = req.body;
  try {
    // Thu dọn tệp chuông cũ nếu có file upload
    const [rows] = await pool.query('SELECT custom_url FROM bell_settings WHERE id = 1');
    if (rows.length > 0 && rows[0].custom_url && rows[0].custom_url !== custom_url) {
      const oldUrl = rows[0].custom_url;
      if (oldUrl.startsWith('/uploads/')) {
        const oldFile = path.join(uploadsDir, path.basename(oldUrl));
        if (fs.existsSync(oldFile)) {
          await fs.promises.unlink(oldFile).catch(() => {});
          console.log('🗑️ Đã xóa tệp chuông cũ để giải phóng bộ nhớ:', path.basename(oldUrl));
        }
      }
    }

    await pool.query(
      'UPDATE bell_settings SET custom_url = ?, auto_play = ?, interval_seconds = ?, volume = ? WHERE id = 1',
      [custom_url || '', auto_play ? 1 : 0, interval_seconds || 60, volume || 0.85]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================================================
// 5. API THỐNG KÊ LƯỢT TRUY CẬP (ANALYTICS)
// ========================================================
// Ghi nhận sự kiện từ người dùng (truy cập, thắp hương, rút thẻ)
app.post('/api/analytics/event', async (req, res) => {
  const { type, label } = req.body;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  try {
    // 1. Thêm vào nhật ký chi tiết
    await pool.query(
      'INSERT INTO analytics_logs (action_type, ip_address, label) VALUES (?, ?, ?)',
      [type, ip, label || 'Hoạt động']
    );

    // 2. Cập nhật số liệu cộng dồn hôm nay
    const colName = type === 'offering' ? 'offerings_count' : (type === 'blessing' ? 'blessings_count' : 'visits_count');
    await pool.query(`
      INSERT INTO analytics_daily_stats (stat_date, ${colName})
      VALUES (CURDATE(), 1)
      ON DUPLICATE KEY UPDATE ${colName} = ${colName} + 1
    `);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lấy toàn bộ số liệu Dashboard thống kê
app.get('/api/analytics/dashboard', async (req, res) => {
  try {
    // 1. Tổng số tích lũy
    const [totals] = await pool.query(`
      SELECT 
        IFNULL(SUM(visits_count), 0) AS total_visits,
        IFNULL(SUM(offerings_count), 0) AS total_offerings,
        IFNULL(SUM(blessings_count), 0) AS total_blessings
      FROM analytics_daily_stats
    `);

    // 2. Số liệu hôm nay
    const [todayRows] = await pool.query(`
      SELECT visits_count, offerings_count, blessings_count
      FROM analytics_daily_stats
      WHERE stat_date = CURDATE()
    `);
    const todayStat = todayRows[0] || { visits_count: 0, offerings_count: 0, blessings_count: 0 };

    // 3. Biểu đồ 7 ngày gần nhất
    const [historyRows] = await pool.query(`
      SELECT 
        DATE_FORMAT(stat_date, '%d/%m') AS date,
        visits_count AS visits,
        offerings_count AS offerings,
        blessings_count AS blessings
      FROM analytics_daily_stats
      ORDER BY stat_date DESC
      LIMIT 7
    `);

    // Đảo ngược mảng để theo thứ tự từ quá khứ đến hiện tại
    const history = historyRows.reverse();

    // 4. Mười nhật ký hoạt động gần nhất
    const [logs] = await pool.query(`
      SELECT 
        id,
        action_type AS type,
        label,
        DATE_FORMAT(created_at, '%H:%i') AS time
      FROM analytics_logs
      ORDER BY id DESC
      LIMIT 10
    `);

    res.json({
      totalVisits: Number(totals[0].total_visits),
      todayVisits: Number(todayStat.visits_count),
      totalOfferings: Number(totals[0].total_offerings),
      todayOfferings: Number(todayStat.offerings_count),
      totalBlessings: Number(totals[0].total_blessings),
      todayBlessings: Number(todayStat.blessings_count),
      history,
      recentLogs: logs
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ========================================================
// 6. API TÂM NGUYỆN PHẬT TỬ (KÍNH DÂNG LÊN TAM BẢO)
// ========================================================

// Hàm ẩn danh thông tin cá nhân theo đúng phong tục tôn nghiêm
function maskVietnameseName(name) {
  if (!name || !name.trim()) return 'Phật tử ẩn danh';
  const clean = name.trim();
  const words = clean.split(/\s+/);
  const maskedWords = words.map(w => {
    if (w.length <= 1) return w;
    return w.charAt(0) + '***';
  });
  return 'Phật tử ' + maskedWords.join(' ');
}

function maskAge(age) {
  if (!age || !age.trim()) return '';
  const clean = age.trim();
  const digitsMatch = clean.match(/\d+/);
  if (digitsMatch) {
    const num = digitsMatch[0];
    if (num.length === 2) {
      return num.charAt(0) + '* tuổi';
    } else if (num.length === 4) {
      return num.slice(0, 2) + '**';
    }
    return num.charAt(0) + '* tuổi';
  }
  return clean.length > 2 ? clean.charAt(0) + '**' : clean;
}

function maskAddress(addr) {
  if (!addr || !addr.trim()) return '';
  const clean = addr.trim();
  const parts = clean.split(/,\s*/);
  const maskedParts = parts.map(part => {
    const words = part.split(/\s+/);
    if (words.length === 1) {
      return words[0].length > 1 ? words[0].charAt(0) + '***' : words[0];
    }
    return words[0] + ' ' + words.slice(1).map(w => w.charAt(0) + '***').join(' ');
  });
  return maskedParts.join(', ');
}

function formatTimeAgo(date) {
  const diffSec = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (diffSec < 60) return 'Vừa xong';
  if (diffSec < 3600) return `${Math.floor(diffSec / 60)} phút trước`;
  if (diffSec < 86400) return `${Math.floor(diffSec / 3600)} giờ trước`;
  if (diffSec < 172800) return 'Hôm qua';
  const d = new Date(date);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
}

// Lấy danh sách tâm nguyện (đã che thông tin cá nhân)
app.get('/api/wishes', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, author_name, author_age, author_address, content, likes_count, created_at 
      FROM prayers_wishes 
      WHERE is_approved = 1 
      ORDER BY id DESC 
      LIMIT 60
    `);

    const formatted = rows.map(r => ({
      id: r.id,
      display_name: maskVietnameseName(r.author_name),
      display_age: maskAge(r.author_age),
      display_address: maskAddress(r.author_address),
      content: r.content,
      likes_count: r.likes_count || 1,
      created_at: r.created_at,
      time_ago: formatTimeAgo(r.created_at)
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Gửi tâm nguyện mới kính dâng lên Tam Bảo
app.post('/api/wishes', async (req, res) => {
  const { author_name, author_age, author_address, content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Nội dung tâm nguyện không được để trống' });
  }
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';

  try {
    const [result] = await pool.query(
      'INSERT INTO prayers_wishes (author_name, author_age, author_address, content, likes_count, is_approved, ip_address) VALUES (?, ?, ?, ?, 1, 1, ?)',
      [
        author_name?.trim() || null,
        author_age?.trim() || null,
        author_address?.trim() || null,
        content.trim(),
        ip
      ]
    );

    // Ghi nhận vào nhật ký
    await pool.query(
      'INSERT INTO analytics_logs (action_type, ip_address, label) VALUES (?, ?, ?)',
      ['blessing', ip, `Phật tử kính dâng tâm nguyện: "${content.trim().slice(0, 35)}..."`]
    );

    res.json({
      success: true,
      message: 'Tâm nguyện của thí chủ đã được kính cẩn dâng lên Tam Bảo',
      id: result.insertId
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Chắp tay cầu an (thích / hoan hỷ cùng tâm nguyện)
app.post('/api/wishes/:id/like', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    await pool.query('UPDATE prayers_wishes SET likes_count = likes_count + 1 WHERE id = ?', [id]);
    const [rows] = await pool.query('SELECT likes_count FROM prayers_wishes WHERE id = ?', [id]);
    res.json({ success: true, likes_count: rows[0]?.likes_count || 1 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Lấy danh sách tâm nguyện dành cho Quản Trị Viên (Admin)
app.get('/api/admin/wishes', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT id, author_name, author_age, author_address, content, likes_count, is_approved, ip_address, created_at 
      FROM prayers_wishes 
      ORDER BY id DESC 
      LIMIT 100
    `);

    const formatted = rows.map(r => ({
      id: r.id,
      author_name: r.author_name || 'Phật tử ẩn danh',
      masked_name: maskVietnameseName(r.author_name),
      author_age: r.author_age || '',
      masked_age: maskAge(r.author_age),
      author_address: r.author_address || '',
      masked_address: maskAddress(r.author_address),
      content: r.content,
      likes_count: r.likes_count,
      is_approved: r.is_approved,
      ip_address: r.ip_address,
      created_at: r.created_at,
      time_ago: formatTimeAgo(r.created_at)
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Quản trị viên xóa tâm nguyện
app.delete('/api/admin/wishes/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    await pool.query('DELETE FROM prayers_wishes WHERE id = ?', [id]);
    res.json({ success: true, message: 'Đã xóa tâm nguyện' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Quản trị viên bật / tắt hiển thị tâm nguyện
app.patch('/api/admin/wishes/:id/toggle', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    await pool.query('UPDATE prayers_wishes SET is_approved = IF(is_approved = 1, 0, 1) WHERE id = ?', [id]);
    const [rows] = await pool.query('SELECT is_approved FROM prayers_wishes WHERE id = ?', [id]);
    res.json({ success: true, is_approved: rows[0]?.is_approved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`🚀 Backend API Server đang chạy tại http://127.0.0.1:${PORT}`);
});
