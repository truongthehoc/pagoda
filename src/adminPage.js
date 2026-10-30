// Script điều khiển bảng quản trị kết nối trực tiếp MySQL Database
import './style.css';
import { soundEngine } from './audio.js';
import { AnalyticsTracker } from './analytics.js';

class ModernAdminApp {
  constructor() {
    this.authKey = 'pagoda_admin_auth';

    // Elements Đăng nhập
    this.loginModal = document.getElementById('admin-login-modal');
    this.loginForm = document.getElementById('admin-login-form');
    this.loginUsername = document.getElementById('login-username');
    this.loginPassword = document.getElementById('login-password');
    this.loginErrorAlert = document.getElementById('login-error-msg');
    this.loginErrorText = document.getElementById('login-error-text');

    // Layout chính & Header
    this.appLayout = document.getElementById('admin-app-layout');
    this.btnLogout = document.getElementById('btn-admin-logout');
    this.userDropdownWrap = document.getElementById('admin-user-dropdown-wrap');
    this.userDropdownToggle = document.getElementById('btn-user-dropdown-toggle');
    this.userDropdownMenu = document.getElementById('admin-user-dropdown-menu');
    this.topbarUserFullname = document.getElementById('topbar-user-fullname');
    this.dropdownUserFullname = document.getElementById('dropdown-user-fullname');
    this.dropdownUserEmail = document.getElementById('dropdown-user-email');

    // Sidebar & Navigation
    this.navItems = document.querySelectorAll('.sidebar-nav .nav-item');
    this.tabPanes = document.querySelectorAll('.admin-tab-pane');
    this.pageTitle = document.getElementById('page-title');
    this.pageSubtitle = document.getElementById('page-subtitle');
    this.sidebarTrackBadge = document.getElementById('sidebar-track-badge');

    // Tab 1: Thống kê & Thống kê nhanh tâm nguyện
    this.btnRefreshStats = document.getElementById('btn-refresh-stats');
    this.barChartContainer = document.getElementById('analytics-bar-chart');
    this.logsListContainer = document.getElementById('analytics-logs-list');
    this.kpiTotalWishes = document.getElementById('kpi-total-wishes');
    this.dashboardWishesTbody = document.getElementById('dashboard-wishes-tbody');
    this.dashboardWishesBadge = document.getElementById('dashboard-wishes-badge');
    this.btnRefreshDashboardWishes = document.getElementById('btn-refresh-dashboard-wishes');

    // Tab Mới: Nhật ký tương tác đầy đủ (Full Logs)
    this.adminFullLogsTbody = document.getElementById('admin-full-logs-tbody');
    this.btnRefreshFullLogs = document.getElementById('btn-refresh-full-logs');
    this.btnCleanFullLogs = document.getElementById('btn-clean-full-logs');
    this.logsSearchInput = document.getElementById('logs-search-input');
    this.logFilterChips = document.querySelectorAll('.log-filter-chip');
    this.logCountAll = document.getElementById('log-count-all');
    this.logCountVisit = document.getElementById('log-count-visit');
    this.logCountOffering = document.getElementById('log-count-offering');
    this.logCountBlessing = document.getElementById('log-count-blessing');
    this.logsTotalLabel = document.getElementById('logs-total-label');
    this.logsSummaryHint = document.getElementById('logs-summary-hint');
    this.allFullLogs = [];
    this.logsFilterState = 'all';
    this.logsSearchText = '';

    // Tab 2: Ảnh bàn thờ (PC & Mobile)
    this.currentAltarPreview = document.getElementById('altar-current-preview');
    this.inputAltarFile = document.getElementById('input-altar-file');
    this.cbUsePcForMobile = document.getElementById('cb-use-pc-for-mobile');
    this.mobileAltarCustomBox = document.getElementById('mobile-altar-custom-box');
    this.altarMobilePreview = document.getElementById('altar-mobile-preview');
    this.inputAltarMobileFile = document.getElementById('input-altar-mobile-file');
    this.mobilePreviewBadge = document.getElementById('mobile-preview-badge');
    this.mobileUsingPcHint = document.getElementById('mobile-using-pc-hint');

    // Tab 3: Nhạc thiền
    this.musicTableBody = document.getElementById('music-table-body');
    this.musicTrackCount = document.getElementById('music-track-count');
    this.inputMusicTitle = document.getElementById('input-music-title');
    this.inputMusicUrl = document.getElementById('input-music-url');
    this.inputMusicFile = document.getElementById('input-music-file');
    this.btnAddMusicUrl = document.getElementById('btn-add-music-url');

    // Tab 4: Âm thanh hệ thống (Chuông & Mõ)
    this.bellCustomUrl = document.getElementById('bell-custom-url');
    this.bellCustomFile = document.getElementById('bell-custom-file');
    this.bellAutoplayToggle = document.getElementById('bell-autoplay-toggle');
    this.bellIntervalInput = document.getElementById('bell-interval-input');
    this.bellVolumeSlider = document.getElementById('bell-volume-slider');
    this.bellVolumeLabel = document.getElementById('bell-volume-label');
    this.intervalChips = document.querySelectorAll('.btn-interval-chip');
    this.btnTestBell = document.getElementById('btn-test-bell');
    this.bellSourceBadge = document.getElementById('bell-source-badge');
    this.btnClearBellUrl = document.getElementById('btn-clear-bell-url');
    this.bellAutoplayStatus = document.getElementById('bell-autoplay-status');

    this.woodenFishCustomUrl = document.getElementById('wooden-fish-custom-url');
    this.woodenFishCustomFile = document.getElementById('wooden-fish-custom-file');
    this.woodenFishVolumeSlider = document.getElementById('wooden-fish-volume-slider');
    this.woodenFishVolumeLabel = document.getElementById('wooden-fish-volume-label');
    this.btnTestWoodenFish = document.getElementById('btn-test-wooden-fish');
    this.woodenFishSourceBadge = document.getElementById('wooden-fish-source-badge');
    this.btnClearWoodenFishUrl = document.getElementById('btn-clear-wooden-fish-url');

    this.btnSaveBellConfig = document.getElementById('btn-save-bell-config');
    this.btnResetBellDefault = document.getElementById('btn-reset-bell-default');

    // Tab 5: Flare ánh sáng
    this.sliderFlareX = document.getElementById('admin-flare-x');
    this.sliderFlareY = document.getElementById('admin-flare-y');
    this.sliderFlareOpacity = document.getElementById('admin-flare-opacity');
    this.sliderFlareSize = document.getElementById('admin-flare-size');
    this.lblFlareX = document.getElementById('lbl-admin-flare-x');
    this.lblFlareY = document.getElementById('lbl-admin-flare-y');
    this.lblFlareOpacity = document.getElementById('lbl-admin-flare-opacity');
    this.lblFlareSize = document.getElementById('lbl-admin-flare-size');
    this.btnResetFlare = document.getElementById('admin-btn-reset-flare');

    // Tab 6: Quản lý chức năng (Tỉ lệ 7/3)
    this.inputIncenseTitle = document.getElementById('admin-input-incense-title');
    this.inputCardTitle = document.getElementById('admin-input-card-title');
    this.inputWishTitle = document.getElementById('admin-input-wish-title');

    this.previewIncenseTitle = document.getElementById('preview-incense-title');
    this.previewCardTitle = document.getElementById('preview-card-title');
    this.previewWishTitle = document.getElementById('preview-wish-title');

    this.adminPreviewBar = document.getElementById('admin-preview-bar');
    this.buttonsConfigCards = document.getElementById('buttons-config-cards');

    this.btnSaveButtonsConfig = document.getElementById('btn-save-buttons-config');
    this.btnResetButtonsDefault = document.getElementById('btn-reset-buttons-default');

    // Tab 7: Quản lý tâm nguyện (Fullwidth List & Filters)
    this.adminWishesTbody = document.getElementById('admin-wishes-tbody');
    this.btnRefreshWishes = document.getElementById('btn-refresh-wishes');
    this.wishesSearchInput = document.getElementById('wishes-search-input');
    this.wishFilterChips = document.querySelectorAll('.wish-filter-chip');
    this.wishCountAll = document.getElementById('wish-count-all');
    this.wishCountApproved = document.getElementById('wish-count-approved');
    this.wishCountHidden = document.getElementById('wish-count-hidden');
    this.wishesTotalLabel = document.getElementById('wishes-total-label');
    this.wishesSummaryHint = document.getElementById('wishes-summary-hint');

    // Cache danh sách tâm nguyện & trạng thái lọc
    this.allWishes = [];
    this.wishesSearchText = '';
    this.wishesFilterState = 'all'; // 'all' | 'approved' | 'hidden'

    // Toast
    this.toastEl = document.getElementById('admin-modern-toast');
    this.toastMsg = document.getElementById('toast-message');

    this.init();
  }

  async init() {
    this.setupAuth();
    this.setupNavigation();
    this.initAnalyticsTab();
    this.initLogsTab();
    await this.initAltarTab();
    await this.initMusicTab();
    await this.initBellTab();
    await this.initFlareTab();
    await this.initActionButtonsTab();
    this.initWishesTab();
  }

  // =========================================================================
  // 1. QUẢN LÝ ĐĂNG NHẬP XÁC THỰC VỚI MYSQL & DROPDOWN TÀI KHOẢN HEADER
  // =========================================================================
  setupAuth() {
    const isAuthenticated = sessionStorage.getItem(this.authKey) === 'true';

    // Cập nhật thông tin tài khoản trên Header
    this.updateHeaderUserInfo();

    // Khởi tạo hiệu ứng hạt bụi vàng quang minh lơ lửng
    this.initLoginParticles();

    // Toggle Hiện / Ẩn Mật khẩu trong ô nhập
    const btnTogglePw = document.getElementById('btn-toggle-login-password');
    if (btnTogglePw && this.loginPassword) {
      btnTogglePw.addEventListener('click', () => {
        const isPw = this.loginPassword.getAttribute('type') === 'password';
        this.loginPassword.setAttribute('type', isPw ? 'text' : 'password');
        const eyeIcon = btnTogglePw.querySelector('.icon-eye');
        const eyeOffIcon = btnTogglePw.querySelector('.icon-eye-off');
        if (eyeIcon && eyeOffIcon) {
          eyeIcon.style.display = isPw ? 'none' : 'block';
          eyeOffIcon.style.display = isPw ? 'block' : 'none';
        }
      });
    }

    if (isAuthenticated) {
      this.showAppLayout();
    } else {
      this.showLoginModal();
    }

    // Toggle Dropdown Menu ở Header bên phải
    if (this.userDropdownToggle && this.userDropdownMenu) {
      this.userDropdownToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        const isOpen = this.userDropdownMenu.style.display === 'block';
        this.userDropdownMenu.style.display = isOpen ? 'none' : 'block';
        this.userDropdownToggle.setAttribute('aria-expanded', !isOpen);
      });

      // Tự động đóng dropdown khi click ra ngoài
      document.addEventListener('click', (e) => {
        if (this.userDropdownWrap && !this.userDropdownWrap.contains(e.target)) {
          this.userDropdownMenu.style.display = 'none';
          this.userDropdownToggle.setAttribute('aria-expanded', 'false');
        }
      });
    }

    if (this.loginForm) {
      this.loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const user = this.loginUsername.value.trim();
        const pass = this.loginPassword.value.trim();

        try {
          // Xác thực trực tiếp qua MySQL Database
          const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: user, password: pass })
          });

          const data = await res.json();

          if (res.ok && data.success) {
            sessionStorage.setItem(this.authKey, 'true');
            sessionStorage.setItem('pagoda_admin_user', JSON.stringify(data.user));
            this.loginErrorAlert.style.display = 'none';
            this.updateHeaderUserInfo();
            this.showAppLayout();
            this.showToast(`Đăng nhập thành công! Kính chào ${data.user.fullname}`);
          } else {
            this.loginErrorAlert.style.display = 'flex';
            this.loginErrorText.textContent = data.message || 'Tài khoản hoặc mật khẩu không chính xác';
          }
        } catch (err) {
          // Dự phòng nếu kết nối máy chủ gián đoạn
          if (user === 'admin' && pass === 'admin123') {
            const fallbackUser = { username: 'admin', fullname: 'Ban Quản Trị Tam Bảo', email: 'admin@pagoda.vn', role: 'admin' };
            sessionStorage.setItem(this.authKey, 'true');
            sessionStorage.setItem('pagoda_admin_user', JSON.stringify(fallbackUser));
            this.updateHeaderUserInfo();
            this.showAppLayout();
            this.showToast('Đăng nhập thành công');
          } else {
            this.loginErrorAlert.style.display = 'flex';
            this.loginErrorText.textContent = 'Lỗi kết nối máy chủ dữ liệu';
          }
        }
      });
    }

    if (this.btnLogout) {
      this.btnLogout.addEventListener('click', () => {
        if (confirm('Bạn có chắc chắn muốn đăng xuất khỏi trang quản trị?')) {
          sessionStorage.removeItem(this.authKey);
          sessionStorage.removeItem('pagoda_admin_user');
          if (this.userDropdownMenu) this.userDropdownMenu.style.display = 'none';
          this.showLoginModal();
          this.showToast('Đã đăng xuất khỏi hệ thống');
        }
      });
    }
  }

  updateHeaderUserInfo() {
    try {
      const stored = sessionStorage.getItem('pagoda_admin_user');
      if (stored) {
        const u = JSON.parse(stored);
        if (this.topbarUserFullname) this.topbarUserFullname.textContent = u.fullname || u.username || 'Quản trị viên';
        if (this.dropdownUserFullname) this.dropdownUserFullname.textContent = u.fullname || 'Quản Trị Viên';
        if (this.dropdownUserEmail) this.dropdownUserEmail.textContent = u.email || 'admin@pagoda.vn';
      }
    } catch (_) {}
  }

  initLoginParticles() {
    const canvas = document.getElementById('login-particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles = [];
    const PARTICLE_COUNT = 42;

    const resize = () => {
      canvas.width = canvas.parentElement ? canvas.parentElement.clientWidth : window.innerWidth;
      canvas.height = canvas.parentElement ? canvas.parentElement.clientHeight : window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    class SparkleParticle {
      constructor(w, h, initial = false) {
        this.reset(w, h, initial);
      }
      reset(w, h, initial = false) {
        this.x = Math.random() * w;
        this.y = initial ? Math.random() * h : h + 10;
        this.size = Math.random() * 2.2 + 0.8;
        this.speedY = Math.random() * 0.45 + 0.2;
        this.speedX = (Math.random() - 0.5) * 0.35;
        this.baseOpacity = Math.random() * 0.55 + 0.3;
        this.pulse = Math.random() * Math.PI * 2;
        this.pulseSpeed = Math.random() * 0.025 + 0.01;
        // Sắc vàng hoàng kim và hổ phách ấm áp
        this.hue = Math.random() > 0.4 ? 44 : 36;
      }
      update(w, h) {
        this.y -= this.speedY;
        this.pulse += this.pulseSpeed;
        this.x += Math.sin(this.pulse) * 0.4 + this.speedX;
        if (this.y < -10 || this.x < -10 || this.x > w + 10) {
          this.reset(w, h, false);
        }
      }
      draw(c) {
        const alpha = Math.max(0, this.baseOpacity * (0.6 + 0.4 * Math.sin(this.pulse)));
        c.save();
        c.beginPath();
        c.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        c.fillStyle = `hsla(${this.hue}, 95%, 65%, ${alpha})`;
        c.shadowBlur = this.size * 3.5;
        c.shadowColor = `hsla(${this.hue}, 100%, 55%, 0.9)`;
        c.fill();
        c.restore();
      }
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new SparkleParticle(canvas.width, canvas.height, true));
    }

    const animate = () => {
      const modal = document.getElementById('admin-login-modal');
      if (!modal || modal.style.display === 'none') {
        this.loginParticleLoopId = requestAnimationFrame(animate);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = canvas.width;
      const h = canvas.height;
      for (let i = 0; i < particles.length; i++) {
        particles[i].update(w, h);
        particles[i].draw(ctx);
      }
      this.loginParticleLoopId = requestAnimationFrame(animate);
    };

    if (this.loginParticleLoopId) {
      cancelAnimationFrame(this.loginParticleLoopId);
    }
    this.loginParticleLoopId = requestAnimationFrame(animate);
  }

  showLoginModal() {
    if (this.loginModal) this.loginModal.style.display = 'flex';
    if (this.appLayout) this.appLayout.style.display = 'none';
    if (this.loginPassword) this.loginPassword.value = '';
    if (this.loginUsername && !this.loginUsername.value) {
      setTimeout(() => this.loginUsername.focus(), 150);
    }
  }

  showAppLayout() {
    if (this.loginModal) this.loginModal.style.display = 'none';
    if (this.appLayout) this.appLayout.style.display = 'flex';
    this.renderAnalyticsData();
    this.renderMusicTable();
  }

  // =========================================================================
  // 2. ĐIỀU HƯỚNG SIDEBAR
  // =========================================================================
  setupNavigation() {
    const titlesMap = {
      'tab-dashboard': {
        title: 'Thống kê lượt truy cập',
        subtitle: 'Dữ liệu được lưu trữ và truy vấn trực tiếp từ MySQL Database'
      },
      'tab-logs': {
        title: 'Nhật ký tương tác hệ thống',
        subtitle: 'Theo dõi toàn bộ lịch sử viếng thăm, dâng hương, rút thẻ và tâm nguyện của khách thập phương từ MySQL'
      },
      'tab-altar': {
        title: 'Cập nhật hình ảnh Tam Bảo (PC & Mobile)',
        subtitle: 'Cấu hình ảnh nền riêng cho máy tính và điện thoại hoặc dùng chung tiện lợi'
      },
      'tab-music': {
        title: 'Quản lý danh sách nhạc thiền phát lần lượt',
        subtitle: 'Danh sách nhạc lưu trong MySQL, phát tuần tự trên trang public và có nút chỉnh âm lượng'
      },
      'tab-bell': {
        title: 'Cài đặt Âm thanh hệ thống (Chuông & Mõ)',
        subtitle: 'Cấu hình chuông chùa định kỳ và tiếng mõ thanh tịnh gán với thao tác người dùng'
      },
      'tab-flare': {
        title: 'Tùy chỉnh Flare ánh sáng quang minh quanh Phật',
        subtitle: 'Đồng bộ tọa độ và độ sáng hào quang từ cơ sở dữ liệu'
      },
      'tab-action-buttons': {
        title: 'Quản lý chức năng tương tác (Thắp Hương, Rút Thẻ, Tâm Nguyện)',
        subtitle: 'Sắp xếp thứ tự, chỉnh sửa tên nút chức năng và xem mô phỏng trực tiếp tỉ lệ 7/3'
      },
      'tab-wishes': {
        title: 'Quản lý danh sách Tâm Nguyện của Phật Tử',
        subtitle: 'Kiểm duyệt, tìm kiếm và bảo vệ quyền riêng tư các tâm nguyện kính dâng lên Tam Bảo'
      }
    };

    this.navItems.forEach(item => {
      item.addEventListener('click', () => {
        const targetTab = item.getAttribute('data-tab');

        this.navItems.forEach(n => n.classList.remove('active'));
        item.classList.add('active');

        this.tabPanes.forEach(pane => {
          if (pane.id === targetTab) {
            pane.classList.add('active');
          } else {
            pane.classList.remove('active');
          }
        });

        if (titlesMap[targetTab]) {
          if (this.pageTitle) this.pageTitle.textContent = titlesMap[targetTab].title;
          if (this.pageSubtitle) this.pageSubtitle.textContent = titlesMap[targetTab].subtitle;
        }

        if (targetTab === 'tab-dashboard') {
          this.renderAnalyticsData();
        } else if (targetTab === 'tab-logs') {
          this.loadFullLogs();
        } else if (targetTab === 'tab-wishes') {
          this.loadAdminWishes();
        }
      });
    });

    // Các nút chuyển hướng nhanh giữa các Tab
    document.querySelectorAll('.btn-goto-logs-tab').forEach(btn => {
      btn.addEventListener('click', () => this.switchTab('tab-logs'));
    });
    document.querySelectorAll('.btn-goto-wishes-tab').forEach(btn => {
      btn.addEventListener('click', () => this.switchTab('tab-wishes'));
    });
  }

  switchTab(tabId) {
    const navBtn = document.querySelector(`.sidebar-nav .nav-item[data-tab="${tabId}"]`);
    if (navBtn) {
      navBtn.click();
    }
  }

  // =========================================================================
  // 3. TAB 1: THỐNG KÊ LƯỢT TRUY CẬP (ANALYTICS TỪ MYSQL)
  // =========================================================================
  initAnalyticsTab() {
    if (this.btnRefreshStats) {
      this.btnRefreshStats.addEventListener('click', async () => {
        await this.renderAnalyticsData();
        this.showToast('Đã làm mới dữ liệu thống kê từ MySQL Database');
      });
    }

    const handleCleanData = async () => {
      const confirmClean = window.confirm(
        '⚠️ XÁC NHẬN DỌN SẠCH DỮ LIỆU MẪU:\n\n' +
        'Thao tác này sẽ dọn sạch toàn bộ:\n' +
        '1. Danh sách Tâm nguyện Phật tử mẫu.\n' +
        '2. Toàn bộ nhật ký tương tác thời gian thực.\n' +
        '3. Toàn bộ số liệu thống kê lượt truy cập 7 ngày mẫu (reset về 0).\n\n' +
        'Hệ thống sẽ bắt đầu đếm số liệu thật từ đầu.\nBạn có chắc chắn muốn thực hiện không?'
      );

      if (!confirmClean) return;

      try {
        const res = await fetch('/api/admin/clean-data', { method: 'POST' });
        if (res.ok) {
          const result = await res.json();
          this.showToast(result.message || 'Đã dọn sạch toàn bộ dữ liệu mẫu! Hệ thống sẵn sàng cho dữ liệu thật.');
          await this.renderAnalyticsData();
          await this.loadAllWishes();
          return;
        }

        // Dự phòng khi VPS chưa khởi động lại tiến trình Node (404 route mới):
        // Xóa sạch toàn bộ tâm nguyện qua các API DELETE hiện có
        const wishesRes = await fetch('/api/admin/wishes');
        if (wishesRes.ok) {
          const wishes = await wishesRes.json();
          if (Array.isArray(wishes) && wishes.length > 0) {
            for (const w of wishes) {
              await fetch(`/api/admin/wishes/${w.id}`, { method: 'DELETE' }).catch(() => {});
            }
          }
        }
        await this.loadAllWishes();
        this.showToast('Đã dọn sạch Tâm nguyện Phật tử! Hãy chạy lệnh: pm2 restart all trên VPS để reset số liệu thống kê.', 'info');
      } catch (err) {
        try {
          const wishesRes = await fetch('/api/admin/wishes');
          if (wishesRes.ok) {
            const wishes = await wishesRes.json();
            if (Array.isArray(wishes) && wishes.length > 0) {
              for (const w of wishes) {
                await fetch(`/api/admin/wishes/${w.id}`, { method: 'DELETE' }).catch(() => {});
              }
            }
          }
          await this.loadAllWishes();
          this.showToast('Đã dọn sạch Tâm nguyện! Hãy chạy: pm2 restart all trên VPS để cập nhật backend.', 'info');
        } catch (_) {
          this.showToast('Không thể kết nối máy chủ để dọn dẹp', 'warning');
        }
      }
    };

    const btnCleanDashboard = document.getElementById('btn-clean-data-dashboard');
    if (btnCleanDashboard) {
      btnCleanDashboard.addEventListener('click', handleCleanData);
    }

    const btnCleanHeader = document.getElementById('btn-admin-clean-data');
    if (btnCleanHeader) {
      btnCleanHeader.addEventListener('click', () => {
        if (this.adminUserDropdownMenu) this.adminUserDropdownMenu.style.display = 'none';
        handleCleanData();
      });
    }
  }

  async renderAnalyticsData() {
    const data = await AnalyticsTracker.getData();
    this.cachedDashboardLogs = data.recentLogs || [];

    const kpiTotalVisits = document.getElementById('kpi-total-visits');
    const kpiTodayVisits = document.getElementById('kpi-today-visits');
    const kpiTotalOfferings = document.getElementById('kpi-total-offerings');
    const kpiTotalBlessings = document.getElementById('kpi-total-blessings');
    const kpiTotalWishes = document.getElementById('kpi-total-wishes');

    if (kpiTotalVisits) kpiTotalVisits.textContent = (data.totalVisits || 0).toLocaleString('vi-VN');
    if (kpiTodayVisits) kpiTodayVisits.textContent = (data.todayVisits || 0).toLocaleString('vi-VN');
    if (kpiTotalOfferings) kpiTotalOfferings.textContent = (data.totalOfferings || 0).toLocaleString('vi-VN');
    if (kpiTotalBlessings) kpiTotalBlessings.textContent = (data.totalBlessings || 0).toLocaleString('vi-VN');
    if (kpiTotalWishes) {
      const wishesCount = data.totalWishes !== undefined ? data.totalWishes : (this.allWishes ? this.allWishes.length : 0);
      kpiTotalWishes.textContent = (wishesCount || 0).toLocaleString('vi-VN');
    }

    // Biểu đồ thanh 7 ngày từ MySQL
    if (this.barChartContainer) {
      this.barChartContainer.innerHTML = '';
      const history = data.history || [];
      if (history.length === 0) {
        this.barChartContainer.innerHTML = '<div class="empty-state" style="padding: 30px; text-align: center; color: #94a3b8; font-size: 0.84rem; width: 100%;">Chưa có dữ liệu thống kê theo ngày. Số liệu sẽ tự động hiển thị khi có khách viếng thăm.</div>';
      } else {
        const maxVal = Math.max(1, ...history.map(h => Math.max(h.visits || 0, h.offerings || 0)));

        history.forEach(day => {
          const col = document.createElement('div');
          col.className = 'bar-chart-col';

          const visitHeightPct = Math.round(((day.visits || 0) / maxVal) * 85);
          const offerHeightPct = Math.round(((day.offerings || 0) / maxVal) * 85);

          col.innerHTML = `
            <div class="bars-pair">
              <div class="bar-bar bar-visit" style="height: ${visitHeightPct}%;" title="${day.date}: ${day.visits} lượt viếng thăm">
                <span class="bar-val">${day.visits}</span>
              </div>
              <div class="bar-bar bar-offer" style="height: ${offerHeightPct}%;" title="${day.date}: ${day.offerings} lượt thắp hương">
                <span class="bar-val">${day.offerings}</span>
              </div>
            </div>
            <span class="bar-day-label">${day.date}</span>
          `;
          this.barChartContainer.appendChild(col);
        });
      }
    }

    // Nhật ký hoạt động gần đây từ MySQL
    if (this.logsListContainer) {
      this.logsListContainer.innerHTML = '';
      const logs = data.recentLogs || [];
      if (logs.length === 0) {
        this.logsListContainer.innerHTML = '<div class="empty-state" style="padding: 20px; text-align: center; color: #94a3b8; font-size: 0.84rem;">Chưa có nhật ký hoạt động nào trong cơ sở dữ liệu</div>';
      } else {
        logs.forEach(log => {
          const item = document.createElement('div');
          item.className = 'log-item';

          let svgIcon = `
            <svg class="mono-svg-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          `;
          let badgeClass = 'badge-slate';

          if (log.type === 'offering') {
            svgIcon = `
              <svg class="mono-svg-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"></path>
              </svg>
            `;
            badgeClass = 'badge-amber';
          } else if (log.type === 'blessing' || log.type === 'wish') {
            svgIcon = `
              <svg class="mono-svg-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
            `;
            badgeClass = 'badge-purple';
          }

          item.innerHTML = `
            <div class="log-left">
              <span class="log-icon ${badgeClass}">${svgIcon}</span>
              <div class="log-text">
                <span class="log-label">${log.label}</span>
                <span class="log-sub">Ghi nhận từ MySQL Database</span>
              </div>
            </div>
            <span class="log-time">${log.time}</span>
          `;
          this.logsListContainer.appendChild(item);
        });
      }
    }

    // Hiển thị thống kê nhanh danh sách tâm nguyện trên Dashboard
    await this.renderDashboardWishes();
  }

  // =========================================================================
  // 3.1. THỐNG KÊ NHANH TÂM NGUYỆN PHẬT TỬ TRÊN DASHBOARD
  // =========================================================================
  async renderDashboardWishes() {
    if (!this.dashboardWishesTbody) return;

    try {
      if (!this.allWishes || this.allWishes.length === 0) {
        const res = await fetch('/api/admin/wishes');
        if (res.ok) {
          this.allWishes = await res.json();
        }
      }

      const wishes = this.allWishes || [];
      if (this.dashboardWishesBadge) {
        this.dashboardWishesBadge.textContent = `${wishes.length} tâm nguyện`;
      }
      const kpiTotalWishes = document.getElementById('kpi-total-wishes');
      if (kpiTotalWishes) {
        kpiTotalWishes.textContent = (wishes.length || 0).toLocaleString('vi-VN');
      }

      if (wishes.length === 0) {
        this.dashboardWishesTbody.innerHTML = `
          <tr>
            <td colspan="6" style="text-align: center; color: #94a3b8; padding: 28px; font-size: 0.86rem;">
              Chưa có lời tâm nguyện nào được gửi về hệ thống
            </td>
          </tr>
        `;
        return;
      }

      // Lấy 6 tâm nguyện mới nhất hiển thị nhanh
      const recentWishes = wishes.slice(0, 6);
      this.dashboardWishesTbody.innerHTML = recentWishes.map((w, index) => {
        const initial = (w.author_name || 'P').trim().charAt(0).toUpperCase();
        const details = [w.author_age ? `${w.author_age} tuổi` : '', w.author_address || ''].filter(Boolean).join(' • ');
        const isApproved = w.is_approved === 1 || w.is_approved === true;

        return `
          <tr>
            <td style="text-align: center; font-weight: 600; color: #94a3b8;">${index + 1}</td>
            <td>
              <div class="wish-author-card">
                <div class="author-avatar-mini">${initial}</div>
                <div class="author-names">
                  <strong>${w.author_name}</strong>
                  ${details ? `<span style="font-size: 0.75rem; color: #64748b;">${details}</span>` : ''}
                </div>
              </div>
            </td>
            <td>
              <span class="wish-content-preview" title="${w.content}">"${w.content}"</span>
            </td>
            <td style="text-align: center; font-weight: 600; color: #e11d48;">
              <span style="display: inline-flex; align-items: center; gap: 4px;">
                🙏 ${w.likes_count || 1}
              </span>
            </td>
            <td style="color: #64748b; font-size: 0.8rem; white-space: nowrap;">
              ${w.time_ago || (w.created_at ? new Date(w.created_at).toLocaleDateString('vi-VN') : 'Mới đây')}
            </td>
            <td style="text-align: center;">
              <span class="status-badge ${isApproved ? 'badge-approved' : 'badge-hidden'}">
                ${isApproved ? 'Đang hiển thị' : 'Đang ẩn'}
              </span>
            </td>
          </tr>
        `;
      }).join('');
    } catch (e) {
      console.warn('Lỗi hiển thị thống kê nhanh tâm nguyện:', e);
    }
  }

  // =========================================================================
  // 3.2. TAB MỚI: NHẬT KÝ TƯƠNG TÁC CHI TIẾT ĐẦY ĐỦ (MYSQL)
  // =========================================================================
  initLogsTab() {
    if (this.btnRefreshFullLogs) {
      this.btnRefreshFullLogs.addEventListener('click', async () => {
        await this.loadFullLogs();
        this.showToast('Đã làm mới toàn bộ nhật ký tương tác');
      });
    }

    if (this.btnCleanFullLogs) {
      this.btnCleanFullLogs.addEventListener('click', async () => {
        const confirmClean = window.confirm(
          '⚠️ XÁC NHẬN DỌN DẸP NHẬT KÝ TƯƠNG TÁC:\n\n' +
          'Thao tác này sẽ xóa sạch toàn bộ lịch sử tương tác được lưu trong MySQL.\n' +
          'Số liệu thống kê tổng hợp và danh sách tâm nguyện vẫn được giữ nguyên.\n\n' +
          'Bạn có chắc chắn muốn xóa nhật ký không?'
        );
        if (!confirmClean) return;

        try {
          let res = await fetch('/api/admin/clean-logs', { method: 'POST' });
          if (!res.ok) {
            res = await fetch('/api/analytics/clean-logs', { method: 'POST' });
          }
          const data = await res.json();
          this.showToast(data.message || 'Đã dọn sạch nhật ký tương tác!');
          await this.loadFullLogs();
          await this.renderAnalyticsData();
        } catch (e) {
          this.showToast('Lỗi khi dọn nhật ký');
        }
      });
    }

    // Bộ lọc theo loại hành động
    this.logFilterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        this.logFilterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.logsFilterState = chip.getAttribute('data-filter') || 'all';
        this.renderFilteredLogs();
      });
    });

    // Tìm kiếm nhật ký theo từ khóa
    if (this.logsSearchInput) {
      this.logsSearchInput.addEventListener('input', (e) => {
        this.logsSearchText = e.target.value.trim().toLowerCase();
        this.renderFilteredLogs();
      });
    }
  }

  async loadFullLogs() {
    if (!this.adminFullLogsTbody) return;
    this.adminFullLogsTbody.innerHTML = `
      <tr>
        <td colspan="6" style="text-align: center; color: #64748b; padding: 36px;">
          <div class="loading-state-box">
            <span class="pulse-spin">🪷</span>
            <span style="margin-left: 8px;">Đang tải toàn bộ nhật ký tương tác từ MySQL Database...</span>
          </div>
        </td>
      </tr>
    `;

    let logs = [];
    let loadSuccess = false;

    // 1. Thử gọi API chuyên dụng /api/admin/logs
    try {
      const res = await fetch('/api/admin/logs?limit=500');
      if (res.ok) {
        const data = await res.json();
        logs = Array.isArray(data) ? data : (data.logs || []);
        loadSuccess = true;
      }
    } catch (_) {}

    // 2. Nếu thất bại, thử gọi alias /api/analytics/logs
    if (!loadSuccess) {
      try {
        const res = await fetch('/api/analytics/logs?limit=500');
        if (res.ok) {
          const data = await res.json();
          logs = Array.isArray(data) ? data : (data.logs || []);
          loadSuccess = true;
        }
      } catch (_) {}
    }

    // 3. Nếu vẫn chưa được (ví dụ Node server trên VPS chưa restart nên các route mới trả về 404),
    // tự động lấy nhật ký từ /api/analytics/dashboard (đang chạy và trả về recentLogs thực tế)
    if (!loadSuccess) {
      try {
        const res = await fetch('/api/analytics/dashboard');
        if (res.ok) {
          const dashData = await res.json();
          const rLogs = dashData.recentLogs || [];
          if (rLogs.length > 0) {
            logs = rLogs.map((l, idx) => ({
              id: l.id || (idx + 1),
              type: l.type || 'visit',
              label: l.label || 'Khách thập phương viếng thăm Chính Điện',
              ip_address: l.ip_address || '127.0.0.1',
              full_time: l.full_time || (l.time ? `Hôm nay ${l.time}` : 'Vừa xong'),
              time_str: l.time || 'Vừa xong',
              date_str: 'Hôm nay'
            }));
            loadSuccess = true;
          }
        }
      } catch (_) {}
    }

    // 4. Nếu vẫn chưa được, dùng cache từ trang Dashboard nếu đã load trước đó
    if (!loadSuccess && this.cachedDashboardLogs && this.cachedDashboardLogs.length > 0) {
      logs = this.cachedDashboardLogs.map((l, idx) => ({
        id: l.id || (idx + 1),
        type: l.type || 'visit',
        label: l.label || 'Khách thập phương viếng thăm Chính Điện',
        ip_address: l.ip_address || '127.0.0.1',
        full_time: l.full_time || (l.time ? `Hôm nay ${l.time}` : 'Vừa xong'),
        time_str: l.time || 'Vừa xong',
        date_str: 'Hôm nay'
      }));
      loadSuccess = true;
    }

    // 5. Dự phòng cuối cùng: đọc từ localStorage cache
    if (!loadSuccess) {
      try {
        const cachedRaw = localStorage.getItem('pagoda_analytics_cache');
        if (cachedRaw) {
          const cached = JSON.parse(cachedRaw);
          const rLogs = cached.recentLogs || [];
          if (rLogs.length > 0) {
            logs = rLogs.map((l, idx) => ({
              id: l.id || (idx + 1),
              type: l.type || 'visit',
              label: l.label || 'Khách thập phương viếng thăm Chính Điện',
              ip_address: l.ip_address || '127.0.0.1',
              full_time: l.full_time || (l.time ? `Hôm nay ${l.time}` : 'Vừa xong'),
              time_str: l.time || 'Vừa xong',
              date_str: 'Hôm nay'
            }));
            loadSuccess = true;
          }
        }
      } catch (_) {}
    }

    if (loadSuccess || logs.length > 0) {
      this.allFullLogs = logs;
      this.updateLogCounters();
      this.renderFilteredLogs();
    } else {
      this.allFullLogs = [];
      this.updateLogCounters();
      this.adminFullLogsTbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; color: #64748b; padding: 36px;">
            <div style="display: flex; flex-direction: column; align-items: center; gap: 8px;">
              <span style="font-size: 1.5rem;">📜</span>
              <span style="font-weight: 500; color: #475569;">Chưa có bản ghi nhật ký tương tác nào hoặc đang chờ máy chủ đồng bộ</span>
              <button type="button" id="btn-retry-logs" class="btn-card-action" style="margin-top: 8px;">
                🔄 Thử tải lại nhật ký
              </button>
            </div>
          </td>
        </tr>
      `;
      const btnRetry = document.getElementById('btn-retry-logs');
      if (btnRetry) btnRetry.addEventListener('click', () => this.loadFullLogs());
    }
  }

  updateLogCounters() {
    const logs = this.allFullLogs || [];
    const countAll = logs.length;
    const countVisit = logs.filter(l => (l.type || 'visit') === 'visit').length;
    const countOffering = logs.filter(l => l.type === 'offering').length;
    const countBlessing = logs.filter(l => l.type === 'blessing' || l.type === 'wish').length;

    if (this.logCountAll) this.logCountAll.textContent = countAll;
    if (this.logCountVisit) this.logCountVisit.textContent = countVisit;
    if (this.logCountOffering) this.logCountOffering.textContent = countOffering;
    if (this.logCountBlessing) this.logCountBlessing.textContent = countBlessing;
    if (this.logsTotalLabel) this.logsTotalLabel.textContent = `Tổng cộng: ${countAll} bản ghi nhật ký`;
  }

  renderFilteredLogs() {
    if (!this.adminFullLogsTbody) return;

    let filtered = [...this.allFullLogs];

    if (this.logsFilterState !== 'all') {
      if (this.logsFilterState === 'blessing') {
        filtered = filtered.filter(l => l.type === 'blessing' || l.type === 'wish');
      } else {
        filtered = filtered.filter(l => (l.type || 'visit') === this.logsFilterState);
      }
    }

    if (this.logsSearchText) {
      filtered = filtered.filter(l => {
        const label = (l.label || '').toLowerCase();
        const ip = (l.ip_address || '').toLowerCase();
        const time = (l.full_time || l.time_str || '').toLowerCase();
        return label.includes(this.logsSearchText) || ip.includes(this.logsSearchText) || time.includes(this.logsSearchText);
      });
    }

    if (this.logsSummaryHint) {
      this.logsSummaryHint.textContent = `Hiển thị ${filtered.length} / ${this.allFullLogs.length} bản ghi`;
    }

    if (filtered.length === 0) {
      this.adminFullLogsTbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; color: #94a3b8; padding: 36px;">
            Không tìm thấy bản ghi nhật ký nào phù hợp với bộ lọc
          </td>
        </tr>
      `;
      return;
    }

    this.adminFullLogsTbody.innerHTML = filtered.map((l, index) => {
      let badgeTypeClass = 'type-visit';
      let badgeTypeLabel = 'Viếng thăm';
      let typeIcon = '👁️';

      if (l.type === 'offering') {
        badgeTypeClass = 'type-offering';
        badgeTypeLabel = 'Thắp hương';
        typeIcon = '🪔';
      } else if (l.type === 'blessing' || l.type === 'wish') {
        badgeTypeClass = 'type-blessing';
        badgeTypeLabel = 'Cầu an & Nguyện';
        typeIcon = '🙏';
      }

      const displayTime = l.full_time || (l.date_str ? `${l.date_str} ${l.time_str || ''}` : l.time || 'Vừa xong');
      const ip = (l.ip_address || '127.0.0.1').replace(/^.*:/, '') || '127.0.0.1';

      return `
        <tr>
          <td style="text-align: center; font-weight: 600; color: #94a3b8;">${index + 1}</td>
          <td style="white-space: nowrap; color: #475569; font-size: 0.82rem;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <svg class="mono-svg-xs" style="color: #94a3b8;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
              <span>${displayTime}</span>
            </div>
          </td>
          <td style="text-align: center;">
            <span class="badge-action-type ${badgeTypeClass}">
              <span>${typeIcon}</span>
              <span>${badgeTypeLabel}</span>
            </span>
          </td>
          <td>
            <span style="font-weight: 500; color: #0f172a; line-height: 1.4;">${l.label}</span>
          </td>
          <td style="text-align: center;">
            <span class="mono-ip-chip">${ip}</span>
          </td>
          <td style="text-align: center;">
            <span class="status-badge badge-approved" style="font-size: 0.72rem; padding: 3px 8px;">
              ✓ Đã ghi nhận
            </span>
          </td>
        </tr>
      `;
    }).join('');
  }

  // =========================================================================
  // 4. TAB 2: CẬP NHẬT HÌNH ẢNH TAM BẢO (PC & MOBILE TINH GỌN)
  // =========================================================================
  async initAltarTab() {
    let currentBg = '/images/tam-bao-main.jpg';
    let currentMobileBg = '/images/tam-bao-main.jpg';
    let usePcForMobile = true;

    // Đọc ảnh PC và ảnh Mobile hiện tại từ MySQL
    try {
      const res = await fetch('/api/settings/altar');
      if (res.ok) {
        const data = await res.json();
        if (data.bg_image_url) currentBg = data.bg_image_url;
        if (data.bg_image_mobile_url) currentMobileBg = data.bg_image_mobile_url;
        if (data.use_pc_for_mobile !== undefined) {
          usePcForMobile = data.use_pc_for_mobile === 1 || data.use_pc_for_mobile === true;
        }
      }
    } catch (e) {
      currentBg = localStorage.getItem('pagoda_altar_bg') || currentBg;
      currentMobileBg = localStorage.getItem('pagoda_altar_mobile_bg') || localStorage.getItem('pagoda_altar_bg_mobile') || currentBg;
      usePcForMobile = localStorage.getItem('pagoda_use_pc_for_mobile') !== 'false';
    }

    const updateMobileUI = (usingPc) => {
      if (this.mobileAltarCustomBox) {
        this.mobileAltarCustomBox.style.display = usingPc ? 'none' : 'flex';
      }
      if (this.mobileUsingPcHint) {
        this.mobileUsingPcHint.style.display = usingPc ? 'flex' : 'none';
      }
      if (this.mobilePreviewBadge) {
        this.mobilePreviewBadge.textContent = usingPc ? 'Đang dùng ảnh PC' : 'Ảnh Mobile riêng';
      }
      if (this.altarMobilePreview) {
        this.altarMobilePreview.src = usingPc ? (this.currentAltarPreview?.src || currentBg) : currentMobileBg;
      }
    };

    if (this.currentAltarPreview) {
      this.currentAltarPreview.src = currentBg;
    }

    if (this.cbUsePcForMobile) {
      this.cbUsePcForMobile.checked = usePcForMobile;
    }

    updateMobileUI(usePcForMobile);

    // Toggle switch dùng chung ảnh PC cho Mobile
    if (this.cbUsePcForMobile) {
      this.cbUsePcForMobile.addEventListener('change', async () => {
        const checked = this.cbUsePcForMobile.checked;
        updateMobileUI(checked);

        try {
          await fetch('/api/settings/altar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              bg_image_url: currentBg,
              bg_image_mobile_url: currentMobileBg,
              use_pc_for_mobile: checked ? 1 : 0
            })
          });
        } catch (_) {}

        localStorage.setItem('pagoda_use_pc_for_mobile', checked ? 'true' : 'false');
        this.showToast(checked
          ? 'Đã chọn dùng chung hình ảnh PC cho điện thoại'
          : 'Đã mở chế độ tải ảnh riêng cho điện thoại');
      });
    }

    // Tải ảnh PC từ máy tính lên Server & lưu vào MySQL
    if (this.inputAltarFile) {
      this.inputAltarFile.addEventListener('change', async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          });

          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            const uploadedUrl = uploadData.url;
            currentBg = uploadedUrl;

            await fetch('/api/settings/altar', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                bg_image_url: uploadedUrl,
                bg_image_mobile_url: currentMobileBg,
                use_pc_for_mobile: this.cbUsePcForMobile?.checked ? 1 : 0
              })
            });

            localStorage.setItem('pagoda_altar_bg', uploadedUrl);
            localStorage.setItem('pagoda_altar_mobile_bg', currentMobileBg);
            localStorage.setItem('pagoda_altar_bg_mobile', currentMobileBg);
            if (this.currentAltarPreview) this.currentAltarPreview.src = uploadedUrl;
            if (this.cbUsePcForMobile?.checked) {
              updateMobileUI(true);
            }

            const saveMsg = uploadData.savedPercent > 0 
              ? `Đã tối ưu nén ảnh PC (tiết kiệm ${uploadData.savedPercent}% dung lượng) và lưu vào MySQL!`
              : 'Đã tải ảnh PC lên Server và lưu vào MySQL Database thành công!';
            this.showToast(saveMsg);
            this.inputAltarFile.value = '';
          }
        } catch (err) {
          this.showToast('Lỗi khi tải ảnh PC lên máy chủ', 'warning');
        }
      });
    }

    // Tải ảnh Mobile riêng từ máy tính lên Server & lưu vào MySQL
    if (this.inputAltarMobileFile) {
      this.inputAltarMobileFile.addEventListener('change', async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          });

          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            const mobileUrl = uploadData.url;
            currentMobileBg = mobileUrl;

            await fetch('/api/settings/altar', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                bg_image_url: currentBg,
                bg_image_mobile_url: mobileUrl,
                use_pc_for_mobile: 0
              })
            });

            if (this.cbUsePcForMobile) this.cbUsePcForMobile.checked = false;
            updateMobileUI(false);

            localStorage.setItem('pagoda_altar_bg', currentBg);
            localStorage.setItem('pagoda_altar_mobile_bg', mobileUrl);
            localStorage.setItem('pagoda_altar_bg_mobile', mobileUrl);
            localStorage.setItem('pagoda_use_pc_for_mobile', 'false');

            const saveMsg = uploadData.savedPercent > 0 
              ? `Đã tối ưu ảnh Mobile (tiết kiệm ${uploadData.savedPercent}% dung lượng) và lưu vào MySQL!`
              : 'Đã lưu ảnh chụp dọc riêng cho Mobile thành công!';
            this.showToast(saveMsg);
            this.inputAltarMobileFile.value = '';
          }
        } catch (err) {
          this.showToast('Lỗi khi tải ảnh Mobile lên máy chủ', 'warning');
        }
      });
    }
  }

  // =========================================================================
  // 5. TAB 3: THÊM & QUẢN LÝ DANH SÁCH NHẠC THIỀN VỚI MYSQL
  // =========================================================================
  async initMusicTab() {
    await soundEngine.syncFromDatabase();
    this.renderMusicTable();

    const handleAddMusicUrl = async () => {
      const title = this.inputMusicTitle ? this.inputMusicTitle.value.trim() : '';
      const url = this.inputMusicUrl ? this.inputMusicUrl.value.trim() : '';

      if (!url) {
        this.showToast('Vui lòng nhập đường dẫn URL file âm thanh (.mp3, .wav, ...)', 'warning');
        if (this.inputMusicUrl) this.inputMusicUrl.focus();
        return;
      }

      if (this.btnAddMusicUrl) {
        this.btnAddMusicUrl.disabled = true;
        this.btnAddMusicUrl.textContent = 'Đang thêm...';
      }

      try {
        const success = await soundEngine.addTrackToDatabase(title || 'Nhạc Thiền An Lạc', url, 'url');
        if (success) {
          if (this.inputMusicTitle) this.inputMusicTitle.value = '';
          if (this.inputMusicUrl) this.inputMusicUrl.value = '';
          this.renderMusicTable();
          this.showToast('Đã lưu bài nhạc mới vào MySQL Database!');
        } else {
          this.showToast('Lỗi thêm bài nhạc vào cơ sở dữ liệu. Vui lòng kiểm tra lại đường dẫn.', 'warning');
        }
      } catch (err) {
        this.showToast('Không thể thêm bài nhạc lúc này', 'warning');
      } finally {
        if (this.btnAddMusicUrl) {
          this.btnAddMusicUrl.disabled = false;
          this.btnAddMusicUrl.textContent = 'Thêm';
        }
      }
    };

    // Thêm qua Click nút bấm
    if (this.btnAddMusicUrl) {
      this.btnAddMusicUrl.addEventListener('click', handleAddMusicUrl);
    }

    // Hỗ trợ phím Enter trên ô nhập link nhạc
    if (this.inputMusicUrl) {
      this.inputMusicUrl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleAddMusicUrl();
        }
      });
    }

    if (this.inputMusicTitle) {
      this.inputMusicTitle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleAddMusicUrl();
        }
      });
    }

    // Tải tệp MP3 lên Server và lưu vào MySQL
    if (this.inputMusicFile) {
      this.inputMusicFile.addEventListener('change', async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          });

          if (uploadRes.ok) {
            const data = await uploadRes.json();
            const trackTitle = file.name.replace(/\.[^/.]+$/, '');
            const success = await soundEngine.addTrackToDatabase(trackTitle, data.url, 'url');
            if (success) {
              this.renderMusicTable();
              this.showToast(`Đã lưu tệp nhạc "${trackTitle}" vào thư mục dự án & MySQL!`);
              this.inputMusicFile.value = '';
            }
          }
        } catch (err) {
          this.showToast('Lỗi khi tải tệp nhạc lên server', 'warning');
        }
      });
    }

    // Xóa tất cả bài nhạc thiền trong hệ thống
    const btnDeleteAllTracks = document.getElementById('btn-delete-all-tracks');
    if (btnDeleteAllTracks) {
      btnDeleteAllTracks.addEventListener('click', async () => {
        const confirmDeleteAll = window.confirm(
          '⚠️ BẠN CÓ CHẮC MUỐN XÓA TẤT CẢ BÀI NHẠC THIỀN?\n\n' +
          'Thao tác này sẽ xóa sạch toàn bộ danh sách bài hát khỏi hệ thống.\n' +
          'Bạn có thể thêm lại bất kỳ lúc nào bằng link URL hoặc tệp MP3.'
        );
        if (!confirmDeleteAll) return;

        btnDeleteAllTracks.disabled = true;
        try {
          const success = await soundEngine.removeAllTracksFromDatabase();
          if (success) {
            this.renderMusicTable();
            this.showToast('Đã xóa sạch toàn bộ danh sách nhạc thiền!');
          } else {
            this.showToast('Lỗi khi xóa danh sách nhạc từ cơ sở dữ liệu', 'warning');
          }
        } catch (err) {
          this.showToast('Không thể kết nối máy chủ để xóa nhạc', 'warning');
        } finally {
          btnDeleteAllTracks.disabled = false;
        }
      });
    }
  }

  renderMusicTable() {
    if (!this.musicTableBody) return;
    this.musicTableBody.innerHTML = '';

    const list = soundEngine.playlist || [];
    if (this.musicTrackCount) this.musicTrackCount.textContent = list.length;
    if (this.sidebarTrackBadge) this.sidebarTrackBadge.textContent = list.length;

    const btnDeleteAllTracks = document.getElementById('btn-delete-all-tracks');
    if (btnDeleteAllTracks) {
      btnDeleteAllTracks.style.display = list.length > 0 ? 'inline-flex' : 'none';
    }

    if (list.length === 0) {
      this.musicTableBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 36px 16px; color: var(--text-muted); font-size: 13.5px;">
            Danh sách hiện chưa có bài nhạc nào trong hệ thống. Hãy thêm đường dẫn URL hoặc tải lên tệp âm thanh ở trên.
          </td>
        </tr>
      `;
      return;
    }

    list.forEach((track, index) => {
      const isCurrent = soundEngine.currentTrackIndex === index;
      const isPlaying = isCurrent && soundEngine.isAmbientPlaying;
      const row = document.createElement('tr');
      row.className = isCurrent ? 'row-active' : '';

      row.innerHTML = `
        <td class="td-index">${index + 1}</td>
        <td class="td-title">
          <div class="track-title-cell">
            <span class="music-note-icon">
              <svg class="mono-svg-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 18V5l12-2v13"></path>
                <circle cx="6" cy="18" r="3"></circle>
                <circle cx="18" cy="16" r="3"></circle>
              </svg>
            </span>
            <div>
              <span class="track-name-text">${track.title}</span>
              ${isCurrent ? '<span class="now-playing-tag">Đang phát</span>' : ''}
            </div>
          </div>
        </td>
        <td>
          ${track.type === 'synth' ? '<span class="badge-pill badge-purple">Sóng Âm Thiền</span>' : '<span class="badge-pill badge-slate">Tệp MP3 Audio</span>'}
        </td>
        <td>
          ${isPlaying ? '<span class="status-indicator active"><span class="pulse-dot"></span> Đang phát thử</span>' : '<span class="status-indicator">Sẵn sàng</span>'}
        </td>
        <td style="text-align: right;">
          <div class="row-actions">
            <button class="btn-table-play" data-index="${index}">
              <svg class="mono-svg-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                ${isPlaying
                  ? '<rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect>'
                  : '<polygon points="5 3 19 12 5 21 5 3"></polygon>'
                }
              </svg>
              <span>${isPlaying ? 'Tạm dừng' : 'Nghe thử'}</span>
            </button>
            <button class="btn-table-delete" data-id="${track.id}" title="Xóa bài nhạc khỏi danh sách">
              <svg class="mono-svg-xs" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              <span>Xóa</span>
            </button>
          </div>
        </td>
      `;

      const btnPlay = row.querySelector('.btn-table-play');
      btnPlay.addEventListener('click', () => {
        if (isCurrent && soundEngine.isAmbientPlaying) {
          soundEngine.stopAmbient();
        } else {
          soundEngine.selectTrack(index);
          soundEngine.startAmbient(true);
        }
        this.renderMusicTable();
      });

      const btnDel = row.querySelector('.btn-table-delete');
      if (btnDel) {
        btnDel.addEventListener('click', async () => {
          if (confirm(`Bạn có chắc muốn xóa bài "${track.title}" khỏi MySQL Database?`)) {
            const success = await soundEngine.removeTrackFromDatabase(track.id);
            if (success) {
              this.renderMusicTable();
              this.showToast('Đã xóa bài nhạc khỏi MySQL Database');
            }
          }
        });
      }

      this.musicTableBody.appendChild(row);
    });
  }

  // =========================================================================
  // 6. TAB 4: CÀI ĐẶT ÂM THANH HỆ THỐNG (CHUÔNG ĐỊNH KỲ & MÕ TƯƠNG TÁC)
  // =========================================================================
  async initBellTab() {
    let bellConfig = soundEngine.bellConfig || {};

    try {
      const res = await fetch('/api/bell');
      if (res.ok) {
        bellConfig = await res.json();
      }
    } catch (e) {}

    // Helper cập nhật badge nguồn âm thanh
    const updateBellSourceBadge = () => {
      const hasCustom = Boolean(this.bellCustomUrl && this.bellCustomUrl.value.trim());
      if (this.bellSourceBadge) {
        this.bellSourceBadge.className = `sound-source-badge ${hasCustom ? 'badge-custom' : 'badge-default'}`;
        this.bellSourceBadge.textContent = hasCustom ? '📁 Tệp âm thanh riêng' : '✨ Mặc định: Bộ tạo âm thanh tự nhiên';
      }
      if (this.btnClearBellUrl) {
        this.btnClearBellUrl.style.display = hasCustom ? 'flex' : 'none';
      }
    };

    const updateWoodenFishSourceBadge = () => {
      const hasCustom = Boolean(this.woodenFishCustomUrl && this.woodenFishCustomUrl.value.trim());
      if (this.woodenFishSourceBadge) {
        this.woodenFishSourceBadge.className = `sound-source-badge ${hasCustom ? 'badge-custom' : 'badge-default'}`;
        this.woodenFishSourceBadge.textContent = hasCustom ? '📁 Tệp âm thanh riêng' : '✨ Mặc định: Bộ tạo âm mõ gỗ tự nhiên';
      }
      if (this.btnClearWoodenFishUrl) {
        this.btnClearWoodenFishUrl.style.display = hasCustom ? 'flex' : 'none';
      }
    };

    // Cấu hình Chuông
    if (this.bellCustomUrl) {
      this.bellCustomUrl.value = bellConfig.custom_url || bellConfig.customUrl || '';
      this.bellCustomUrl.addEventListener('input', updateBellSourceBadge);
    }
    if (this.bellAutoplayToggle) {
      this.bellAutoplayToggle.checked = Boolean(bellConfig.auto_play ?? bellConfig.autoPlay ?? true);
      if (this.bellAutoplayStatus) {
        this.bellAutoplayStatus.textContent = this.bellAutoplayToggle.checked ? 'Tự động phát' : 'Đã tạm dừng';
      }
      this.bellAutoplayToggle.addEventListener('change', () => {
        if (this.bellAutoplayStatus) {
          this.bellAutoplayStatus.textContent = this.bellAutoplayToggle.checked ? 'Tự động phát' : 'Đã tạm dừng';
        }
      });
    }
    if (this.bellIntervalInput) {
      this.bellIntervalInput.value = bellConfig.interval_seconds || bellConfig.intervalSeconds || 60;
      this.bellIntervalInput.addEventListener('input', () => {
        const val = parseInt(this.bellIntervalInput.value, 10);
        this.intervalChips.forEach(c => {
          c.classList.toggle('active', parseInt(c.getAttribute('data-sec'), 10) === val);
        });
      });
    }

    const initialBellVol = Math.round((bellConfig.volume || 0.85) * 100);
    if (this.bellVolumeSlider) this.bellVolumeSlider.value = initialBellVol;
    if (this.bellVolumeLabel) this.bellVolumeLabel.textContent = `${initialBellVol}%`;

    // Nút xóa đường dẫn chuông riêng
    if (this.btnClearBellUrl) {
      this.btnClearBellUrl.addEventListener('click', () => {
        if (this.bellCustomUrl) this.bellCustomUrl.value = '';
        updateBellSourceBadge();
        this.showToast('Đã khôi phục tiếng chuông chùa tự nhiên mặc định');
      });
    }

    // Cấu hình Mõ
    if (this.woodenFishCustomUrl) {
      this.woodenFishCustomUrl.value = bellConfig.wooden_fish_url || bellConfig.woodenFishUrl || '';
      this.woodenFishCustomUrl.addEventListener('input', updateWoodenFishSourceBadge);
    }
    const initialWfVol = Math.round((bellConfig.wooden_fish_volume ?? bellConfig.woodenFishVolume ?? 0.9) * 100);
    if (this.woodenFishVolumeSlider) this.woodenFishVolumeSlider.value = initialWfVol;
    if (this.woodenFishVolumeLabel) this.woodenFishVolumeLabel.textContent = `${initialWfVol}%`;

    // Nút xóa đường dẫn tiếng mõ riêng
    if (this.btnClearWoodenFishUrl) {
      this.btnClearWoodenFishUrl.addEventListener('click', () => {
        if (this.woodenFishCustomUrl) this.woodenFishCustomUrl.value = '';
        updateWoodenFishSourceBadge();
        this.showToast('Đã khôi phục tiếng gõ mõ gỗ tự nhiên mặc định');
      });
    }

    // Cập nhật trạng thái badge ban đầu
    updateBellSourceBadge();
    updateWoodenFishSourceBadge();

    // Chips chọn nhanh chu kỳ chuông
    this.intervalChips.forEach(chip => {
      const sec = parseInt(chip.getAttribute('data-sec'), 10);
      if (sec === (bellConfig.interval_seconds || bellConfig.intervalSeconds || 60)) {
        chip.classList.add('active');
      } else {
        chip.classList.remove('active');
      }

      chip.addEventListener('click', () => {
        this.intervalChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        if (this.bellIntervalInput) this.bellIntervalInput.value = sec;
      });
    });

    if (this.bellVolumeSlider) {
      this.bellVolumeSlider.addEventListener('input', (e) => {
        if (this.bellVolumeLabel) this.bellVolumeLabel.textContent = `${e.target.value}%`;
      });
    }

    if (this.woodenFishVolumeSlider) {
      this.woodenFishVolumeSlider.addEventListener('input', (e) => {
        if (this.woodenFishVolumeLabel) this.woodenFishVolumeLabel.textContent = `${e.target.value}%`;
      });
    }

    // Tải tệp chuông lên server
    if (this.bellCustomFile) {
      this.bellCustomFile.addEventListener('change', async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          });

          if (uploadRes.ok) {
            const data = await uploadRes.json();
            if (this.bellCustomUrl) this.bellCustomUrl.value = data.url;
            updateBellSourceBadge();
            this.showToast('Đã tải tệp chuông lên server. Nhấn "Lưu Cấu Hình Âm Thanh Hệ Thống" để lưu.');
            this.bellCustomFile.value = '';
          }
        } catch (err) {
          this.showToast('Lỗi khi tải tệp chuông', 'warning');
        }
      });
    }

    // Tải tệp tiếng mõ lên server
    if (this.woodenFishCustomFile) {
      this.woodenFishCustomFile.addEventListener('change', async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          });

          if (uploadRes.ok) {
            const data = await uploadRes.json();
            if (this.woodenFishCustomUrl) this.woodenFishCustomUrl.value = data.url;
            updateWoodenFishSourceBadge();
            this.showToast('Đã tải tệp tiếng mõ lên server. Nhấn "Lưu Cấu Hình Âm Thanh Hệ Thống" để lưu.');
            this.woodenFishCustomFile.value = '';
          }
        } catch (err) {
          this.showToast('Lỗi khi tải tệp tiếng mõ', 'warning');
        }
      });
    }

    // Nghe thử tiếng chuông
    if (this.btnTestBell) {
      this.btnTestBell.addEventListener('click', () => {
        soundEngine.playBell();
        this.showToast('Đang thỉnh tiếng Đại Hồng Chung ngân vang');
      });
    }

    // Nghe thử tiếng mõ
    if (this.btnTestWoodenFish) {
      this.btnTestWoodenFish.addEventListener('click', () => {
        soundEngine.playWoodenFish();
        this.showToast('Đang gõ tiếng mõ chùa thanh tịnh');
      });
    }

    // Lưu toàn bộ cấu hình âm thanh hệ thống (Chuông & Mõ) vào MySQL
    if (this.btnSaveBellConfig) {
      this.btnSaveBellConfig.addEventListener('click', async () => {
        const customUrl = this.bellCustomUrl ? this.bellCustomUrl.value.trim() : '';
        const autoPlay = this.bellAutoplayToggle ? this.bellAutoplayToggle.checked : true;
        const intervalSec = parseInt(this.bellIntervalInput ? this.bellIntervalInput.value : '60', 10) || 60;
        const volume = (parseInt(this.bellVolumeSlider ? this.bellVolumeSlider.value : '85', 10) || 85) / 100;

        const wfUrl = this.woodenFishCustomUrl ? this.woodenFishCustomUrl.value.trim() : '';
        const wfVolume = (parseInt(this.woodenFishVolumeSlider ? this.woodenFishVolumeSlider.value : '90', 10) || 90) / 100;

        const success = await soundEngine.updateSystemSoundSettingsInDatabase(
          customUrl,
          autoPlay,
          intervalSec,
          volume,
          wfUrl,
          wfVolume
        );

        if (success) {
          updateBellSourceBadge();
          updateWoodenFishSourceBadge();
          this.showToast(`Đã lưu cấu hình Âm thanh hệ thống (Chuông & Mõ) vào MySQL!`);
        } else {
          this.showToast('Lỗi khi lưu cấu hình vào cơ sở dữ liệu', 'warning');
        }
      });
    }

    // Khôi phục mặc định
    if (this.btnResetBellDefault) {
      this.btnResetBellDefault.addEventListener('click', async () => {
        if (this.bellCustomUrl) this.bellCustomUrl.value = '';
        if (this.bellAutoplayToggle) {
          this.bellAutoplayToggle.checked = true;
          if (this.bellAutoplayStatus) this.bellAutoplayStatus.textContent = 'Tự động phát';
        }
        if (this.bellIntervalInput) this.bellIntervalInput.value = 60;
        if (this.bellVolumeSlider) this.bellVolumeSlider.value = 85;
        if (this.bellVolumeLabel) this.bellVolumeLabel.textContent = '85%';

        if (this.woodenFishCustomUrl) this.woodenFishCustomUrl.value = '';
        if (this.woodenFishVolumeSlider) this.woodenFishVolumeSlider.value = 90;
        if (this.woodenFishVolumeLabel) this.woodenFishVolumeLabel.textContent = '90%';

        updateBellSourceBadge();
        updateWoodenFishSourceBadge();

        this.intervalChips.forEach(chip => {
          chip.classList.toggle('active', chip.getAttribute('data-sec') === '60');
        });

        await soundEngine.updateSystemSoundSettingsInDatabase('', true, 60, 0.85, '', 0.9);
        this.showToast('Đã khôi phục âm thanh Chuông & Mõ chuẩn mặc định');
      });
    }
  }

  // =========================================================================
  // 7. TAB 5: TÙY CHỈNH FLARE ÁNH SÁNG VỚI MYSQL
  // =========================================================================
  async initFlareTab() {
    let flareX = 50.0;
    let flareY = 26.5;
    let flareOpacity = 70.0;
    let flareSize = 480.0;

    try {
      const res = await fetch('/api/settings/altar');
      if (res.ok) {
        const data = await res.json();
        if (data.flare_x) flareX = data.flare_x;
        if (data.flare_y) flareY = data.flare_y;
        if (data.flare_opacity) flareOpacity = data.flare_opacity;
        if (data.flare_size) flareSize = data.flare_size;
      }
    } catch (e) {}

    this.updateFlareView(flareX, flareY, flareOpacity, flareSize);

    const saveFlareToDatabase = async () => {
      try {
        await fetch('/api/settings/flare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            flare_x: flareX,
            flare_y: flareY,
            flare_opacity: flareOpacity,
            flare_size: flareSize
          })
        });
      } catch (e) {}
    };

    if (this.sliderFlareX) {
      this.sliderFlareX.addEventListener('input', (e) => {
        flareX = parseFloat(e.target.value);
        if (this.lblFlareX) this.lblFlareX.textContent = `${flareX}%`;
        localStorage.setItem('pagoda_flare_x', flareX.toString());
        saveFlareToDatabase();
      });
    }

    if (this.sliderFlareY) {
      this.sliderFlareY.addEventListener('input', (e) => {
        flareY = parseFloat(e.target.value);
        if (this.lblFlareY) this.lblFlareY.textContent = `${flareY}%`;
        localStorage.setItem('pagoda_flare_y', flareY.toString());
        saveFlareToDatabase();
      });
    }

    if (this.sliderFlareOpacity) {
      this.sliderFlareOpacity.addEventListener('input', (e) => {
        flareOpacity = parseFloat(e.target.value);
        if (this.lblFlareOpacity) this.lblFlareOpacity.textContent = `${flareOpacity}%`;
        localStorage.setItem('pagoda_flare_opacity', flareOpacity.toString());
        saveFlareToDatabase();
      });
    }

    if (this.sliderFlareSize) {
      this.sliderFlareSize.addEventListener('input', (e) => {
        flareSize = parseFloat(e.target.value);
        if (this.lblFlareSize) this.lblFlareSize.textContent = `${flareSize}px`;
        localStorage.setItem('pagoda_flare_size', flareSize.toString());
        saveFlareToDatabase();
      });
    }

    if (this.btnResetFlare) {
      this.btnResetFlare.addEventListener('click', () => {
        flareX = 50; flareY = 26.5; flareOpacity = 70; flareSize = 480;
        this.updateFlareView(50, 26.5, 70, 480);
        localStorage.setItem('pagoda_flare_x', '50');
        localStorage.setItem('pagoda_flare_y', '26.5');
        localStorage.setItem('pagoda_flare_opacity', '70');
        localStorage.setItem('pagoda_flare_size', '480');
        saveFlareToDatabase();
        this.showToast('Đã đặt lại Flare ánh sáng về chuẩn mặc định trong MySQL');
      });
    }
  }

  updateFlareView(x, y, opacity, size) {
    if (this.sliderFlareX) this.sliderFlareX.value = x;
    if (this.sliderFlareY) this.sliderFlareY.value = y;
    if (this.sliderFlareOpacity) this.sliderFlareOpacity.value = opacity;
    if (this.sliderFlareSize) this.sliderFlareSize.value = size;

    if (this.lblFlareX) this.lblFlareX.textContent = `${x}%`;
    if (this.lblFlareY) this.lblFlareY.textContent = `${y}%`;
    if (this.lblFlareOpacity) this.lblFlareOpacity.textContent = `${opacity}%`;
    if (this.lblFlareSize) this.lblFlareSize.textContent = `${size}px`;
  }

  // =========================================================================
  // 8. TAB 6: QUẢN LÝ CHỨC NĂNG TƯƠNG TÁC (TỈ LỆ 7/3 & LIVEVIEW)
  // =========================================================================
  async initActionButtonsTab() {
    let incenseTitle = 'THẮP NÉN HƯƠNG THƠM';
    let cardTitle = 'RÚT THẺ CẦU AN';
    let wishTitle = 'GỬI TÂM NGUYỆN';
    let buttonsOrder = ['incense', 'card', 'wish'];

    // 1. Tải dữ liệu từ API hoặc Cache
    try {
      const res = await fetch('/api/settings/buttons');
      if (res.ok) {
        const data = await res.json();
        if (data.incense_title) incenseTitle = data.incense_title;
        if (data.card_title) cardTitle = data.card_title;
        if (data.wish_title) wishTitle = data.wish_title;
        if (Array.isArray(data.buttons_order) && data.buttons_order.length > 0) {
          buttonsOrder = data.buttons_order;
        }
      }
    } catch (_) {
      incenseTitle = localStorage.getItem('pagoda_incense_title') || incenseTitle;
      cardTitle = localStorage.getItem('pagoda_card_title') || cardTitle;
      wishTitle = localStorage.getItem('pagoda_wish_title') || wishTitle;
      const cachedOrder = localStorage.getItem('pagoda_buttons_order');
      if (cachedOrder) {
        try { buttonsOrder = JSON.parse(cachedOrder); } catch (_) {}
      }
    }

    // Đảm bảo buttonsOrder chứa đủ 3 phím
    const validKeys = ['incense', 'card', 'wish'];
    buttonsOrder = buttonsOrder.filter(k => validKeys.includes(k));
    validKeys.forEach(k => {
      if (!buttonsOrder.includes(k)) buttonsOrder.push(k);
    });

    // 2. Điền dữ liệu vào form & cập nhật giao diện
    const updateUI = () => {
      if (this.inputIncenseTitle) this.inputIncenseTitle.value = incenseTitle;
      if (this.inputCardTitle) this.inputCardTitle.value = cardTitle;
      if (this.inputWishTitle) this.inputWishTitle.value = wishTitle;

      if (this.previewIncenseTitle) this.previewIncenseTitle.textContent = incenseTitle;
      if (this.previewCardTitle) this.previewCardTitle.textContent = cardTitle;
      if (this.previewWishTitle) this.previewWishTitle.textContent = wishTitle;

      // Sắp xếp lại thứ tự DOM của các preview button trong Live Preview
      if (this.adminPreviewBar) {
        buttonsOrder.forEach(key => {
          const previewEl = this.adminPreviewBar.querySelector(`[data-preview-key="${key}"]`);
          if (previewEl) this.adminPreviewBar.appendChild(previewEl);
        });
      }

      // Sắp xếp lại thứ tự DOM của các thẻ cấu hình danh sách dọc (Cột 7 phần)
      if (this.buttonsConfigCards) {
        buttonsOrder.forEach((key, index) => {
          const cardEl = this.buttonsConfigCards.querySelector(`[data-key="${key}"]`);
          if (cardEl) {
            this.buttonsConfigCards.appendChild(cardEl);

            const orderNumEl = cardEl.querySelector('.feature-order-num');
            if (orderNumEl) orderNumEl.textContent = `${index + 1}`;

            const btnUp = cardEl.querySelector('.btn-reorder-move[data-dir="-1"]');
            const btnDown = cardEl.querySelector('.btn-reorder-move[data-dir="1"]');
            if (btnUp) btnUp.disabled = (index === 0);
            if (btnDown) btnDown.disabled = (index === buttonsOrder.length - 1);
          }
        });
      }
    };

    updateUI();

    // 3. Xử lý di chuyển thứ tự (Move Up / Down)
    if (this.buttonsConfigCards) {
      this.buttonsConfigCards.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn-reorder-move');
        if (!btn) return;
        const key = btn.getAttribute('data-key');
        const dir = parseInt(btn.getAttribute('data-dir'), 10);
        const currentIndex = buttonsOrder.indexOf(key);
        if (currentIndex === -1) return;

        const newIndex = currentIndex + dir;
        if (newIndex < 0 || newIndex >= buttonsOrder.length) return;

        // Hoán đổi vị trí
        const temp = buttonsOrder[currentIndex];
        buttonsOrder[currentIndex] = buttonsOrder[newIndex];
        buttonsOrder[newIndex] = temp;

        updateUI();
      });
    }

    // 4. Cập nhật preview thời gian thực khi gõ phím
    if (this.inputIncenseTitle) {
      this.inputIncenseTitle.addEventListener('input', () => {
        incenseTitle = this.inputIncenseTitle.value.trim() || 'THẮP NÉN HƯƠNG THƠM';
        if (this.previewIncenseTitle) this.previewIncenseTitle.textContent = incenseTitle;
      });
    }
    if (this.inputCardTitle) {
      this.inputCardTitle.addEventListener('input', () => {
        cardTitle = this.inputCardTitle.value.trim() || 'RÚT THẺ CẦU AN';
        if (this.previewCardTitle) this.previewCardTitle.textContent = cardTitle;
      });
    }
    if (this.inputWishTitle) {
      this.inputWishTitle.addEventListener('input', () => {
        wishTitle = this.inputWishTitle.value.trim() || 'GỬI TÂM NGUYỆN';
        if (this.previewWishTitle) this.previewWishTitle.textContent = wishTitle;
      });
    }

    // 5. Lưu cấu hình vào MySQL qua API
    if (this.btnSaveButtonsConfig) {
      this.btnSaveButtonsConfig.addEventListener('click', async () => {
        const payload = {
          incense_title: this.inputIncenseTitle ? this.inputIncenseTitle.value.trim() || 'THẮP NÉN HƯƠNG THƠM' : 'THẮP NÉN HƯƠNG THƠM',
          card_title: this.inputCardTitle ? this.inputCardTitle.value.trim() || 'RÚT THẺ CẦU AN' : 'RÚT THẺ CẦU AN',
          wish_title: this.inputWishTitle ? this.inputWishTitle.value.trim() || 'GỬI TÂM NGUYỆN' : 'GỬI TÂM NGUYỆN',
          buttons_order: buttonsOrder
        };

        try {
          await fetch('/api/settings/buttons', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          localStorage.setItem('pagoda_incense_title', payload.incense_title);
          localStorage.setItem('pagoda_card_title', payload.card_title);
          localStorage.setItem('pagoda_wish_title', payload.wish_title);
          localStorage.setItem('pagoda_buttons_order', JSON.stringify(payload.buttons_order));

          this.showToast('Đã lưu cấu hình và sắp xếp vị trí chức năng thành công!');
        } catch (err) {
          localStorage.setItem('pagoda_incense_title', payload.incense_title);
          localStorage.setItem('pagoda_card_title', payload.card_title);
          localStorage.setItem('pagoda_wish_title', payload.wish_title);
          localStorage.setItem('pagoda_buttons_order', JSON.stringify(payload.buttons_order));
          this.showToast('Đã lưu cục bộ vào trình duyệt');
        }
      });
    }

    // 6. Khôi phục mặc định
    if (this.btnResetButtonsDefault) {
      this.btnResetButtonsDefault.addEventListener('click', async () => {
        incenseTitle = 'THẮP NÉN HƯƠNG THƠM';
        cardTitle = 'RÚT THẺ CẦU AN';
        wishTitle = 'GỬI TÂM NGUYỆN';
        buttonsOrder = ['incense', 'card', 'wish'];

        updateUI();

        const defaultPayload = {
          incense_title: incenseTitle,
          card_title: cardTitle,
          wish_title: wishTitle,
          buttons_order: buttonsOrder
        };

        try {
          await fetch('/api/settings/buttons', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(defaultPayload)
          });
          localStorage.setItem('pagoda_incense_title', incenseTitle);
          localStorage.setItem('pagoda_card_title', cardTitle);
          localStorage.setItem('pagoda_wish_title', wishTitle);
          localStorage.setItem('pagoda_buttons_order', JSON.stringify(buttonsOrder));
          this.showToast('Đã khôi phục tiêu đề & thứ tự chuẩn mặc định');
        } catch (err) {
          this.showToast('Đã khôi phục mặc định');
        }
      });
    }
  }

  // =========================================================================
  // 9. TAB 7: QUẢN LÝ TÂM NGUYỆN PHẬT TỬ (FULLWIDTH LIST & TÌM KIẾM BỘ LỌC)
  // =========================================================================
  initWishesTab() {
    if (this.btnRefreshWishes) {
      this.btnRefreshWishes.addEventListener('click', () => {
        this.loadAdminWishes();
      });
    }

    // Bộ lọc trạng thái: Tất cả, Đang hiển thị, Đang ẩn
    this.wishFilterChips.forEach(chip => {
      chip.addEventListener('click', () => {
        this.wishFilterChips.forEach(c => c.classList.remove('active'));
        chip.classList.add('active');
        this.wishesFilterState = chip.getAttribute('data-filter') || 'all';
        this.renderFilteredWishes();
      });
    });

    // Tìm kiếm tức thời
    if (this.wishesSearchInput) {
      this.wishesSearchInput.addEventListener('input', (e) => {
        this.wishesSearchText = e.target.value.trim().toLowerCase();
        this.renderFilteredWishes();
      });
    }
  }

  async loadAdminWishes() {
    if (!this.adminWishesTbody) return;
    this.adminWishesTbody.innerHTML = `
      <tr>
        <td colspan="7" style="text-align: center; color: #64748b; padding: 36px;">
          <div class="loading-state-box">
            <span class="pulse-spin">🪷</span>
            <span style="margin-left: 8px;">Đang tải danh sách tâm nguyện từ MySQL Database...</span>
          </div>
        </td>
      </tr>
    `;

    try {
      const res = await fetch('/api/admin/wishes');
      if (!res.ok) throw new Error('Lỗi tải danh sách từ server');
      const data = await res.json();
      this.allWishes = Array.isArray(data) ? data : [];
      this.renderFilteredWishes();
    } catch (err) {
      this.adminWishesTbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; color: #ef4444; padding: 28px;">
            Không thể tải danh sách tâm nguyện: ${err.message}
          </td>
        </tr>
      `;
    }
  }

  renderFilteredWishes() {
    if (!this.adminWishesTbody) return;

    // Cập nhật số liệu trên các Chip lọc
    const totalCount = this.allWishes.length;
    const approvedCount = this.allWishes.filter(w => w.is_approved === 1 || w.is_approved === true).length;
    const hiddenCount = totalCount - approvedCount;

    if (this.wishCountAll) this.wishCountAll.textContent = totalCount;
    if (this.wishCountApproved) this.wishCountApproved.textContent = approvedCount;
    if (this.wishCountHidden) this.wishCountHidden.textContent = hiddenCount;

    // Lọc theo trạng thái và từ khóa tìm kiếm
    let filtered = this.allWishes.filter(w => {
      const isApproved = w.is_approved === 1 || w.is_approved === true;

      // Lọc trạng thái
      if (this.wishesFilterState === 'approved' && !isApproved) return false;
      if (this.wishesFilterState === 'hidden' && isApproved) return false;

      // Lọc từ khóa tìm kiếm
      if (this.wishesSearchText) {
        const name = (w.author_name || '').toLowerCase();
        const masked = (w.masked_name || '').toLowerCase();
        const addr = (w.author_address || '').toLowerCase();
        const content = (w.content || '').toLowerCase();
        const match = name.includes(this.wishesSearchText) ||
                      masked.includes(this.wishesSearchText) ||
                      addr.includes(this.wishesSearchText) ||
                      content.includes(this.wishesSearchText);
        if (!match) return false;
      }

      return true;
    });

    if (this.wishesTotalLabel) {
      this.wishesTotalLabel.textContent = `Hiển thị ${filtered.length} trên tổng số ${totalCount} tâm nguyện`;
    }

    if (this.wishesSummaryHint) {
      if (this.wishesFilterState === 'approved') {
        this.wishesSummaryHint.textContent = 'Đang lọc các tâm nguyện hiển thị công khai trên vách';
      } else if (this.wishesFilterState === 'hidden') {
        this.wishesSummaryHint.textContent = 'Đang lọc các tâm nguyện đã ẩn kiểm duyệt';
      } else {
        this.wishesSummaryHint.textContent = 'Hiển thị toàn bộ tâm nguyện';
      }
    }

    if (filtered.length === 0) {
      this.adminWishesTbody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; color: #94a3b8; padding: 36px;">
            <div style="font-size: 1.5rem; margin-bottom: 8px;">📭</div>
            <div style="font-size: 0.9rem; font-weight: 500; color: #64748b;">Không tìm thấy tâm nguyện nào phù hợp</div>
            <div style="font-size: 0.8rem; color: #94a3b8; margin-top: 4px;">Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm</div>
          </td>
        </tr>
      `;
      return;
    }

    this.adminWishesTbody.innerHTML = filtered.map((w, index) => {
      const isApproved = w.is_approved === 1 || w.is_approved === true;
      const statusBadge = isApproved
        ? `<span class="badge-status status-visible">Hiển thị</span>`
        : `<span class="badge-status status-hidden">Đã ẩn</span>`;

      const toggleBtnLabel = isApproved ? 'Ẩn' : 'Hiện';
      const toggleBtnClass = isApproved ? 'btn-wish-hide' : 'btn-wish-show';
      const initialChar = (w.author_name || 'P').trim().charAt(0).toUpperCase();

      return `
        <tr data-id="${w.id}">
          <td class="td-wish-stt">${index + 1}</td>
          <td class="td-wish-author">
            <div class="wish-author-card">
              <div class="author-avatar-mini">${initialChar}</div>
              <div class="author-names">
                <span class="author-display-name">${w.masked_name || 'Phật tử'}</span>
                <span class="author-real-name">Tên thật: <strong>${w.author_name || 'Khuyết danh'}</strong></span>
                <span class="author-meta-info">${w.author_address ? `📍 ${w.author_address}` : 'Toàn quốc'}${w.author_age ? ` • ${w.author_age} tuổi` : ''}</span>
              </div>
            </div>
          </td>
          <td class="td-wish-content">
            <div class="wish-content-bubble">
              <span class="quote-mark">“</span>
              <span class="wish-content-text">${this.escapeHtml(w.content)}</span>
              <span class="quote-mark">”</span>
            </div>
          </td>
          <td class="td-wish-likes">
            <div class="likes-count-pill">
              <span>🙏</span>
              <span class="likes-val">${w.likes_count || 0}</span>
            </div>
          </td>
          <td class="td-wish-time">
            <div class="time-block">
              <span class="time-relative">${w.time_ago || 'Gần đây'}</span>
              <span class="time-id-sub">Mã: #${w.id}</span>
            </div>
          </td>
          <td class="td-wish-status">
            ${statusBadge}
          </td>
          <td class="td-wish-actions">
            <div class="wish-action-buttons">
              <button type="button" class="btn-wish-action ${toggleBtnClass}" data-id="${w.id}" title="${toggleBtnLabel} tâm nguyện">
                ${toggleBtnLabel}
              </button>
              <button type="button" class="btn-wish-action btn-wish-delete" data-id="${w.id}" title="Xóa tâm nguyện">
                Xóa
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    // Gắn sự kiện Ẩn / Hiện và Xóa
    this.adminWishesTbody.querySelectorAll('.btn-wish-action:not(.btn-wish-delete)').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        try {
          const patchRes = await fetch(`/api/admin/wishes/${id}/toggle`, { method: 'PATCH' });
          if (patchRes.ok) {
            // Cập nhật local cache
            const target = this.allWishes.find(w => String(w.id) === String(id));
            if (target) {
              target.is_approved = (target.is_approved === 1 || target.is_approved === true) ? 0 : 1;
            }
            this.renderFilteredWishes();
            this.showToast('Đã cập nhật trạng thái hiển thị tâm nguyện');
          }
        } catch (e) {
          this.showToast('Lỗi cập nhật trạng thái', 'warning');
        }
      });
    });

    this.adminWishesTbody.querySelectorAll('.btn-wish-delete').forEach(btn => {
      btn.addEventListener('click', async () => {
        const id = btn.getAttribute('data-id');
        if (!confirm(`Bạn có chắc chắn muốn xóa tâm nguyện #${id} khỏi MySQL Database không?`)) return;

        try {
          const delRes = await fetch(`/api/admin/wishes/${id}`, { method: 'DELETE' });
          if (delRes.ok) {
            this.allWishes = this.allWishes.filter(w => String(w.id) !== String(id));
            this.renderFilteredWishes();
            this.showToast('Đã xóa tâm nguyện thành công');
          }
        } catch (e) {
          this.showToast('Lỗi khi xóa tâm nguyện', 'warning');
        }
      });
    });
  }

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  // =========================================================================
  // TOAST THÔNG BÁO HIỆN ĐẠI
  // =========================================================================
  showToast(message, type = 'success') {
    if (!this.toastEl) return;
    if (this.toastMsg) this.toastMsg.textContent = message;

    this.toastEl.className = `modern-toast ${type} show`;
    this.toastEl.style.display = 'flex';

    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      this.toastEl.className = 'modern-toast';
      this.toastEl.style.display = 'none';
    }, 2800);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new ModernAdminApp();
});
