import './style.css';
import { soundEngine } from './audio.js';
import { TempleMistSystem } from './templeMist.js';
import { IncenseOfferingRitual } from './incenseOffering.js';
import { AnalyticsTracker } from './analytics.js';
import { PRAYERS } from './prayers.js';

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

    // Nút chức năng chính
    this.btnOfferIncense = document.getElementById('btn-offer-incense');
    this.btnDrawCard = document.getElementById('btn-draw-card');

    // Modal Thiệp Cầu An & HUD
    this.ritualHud = document.getElementById('ritual-status-hud');
    this.ritualChantText = document.getElementById('ritual-chant-text');
    this.blessingModal = document.getElementById('blessing-modal');
    this.btnCloseBlessing = document.getElementById('btn-close-blessing');
    this.btnConfirmBlessing = document.getElementById('btn-confirm-blessing');
    this.btnDrawAnother = document.getElementById('btn-draw-another');

    // Controllers
    this.mistSystem = null;
    this.incenseRitual = null;

    this.init();
  }

  async init() {
    // 1. Ghi nhận lượt truy cập trực tiếp vào MySQL Database
    AnalyticsTracker.trackVisit();

    await this.applyAltarSettingsFromDatabase();

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
    this.setupStorageSync();
    this.setupKeyboardShortcuts();

    this.startLoop();
  }

  // 1. ÁP DỤNG HÌNH NỀN VÀ FLARE TỪ MYSQL DATABASE
  async applyAltarSettingsFromDatabase() {
    let bgUrl = localStorage.getItem('pagoda_altar_bg') || '/images/tam-bao-main.jpg';
    let flareX = parseFloat(localStorage.getItem('pagoda_flare_x') || '50');
    let flareY = parseFloat(localStorage.getItem('pagoda_flare_y') || '26.5');
    let flareOpacity = parseFloat(localStorage.getItem('pagoda_flare_opacity') || '70');
    let flareSize = parseFloat(localStorage.getItem('pagoda_flare_size') || '480');

    try {
      const res = await fetch('/api/settings/altar');
      if (res.ok) {
        const data = await res.json();
        if (data.bg_image_url) bgUrl = data.bg_image_url;
        if (data.flare_x !== undefined) flareX = data.flare_x;
        if (data.flare_y !== undefined) flareY = data.flare_y;
        if (data.flare_opacity !== undefined) flareOpacity = data.flare_opacity;
        if (data.flare_size !== undefined) flareSize = data.flare_size;
      }
    } catch (e) {}

    if (this.bgEl) {
      this.bgEl.style.backgroundImage = `url('${bgUrl}')`;
    }
    this.renderFlare(flareX, flareY, flareOpacity, flareSize);
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
      if (e.key === 'pagoda_altar_bg') {
        if (this.bgEl) this.bgEl.style.backgroundImage = `url('${e.newValue}')`;
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
      }
    });
  }

  // 2. ĐIỀU KHIỂN ÂM LƯỢNG (TĂNG / GIẢM & BẬT / TẮT)
  setupAudioControls() {
    let hasInteracted = false;

    const initialVol = Math.round((soundEngine.volume || 0.75) * 100);
    if (this.volumeSlider) this.volumeSlider.value = initialVol;
    if (this.volumePercent) this.volumePercent.textContent = `${initialVol}%`;

    const startAudioOnFirstInteraction = () => {
      if (hasInteracted) return;
      hasInteracted = true;
      soundEngine.ensureContext();
      if (!soundEngine.isAmbientPlaying && !soundEngine.isMuted) {
        soundEngine.startAmbient();
      }
    };

    window.addEventListener('pointerdown', startAudioOnFirstInteraction, { once: true });
    window.addEventListener('keydown', startAudioOnFirstInteraction, { once: true });

    if (this.btnVolumeToggle) {
      this.btnVolumeToggle.addEventListener('click', () => {
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

  // 3. NGHI THỨC THẮP NÉN HƯƠNG THƠM (FPOV)
  setupRitualEvents() {
    if (this.btnOfferIncense) {
      this.btnOfferIncense.addEventListener('click', () => {
        if (!this.incenseRitual || this.incenseRitual.isOffering) return;

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
        soundEngine.playChime();
        // Ghi nhận sự kiện rút thẻ cầu an vào MySQL
        AnalyticsTracker.trackBlessing();
        this.openBlessingModal();
      });
    }
  }

  // 4. THIỆP CẦU AN & LỜI PHẬT DẠY
  setupBlessingModalEvents() {
    if (this.btnCloseBlessing) {
      this.btnCloseBlessing.addEventListener('click', () => {
        if (this.blessingModal) this.blessingModal.style.display = 'none';
      });
    }

    if (this.btnConfirmBlessing) {
      this.btnConfirmBlessing.addEventListener('click', () => {
        if (this.blessingModal) this.blessingModal.style.display = 'none';
      });
    }

    if (this.btnDrawAnother) {
      this.btnDrawAnother.addEventListener('click', () => {
        soundEngine.playChime();
        AnalyticsTracker.trackBlessing();
        this.showRandomPrayer();
      });
    }
  }

  openBlessingModal() {
    this.showRandomPrayer();
    if (this.blessingModal) this.blessingModal.style.display = 'flex';
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

  // 5. PHÍM TẮT TIỆN LỢI
  setupKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;

      if (e.code === 'KeyM') {
        if (this.btnVolumeToggle) this.btnVolumeToggle.click();
      } else if (e.code === 'KeyH') {
        if (this.btnOfferIncense && !this.btnOfferIncense.disabled) {
          this.btnOfferIncense.click();
        }
      } else if (e.code === 'KeyR') {
        if (this.btnDrawCard) this.btnDrawCard.click();
      } else if (e.code === 'Escape') {
        if (this.blessingModal) this.blessingModal.style.display = 'none';
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
