// Hệ thống âm thanh tâm linh & Quản lý phát nhạc / Chuông chùa kết nối MySQL
class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.ambientGain = null;
    this.isMuted = false;
    this.isAmbientPlaying = false;
    this.ambientOscillators = [];
    this.ambientTimer = null;
    this.bellIntervalTimer = null;
    this.synthCycleTimer = null;
    this.initialized = false;
    this.isMobileUnlocked = false;

    // Âm lượng mặc định (0.0 đến 1.0)
    this.volume = parseFloat(localStorage.getItem('pagoda_volume') || '0.75');

    // Cấu hình chuông chùa (Đại Hồng Chung)
    this.bellConfig = {
      customUrl: '',
      autoPlay: true,
      intervalSeconds: 60,
      volume: 0.85
    };

    // Cấu hình tiếng Mõ chùa (Wooden Fish)
    this.woodenFishConfig = {
      customUrl: '',
      volume: 0.90
    };

    // Custom audio player cho nhạc thiền
    this.customAudio = new Audio();
    this.customAudio.loop = false; // Phát tuần tự danh sách
    this.customAudio.addEventListener('ended', () => {
      this.playNextTrack();
    });

    // Custom bell audio player cho chuông
    this.customBellAudio = new Audio();

    // Custom wooden fish audio player cho tiếng mõ
    this.customWoodenFishAudio = new Audio();

    // Danh sách nhạc thiền
    this.playlist = [
      {
        id: 'track-1',
        title: 'Tiếng Trúc & Suối Nước Chốn Thiền Môn',
        type: 'url',
        url: 'https://cdn.pixabay.com/download/audio/2022/05/16/audio_db6591201e.mp3?filename=meditation-flute-22533.mp3'
      },
      {
        id: 'track-2',
        title: 'Nhạc Thiền An Lạc Thư Thái',
        type: 'url',
        url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=relaxing-meditation-10940.mp3'
      },
      {
        id: 'track-synth',
        title: 'Sóng Âm Thiền Định & Bát Xoay Tây Tạng (Tự Nhiên)',
        type: 'synth'
      }
    ];
    this.currentTrackIndex = 0;

    // Lắng nghe sự kiện quay lại trang trên Mobile để tiếp tục âm thanh
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (!document.hidden && this.isAmbientPlaying) {
          this.ensureContext();
          if (this.customAudio && this.customAudio.paused && !this.isMuted) {
            this.customAudio.play().catch(() => {});
          }
        }
      });
      window.addEventListener('pageshow', () => {
        if (this.isAmbientPlaying) {
          this.ensureContext();
        }
      });
    }

    // Tự động đồng bộ từ MySQL Database
    this.syncFromDatabase();
  }

  async syncFromDatabase() {
    try {
      const [tracksRes, bellRes] = await Promise.all([
        fetch('/api/tracks'),
        fetch('/api/bell')
      ]);

      if (tracksRes.ok) {
        const tracks = await tracksRes.json();
        if (Array.isArray(tracks) && tracks.length > 0) {
          this.playlist = tracks.map(t => ({
            id: t.track_id || t.id,
            title: t.title,
            type: t.type,
            url: t.url
          }));
          if (this.currentTrackIndex >= this.playlist.length) {
            this.currentTrackIndex = 0;
          }
        }
      }

      if (bellRes.ok) {
        const bell = await bellRes.json();
        this.bellConfig = {
          customUrl: bell.custom_url || '',
          autoPlay: bell.auto_play !== undefined ? Boolean(bell.auto_play) : true,
          intervalSeconds: bell.interval_seconds || 60,
          volume: bell.volume !== undefined ? parseFloat(bell.volume) : 0.85
        };
        this.woodenFishConfig = {
          customUrl: bell.wooden_fish_url || '',
          volume: bell.wooden_fish_volume !== undefined ? parseFloat(bell.wooden_fish_volume) : 0.90
        };
        this.restartBellScheduler();
      }
    } catch (e) {
      console.warn('Đang sử dụng cấu hình âm thanh mặc định:', e);
    }
  }

  init() {
    if (this.initialized) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.ctx = new AudioContext();

    this.masterGain = this.ctx.createGain();
    const currentVol = this.isMuted ? 0 : this.volume;
    this.masterGain.gain.setValueAtTime(currentVol, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.32, this.ctx.currentTime);
    this.ambientGain.connect(this.masterGain);

    this.initialized = true;
  }

  ensureContext() {
    if (!this.initialized) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  // Tối ưu hóa đặc biệt mở khóa âm thanh trên các trình duyệt di động (iOS Safari, Android Chrome)
  unlockMobileAudio() {
    this.ensureContext();
    if (this.isMobileUnlocked) return;
    this.isMobileUnlocked = true;

    // Mồi âm thanh trống cho thẻ HTML5 Audio để vượt qua rào cản Autoplay trên Mobile
    const primeAudio = (audioEl) => {
      if (!audioEl) return;
      try {
        const playPromise = audioEl.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              audioEl.pause();
              audioEl.currentTime = 0;
            })
            .catch(() => {});
        }
      } catch (_) {}
    };

    primeAudio(this.customAudio);
    primeAudio(this.customBellAudio);
    primeAudio(this.customWoodenFishAudio);
  }

  // ĐIỀU CHỈNH ÂM LƯỢNG (TĂNG / GIẢM TỪ 0 ĐẾN 100%)
  setVolume(val) {
    this.ensureContext();
    this.volume = Math.max(0, Math.min(1, val));
    try {
      localStorage.setItem('pagoda_volume', this.volume.toString());
    } catch (e) {}

    if (!this.isMuted) {
      if (this.masterGain && this.ctx) {
        this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      }
      this.customAudio.volume = this.volume * 0.75;
      this.customBellAudio.volume = this.volume * (this.bellConfig.volume || 0.85);
      this.customWoodenFishAudio.volume = this.volume * (this.woodenFishConfig.volume || 0.90);
    }
    return this.volume;
  }

  toggleMute() {
    this.ensureContext();
    this.isMuted = !this.isMuted;
    const target = this.isMuted ? 0 : this.volume;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(target, this.ctx.currentTime);
    }
    this.customAudio.volume = this.isMuted ? 0 : this.volume * 0.75;
    this.customBellAudio.volume = this.isMuted ? 0 : this.volume * (this.bellConfig.volume || 0.85);
    this.customWoodenFishAudio.volume = this.isMuted ? 0 : this.volume * (this.woodenFishConfig.volume || 0.90);
    return !this.isMuted;
  }

  // =========================================================================
  // 1. PHÁT NHẠC THIỀN LẦN LƯỢT THEO DANH SÁCH (SEQUENTIAL PLAYLIST)
  // =========================================================================
  startAmbient(forcePlayCurrent = false) {
    this.ensureContext();
    if (this.isAmbientPlaying && !forcePlayCurrent) return;
    this.isAmbientPlaying = true;

    this.playCurrentTrack();
    this.startBellScheduler();
  }

  playCurrentTrack() {
    if (!this.playlist || this.playlist.length === 0) return;
    if (this.currentTrackIndex >= this.playlist.length) {
      this.currentTrackIndex = 0;
    }

    const track = this.playlist[this.currentTrackIndex];

    this.stopSynthDrone();
    this.customAudio.pause();

    if (track && track.type === 'url' && track.url) {
      this.customAudio.src = track.url;
      this.customAudio.currentTime = 0;
      this.customAudio.volume = this.isMuted ? 0 : this.volume * 0.75;
      this.customAudio.play().catch(e => {
        console.warn('Lỗi phát bài nhạc, chuyển sang bài tiếp theo:', e);
        setTimeout(() => this.playNextTrack(), 2000);
      });
    } else {
      this.startSynthDrone();
      clearTimeout(this.synthCycleTimer);
      this.synthCycleTimer = setTimeout(() => {
        if (this.isAmbientPlaying) {
          this.playNextTrack();
        }
      }, 210000); // 3.5 phút
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('pagoda_track_changed', {
        detail: { track, index: this.currentTrackIndex }
      }));
    }
  }

  playNextTrack() {
    if (!this.playlist || this.playlist.length === 0) return;
    if (this.playlist.length <= 1) {
      this.currentTrackIndex = 0;
    } else {
      this.currentTrackIndex = (this.currentTrackIndex + 1) % this.playlist.length;
    }
    if (this.isAmbientPlaying) {
      this.playCurrentTrack();
    }
  }

  selectTrack(index) {
    if (index >= 0 && index < this.playlist.length) {
      this.currentTrackIndex = index;
      if (this.isAmbientPlaying) {
        this.playCurrentTrack();
      }
    }
  }

  stopAmbient() {
    this.isAmbientPlaying = false;
    clearTimeout(this.ambientTimer);
    clearTimeout(this.synthCycleTimer);
    clearInterval(this.bellIntervalTimer);
    this.stopSynthDrone();
    this.customAudio.pause();
  }

  // =========================================================================
  // 2. TẠO SÓNG ÂM THIỀN ĐỊNH BẰNG WEB AUDIO API
  // =========================================================================
  startSynthDrone() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const rootNotes = [65.41, 98.0, 130.81, 196.0, 261.63, 329.63];

    rootNotes.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const lfo = this.ctx.createOscillator();
      const lfoGain = this.ctx.createGain();

      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      lfo.frequency.setValueAtTime(0.08 + i * 0.02, now);
      lfoGain.gain.setValueAtTime(0.015, now);
      lfo.connect(lfoGain);

      const baseLevel = 0.04 / (i * 0.6 + 1);
      gain.gain.setValueAtTime(baseLevel, now);
      lfoGain.connect(gain.gain);

      osc.connect(gain);
      gain.connect(this.ambientGain);

      osc.start(now);
      lfo.start(now);

      this.ambientOscillators.push(osc, lfo);
    });
  }

  stopSynthDrone() {
    this.ambientOscillators.forEach(node => {
      try {
        node.stop();
        node.disconnect();
      } catch (e) {}
    });
    this.ambientOscillators = [];
  }

  // =========================================================================
  // 3. TIẾNG ĐẠI HỒNG CHUNG & QUẢN LÝ CHUÔNG CHÙA
  // =========================================================================
  playBell(pitchScale = 1.0) {
    this.ensureContext();

    // Nếu người dùng có tệp chuông riêng, thử phát tệp
    if (this.bellConfig.customUrl) {
      try {
        this.customBellAudio.src = this.bellConfig.customUrl;
        this.customBellAudio.currentTime = 0;
        this.customBellAudio.volume = this.isMuted ? 0 : this.volume * (this.bellConfig.volume || 0.85);
        const p = this.customBellAudio.play();
        if (p !== undefined) {
          p.catch(() => {
            // Dự phòng phát tiếng chuông tổng hợp nếu tệp lỗi hoặc bị chặn trên mobile
            this.playSynthesizedBell(pitchScale);
          });
        }
        return;
      } catch (_) {
        this.playSynthesizedBell(pitchScale);
        return;
      }
    }

    this.playSynthesizedBell(pitchScale);
  }

  playSynthesizedBell(pitchScale = 1.0) {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const baseFreq = 130.81 * pitchScale;

    const partials = [
      { ratio: 0.5, amp: 0.85, decay: 13.0 },
      { ratio: 1.0, amp: 1.0, decay: 9.5 },
      { ratio: 1.19, amp: 0.65, decay: 7.5 },
      { ratio: 1.56, amp: 0.5, decay: 6.0 },
      { ratio: 2.0, amp: 0.35, decay: 4.8 },
      { ratio: 2.74, amp: 0.2, decay: 3.2 }
    ];

    partials.forEach(p => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq * p.ratio, now);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.linearRampToValueAtTime(p.amp * 0.18 * (this.bellConfig.volume || 0.85), now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + p.decay);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + p.decay + 0.1);
    });
  }

  startBellScheduler() {
    clearInterval(this.bellIntervalTimer);
    if (!this.bellConfig.autoPlay) return;

    const intervalMs = Math.max(10, this.bellConfig.intervalSeconds || 60) * 1000;
    this.bellIntervalTimer = setInterval(() => {
      if (this.isAmbientPlaying) {
        this.playBell();
      }
    }, intervalMs);
  }

  restartBellScheduler() {
    if (this.isAmbientPlaying) {
      this.startBellScheduler();
    }
  }

  playChime() {
    this.ensureContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const chimeFreqs = [587.33, 880.0, 1174.66, 1760.0];

    chimeFreqs.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.05);

      gain.gain.setValueAtTime(0.0001, now + idx * 0.05);
      gain.gain.exponentialRampToValueAtTime(0.12 / (idx + 1), now + idx * 0.05 + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 3.2);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.05);
      osc.stop(now + idx * 0.05 + 3.3);
    });
  }

  // Tiếng mõ chùa (Wooden Fish) thanh tịnh, ấm áp - Phát khi bấm Thắp Hương, Rút Thẻ hoặc vái lạy
  playWoodenFish() {
    this.ensureContext();

    // Nếu người dùng tải lên tệp âm thanh mõ riêng, phát tệp
    if (this.woodenFishConfig.customUrl) {
      try {
        this.customWoodenFishAudio.src = this.woodenFishConfig.customUrl;
        this.customWoodenFishAudio.currentTime = 0;
        this.customWoodenFishAudio.volume = this.isMuted ? 0 : this.volume * (this.woodenFishConfig.volume || 0.90);
        const p = this.customWoodenFishAudio.play();
        if (p !== undefined) {
          p.catch(() => {
            this.playSynthesizedWoodenFish();
          });
        }
        return;
      } catch (_) {
        this.playSynthesizedWoodenFish();
        return;
      }
    }

    this.playSynthesizedWoodenFish();
  }

  playSynthesizedWoodenFish() {
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(580, now);
    osc.frequency.exponentialRampToValueAtTime(320, now + 0.09);

    const fishVol = (this.woodenFishConfig.volume || 0.90) * 0.28;
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(fishVol, now + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.32);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, now);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.35);
  }

  playIncenseIgnite() {
    this.ensureContext();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.7);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.4));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2400, now);
    filter.Q.setValueAtTime(3.0, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
    noise.stop(now + 0.7);
  }

  // =========================================================================
  // ADMIN QUẢN LÝ PLAYLIST VỚI MYSQL
  // =========================================================================
  async addTrackToDatabase(title, url, type = 'url') {
    try {
      const res = await fetch('/api/tracks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, url, type })
      });
      if (res.ok) {
        await this.syncFromDatabase();
        return true;
      }
    } catch (e) {
      console.warn('Lỗi thêm bài nhạc vào MySQL:', e);
    }
    return false;
  }

  async removeTrackFromDatabase(id) {
    try {
      const res = await fetch(`/api/tracks/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await this.syncFromDatabase();
        return true;
      }
    } catch (e) {
      console.warn('Lỗi xóa bài nhạc từ MySQL:', e);
    }
    return false;
  }

  async updateSystemSoundSettingsInDatabase(bellUrl, autoPlay, intervalSeconds, bellVolume, woodenFishUrl, woodenFishVolume) {
    try {
      const res = await fetch('/api/bell', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          custom_url: bellUrl,
          auto_play: autoPlay,
          interval_seconds: intervalSeconds,
          volume: bellVolume,
          wooden_fish_url: woodenFishUrl,
          wooden_fish_volume: woodenFishVolume
        })
      });
      if (res.ok) {
        this.bellConfig.customUrl = bellUrl;
        this.bellConfig.autoPlay = Boolean(autoPlay);
        this.bellConfig.intervalSeconds = parseInt(intervalSeconds, 10) || 60;
        this.bellConfig.volume = parseFloat(bellVolume) || 0.85;
        this.woodenFishConfig.customUrl = woodenFishUrl || '';
        this.woodenFishConfig.volume = parseFloat(woodenFishVolume) || 0.90;
        this.restartBellScheduler();
        return true;
      }
    } catch (e) {
      console.warn('Lỗi lưu âm thanh hệ thống vào MySQL:', e);
    }
    return false;
  }

  // Tương thích ngược với tên hàm cũ
  async updateBellSettingsInDatabase(customUrl, autoPlay, intervalSeconds, volume) {
    return this.updateSystemSoundSettingsInDatabase(
      customUrl,
      autoPlay,
      intervalSeconds,
      volume,
      this.woodenFishConfig.customUrl,
      this.woodenFishConfig.volume
    );
  }
}

export const soundEngine = new SoundEngine();
