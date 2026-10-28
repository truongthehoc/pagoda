/**
 * Script khởi chạy toàn bộ hệ thống Pagoda (Backend + Frontend)
 * Tự động kiểm tra cổng MySQL, khởi động server API, Vite Dev Server và mở trình duyệt.
 */

import { spawn, exec, execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import net from 'net';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Màu sắc terminal ANSI
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  red: '\x1b[31m',
  white: '\x1b[37m'
};

const prefixSys = `${colors.bold}${colors.cyan}[HỆ THỐNG]${colors.reset}`;
const prefixBackend = `${colors.bold}${colors.green}[BACKEND ]${colors.reset}`;
const prefixFrontend = `${colors.bold}${colors.yellow}[FRONTEND]${colors.reset}`;

let backendProcess = null;
let frontendProcess = null;
let isShuttingDown = false;

// Tự động giải phóng cổng nếu có tiến trình Node cũ bị treo
function freePortIfBusy(port) {
  return new Promise((resolve) => {
    if (process.platform !== 'win32') return resolve();
    exec(`netstat -ano | findstr :${port}`, (err, stdout) => {
      if (err || !stdout) return resolve();
      const lines = stdout.trim().split('\n');
      for (const line of lines) {
        if (line.includes('LISTENING')) {
          const parts = line.trim().split(/\s+/);
          const pid = parts[parts.length - 1];
          if (pid && pid !== '0' && pid != process.pid) {
            try {
              execSync(`taskkill /pid ${pid} /F /T`, { stdio: 'ignore' });
              console.log(`${prefixSys} ${colors.yellow}Đã giải phóng cổng ${port} từ tiến trình cũ (PID: ${pid}).${colors.reset}`);
            } catch (_) {}
          }
        }
      }
      resolve();
    });
  });
}

// Hàm kiểm tra port socket
function checkPort(port, host = '127.0.0.1', timeout = 1200) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(timeout);
    socket.once('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.once('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.once('error', () => {
      resolve(false);
    });
    socket.connect(port, host);
  });
}

// Hàm mở trình duyệt
function openBrowser(url) {
  const cmd = process.platform === 'win32'
    ? `start "" "${url}"`
    : process.platform === 'darwin'
    ? `open "${url}"`
    : `xdg-open "${url}"`;
  
  exec(cmd, (err) => {
    if (err) {
      console.log(`${prefixSys} ${colors.dim}Không thể tự động mở trình duyệt. Vui lòng mở thủ công: ${url}${colors.reset}`);
    }
  });
}

// In banner
function printBanner() {
  console.log(`
${colors.yellow}================================================================${colors.reset}
  ${colors.bold}${colors.magenta}☸  HỆ THỐNG PHẬT GIÁO - CHÍNH ĐIỆN TAM BẢO (PAGODA)  ☸${colors.reset}
  ${colors.white}Môi trường Test & Phát triển tích hợp tự động${colors.reset}
${colors.yellow}================================================================${colors.reset}
`);
}

// Hàm dọn dẹp và dừng tiến trình khi thoát
function shutdown() {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`\n${prefixSys} ${colors.yellow}Đang dừng toàn bộ dịch vụ...${colors.reset}`);

  const killProc = (proc) => {
    if (!proc || proc.killed) return;
    try {
      if (process.platform === 'win32') {
        exec(`taskkill /pid ${proc.pid} /T /F`, () => {});
      } else {
        proc.kill('SIGINT');
      }
    } catch (_) {}
  };

  killProc(backendProcess);
  killProc(frontendProcess);

  setTimeout(() => {
    console.log(`${prefixSys} ${colors.green}Đã dừng tất cả dịch vụ an toàn. Tạm biệt!${colors.reset}\n`);
    process.exit(0);
  }, 600);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Giữ tiến trình luôn chạy chờ tín hiệu dừng
setInterval(() => {}, 1000 * 60 * 60);

async function start() {
  printBanner();

  console.log(`${prefixSys} Đang kiểm tra dịch vụ MySQL (cổng 3306)...`);
  const isMysqlUp = await checkPort(3306);
  if (isMysqlUp) {
    console.log(`${prefixSys} ${colors.green}✓ Dịch vụ MySQL đang hoạt động sẵn sàng.${colors.reset}`);
  } else {
    console.log(`${prefixSys} ${colors.red}⚠ CẢNH BÁO: Chưa kết nối được MySQL trên cổng 3306.${colors.reset}`);
    console.log(`${prefixSys} ${colors.dim}  -> Nếu bạn cần dữ liệu từ Database, hãy bật XAMPP / Laragon / MySQL Service.${colors.reset}`);
  }

  // Giải phóng port nếu có tiến trình Node cũ chiếm giữ
  await freePortIfBusy(3001);
  await freePortIfBusy(5173);

  // 1. Khởi chạy Backend Express API (port 3001)
  console.log(`\n${prefixSys} Đang khởi động Backend API Server (server.js)...`);
  backendProcess = spawn(process.execPath, [path.join(__dirname, 'server.js')], {
    cwd: __dirname,
    env: { ...process.env, PORT: '3001' },
    stdio: ['inherit', 'pipe', 'pipe']
  });

  backendProcess.stdout.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => {
      if (line.trim()) console.log(`${prefixBackend} ${line}`);
    });
  });

  backendProcess.stderr.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => {
      if (line.trim()) console.error(`${prefixBackend} ${colors.red}${line}${colors.reset}`);
    });
  });

  backendProcess.on('error', (err) => {
    console.error(`${prefixBackend} ${colors.red}Lỗi khởi động backend:${colors.reset}`, err.message);
  });

  backendProcess.on('exit', (code, signal) => {
    if (!isShuttingDown) {
      console.log(`${prefixBackend} ${colors.yellow}Tiến trình backend đã dừng (mã thoát: ${code})${colors.reset}`);
    }
  });

  // 2. Khởi chạy Frontend Vite Dev Server (port 5173)
  console.log(`${prefixSys} Đang khởi động Frontend Vite Dev Server...`);
  const viteBin = path.join(__dirname, 'node_modules', 'vite', 'bin', 'vite.js');
  frontendProcess = spawn(process.execPath, [viteBin], {
    cwd: __dirname,
    stdio: ['inherit', 'pipe', 'pipe']
  });

  let browserOpened = false;
  const noOpen = process.argv.includes('--no-open') || process.argv.includes('-n');

  frontendProcess.stdout.on('data', (data) => {
    const str = data.toString();
    const lines = str.trim().split('\n');
    lines.forEach(line => {
      if (line.trim()) console.log(`${prefixFrontend} ${line}`);
    });

    // Tự động mở trình duyệt khi Vite đã sẵn sàng
    if (!browserOpened && !noOpen && (str.includes('Local:') || str.includes('http://127.0.0.1:5173') || str.includes('localhost:5173'))) {
      browserOpened = true;
      setTimeout(() => {
        console.log(`\n${prefixSys} ${colors.bold}${colors.green}✓ Hệ thống đã sẵn sàng phục vụ!${colors.reset}`);
        console.log(`${prefixSys} ➜ Trang chính Tam Bảo:  ${colors.cyan}${colors.bold}http://localhost:5173${colors.reset}`);
        console.log(`${prefixSys} ➜ Trang Quản trị Admin: ${colors.cyan}${colors.bold}http://localhost:5173/admin.html${colors.reset}`);
        console.log(`${prefixSys} ➜ API Backend:          ${colors.cyan}${colors.bold}http://localhost:3001${colors.reset}`);
        console.log(`${prefixSys} ${colors.dim}(Nhấn Ctrl + C để dừng tất cả dịch vụ bất cứ lúc nào)${colors.reset}\n`);
        
        console.log(`${prefixSys} Đang tự động mở trình duyệt tới http://localhost:5173 ...`);
        openBrowser('http://localhost:5173');
      }, 500);
    }
  });

  frontendProcess.stderr.on('data', (data) => {
    const lines = data.toString().trim().split('\n');
    lines.forEach(line => {
      if (line.trim()) console.error(`${prefixFrontend} ${colors.yellow}${line}${colors.reset}`);
    });
  });

  frontendProcess.on('error', (err) => {
    console.error(`${prefixFrontend} ${colors.red}Lỗi khởi động frontend:${colors.reset}`, err.message);
  });

  frontendProcess.on('exit', (code, signal) => {
    if (!isShuttingDown) {
      console.log(`${prefixFrontend} ${colors.yellow}Tiến trình frontend đã dừng (mã thoát: ${code})${colors.reset}`);
    }
  });
}

start();
