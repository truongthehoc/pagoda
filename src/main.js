import './style.css';
import { soundEngine } from './audio.js';
import { TempleMistSystem } from './templeMist.js';
import { IncenseOfferingRitual } from './incenseOffering.js';
import { AnalyticsTracker } from './analytics.js';
import { PRAYERS } from './prayers.js';
import confetti from 'canvas-confetti';

class PagodaMainApp {
  constructor() {
    this.bgEl = document.getElementById('tam-bao-bg');
    this.mistCanvas = document.getElementById('mist-canvas');
    this.incenseCanvas = document.getElementById('incense-canvas');
    this.flareEl = document.getElementById('buddha-flare');

    // Nút điều khiển âm lượng
    this.btnVolumeToggle = document.getElementById('btn-volume-toggle');
    this.volumeIcon = document.getElementById('volume-icon');
    this.volumeSlider = document.getElementById('volume-slider');
    this.volumePercent = document.getElementById('volume-percent');

    // Thanh công cụ đáy
    this.mainActionBar = document.getElementById('main-action-bar');

    // Nút chức năng chính (3 nút dưới đáy màn hình)
    this.btnOfferIncense = document.getElementById('btn-offer-incense');
    this.btnDrawCard = document.getElementById('btn-draw-card');
    this.btnOpenWish = document.getElementById('btn-open-wish');
    this.incenseBtnTitle = document.getElementById('incense-btn-title');
    this.cardBtnTitle = document.getElementById('card-btn-title');
    this.wishBtnTitle = document.getElementById('wish-btn-title');

    // Biểu tượng Tâm Nguyện góc trái & Khung danh sách Tâm Nguyện Side Panel
    this.btnTopWishes = document.getElementById('btn-top-wishes');
    this.topWishesBadge = document.getElementById('top-wishes-badge');
    this.wishesSidePanel = document.getElementById('wishes-side-panel');
    this.btnCloseSideWishes = document.getElementById('btn-close-side-wishes');
    this.btnRefreshSideWishes = document.getElementById('btn-refresh-side-wishes');
    this.btnSideWriteWish = document.getElementById('btn-side-write-wish');
    this.sideWishesList = document.getElementById('side-wishes-list');
    this.sidePanelCountLabel = document.getElementById('side-panel-count-label');

    // Modal Thiệp Cầu An & HUD
    this.ritualHud = document.getElementById('ritual-status-hud');
    this.ritualChantText = document.getElementById('ritual-chant-text');
    this.blessingModal = document.getElementById('blessing-modal');
    this.btnCloseBlessing = document.getElementById('btn-close-blessing');
    this.btnConfirmBlessing = document.getElementById('btn-confirm-blessing');
    this.btnDrawAnother = document.getElementById('btn-draw-another');
    this.btnBlessingToWish = document.getElementById('btn-blessing-to-wish');

    // 1. Modal Kính Dâng Tâm Nguyện (Form)
    this.wishModal = document.getElementById('wish-modal');
    this.btnCloseWish = document.getElementById('btn-close-wish');
    this.formSubmitWish = document.getElementById('form-submit-wish');
    this.wishInputContent = document.getElementById('wish-input-content');
    this.wishCharCount = document.getElementById('wish-char-count');
    this.wishInputName = document.getElementById('wish-input-name');
    this.wishInputAge = document.getElementById('wish-input-age');
    this.wishInputAddress = document.getElementById('wish-input-address');
    this.btnSubmitWish = document.getElementById('btn-submit-wish');
    this.wishSuccessState = document.getElementById('wish-success-state');
    this.btnViewPrayersWall = document.getElementById('btn-view-prayers-wall');
    this.btnWriteAnotherWish = document.getElementById('btn-write-another-wish');
    this.btnOpenWallFromWrite = document.getElementById('btn-open-wall-from-write');
    this.wishWriteBadgeCount = document.getElementById('wish-write-badge-count');

    // 2. Modal Dòng Tâm Nguyện (Danh sách)
    this.wishesWallModal = document.getElementById('wishes-wall-modal');
    this.btnCloseWall = document.getElementById('btn-close-wall');
    this.wishesListContainer = document.getElementById('wishes-list-container');
    this.btnSwitchToWrite = document.getElementById('btn-switch-to-write');

    // Controllers
    this.mistSystem = null;
    this.incenseRitual = null;

    this.init();
  }

  async init() {
    // 1. Ghi nhận lượt truy cập trực tiếp vào MySQL Database
    AnalyticsTracker.trackVisit();

    await this.applyAltarSettingsFromDatabase();
    await this.applyButtonSettingsFromDatabase();

    // Khởi tạo hệ thống sương khói trầm hương & bụi vàng
    if (this.mistCanvas) {
      this.mistSystem = new TempleMistSystem(this.mistCanvas);
    }

    // Khởi tạo hoạt ảnh dâng hương FPOV
    if (this.incenseCanvas) {
      this.incenseRitual = new IncenseOfferingRitual(this.incenseCanvas);
    }

    this.setupAudioControls();
    this.setupRitualEvents();
    this.setupBlessingModalEvents();
    this.setupWishEvents();
    this.loadWishesList();
    this.loadSideWishesList();
    this.setupStorageSync();
    this.setupKeyboardShortcuts();

    this.startLoop();
  }

  // 1. ÁP DỤNG HÌNH NỀN VÀ FLARE TỪ MYSQL DATABASE (HỖ TRỢ PC & MOBILE RIÊNG HOẶC DÙNG CHUNG)
  async applyAltarSettingsFromDatabase() {
    let bgUrl = localStorage.getItem('pagoda_altar_bg') || '/images/tam-bao-main.jpg';
    let bgMobileUrl = localStorage.getItem('pagoda_altar_mobile_bg') || localStorage.getItem('pagoda_altar_bg_mobile') || null;
    let usePcForMobile = localStorage.getItem('pagoda_use_pc_for_mobile') !== 'false';
    let flareX = parseFloat(localStorage.getItem('pagoda_flare_x') || '50');
    let flareY = parseFloat(localStorage.getItem('pagoda_flare_y') || '26.5');
    let flareOpacity = parseFloat(localStorage.getItem('pagoda_flare_opacity') || '70');
    let flareSize = parseFloat(localStorage.getItem('pagoda_flare_size') || '480');

    // Hiển thị ngay ảnh nền từ cache / mặc định để tránh màn hình trống
    this.altarSettings = { bgUrl, bgMobileUrl, usePcForMobile, flareX, flareY, flareOpacity, flareSize };
    this.updateAltarBackground();
    this.renderFlare(flareX, flareY, flareOpacity, flareSize);

    try {
      const res = await fetch('/api/settings/altar');
      if (res.ok) {
        const data = await res.json();
        if (data.bg_image_url) bgUrl = data.bg_image_url;
        if (data.bg_image_mobile_url !== undefined) bgMobileUrl = data.bg_image_mobile_url;
        if (data.use_pc_for_mobile !== undefined) usePcForMobile = Boolean(data.use_pc_for_mobile);
        if (data.flare_x !== undefined) flareX = data.flare_x;
        if (data.flare_y !== undefined) flareY = data.flare_y;
        if (data.flare_opacity !== undefined) flareOpacity = data.flare_opacity;
        if (data.flare_size !== undefined) flareSize = data.flare_size;

        localStorage.setItem('pagoda_altar_bg', bgUrl);
        if (bgMobileUrl) {
          localStorage.setItem('pagoda_altar_mobile_bg', bgMobileUrl);
          localStorage.setItem('pagoda_altar_bg_mobile', bgMobileUrl);
        } else {
          localStorage.removeItem('pagoda_altar_mobile_bg');
          localStorage.removeItem('pagoda_altar_bg_mobile');
        }
        localStorage.setItem('pagoda_use_pc_for_mobile', usePcForMobile ? 'true' : 'false');

        this.altarSettings = { bgUrl, bgMobileUrl, usePcForMobile, flareX, flareY, flareOpacity, flareSize };
        this.updateAltarBackground();
        this.renderFlare(flareX, flareY, flareOpacity, flareSize);
      }
    } catch (e) {}

    // Lắng nghe thay đổi kích thước màn hình để tự động đổi ảnh nền PC / Mobile
    window.addEventListener('resize', () => {
      this.updateAltarBackground();
    });
  }

  updateAltarBackground() {
    if (!this.bgEl) return;
    const isMobile = window.innerWidth <= 768;
    const { bgUrl, bgMobileUrl, usePcForMobile } = this.altarSettings || {};

    let finalBg = (bgUrl && String(bgUrl).trim()) ? bgUrl : '/images/tam-bao-main.jpg';
    if (isMobile && !usePcForMobile && bgMobileUrl && String(bgMobileUrl).trim()) {
      finalBg = bgMobileUrl;
    }
    if (!finalBg || finalBg === 'null' || finalBg === 'undefined') {
      finalBg = '/images/tam-bao-main.jpg';
    }
    this.bgEl.style.backgroundImage = `url('${finalBg}')`;
  }

  // 1.1 ÁP DỤNG CẤU HÌNH VĂN BẢN VÀ VỊ TRÍ NÚT TƯƠNG TÁC TỪ DATABASE
  async applyButtonSettingsFromDatabase() {
    let incenseTitle = localStorage.getItem('pagoda_incense_title') || 'THẮP NÉN HƯƠNG THƠM';
    let cardTitle = localStorage.getItem('pagoda_card_title') || 'RÚT THẺ CẦU AN';
    let wishTitle = localStorage.getItem('pagoda_wish_title') || 'GỬI TÂM NGUYỆN';
    let buttonsOrder = ['incense', 'card', 'wish'];

    try {
      const cachedOrder = localStorage.getItem('pagoda_buttons_order');
      if (cachedOrder) {
        buttonsOrder = JSON.parse(cachedOrder);
      }
    } catch (_) {}

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

        localStorage.setItem('pagoda_incense_title', incenseTitle);
        localStorage.setItem('pagoda_card_title', cardTitle);
        localStorage.setItem('pagoda_wish_title', wishTitle);
        localStorage.setItem('pagoda_buttons_order', JSON.stringify(buttonsOrder));
      }
    } catch (_) {}

    this.renderButtonsConfiguration(incenseTitle, cardTitle, wishTitle, buttonsOrder);
  }

  renderButtonsConfiguration(incenseTitle, cardTitle, wishTitle, buttonsOrder) {
    if (this.incenseBtnTitle) this.incenseBtnTitle.textContent = incenseTitle;
    if (this.cardBtnTitle) this.cardBtnTitle.textContent = cardTitle;
    if (this.wishBtnTitle) this.wishBtnTitle.textContent = wishTitle;

    // Sắp xếp lại thứ tự DOM các nút theo buttonsOrder
    const orderMap = {
      incense: this.btnOfferIncense,
      card: this.btnDrawCard,
      wish: this.btnOpenWish
    };

    if (Array.isArray(buttonsOrder) && this.mainActionBar) {
      buttonsOrder.forEach(key => {
        if (orderMap[key]) {
          this.mainActionBar.appendChild(orderMap[key]);
        }
      });
    }
  }

  renderFlare(x, y, opacity, size) {
    if (!this.flareEl) return;
    this.flareEl.style.left = `${x}%`;
    this.flareEl.style.top = `${y}%`;
    this.flareEl.style.opacity = (opacity / 100).toString();
    this.flareEl.style.width = `${size}px`;
    this.flareEl.style.height = `${size}px`;
  }

  setupStorageSync() {
    window.addEventListener('storage', (e) => {
      if (
        e.key === 'pagoda_altar_bg' || 
        e.key === 'pagoda_altar_bg_mobile' || 
        e.key === 'pagoda_altar_mobile_bg' ||
        e.key === 'pagoda_use_pc_for_mobile'
      ) {
        if (this.altarSettings) {
          this.altarSettings.bgUrl = localStorage.getItem('pagoda_altar_bg') || '/images/tam-bao-main.jpg';
          this.altarSettings.bgMobileUrl = localStorage.getItem('pagoda_altar_mobile_bg') || localStorage.getItem('pagoda_altar_bg_mobile') || null;
          this.altarSettings.usePcForMobile = localStorage.getItem('pagoda_use_pc_for_mobile') !== 'false';
          this.updateAltarBackground();
        }
      } else if (
        e.key === 'pagoda_flare_x' ||
        e.key === 'pagoda_flare_y' ||
        e.key === 'pagoda_flare_opacity' ||
        e.key === 'pagoda_flare_size'
      ) {
        const x = parseFloat(localStorage.getItem('pagoda_flare_x') || '50');
        const y = parseFloat(localStorage.getItem('pagoda_flare_y') || '26.5');
        const opacity = parseFloat(localStorage.getItem('pagoda_flare_opacity') || '70');
        const size = parseFloat(localStorage.getItem('pagoda_flare_size') || '480');
        this.renderFlare(x, y, opacity, size);
      } else if (
        e.key === 'pagoda_incense_title' ||
        e.key === 'pagoda_card_title' ||
        e.key === 'pagoda_wish_title' ||
        e.key === 'pagoda_buttons_order'
      ) {
        let buttonsOrder = ['incense', 'card', 'wish'];
        try {
          const cached = localStorage.getItem('pagoda_buttons_order');
          if (cached) buttonsOrder = JSON.parse(cached);
        } catch (_) {}
        this.renderButtonsConfiguration(
          localStorage.getItem('pagoda_incense_title') || 'THẮP NÉN HƯƠNG THƠM',
          localStorage.getItem('pagoda_card_title') || 'RÚT THẺ CẦU AN',
          localStorage.getItem('pagoda_wish_title') || 'GỬI TÂM NGUYỆN',
          buttonsOrder
        );
      }
    });
  }

  // 2. ĐIỀU KHIỂN ÂM LƯỢNG (TĂNG / GIẢM & BẬT / TẮT & TỰ ĐỘNG PHÁT MOBILE)
  setupAudioControls() {
    let hasInteracted = false;

    const initialVol = Math.round((soundEngine.volume || 0.75) * 100);
    if (this.volumeSlider) this.volumeSlider.value = initialVol;
    if (this.volumePercent) this.volumePercent.textContent = `${initialVol}%`;

    const startAudioOnFirstInteraction = () => {
      soundEngine.unlockMobileAudio();
      soundEngine.ensureContext();

      if (!hasInteracted) {
        hasInteracted = true;
        if (!soundEngine.isAmbientPlaying && !soundEngine.isMuted) {
          soundEngine.startAmbient();
        }
      }
    };

    // Bắt toàn bộ sự kiện chạm và nhấp trên di động và máy tính để mở khóa âm thanh
    ['touchstart', 'touchend', 'click', 'pointerdown', 'keydown'].forEach(evtType => {
      window.addEventListener(evtType, startAudioOnFirstInteraction, { passive: true, capture: true });
      document.addEventListener(evtType, startAudioOnFirstInteraction, { passive: true, capture: true });
    });

    if (this.btnVolumeToggle) {
      this.btnVolumeToggle.addEventListener('click', (e) => {
        e.stopPropagation();
        soundEngine.unlockMobileAudio();
        soundEngine.ensureContext();

        if (!soundEngine.isAmbientPlaying) {
          soundEngine.startAmbient();
        }

        const isUnmuted = soundEngine.toggleMute();
        if (this.volumeIcon) {
          this.volumeIcon.textContent = isUnmuted ? '🔊' : '🔇';
        }
        this.btnVolumeToggle.classList.toggle('muted', !isUnmuted);
      });
    }

    if (this.volumeSlider) {
      this.volumeSlider.addEventListener('input', (e) => {
        const val = parseInt(e.target.value, 10);
        soundEngine.unlockMobileAudio();
        soundEngine.ensureContext();
        if (!soundEngine.isAmbientPlaying) {
          soundEngine.startAmbient();
        }

        if (soundEngine.isMuted) {
          soundEngine.toggleMute();
          if (this.volumeIcon) this.volumeIcon.textContent = '🔊';
          if (this.btnVolumeToggle) this.btnVolumeToggle.classList.remove('muted');
        }

        soundEngine.setVolume(val / 100);
        if (this.volumePercent) this.volumePercent.textContent = `${val}%`;

        if (val === 0) {
          if (this.volumeIcon) this.volumeIcon.textContent = '🔇';
        } else {
          if (this.volumeIcon) this.volumeIcon.textContent = '🔊';
        }
      });
    }
  }

  // 3. NGHI THỨC THẮP NÉN HƯƠNG THƠM (FPOV) & TIẾNG MÕ GÕ KHI TƯƠNG TÁC
  setupRitualEvents() {
    if (this.btnOfferIncense) {
      this.btnOfferIncense.addEventListener('click', () => {
        if (!this.incenseRitual || this.incenseRitual.isOffering) return;

        // Gõ tiếng mõ ngay khi Phật tử bấm nút thắp hương
        try {
          soundEngine.unlockMobileAudio();
          soundEngine.playWoodenFish();
        } catch (_) {}

        this.btnOfferIncense.disabled = true;
        this.btnOfferIncense.style.opacity = '0.6';
        if (this.btnDrawCard) this.btnDrawCard.style.opacity = '0.6';

        if (this.ritualHud) this.ritualHud.style.display = 'block';

        // Ghi nhận sự kiện thắp hương vào MySQL
        AnalyticsTracker.trackOffering();

        this.incenseRitual.startOffering(
          (progress) => {
            if (this.ritualChantText) this.ritualChantText.textContent = progress.message;
          },
          () => {
            this.btnOfferIncense.disabled = false;
            this.btnOfferIncense.style.opacity = '1';
            if (this.btnDrawCard) this.btnDrawCard.style.opacity = '1';
            if (this.ritualHud) this.ritualHud.style.display = 'none';

            this.openBlessingModal();
          }
        );
      });
    }

    if (this.btnDrawCard) {
      this.btnDrawCard.addEventListener('click', () => {
        // Gõ tiếng mõ thanh tịnh và tiếng chuông khánh khi bấm rút thẻ cầu an
        try {
          soundEngine.unlockMobileAudio();
          soundEngine.playWoodenFish();
          soundEngine.playChime();
        } catch (_) {}

        // Ghi nhận sự kiện rút thẻ cầu an vào MySQL
        AnalyticsTracker.trackBlessing();
        this.openBlessingModal();
      });
    }
  }

  // 4. THIỆP CẦU AN & LỜI PHẬT DẠY
  setupBlessingModalEvents() {
    const closeModal = (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }
      if (this.blessingModal) {
        this.blessingModal.style.display = 'none';
      }
    };

    this.closeBlessingModal = closeModal;

    if (this.btnCloseBlessing) {
      this.btnCloseBlessing.addEventListener('click', closeModal);
      this.btnCloseBlessing.addEventListener('touchend', closeModal, { passive: false });
    }

    if (this.btnConfirmBlessing) {
      this.btnConfirmBlessing.addEventListener('click', closeModal);
      this.btnConfirmBlessing.addEventListener('touchend', closeModal, { passive: false });
    }

    if (this.blessingModal) {
      // Chạm hoặc click vào vùng nền tối bên ngoài thẻ để đóng modal nhanh
      this.blessingModal.addEventListener('click', (e) => {
        if (e.target === this.blessingModal) {
          closeModal(e);
        }
      });
      this.blessingModal.addEventListener('touchend', (e) => {
        if (e.target === this.blessingModal) {
          closeModal(e);
        }
      }, { passive: false });

      // Chặn sự kiện lan truyền khi chạm vào bên trong thẻ
      const cardEl = this.blessingModal.querySelector('.blessing-card');
      if (cardEl) {
        cardEl.addEventListener('click', (e) => e.stopPropagation());
        cardEl.addEventListener('touchend', (e) => e.stopPropagation());
      }
    }

    if (this.btnDrawAnother) {
      const handleDrawAnother = (e) => {
        if (e) {
          e.preventDefault();
          e.stopPropagation();
        }
        soundEngine.playChime();
        AnalyticsTracker.trackBlessing();
        this.showRandomPrayer();
      };
      this.btnDrawAnother.addEventListener('click', handleDrawAnother);
      this.btnDrawAnother.addEventListener('touchend', handleDrawAnother, { passive: false });
    }
  }

  openBlessingModal() {
    this.showRandomPrayer();
    if (this.blessingModal) {
      this.blessingModal.style.display = 'flex';
    }
  }

  showRandomPrayer() {
    const rand = PRAYERS[Math.floor(Math.random() * PRAYERS.length)];
    const titleEl = document.getElementById('blessing-title');
    const verseEl = document.getElementById('blessing-verse');
    const descEl = document.getElementById('blessing-desc');

    if (titleEl) titleEl.textContent = rand.title;
    if (verseEl) verseEl.textContent = rand.verse;
    if (descEl) descEl.textContent = rand.blessing;
  }

  // 4.1 HAI MODAL & SIDE PANEL TÂM NGUYỆN (FORM GỬI & DÒNG TÂM NGUYỆN KÍNH MỜ GÓC TRÁI)
  setupWishEvents() {
    const openWriteModal = () => {
      if (this.wishesWallModal) this.wishesWallModal.style.display = 'none';
      if (this.wishesSidePanel) this.wishesSidePanel.style.display = 'none';
      if (this.wishModal) {
        this.wishModal.style.display = 'flex';
        if (this.formSubmitWish) this.formSubmitWish.style.display = 'flex';
        if (this.wishSuccessState) this.wishSuccessState.style.display = 'none';
      }
    };

    const closeWriteModal = () => {
      if (this.wishModal) this.wishModal.style.display = 'none';
    };

    const openSidePanel = () => {
      if (this.wishModal) this.wishModal.style.display = 'none';
      if (this.wishesWallModal) this.wishesWallModal.style.display = 'none';
      if (this.wishesSidePanel) {
        this.wishesSidePanel.style.display = 'flex';
        this.loadSideWishesList();
      }
    };

    const closeSidePanel = () => {
      if (this.wishesSidePanel) this.wishesSidePanel.style.display = 'none';
    };

    const toggleSidePanel = () => {
      if (this.wishesSidePanel && this.wishesSidePanel.style.display === 'flex') {
        closeSidePanel();
      } else {
        openSidePanel();
      }
    };

    const openWallModal = () => {
      // Ưu tiên mở Side Panel góc trái để ngắm Chính Điện
      openSidePanel();
    };

    const closeWallModal = () => {
      if (this.wishesWallModal) this.wishesWallModal.style.display = 'none';
      closeSidePanel();
    };

    this.openWishWriteModal = openWriteModal;
    this.closeWishWriteModal = closeWriteModal;
    this.openSidePanel = openSidePanel;
    this.closeSidePanel = closeSidePanel;
    this.toggleSidePanel = toggleSidePanel;
    this.openWishesWallModal = openWallModal;
    this.closeWishesWallModal = closeWallModal;

    // Biểu tượng Tâm Nguyện góc trái
    if (this.btnTopWishes) {
      this.btnTopWishes.addEventListener('click', toggleSidePanel);
      this.btnTopWishes.addEventListener('touchend', (e) => {
        e.preventDefault();
        toggleSidePanel();
      });
    }

    // Các nút trong Khung Side Panel
    if (this.btnCloseSideWishes) {
      this.btnCloseSideWishes.addEventListener('click', closeSidePanel);
    }
    if (this.btnRefreshSideWishes) {
      this.btnRefreshSideWishes.addEventListener('click', () => this.loadSideWishesList());
    }
    if (this.btnSideWriteWish) {
      this.btnSideWriteWish.addEventListener('click', () => {
        closeSidePanel();
        openWriteModal();
      });
    }

    // Nút Gửi Tâm Nguyện ở thanh công cụ dưới đáy
    if (this.btnOpenWish) {
      this.btnOpenWish.addEventListener('click', openWriteModal);
      this.btnOpenWish.addEventListener('touchend', (e) => {
        e.preventDefault();
        openWriteModal();
      });
    }

    // Từ thẻ Cầu An mở Modal Gửi Tâm Nguyện
    if (this.btnBlessingToWish) {
      this.btnBlessingToWish.addEventListener('click', () => {
        if (this.blessingModal) this.blessingModal.style.display = 'none';
        openWriteModal();
      });
    }

    // Nút đóng Modal 1: Gửi Tâm Nguyện
    if (this.btnCloseWish) {
      this.btnCloseWish.addEventListener('click', closeWriteModal);
      this.btnCloseWish.addEventListener('touchend', (e) => {
        e.preventDefault();
        closeWriteModal();
      });
    }

    if (this.wishModal) {
      this.wishModal.addEventListener('click', (e) => {
        if (e.target === this.wishModal) closeWriteModal();
      });
      const card = this.wishModal.querySelector('.wish-card');
      if (card) {
        card.addEventListener('click', (e) => e.stopPropagation());
      }
    }

    // Nút đóng Modal 2: Dòng Tâm Nguyện
    if (this.btnCloseWall) {
      this.btnCloseWall.addEventListener('click', closeWallModal);
      this.btnCloseWall.addEventListener('touchend', (e) => {
        e.preventDefault();
        closeWallModal();
      });
    }

    if (this.wishesWallModal) {
      this.wishesWallModal.addEventListener('click', (e) => {
        if (e.target === this.wishesWallModal) closeWallModal();
      });
      const card = this.wishesWallModal.querySelector('.wishes-wall-card');
      if (card) {
        card.addEventListener('click', (e) => e.stopPropagation());
      }
    }

    // Chuyển từ Modal Viết sang Khung Dòng Tâm Nguyện
    if (this.btnOpenWallFromWrite) {
      this.btnOpenWallFromWrite.addEventListener('click', openSidePanel);
    }
    if (this.btnViewPrayersWall) {
      this.btnViewPrayersWall.addEventListener('click', openSidePanel);
    }

    // Chuyển từ Modal 2 sang Modal 1
    if (this.btnSwitchToWrite) {
      this.btnSwitchToWrite.addEventListener('click', openWriteModal);
    }

    if (this.btnWriteAnotherWish) {
      this.btnWriteAnotherWish.addEventListener('click', () => {
        if (this.formSubmitWish) this.formSubmitWish.style.display = 'flex';
        if (this.wishSuccessState) this.wishSuccessState.style.display = 'none';
        if (this.wishInputContent) {
          this.wishInputContent.value = '';
          this.wishInputContent.focus();
        }
        if (this.wishCharCount) this.wishCharCount.textContent = '0';
      });
    }

    // Đếm ký tự textarea
    if (this.wishInputContent && this.wishCharCount) {
      this.wishInputContent.addEventListener('input', () => {
        this.wishCharCount.textContent = this.wishInputContent.value.length;
      });
    }

    // Xử lý gửi tâm nguyện
    if (this.formSubmitWish) {
      this.formSubmitWish.addEventListener('submit', async (e) => {
        e.preventDefault();
        const content = this.wishInputContent ? this.wishInputContent.value.trim() : '';
        if (!content) return;

        const name = this.wishInputName ? this.wishInputName.value.trim() : '';
        const age = this.wishInputAge ? this.wishInputAge.value.trim() : '';
        const address = this.wishInputAddress ? this.wishInputAddress.value.trim() : '';

        const submitBtn = this.btnSubmitWish;
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.style.opacity = '0.6';
          submitBtn.innerHTML = '<span>Đang kính dâng lên Tam Bảo...</span>';
        }

        try {
          soundEngine.ensureContext();
          soundEngine.playChime();

          const res = await fetch('/api/wishes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              author_name: name,
              author_age: age,
              author_address: address,
              content
            })
          });

          // Hiệu ứng cánh hoa sen vàng chúc phúc bay bổng
          confetti({
            particleCount: 50,
            spread: 80,
            origin: { y: 0.55 },
            colors: ['#ffd700', '#f59e0b', '#fbbf24', '#ffffff'],
            zIndex: 2500
          });

          if (this.formSubmitWish) this.formSubmitWish.style.display = 'none';
          if (this.wishSuccessState) this.wishSuccessState.style.display = 'block';

          // Tải lại danh sách tâm nguyện và cập nhật badge
          await this.loadWishesList();
          await this.loadSideWishesList();
        } catch (err) {
          console.warn('Lỗi gửi tâm nguyện:', err);
          alert('Tâm nguyện đã được thành kính ghi nhận trong lòng!');
        } finally {
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.style.opacity = '1';
            submitBtn.innerHTML = '<span class="btn-wish-icon">🪷</span><span>Kính Dâng Lên Tam Bảo 🙏</span>';
          }
        }
      });
    }
  }

  async loadSideWishesList() {
    try {
      const res = await fetch('/api/wishes');
      if (res.ok) {
        const wishes = await res.json();
        this.renderSideWishesList(wishes);
        if (this.topWishesBadge) this.topWishesBadge.textContent = wishes.length;
        if (this.sidePanelCountLabel) this.sidePanelCountLabel.textContent = `${wishes.length} lời nguyện kính dâng Tam Bảo`;
        if (this.wishWriteBadgeCount) this.wishWriteBadgeCount.textContent = wishes.length;
      }
    } catch (e) {
      console.warn('Không tải được danh sách tâm nguyện side panel:', e);
    }
  }

  renderSideWishesList(wishes) {
    if (!this.sideWishesList) return;
    if (!wishes || wishes.length === 0) {
      this.sideWishesList.innerHTML = '<div class="wishes-empty">Chưa có tâm nguyện nào được gửi. Hãy là người đầu tiên kính dâng ước nguyện!</div>';
      return;
    }

    this.sideWishesList.innerHTML = wishes.map(wish => {
      const metaParts = [];
      if (wish.display_age) metaParts.push(wish.display_age);
      if (wish.display_address) metaParts.push(wish.display_address);
      const metaStr = metaParts.length > 0 ? ` • ${metaParts.join(' • ')}` : '';

      return `
        <div class="wish-item-card" data-id="${wish.id}">
          <div class="wish-item-header">
            <div class="wish-author-info">
              <span class="wish-author-name">🪷 ${wish.display_name}</span>
              <span class="wish-author-meta">${metaStr}</span>
            </div>
            <span class="wish-time-ago">${wish.time_ago}</span>
          </div>
          <p class="wish-item-body">"${wish.content}"</p>
          <div class="wish-item-footer">
            <button class="btn-like-wish" data-id="${wish.id}">
              <span class="like-icon">🙏</span>
              <span class="like-text">Chắp tay</span>
              <span class="like-count">(${wish.likes_count})</span>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Bắt sự kiện chắp tay cầu an (thích)
    this.sideWishesList.querySelectorAll('.btn-like-wish').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        if (btn.classList.contains('liked')) return;

        btn.classList.add('liked');
        soundEngine.ensureContext();
        soundEngine.playWoodenFish();

        try {
          const res = await fetch(`/api/wishes/${id}/like`, { method: 'POST' });
          if (res.ok) {
            const data = await res.json();
            const countEl = btn.querySelector('.like-count');
            if (countEl) countEl.textContent = `(${data.likes_count})`;
          }
        } catch (_) {}
      });
    });
  }

  async loadWishesList() {
    try {
      const res = await fetch('/api/wishes');
      if (res.ok) {
        const wishes = await res.json();
        this.renderWishesList(wishes);
        if (this.wishWriteBadgeCount) this.wishWriteBadgeCount.textContent = wishes.length;
      }
    } catch (e) {
      console.warn('Không tải được danh sách tâm nguyện:', e);
    }
  }

  renderWishesList(wishes) {
    if (!this.wishesListContainer) return;
    if (!wishes || wishes.length === 0) {
      this.wishesListContainer.innerHTML = '<div class="wishes-empty">Chưa có tâm nguyện nào được gửi. Hãy là người đầu tiên kính dâng ước nguyện!</div>';
      return;
    }

    this.wishesListContainer.innerHTML = wishes.map(wish => {
      const metaParts = [];
      if (wish.display_age) metaParts.push(wish.display_age);
      if (wish.display_address) metaParts.push(wish.display_address);
      const metaStr = metaParts.length > 0 ? ` • ${metaParts.join(' • ')}` : '';

      return `
        <div class="wish-item-card" data-id="${wish.id}">
          <div class="wish-item-header">
            <div class="wish-author-info">
              <span class="wish-author-name">🪷 ${wish.display_name}</span>
              <span class="wish-author-meta">${metaStr}</span>
            </div>
            <span class="wish-time-ago">${wish.time_ago}</span>
          </div>
          <p class="wish-item-body">"${wish.content}"</p>
          <div class="wish-item-footer">
            <button class="btn-like-wish" data-id="${wish.id}">
              <span class="like-icon">🙏</span>
              <span class="like-text">Chắp tay cầu an</span>
              <span class="like-count">(${wish.likes_count})</span>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Bắt sự kiện chắp tay cầu an (thích)
    this.wishesListContainer.querySelectorAll('.btn-like-wish').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        if (btn.classList.contains('liked')) return;

        btn.classList.add('liked');
        soundEngine.ensureContext();
        soundEngine.playWoodenFish();

        try {
          const res = await fetch(`/api/wishes/${id}/like`, { method: 'POST' });
          if (res.ok) {
            const data = await res.json();
            const countEl = btn.querySelector('.like-count');
            if (countEl) countEl.textContent = `(${data.likes_count})`;
          }
        } catch (_) {}
      });
    });
  }

  // 5. PHÍM TẮT TIỆN LỢI
  setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.wishesSidePanel && this.wishesSidePanel.style.display !== 'none') {
          this.closeSidePanel();
          return;
        }
        if (this.wishModal && this.wishModal.style.display !== 'none') {
          this.closeWishWriteModal();
          return;
        }
        if (this.wishesWallModal && this.wishesWallModal.style.display !== 'none') {
          this.closeWishesWallModal();
          return;
        }
        if (this.blessingModal && this.blessingModal.style.display !== 'none') {
          this.closeBlessingModal();
          return;
        }
      }

      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.code === 'KeyM') {
        if (this.btnVolumeToggle) this.btnVolumeToggle.click();
      } else if (e.code === 'KeyH') {
        if (this.btnOfferIncense && !this.btnOfferIncense.disabled) {
          this.btnOfferIncense.click();
        }
      } else if (e.code === 'KeyR') {
        if (this.btnDrawCard) this.btnDrawCard.click();
      } else if (e.code === 'KeyT') {
        if (this.btnOpenWish) this.btnOpenWish.click();
      }
    });
  }

  // 6. VÒNG LẶP RENDER CHÍNH (60 FPS)
  startLoop() {
    const render = () => {
      if (this.mistSystem) {
        this.mistSystem.updateAndRender();
      }
      if (this.incenseRitual) {
        this.incenseRitual.updateAndRender();
      }
      requestAnimationFrame(render);
    };
    render();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  new PagodaMainApp();
});
