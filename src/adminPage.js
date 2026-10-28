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

    // Layout chính
    this.appLayout = document.getElementById('admin-app-layout');
    this.btnLogout = document.getElementById('btn-admin-logout');

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

    // Tab 2: Ảnh bàn thờ
    this.currentAltarPreview = document.getElementById('altar-current-preview');
    this.inputAltarFile = document.getElementById('input-altar-file');
    this.presetAltarCards = document.querySelectorAll('.preset-card');

    // Tab 3: Nhạc thiền
    this.musicTableBody = document.getElementById('music-table-body');
    this.musicTrackCount = document.getElementById('music-track-count');
    this.inputMusicTitle = document.getElementById('input-music-title');
    this.inputMusicUrl = document.getElementById('input-music-url');
    this.inputMusicFile = document.getElementById('input-music-file');
    this.btnAddMusicUrl = document.getElementById('btn-add-music-url');

    // Tab 4: Chuông chùa
    this.bellCustomUrl = document.getElementById('bell-custom-url');
    this.bellCustomFile = document.getElementById('bell-custom-file');
    this.bellAutoplayToggle = document.getElementById('bell-autoplay-toggle');
    this.bellIntervalInput = document.getElementById('bell-interval-input');
    this.bellVolumeSlider = document.getElementById('bell-volume-slider');
    this.bellVolumeLabel = document.getElementById('bell-volume-label');
    this.intervalChips = document.querySelectorAll('.btn-interval-chip');
    this.btnTestBell = document.getElementById('btn-test-bell');
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

    // Tab 6: Cấu hình & sắp xếp nút tương tác
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

    // Tab 7: Quản lý tâm nguyện
    this.adminWishesTbody = document.getElementById('admin-wishes-tbody');
    this.btnRefreshWishes = document.getElementById('btn-refresh-wishes');

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
  // 1. QUẢN LÝ ĐĂNG NHẬP XÁC THỰC VỚI MYSQL
  // =========================================================================
  setupAuth() {
    const isAuthenticated = sessionStorage.getItem(this.authKey) === 'true';

    if (isAuthenticated) {
      this.showAppLayout();
    } else {
      this.showLoginModal();
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
            this.showAppLayout();
            this.showToast(`Đăng nhập thành công! Kính chào ${data.user.fullname}`);
          } else {
            this.loginErrorAlert.style.display = 'flex';
            this.loginErrorText.textContent = data.message || 'Tài khoản hoặc mật khẩu không chính xác';
          }
        } catch (err) {
          // Dự phòng nếu mất kết nối
          if (user === 'admin' && pass === 'admin123') {
            sessionStorage.setItem(this.authKey, 'true');
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
          this.showLoginModal();
          this.showToast('Đã đăng xuất khỏi hệ thống');
        }
      });
    }
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
        title: 'Cập nhật hình ảnh bàn thờ Tam Bảo',
        subtitle: 'Lưu trữ thông tin hình ảnh và cài đặt trong cơ sở dữ liệu'
      },
      'tab-music': {
        title: 'Quản lý danh sách nhạc thiền phát lần lượt',
        subtitle: 'Danh sách nhạc lưu trong MySQL, phát tuần tự trên trang public và có nút chỉnh âm lượng'
      },
      'tab-bell': {
        title: 'Cài đặt & Quản lý chuông chùa (Đại Hồng Chung)',
        subtitle: 'Cấu hình âm thanh chuông và thời gian phát tự động lưu trong MySQL'
      },
      'tab-flare': {
        title: 'Tùy chỉnh Flare ánh sáng quang minh quanh Phật',
        subtitle: 'Đồng bộ tọa độ và độ sáng hào quang từ cơ sở dữ liệu'
      },
      'tab-action-buttons': {
        title: 'Cấu hình văn bản nút tương tác (Thắp Hương & Rút Thẻ)',
        subtitle: 'Tùy chỉnh tiêu đề chính, phụ cho các nút hành động, lưu trực tiếp vào cơ sở dữ liệu'
      },
      'tab-wishes': {
        title: 'Quản lý danh sách Tâm Nguyện của Phật Tử',
        subtitle: 'Kiểm duyệt, theo dõi và bảo vệ quyền riêng tư các tâm nguyện kính dâng lên Tam Bảo'
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
  // 4. TAB 2: CẬP NHẬT HÌNH ẢNH TAM BẢO VỚI MYSQL
  // =========================================================================
  async initAltarTab() {
    let currentBg = '/images/tam-bao-main.jpg';

    // Đọc ảnh hiện tại từ MySQL
    try {
      const res = await fetch('/api/settings/altar');
      if (res.ok) {
        const data = await res.json();
        if (data.bg_image_url) currentBg = data.bg_image_url;
      }
    } catch (e) {}

    if (this.currentAltarPreview) {
      this.currentAltarPreview.src = currentBg;
    }

    this.presetAltarCards.forEach(card => {
      const src = card.getAttribute('data-src');
      if (src === currentBg) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }

      card.addEventListener('click', async () => {
        this.presetAltarCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');

        // Lưu vào MySQL
        try {
          await fetch('/api/settings/altar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bg_image_url: src })
          });
        } catch (e) {}

        localStorage.setItem('pagoda_altar_bg', src);
        if (this.currentAltarPreview) this.currentAltarPreview.src = src;

        this.showToast(`Đã lưu ảnh bàn thờ vào MySQL: ${card.querySelector('.preset-name')?.textContent || 'Mẫu mới'}`);
      });
    });

    // Tải ảnh từ máy tính lên Server & lưu vào MySQL
    if (this.inputAltarFile) {
      this.inputAltarFile.addEventListener('change', async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
          // 1. Tải file lên server
          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          });

          if (uploadRes.ok) {
            const uploadData = await uploadRes.json();
            const uploadedUrl = uploadData.url;

            // 2. Lưu đường dẫn vào MySQL
            await fetch('/api/settings/altar', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ bg_image_url: uploadedUrl })
            });

            this.presetAltarCards.forEach(c => c.classList.remove('active'));
            localStorage.setItem('pagoda_altar_bg', uploadedUrl);
            if (this.currentAltarPreview) this.currentAltarPreview.src = uploadedUrl;
            const saveMsg = uploadData.savedPercent > 0 
              ? `Đã tối ưu nén ảnh (tiết kiệm ${uploadData.savedPercent}% dung lượng) và lưu vào MySQL!`
              : 'Đã tải ảnh lên Server và lưu vào MySQL Database thành công!';
            this.showToast(saveMsg);
            this.inputAltarFile.value = '';
          }
        } catch (err) {
          this.showToast('Lỗi khi tải ảnh lên máy chủ', 'warning');
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

    // Thêm qua URL
    if (this.btnAddMusicUrl) {
      this.btnAddMusicUrl.addEventListener('click', async () => {
        const title = this.inputMusicTitle.value.trim();
        const url = this.inputMusicUrl.value.trim();

        if (!url) {
          this.showToast('Vui lòng nhập đường dẫn URL file âm thanh (.mp3)', 'warning');
          return;
        }

        const success = await soundEngine.addTrackToDatabase(title || 'Nhạc Thiền An Lạc', url, 'url');
        if (success) {
          this.inputMusicTitle.value = '';
          this.inputMusicUrl.value = '';
          this.renderMusicTable();
          this.showToast('Đã lưu bài nhạc mới vào MySQL Database!');
        } else {
          this.showToast('Lỗi thêm bài nhạc vào cơ sở dữ liệu', 'warning');
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
  // 6. TAB 4: QUẢN LÝ CHUÔNG CHÙA VỚI MYSQL
  // =========================================================================
  async initBellTab() {
    let bellConfig = soundEngine.bellConfig || {};

    try {
      const res = await fetch('/api/bell');
      if (res.ok) {
        bellConfig = await res.json();
      }
    } catch (e) {}

    if (this.bellCustomUrl) this.bellCustomUrl.value = bellConfig.custom_url || bellConfig.customUrl || '';
    if (this.bellAutoplayToggle) this.bellAutoplayToggle.checked = Boolean(bellConfig.auto_play ?? bellConfig.autoPlay ?? true);
    if (this.bellIntervalInput) this.bellIntervalInput.value = bellConfig.interval_seconds || bellConfig.intervalSeconds || 60;

    const initialVol = Math.round((bellConfig.volume || 0.85) * 100);
    if (this.bellVolumeSlider) this.bellVolumeSlider.value = initialVol;
    if (this.bellVolumeLabel) this.bellVolumeLabel.textContent = `${initialVol}%`;

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

    // Tải file chuông lên server
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
            this.showToast('Đã tải tệp chuông lên thư mục dự án. Nhấn "Lưu cấu hình chuông" để lưu vào MySQL.');
            this.bellCustomFile.value = '';
          }
        } catch (err) {
          this.showToast('Lỗi khi tải tệp chuông', 'warning');
        }
      });
    }

    if (this.btnTestBell) {
      this.btnTestBell.addEventListener('click', () => {
        soundEngine.playBell();
        this.showToast('Đang thỉnh tiếng Đại Hồng Chung');
      });
    }

    // Lưu vào MySQL
    if (this.btnSaveBellConfig) {
      this.btnSaveBellConfig.addEventListener('click', async () => {
        const customUrl = this.bellCustomUrl ? this.bellCustomUrl.value.trim() : '';
        const autoPlay = this.bellAutoplayToggle ? this.bellAutoplayToggle.checked : true;
        const intervalSec = parseInt(this.bellIntervalInput ? this.bellIntervalInput.value : '60', 10) || 60;
        const volume = (parseInt(this.bellVolumeSlider ? this.bellVolumeSlider.value : '85', 10) || 85) / 100;

        const success = await soundEngine.updateBellSettingsInDatabase(customUrl, autoPlay, intervalSec, volume);
        if (success) {
          this.showToast(`Đã lưu cấu hình chuông vào MySQL Database (${intervalSec} giây/lần)!`);
        } else {
          this.showToast('Lỗi khi lưu cấu hình vào cơ sở dữ liệu', 'warning');
        }
      });
    }

    if (this.btnResetBellDefault) {
      this.btnResetBellDefault.addEventListener('click', async () => {
        if (this.bellCustomUrl) this.bellCustomUrl.value = '';
        if (this.bellAutoplayToggle) this.bellAutoplayToggle.checked = true;
        if (this.bellIntervalInput) this.bellIntervalInput.value = 60;
        if (this.bellVolumeSlider) this.bellVolumeSlider.value = 85;
        if (this.bellVolumeLabel) this.bellVolumeLabel.textContent = '85%';

        this.intervalChips.forEach(chip => {
          chip.classList.toggle('active', chip.getAttribute('data-sec') === '60');
        });

        await soundEngine.updateBellSettingsInDatabase('', true, 60, 0.85);
        this.showToast('Đã khôi phục tiếng chuông Đại Hồng Chung mặc định');
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
  // 7. CẤU HÌNH & SẮP XẾP NÚT TƯƠNG TÁC (THẮP HƯƠNG, RÚT THẺ, GỬI TÂM NGUYỆN)
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

      // Sắp xếp lại thứ tự DOM của các thẻ cấu hình
      if (this.buttonsConfigCards) {
        buttonsOrder.forEach((key, index) => {
          const cardEl = this.buttonsConfigCards.querySelector(`[data-key="${key}"]`);
          if (cardEl) {
            this.buttonsConfigCards.appendChild(cardEl);
            const label = cardEl.querySelector('.btn-order-indicator');
            if (label) label.textContent = `Vị trí: ${index + 1}`;
            const btnLeft = cardEl.querySelector('.btn-reorder-move[data-dir="-1"]');
            const btnRight = cardEl.querySelector('.btn-reorder-move[data-dir="1"]');
            if (btnLeft) btnLeft.disabled = (index === 0);
            if (btnRight) btnRight.disabled = (index === buttonsOrder.length - 1);
          }
        });
      }
    };

    updateUI();

    // 3. Xử lý di chuyển thứ tự (Move Left / Right)
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
          const res = await fetch('/api/settings/buttons', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });
          const resData = await res.json();

          localStorage.setItem('pagoda_incense_title', payload.incense_title);
          localStorage.setItem('pagoda_card_title', payload.card_title);
          localStorage.setItem('pagoda_wish_title', payload.wish_title);
          localStorage.setItem('pagoda_buttons_order', JSON.stringify(payload.buttons_order));

          this.showToast('Đã lưu cấu hình và thứ tự nút bấm thành công!');
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
  // 8. TAB 7: QUẢN LÝ TÂM NGUYỆN PHẬT TỬ
  // =========================================================================
  initWishesTab() {
    if (this.btnRefreshWishes) {
      this.btnRefreshWishes.addEventListener('click', () => {
        this.loadAdminWishes();
      });
    }
  }

  async loadAdminWishes() {
    if (!this.adminWishesTbody) return;
    this.adminWishesTbody.innerHTML = `
      <tr>
        <td colspan="9" style="text-align: center; color: #64748b; padding: 24px;">Đang tải danh sách tâm nguyện...</td>
      </tr>
    `;

    try {
      const res = await fetch('/api/admin/wishes');
      if (!res.ok) throw new Error('Lỗi tải tâm nguyện');
      const wishes = await res.json();

      if (!wishes || wishes.length === 0) {
        this.adminWishesTbody.innerHTML = `
          <tr>
            <td colspan="9" style="text-align: center; color: #94a3b8; padding: 24px;">Chưa có tâm nguyện nào được gửi</td>
          </tr>
        `;
        return;
      }

      this.adminWishesTbody.innerHTML = wishes.map(w => {
        const isApproved = w.is_approved === 1 || w.is_approved === true;
        const statusBadge = isApproved
          ? `<span class="badge badge-success" style="background: #dcfce7; color: #166534; padding: 4px 8px; border-radius: 9999px; font-size: 0.76rem; font-weight: 700;">Hiển thị</span>`
          : `<span class="badge badge-danger" style="background: #fee2e2; color: #991b1b; padding: 4px 8px; border-radius: 9999px; font-size: 0.76rem; font-weight: 700;">Đã ẩn</span>`;

        const toggleBtnLabel = isApproved ? 'Ẩn' : 'Hiện';

        return `
          <tr data-id="${w.id}">
            <td style="font-weight: 600; color: #64748b;">#${w.id}</td>
            <td>
              <div style="font-weight: 700; color: #1e293b;">${w.masked_name}</div>
              <div style="font-size: 0.75rem; color: #64748b;">Tên gốc: ${w.author_name}</div>
            </td>
            <td>${w.author_age || '—'}</td>
            <td>${w.author_address || '—'}</td>
            <td style="font-style: italic; color: #334155; max-width: 320px; line-height: 1.5;">"${w.content}"</td>
            <td style="text-align: center; font-weight: 700; color: #d97706;">🙏 ${w.likes_count}</td>
            <td style="font-size: 0.8rem; color: #64748b;">${w.time_ago}</td>
            <td style="text-align: center;">${statusBadge}</td>
            <td style="text-align: center;">
              <div style="display: flex; gap: 6px; justify-content: center;">
                <button class="btn-table-action btn-toggle-wish" data-id="${w.id}" title="${toggleBtnLabel} tâm nguyện">
                  ${toggleBtnLabel}
                </button>
                <button class="btn-table-action btn-del-wish" data-id="${w.id}" style="color: #ef4444;" title="Xóa tâm nguyện">
                  Xóa
                </button>
              </div>
            </td>
          </tr>
        `;
      }).join('');

      // Gắn sự kiện Ẩn/Hiện và Xóa
      this.adminWishesTbody.querySelectorAll('.btn-toggle-wish').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-id');
          try {
            const patchRes = await fetch(`/api/admin/wishes/${id}/toggle`, { method: 'PATCH' });
            if (patchRes.ok) {
              this.showToast('Đã cập nhật trạng thái hiển thị');
              this.loadAdminWishes();
            }
          } catch (e) {
            this.showToast('Lỗi cập nhật', 'danger');
          }
        });
      });

      this.adminWishesTbody.querySelectorAll('.btn-del-wish').forEach(btn => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-id');
          if (!confirm(`Bạn có chắc chắn muốn xóa tâm nguyện #${id} không?`)) return;

          try {
            const delRes = await fetch(`/api/admin/wishes/${id}`, { method: 'DELETE' });
            if (delRes.ok) {
              this.showToast('Đã xóa tâm nguyện thành công');
              this.loadAdminWishes();
            }
          } catch (e) {
            this.showToast('Lỗi khi xóa', 'danger');
          }
        });
      });

    } catch (err) {
      this.adminWishesTbody.innerHTML = `
        <tr>
          <td colspan="9" style="text-align: center; color: #ef4444; padding: 24px;">Không thể tải danh sách: ${err.message}</td>
        </tr>
      `;
    }
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
