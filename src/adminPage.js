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

    // Tab 1: Thống kê
    this.btnRefreshStats = document.getElementById('btn-refresh-stats');
    this.barChartContainer = document.getElementById('analytics-bar-chart');
    this.logsListContainer = document.getElementById('analytics-logs-list');

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

    this.woodenFishCustomUrl = document.getElementById('wooden-fish-custom-url');
    this.woodenFishCustomFile = document.getElementById('wooden-fish-custom-file');
    this.woodenFishVolumeSlider = document.getElementById('wooden-fish-volume-slider');
    this.woodenFishVolumeLabel = document.getElementById('wooden-fish-volume-label');
    this.btnTestWoodenFish = document.getElementById('btn-test-wooden-fish');

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

  showLoginModal() {
    if (this.loginModal) this.loginModal.style.display = 'flex';
    if (this.appLayout) this.appLayout.style.display = 'none';
    if (this.loginPassword) this.loginPassword.value = '';
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
        } else if (targetTab === 'tab-wishes') {
          this.loadAdminWishes();
        }
      });
    });
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
        const result = await res.json();
        if (result.success) {
          this.showToast('Đã dọn sạch toàn bộ dữ liệu mẫu! Hệ thống sẵn sàng cho dữ liệu thật.');
          await this.renderAnalyticsData();
          await this.loadAllWishes();
        } else {
          this.showToast(result.message || 'Lỗi khi dọn dẹp dữ liệu', 'warning');
        }
      } catch (err) {
        this.showToast('Không thể kết nối máy chủ để dọn dẹp', 'warning');
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

    const kpiTotalVisits = document.getElementById('kpi-total-visits');
    const kpiTodayVisits = document.getElementById('kpi-today-visits');
    const kpiTotalOfferings = document.getElementById('kpi-total-offerings');
    const kpiTotalBlessings = document.getElementById('kpi-total-blessings');

    if (kpiTotalVisits) kpiTotalVisits.textContent = (data.totalVisits || 0).toLocaleString('vi-VN');
    if (kpiTodayVisits) kpiTodayVisits.textContent = (data.todayVisits || 0).toLocaleString('vi-VN');
    if (kpiTotalOfferings) kpiTotalOfferings.textContent = (data.totalOfferings || 0).toLocaleString('vi-VN');
    if (kpiTotalBlessings) kpiTotalBlessings.textContent = (data.totalBlessings || 0).toLocaleString('vi-VN');

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

    // Nhật ký hoạt động từ MySQL
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
          } else if (log.type === 'blessing') {
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
  }

  renderMusicTable() {
    if (!this.musicTableBody) return;
    this.musicTableBody.innerHTML = '';

    const list = soundEngine.playlist || [];
    if (this.musicTrackCount) this.musicTrackCount.textContent = list.length;
    if (this.sidebarTrackBadge) this.sidebarTrackBadge.textContent = list.length;

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

    // Cấu hình Chuông
    if (this.bellCustomUrl) this.bellCustomUrl.value = bellConfig.custom_url || bellConfig.customUrl || '';
    if (this.bellAutoplayToggle) this.bellAutoplayToggle.checked = Boolean(bellConfig.auto_play ?? bellConfig.autoPlay ?? true);
    if (this.bellIntervalInput) this.bellIntervalInput.value = bellConfig.interval_seconds || bellConfig.intervalSeconds || 60;

    const initialBellVol = Math.round((bellConfig.volume || 0.85) * 100);
    if (this.bellVolumeSlider) this.bellVolumeSlider.value = initialBellVol;
    if (this.bellVolumeLabel) this.bellVolumeLabel.textContent = `${initialBellVol}%`;

    // Cấu hình Mõ
    if (this.woodenFishCustomUrl) {
      this.woodenFishCustomUrl.value = bellConfig.wooden_fish_url || bellConfig.woodenFishUrl || '';
    }
    const initialWfVol = Math.round((bellConfig.wooden_fish_volume ?? bellConfig.woodenFishVolume ?? 0.9) * 100);
    if (this.woodenFishVolumeSlider) this.woodenFishVolumeSlider.value = initialWfVol;
    if (this.woodenFishVolumeLabel) this.woodenFishVolumeLabel.textContent = `${initialWfVol}%`;

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
        if (this.bellAutoplayToggle) this.bellAutoplayToggle.checked = true;
        if (this.bellIntervalInput) this.bellIntervalInput.value = 60;
        if (this.bellVolumeSlider) this.bellVolumeSlider.value = 85;
        if (this.bellVolumeLabel) this.bellVolumeLabel.textContent = '85%';

        if (this.woodenFishCustomUrl) this.woodenFishCustomUrl.value = '';
        if (this.woodenFishVolumeSlider) this.woodenFishVolumeSlider.value = 90;
        if (this.woodenFishVolumeLabel) this.woodenFishVolumeLabel.textContent = '90%';

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
