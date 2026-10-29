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

// Đọc cấu hình từ file .env nếu có
const envPath = path.join(__dirname, '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const match = trimmed.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let val = match[2].trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[key] = val;
      }
    }
  });
}

const app = express();
const PORT = parseInt(process.env.PORT || '3002', 10);

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

// Phục vụ các file tĩnh trong thư mục public (images, audio, icons...)
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));
app.use(express.static(path.join(__dirname, 'public')));

// Phục vụ frontend tĩnh đã build trong thư mục dist/ (chế độ Production)
const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
}

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

// ========================================================
// BỘ DỮ LIỆU DỰ PHÒNG TỰ ĐỘNG (FALLBACK STORE)
// Đảm bảo hệ thống hoạt động 100% mượt mà ngay cả khi MySQL chưa khởi động
// ========================================================
const fallbackDbPath = path.join(__dirname, 'public', 'local_data.json');
let fallbackDb = {
  altar: {
    id: 1,
    bg_image_url: '/images/tam-bao-main.jpg',
    bg_image_mobile_url: null,
    use_pc_for_mobile: 1,
    flare_x: 50.0,
    flare_y: 26.5,
    flare_opacity: 70.0,
    flare_size: 480.0
  },
  bell: {
    id: 1,
    custom_url: '',
    auto_play: 1,
    interval_seconds: 60,
    volume: 0.85,
    wooden_fish_url: '',
    wooden_fish_volume: 0.90
  },
  buttons: {
    id: 1,
    incense_title: 'THẮP NÉN HƯƠNG THƠM',
    card_title: 'RÚT THẺ CẦU AN',
    wish_title: 'GỬI TÂM NGUYỆN',
    buttons_order: ['incense', 'card', 'wish']
  },
  tracks: [
    {
      id: 1,
      track_id: 'track-1',
      title: 'Tiếng Trúc & Suối Nước Chốn Thiền Môn',
      type: 'url',
      url: 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_db6591201e.mp3?filename=meditation-flute-22533.mp3',
      sort_order: 1
    },
    {
      id: 2,
      track_id: 'track-2',
      title: 'Nhạc Thiền An Lạc Thư Thái',
      type: 'url',
      url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=relaxing-meditation-10940.mp3',
      sort_order: 2
    },
    {
      id: 3,
      track_id: 'track-synth',
      title: 'Sóng Âm Thiền Định & Bát Xoay Tây Tạng (Tự Nhiên)',
      type: 'synth',
      url: '',
      sort_order: 3
    }
  ],
  wishes: [
    {
      id: 1,
      author_name: 'Nguyễn Thị Hoa',
      author_age: '34 tuổi',
      author_address: 'Hà Nội',
      content: 'Nguyện cầu mười phương chư Phật từ bi gia hộ cho cha mẹ hai bên sức khỏe dồi dào, tai qua nạn khỏi, bệnh tật tiêu trừ, sống đời an lạc bên con cháu.',
      likes_count: 18,
      is_approved: 1,
      ip_address: '127.0.0.1',
      created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString()
    },
    {
      id: 2,
      author_name: 'Trần Văn Tuấn',
      author_age: '42 tuổi',
      author_address: 'Đà Nẵng',
      content: 'Cầu mong cho gia đạo êm ấm, trong ấm ngoài êm, công việc hanh thông, các con chăm ngoan học giỏi, luôn biết hướng thiện.',
      likes_count: 26,
      is_approved: 1,
      ip_address: '127.0.0.1',
      created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
    },
    {
      id: 3,
      author_name: 'Lê Hoàng Nam',
      author_age: '27 tuổi',
      author_address: 'TP. Hồ Chí Minh',
      content: 'Con xin sám hối mọi lỗi lầm vô minh trong quá khứ, nguyện cho thân tâm được an lạc, buông bỏ muộn phiền, công việc thuận buồm xuôi gió.',
      likes_count: 15,
      is_approved: 1,
      ip_address: '127.0.0.1',
      created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
    }
  ],
  stats: {
    totalVisits: 72,
    todayVisits: 28,
    totalOfferings: 31,
    todayOfferings: 14,
    totalBlessings: 24,
    todayBlessings: 11,
    history: [
      { date: '23/10', visits: 38, offerings: 14, blessings: 9 },
      { date: '24/10', visits: 45, offerings: 18, blessings: 12 },
      { date: '25/10', visits: 52, offerings: 21, blessings: 15 },
      { date: '26/10', visits: 60, offerings: 24, blessings: 16 },
      { date: '27/10', visits: 58, offerings: 20, blessings: 14 },
      { date: '28/10', visits: 64, offerings: 23, blessings: 15 },
      { date: '29/10', visits: 72, offerings: 26, blessings: 19 }
    ],
    recentLogs: [
      { id: 3, type: 'blessing', label: 'Phật tử rút thẻ Cầu Gia Đạo Bình An', time: '07:15' },
      { id: 2, type: 'offering', label: 'Phật tử thành kính dâng 3 nén tâm hương thơm', time: '07:05' },
      { id: 1, type: 'visit', label: 'Khách thập phương viếng thăm Chính Điện Tam Bảo', time: '06:50' }
    ]
  }
};

try {
  if (fs.existsSync(fallbackDbPath)) {
    const raw = fs.readFileSync(fallbackDbPath, 'utf8');
    const parsed = JSON.parse(raw);
    fallbackDb = { ...fallbackDb, ...parsed };
  }
} catch (_) {}

function saveFallbackDb() {
  try {
    fs.writeFileSync(fallbackDbPath, JSON.stringify(fallbackDb, null, 2), 'utf8');
  } catch (_) {}
}

// Kết nối MySQL Database (hỗ trợ biến môi trường trên VPS)
let isDbConnected = false;
const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD !== undefined ? process.env.DB_PASSWORD : '',
  database: process.env.DB_NAME || 'pagoda_db',
  charset: 'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Kiểm tra kết nối cơ sở dữ liệu và khởi tạo các bảng cần thiết
pool.getConnection()
  .then(async conn => {
    isDbConnected = true;
    console.log('✅ Đã kết nối thành công tới MySQL Database (pagoda_db)!');
    try {
      // Bảng altar_settings
      await conn.query(`
        CREATE TABLE IF NOT EXISTS altar_settings (
          id INT PRIMARY KEY DEFAULT 1,
          bg_image_url TEXT NOT NULL,
          bg_image_mobile_url TEXT DEFAULT NULL,
          use_pc_for_mobile TINYINT(1) DEFAULT 1,
          flare_x FLOAT DEFAULT 50.0,
          flare_y FLOAT DEFAULT 26.5,
          flare_opacity FLOAT DEFAULT 70.0,
          flare_size FLOAT DEFAULT 480.0,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      try {
        await conn.query("ALTER TABLE altar_settings ADD COLUMN bg_image_mobile_url TEXT DEFAULT NULL");
      } catch (_) {}
      try {
        await conn.query("ALTER TABLE altar_settings ADD COLUMN use_pc_for_mobile TINYINT(1) DEFAULT 1");
      } catch (_) {}
      await conn.query(`
        INSERT INTO altar_settings (id, bg_image_url, bg_image_mobile_url, use_pc_for_mobile, flare_x, flare_y, flare_opacity, flare_size)
        VALUES (1, '/images/tam-bao-main.jpg', NULL, 1, 50.0, 26.5, 70.0, 480.0)
        ON DUPLICATE KEY UPDATE id = 1;
      `);

      // Bảng bell_settings
      await conn.query(`
        CREATE TABLE IF NOT EXISTS bell_settings (
          id INT PRIMARY KEY DEFAULT 1,
          custom_url MEDIUMTEXT DEFAULT NULL,
          auto_play TINYINT(1) DEFAULT 1,
          interval_seconds INT DEFAULT 60,
          volume FLOAT DEFAULT 0.85,
          wooden_fish_url VARCHAR(500) DEFAULT '',
          wooden_fish_volume FLOAT DEFAULT 0.90,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
      `);
      try {
        await conn.query("ALTER TABLE bell_settings ADD COLUMN wooden_fish_url VARCHAR(500) DEFAULT ''");
      } catch (_) {}
      try {
        await conn.query("ALTER TABLE bell_settings ADD COLUMN wooden_fish_volume FLOAT DEFAULT 0.90");
      } catch (_) {}
      await conn.query(`
        INSERT INTO bell_settings (id, custom_url, auto_play, interval_seconds, volume, wooden_fish_url, wooden_fish_volume)
        VALUES (1, '', 1, 60, 0.85, '', 0.90)
        ON DUPLICATE KEY UPDATE id = 1;
      `);

      // Bảng button_settings
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

      // Bảng prayers_wishes
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
    isDbConnected = false;
    console.warn('⚠️ Chưa kết nối MySQL Database (sử dụng cơ chế Fallback Store dự phòng tự động):', err.message);
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

    if (rows && rows.length > 0) {
      return res.json({
        success: true,
        message: 'Đăng nhập thành công',
        user: rows[0]
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản hoặc mật khẩu không chính xác'
      });
    }
  } catch (err) {
    // Dự phòng khi MySQL chưa kết nối
    if (username === 'admin' && password === 'admin123') {
      return res.json({
        success: true,
        message: 'Đăng nhập thành công (Chế độ Quản trị Dự phòng)',
        user: { id: 1, username: 'admin', fullname: 'Quản Trị Viên', email: 'admin@pagoda.vn' }
      });
    }
    res.status(401).json({
      success: false,
      message: 'Tài khoản hoặc mật khẩu không chính xác'
    });
  }
});

// ========================================================
// 2. API CÀI ĐẶT HÌNH ẢNH & HIỆU ỨNG TAM BẢO (PC & MOBILE)
// ========================================================
app.get('/api/settings/altar', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM altar_settings WHERE id = 1');
    if (rows && rows.length > 0) {
      const row = rows[0];
      res.json({
        bg_image_url: row.bg_image_url || '/images/tam-bao-main.jpg',
        bg_image_mobile_url: row.bg_image_mobile_url || null,
        use_pc_for_mobile: row.use_pc_for_mobile !== undefined ? Boolean(row.use_pc_for_mobile) : true,
        flare_x: row.flare_x !== undefined ? row.flare_x : 50.0,
        flare_y: row.flare_y !== undefined ? row.flare_y : 26.5,
        flare_opacity: row.flare_opacity !== undefined ? row.flare_opacity : 70.0,
        flare_size: row.flare_size !== undefined ? row.flare_size : 480.0
      });
    } else {
      res.json(fallbackDb.altar);
    }
  } catch (err) {
    res.json(fallbackDb.altar);
  }
});

app.post('/api/settings/altar', async (req, res) => {
  const { bg_image_url, bg_image_mobile_url, use_pc_for_mobile } = req.body;
  try {
    let currentRows = [];
    try {
      [currentRows] = await pool.query('SELECT bg_image_url, bg_image_mobile_url, use_pc_for_mobile FROM altar_settings WHERE id = 1');
    } catch (_) {}

    const oldRow = (currentRows && currentRows[0]) || fallbackDb.altar || {};
    const oldUrl = oldRow.bg_image_url;
    const oldMobileUrl = oldRow.bg_image_mobile_url;

    // Chỉ dọn dẹp file PC cũ nếu req.body cung cấp URL PC MỚI khác với URL cũ
    if (bg_image_url !== undefined && bg_image_url !== null && oldUrl && oldUrl.startsWith('/uploads/') && oldUrl !== bg_image_url) {
      const oldFilename = path.basename(oldUrl);
      const oldFilePath = path.join(uploadsDir, oldFilename);
      if (fs.existsSync(oldFilePath)) {
        fs.promises.unlink(oldFilePath).catch(() => {});
      }
    }

    // Chỉ dọn dẹp file Mobile cũ nếu req.body cung cấp URL Mobile MỚI khác với URL cũ
    if (bg_image_mobile_url !== undefined && bg_image_mobile_url !== null && oldMobileUrl && oldMobileUrl.startsWith('/uploads/') && oldMobileUrl !== bg_image_mobile_url) {
      const oldFilename = path.basename(oldMobileUrl);
      const oldFilePath = path.join(uploadsDir, oldFilename);
      if (fs.existsSync(oldFilePath)) {
        fs.promises.unlink(oldFilePath).catch(() => {});
      }
    }

    // Giữ nguyên giá trị hiện có nếu trường tương ứng không được gửi trong req.body
    const finalBgUrl = bg_image_url !== undefined 
      ? (bg_image_url || '/images/tam-bao-main.jpg')
      : (oldUrl || fallbackDb.altar.bg_image_url || '/images/tam-bao-main.jpg');

    const finalMobileUrl = bg_image_mobile_url !== undefined 
      ? (bg_image_mobile_url || null)
      : (oldMobileUrl !== undefined ? oldMobileUrl : (fallbackDb.altar.bg_image_mobile_url || null));

    const finalUsePc = use_pc_for_mobile !== undefined 
      ? (use_pc_for_mobile === false || use_pc_for_mobile === 0 ? 0 : 1)
      : (oldRow.use_pc_for_mobile !== undefined ? (oldRow.use_pc_for_mobile ? 1 : 0) : (fallbackDb.altar.use_pc_for_mobile ? 1 : 0));

    try {
      await pool.query(
        `UPDATE altar_settings 
         SET bg_image_url = ?, 
             bg_image_mobile_url = ?, 
             use_pc_for_mobile = ? 
         WHERE id = 1`,
        [finalBgUrl, finalMobileUrl, finalUsePc]
      );
    } catch (dbErr) {
      console.warn('Cảnh báo ghi MySQL altar_settings:', dbErr.message);
    }

    fallbackDb.altar.bg_image_url = finalBgUrl;
    fallbackDb.altar.bg_image_mobile_url = finalMobileUrl;
    fallbackDb.altar.use_pc_for_mobile = finalUsePc;
    saveFallbackDb();

    res.json({
      success: true,
      bg_image_url: finalBgUrl,
      bg_image_mobile_url: finalMobileUrl,
      use_pc_for_mobile: Boolean(finalUsePc)
    });
  } catch (err) {
    if (bg_image_url !== undefined) fallbackDb.altar.bg_image_url = bg_image_url;
    if (bg_image_mobile_url !== undefined) fallbackDb.altar.bg_image_mobile_url = bg_image_mobile_url;
    if (use_pc_for_mobile !== undefined) fallbackDb.altar.use_pc_for_mobile = use_pc_for_mobile ? 1 : 0;
    saveFallbackDb();

    res.json({
      success: true,
      ...fallbackDb.altar
    });
  }
});

app.post('/api/settings/flare', async (req, res) => {
  const { flare_x, flare_y, flare_opacity, flare_size } = req.body;
  try {
    await pool.query(
      'UPDATE altar_settings SET flare_x = ?, flare_y = ?, flare_opacity = ?, flare_size = ? WHERE id = 1',
      [flare_x, flare_y, flare_opacity, flare_size]
    );
    fallbackDb.altar.flare_x = flare_x;
    fallbackDb.altar.flare_y = flare_y;
    fallbackDb.altar.flare_opacity = flare_opacity;
    fallbackDb.altar.flare_size = flare_size;
    saveFallbackDb();
    res.json({ success: true });
  } catch (err) {
    fallbackDb.altar.flare_x = flare_x;
    fallbackDb.altar.flare_y = flare_y;
    fallbackDb.altar.flare_opacity = flare_opacity;
    fallbackDb.altar.flare_size = flare_size;
    saveFallbackDb();
    res.json({ success: true });
  }
});

// ========================================================
// 2.1 API CẤU HÌNH VĂN BẢN & VỊ TRÍ NÚT HÀNH ĐỘNG
// ========================================================
app.get('/api/settings/buttons', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM button_settings WHERE id = 1');
    if (rows && rows.length > 0) {
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
      res.json(fallbackDb.buttons);
    }
  } catch (err) {
    res.json(fallbackDb.buttons);
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

    fallbackDb.buttons = {
      id: 1,
      incense_title,
      card_title,
      wish_title,
      buttons_order: orderStr.split(',').map(s => s.trim()).filter(Boolean)
    };
    saveFallbackDb();

    res.json({
      success: true,
      message: 'Cập nhật cấu hình nút bấm thành công',
      data: fallbackDb.buttons
    });
  } catch (err) {
    fallbackDb.buttons = {
      id: 1,
      incense_title,
      card_title,
      wish_title,
      buttons_order: orderStr.split(',').map(s => s.trim()).filter(Boolean)
    };
    saveFallbackDb();

    res.json({
      success: true,
      message: 'Cập nhật cấu hình nút bấm thành công (Lưu bộ nhớ)',
      data: fallbackDb.buttons
    });
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
    if (rows && rows.length > 0) {
      return res.json(rows);
    }
    return res.json(fallbackDb.tracks);
  } catch (err) {
    res.json(fallbackDb.tracks);
  }
});

app.post('/api/tracks', async (req, res) => {
  const { title, type, url } = req.body;
  const track_id = 'track-' + Date.now();
  const trackTitle = (title && title.trim()) ? title.trim() : 'Nhạc Thiền An Tịnh';
  const trackType = type || 'url';
  const trackUrl = url || '';

  try {
    // Sửa lỗi cú pháp subquery lồng nhau trong MySQL (Error 1093)
    const [orderRows] = await pool.query('SELECT IFNULL(MAX(sort_order), 0) + 1 AS next_order FROM playlist_tracks');
    const nextOrder = (orderRows && orderRows[0]?.next_order) || (fallbackDb.tracks.length + 1);

    const [result] = await pool.query(
      'INSERT INTO playlist_tracks (track_id, title, type, url, sort_order) VALUES (?, ?, ?, ?, ?)',
      [track_id, trackTitle, trackType, trackUrl, nextOrder]
    );

    const newTrack = { id: result.insertId, track_id, title: trackTitle, type: trackType, url: trackUrl, sort_order: nextOrder };
    fallbackDb.tracks.push(newTrack);
    saveFallbackDb();

    res.json({
      success: true,
      track: newTrack
    });
  } catch (err) {
    const nextOrder = fallbackDb.tracks.length + 1;
    const newTrack = {
      id: Date.now(),
      track_id,
      title: trackTitle,
      type: trackType,
      url: trackUrl,
      sort_order: nextOrder
    };
    fallbackDb.tracks.push(newTrack);
    saveFallbackDb();

    res.json({
      success: true,
      track: newTrack
    });
  }
});

app.delete('/api/tracks/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // 1. Kiểm tra tệp vật lý lưu trong uploads để xóa giải phóng bộ nhớ ổ đĩa dự án
    const [rows] = await pool.query('SELECT url FROM playlist_tracks WHERE track_id = ? OR id = ?', [id, id]);
    if (rows && rows.length > 0 && rows[0].url) {
      const trackUrl = rows[0].url;
      if (trackUrl.startsWith('/uploads/')) {
        const fileName = path.basename(trackUrl);
        const filePath = path.join(uploadsDir, fileName);
        if (fs.existsSync(filePath)) {
          await fs.promises.unlink(filePath).catch(() => {});
          console.log('🗑️ Đã xóa tệp nhạc khỏi thư mục uploads dự án:', fileName);
        }
      }
    }

    // 2. Xóa dòng khỏi MySQL
    await pool.query('DELETE FROM playlist_tracks WHERE track_id = ? OR id = ?', [id, id]);
    fallbackDb.tracks = fallbackDb.tracks.filter(t => String(t.track_id) !== String(id) && String(t.id) !== String(id));
    saveFallbackDb();
    res.json({ success: true });
  } catch (err) {
    fallbackDb.tracks = fallbackDb.tracks.filter(t => String(t.track_id) !== String(id) && String(t.id) !== String(id));
    saveFallbackDb();
    res.json({ success: true });
  }
});

// ========================================================
// 4. API CÀI ĐẶT ÂM THANH HỆ THỐNG (CHUÔNG & MÕ)
// ========================================================
app.get('/api/bell', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM bell_settings WHERE id = 1');
    if (rows && rows.length > 0) {
      const row = rows[0];
      res.json({
        id: row.id,
        custom_url: row.custom_url || '',
        auto_play: row.auto_play !== undefined ? row.auto_play : 1,
        interval_seconds: row.interval_seconds || 60,
        volume: row.volume !== undefined ? row.volume : 0.85,
        wooden_fish_url: row.wooden_fish_url || '',
        wooden_fish_volume: row.wooden_fish_volume !== undefined ? row.wooden_fish_volume : 0.90
      });
    } else {
      res.json(fallbackDb.bell);
    }
  } catch (err) {
    res.json(fallbackDb.bell);
  }
});

app.post('/api/bell', async (req, res) => {
  const { custom_url, auto_play, interval_seconds, volume, wooden_fish_url, wooden_fish_volume } = req.body;
  try {
    // Thu dọn tệp chuông & mõ cũ nếu có
    const [rows] = await pool.query('SELECT custom_url, wooden_fish_url FROM bell_settings WHERE id = 1');
    if (rows && rows.length > 0) {
      const oldUrl = rows[0].custom_url;
      const oldWooden = rows[0].wooden_fish_url;
      if (oldUrl && oldUrl.startsWith('/uploads/') && oldUrl !== custom_url) {
        const oldFile = path.join(uploadsDir, path.basename(oldUrl));
        if (fs.existsSync(oldFile)) {
          fs.promises.unlink(oldFile).catch(() => {});
        }
      }
      if (oldWooden && oldWooden.startsWith('/uploads/') && oldWooden !== wooden_fish_url) {
        const oldFile = path.join(uploadsDir, path.basename(oldWooden));
        if (fs.existsSync(oldFile)) {
          fs.promises.unlink(oldFile).catch(() => {});
        }
      }
    }

    const bellData = {
      custom_url: custom_url || '',
      auto_play: auto_play ? 1 : 0,
      interval_seconds: parseInt(interval_seconds, 10) || 60,
      volume: parseFloat(volume) !== undefined ? parseFloat(volume) : 0.85,
      wooden_fish_url: wooden_fish_url || '',
      wooden_fish_volume: parseFloat(wooden_fish_volume) !== undefined ? parseFloat(wooden_fish_volume) : 0.90
    };

    await pool.query(
      `UPDATE bell_settings 
       SET custom_url = ?, 
           auto_play = ?, 
           interval_seconds = ?, 
           volume = ?, 
           wooden_fish_url = ?, 
           wooden_fish_volume = ? 
       WHERE id = 1`,
      [
        bellData.custom_url,
        bellData.auto_play,
        bellData.interval_seconds,
        bellData.volume,
        bellData.wooden_fish_url,
        bellData.wooden_fish_volume
      ]
    );

    fallbackDb.bell = { ...fallbackDb.bell, ...bellData };
    saveFallbackDb();
    res.json({ success: true, ...bellData });
  } catch (err) {
    const bellData = {
      custom_url: custom_url || '',
      auto_play: auto_play ? 1 : 0,
      interval_seconds: parseInt(interval_seconds, 10) || 60,
      volume: parseFloat(volume) !== undefined ? parseFloat(volume) : 0.85,
      wooden_fish_url: wooden_fish_url || '',
      wooden_fish_volume: parseFloat(wooden_fish_volume) !== undefined ? parseFloat(wooden_fish_volume) : 0.90
    };
    fallbackDb.bell = { ...fallbackDb.bell, ...bellData };
    saveFallbackDb();
    res.json({ success: true, ...bellData });
  }
});

// ========================================================
// 5. API THỐNG KÊ LƯỢT TRUY CẬP (ANALYTICS)
// ========================================================
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
    // Cập nhật fallback stats
    if (type === 'visit') fallbackDb.stats.todayVisits++;
    else if (type === 'offering') fallbackDb.stats.todayOfferings++;
    else if (type === 'blessing') fallbackDb.stats.todayBlessings++;
    fallbackDb.stats.recentLogs.unshift({
      id: Date.now(),
      type: type || 'visit',
      label: label || 'Hoạt động',
      time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    });
    if (fallbackDb.stats.recentLogs.length > 15) fallbackDb.stats.recentLogs.pop();
    saveFallbackDb();
    res.json({ success: true });
  }
});

app.get('/api/analytics/dashboard', async (req, res) => {
  try {
    const [totals] = await pool.query(`
      SELECT 
        IFNULL(SUM(visits_count), 0) AS total_visits,
        IFNULL(SUM(offerings_count), 0) AS total_offerings,
        IFNULL(SUM(blessings_count), 0) AS total_blessings
      FROM analytics_daily_stats
    `);

    const [todayRows] = await pool.query(`
      SELECT visits_count, offerings_count, blessings_count
      FROM analytics_daily_stats
      WHERE stat_date = CURDATE()
    `);
    const todayStat = todayRows[0] || { visits_count: 0, offerings_count: 0, blessings_count: 0 };

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
    const history = historyRows.reverse();

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
    res.json(fallbackDb.stats);
  }
});

// ========================================================
// 6. API TÂM NGUYỆN PHẬT TỬ (KÍNH DÂNG LÊN TAM BẢO)
// ========================================================
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
    const formatted = fallbackDb.wishes
      .filter(w => w.is_approved === 1)
      .map(r => ({
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

    await pool.query(
      'INSERT INTO analytics_logs (action_type, ip_address, label) VALUES (?, ?, ?)',
      ['blessing', ip, `Phật tử kính dâng tâm nguyện: "${content.trim().slice(0, 35)}..."`]
    );

    fallbackDb.wishes.unshift({
      id: result.insertId,
      author_name: author_name?.trim() || null,
      author_age: author_age?.trim() || null,
      author_address: author_address?.trim() || null,
      content: content.trim(),
      likes_count: 1,
      is_approved: 1,
      ip_address: ip,
      created_at: new Date().toISOString()
    });
    saveFallbackDb();

    res.json({
      success: true,
      message: 'Tâm nguyện của thí chủ đã được kính cẩn dâng lên Tam Bảo',
      id: result.insertId
    });
  } catch (err) {
    const newId = Date.now();
    fallbackDb.wishes.unshift({
      id: newId,
      author_name: author_name?.trim() || null,
      author_age: author_age?.trim() || null,
      author_address: author_address?.trim() || null,
      content: content.trim(),
      likes_count: 1,
      is_approved: 1,
      ip_address: ip,
      created_at: new Date().toISOString()
    });
    saveFallbackDb();

    res.json({
      success: true,
      message: 'Tâm nguyện của thí chủ đã được kính cẩn dâng lên Tam Bảo',
      id: newId
    });
  }
});

// Chắp tay cầu an (thích / hoan hỷ cùng tâm nguyện)
app.post('/api/wishes/:id/like', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    await pool.query('UPDATE prayers_wishes SET likes_count = likes_count + 1 WHERE id = ?', [id]);
    const [rows] = await pool.query('SELECT likes_count FROM prayers_wishes WHERE id = ?', [id]);
    const likes = rows && rows[0] ? rows[0].likes_count : 1;
    const wish = fallbackDb.wishes.find(w => w.id === id);
    if (wish) {
      wish.likes_count = (wish.likes_count || 1) + 1;
      saveFallbackDb();
    }
    res.json({ success: true, likes_count: likes });
  } catch (err) {
    const wish = fallbackDb.wishes.find(w => w.id === id);
    if (wish) {
      wish.likes_count = (wish.likes_count || 1) + 1;
      saveFallbackDb();
      return res.json({ success: true, likes_count: wish.likes_count });
    }
    res.json({ success: true, likes_count: 2 });
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
    const formatted = fallbackDb.wishes.map(r => ({
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
  }
});

// Quản trị viên xóa tâm nguyện
app.delete('/api/admin/wishes/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    await pool.query('DELETE FROM prayers_wishes WHERE id = ?', [id]);
    fallbackDb.wishes = fallbackDb.wishes.filter(w => w.id !== id);
    saveFallbackDb();
    res.json({ success: true, message: 'Đã xóa tâm nguyện' });
  } catch (err) {
    fallbackDb.wishes = fallbackDb.wishes.filter(w => w.id !== id);
    saveFallbackDb();
    res.json({ success: true, message: 'Đã xóa tâm nguyện' });
  }
});

// Quản trị viên bật / tắt hiển thị tâm nguyện
app.patch('/api/admin/wishes/:id/toggle', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  try {
    await pool.query('UPDATE prayers_wishes SET is_approved = IF(is_approved = 1, 0, 1) WHERE id = ?', [id]);
    const [rows] = await pool.query('SELECT is_approved FROM prayers_wishes WHERE id = ?', [id]);
    const isApproved = rows && rows[0] ? rows[0].is_approved : 1;
    const wish = fallbackDb.wishes.find(w => w.id === id);
    if (wish) {
      wish.is_approved = isApproved;
      saveFallbackDb();
    }
    res.json({ success: true, is_approved: isApproved });
  } catch (err) {
    const wish = fallbackDb.wishes.find(w => w.id === id);
    if (wish) {
      wish.is_approved = wish.is_approved === 1 ? 0 : 1;
      saveFallbackDb();
      return res.json({ success: true, is_approved: wish.is_approved });
    }
    res.json({ success: true, is_approved: 1 });
  }
});

// Định tuyến trang Admin và giao diện chính trong chế độ Production
if (fs.existsSync(distDir)) {
  app.get('/admin', (req, res) => {
    res.sendFile(path.join(distDir, 'admin.html'));
  });
  app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(distDir, 'admin.html'));
  });
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/images')) {
      return next();
    }
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Pagoda Server đang chạy tại http://0.0.0.0:${PORT}`);
});
