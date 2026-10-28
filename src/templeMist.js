// Hệ thống hiệu ứng tâm linh chốn thiền môn:
// 1. Lớp sương khói là là dưới đáy màn hình (Ground Fog / Low-lying Mist)
// 2. Hạt bụi vàng lấp lánh bay toàn màn hình (Full-screen Golden Sparkling Dust)
// 3. Khói trầm thanh thoát từ Bát Nhang

export class TempleMistSystem {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    // Hạt sương khói là là sát chân màn hình
    this.groundFogPuffs = [];

    // Hạt bụi vàng lấp lánh toàn màn hình
    this.goldenSparkles = [];

    // Khói trầm thanh thoát từ Bát Nhang
    this.incenseSmoke = [];
    this.burnerPos = { x: 0.5, y: 0.705 };

    this.init();
    this.setupResize();
  }

  init() {
    this.resize();
    this.initGroundFog();
    this.initGoldenSparkles();
  }

  setupResize() {
    window.addEventListener('resize', () => {
      this.resize();
      this.initGroundFog();
      this.initGoldenSparkles();
    });
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
  }

  // =========================================================================
  // 1. HIỆU ỨNG KHÓI LÀ LÀ DƯỚI MÀN HÌNH (GROUND FOG / LOW-LYING MIST)
  // =========================================================================
  initGroundFog() {
    this.groundFogPuffs = [];
    // Tạo 32 khối khói bồng bềnh phủ ngang toàn bộ phần đáy màn hình
    const puffCount = Math.max(26, Math.floor(this.width / 45));

    for (let i = 0; i < puffCount; i++) {
      this.groundFogPuffs.push({
        x: Math.random() * (this.width + 200) - 100,
        y: this.height * (0.82 + Math.random() * 0.22), // Tập trung sát đáy màn hình
        radius: 130 + Math.random() * 160,
        vx: (Math.random() - 0.48) * 0.28, // Trôi ngang êm ái
        vy: (Math.random() - 0.5) * 0.04,
        baseAlpha: 0.045 + Math.random() * 0.055, // Độ mờ vừa phải, không che nút
        waveSpeed: 0.35 + Math.random() * 0.45,
        waveAmp: 8 + Math.random() * 14,
        seed: Math.random() * Math.PI * 2
      });
    }
  }

  renderGroundFog(time) {
    this.ctx.save();

    // Lớp phủ gradient nền sương mờ dưới cùng tạo độ sâu là là mặt sàn
    const floorGrad = this.ctx.createLinearGradient(0, this.height * 0.78, 0, this.height);
    floorGrad.addColorStop(0, 'rgba(255, 245, 230, 0)');
    floorGrad.addColorStop(0.5, 'rgba(255, 240, 215, 0.04)');
    floorGrad.addColorStop(1, 'rgba(255, 235, 205, 0.12)');
    this.ctx.fillStyle = floorGrad;
    this.ctx.fillRect(0, this.height * 0.78, this.width, this.height * 0.22);

    // Vẽ từng khối khói sương bồng bềnh là là
    for (let i = 0; i < this.groundFogPuffs.length; i++) {
      const p = this.groundFogPuffs[i];

      // Chuyển động trôi ngang và bồng bềnh hình sin
      p.x += p.vx;
      const waveY = p.y + Math.sin(time * p.waveSpeed + p.seed) * p.waveAmp;

      // Vòng lặp biên màn hình
      if (p.x < -p.radius * 1.5) p.x = this.width + p.radius;
      if (p.x > this.width + p.radius * 1.5) p.x = -p.radius;

      // Độ mờ nhịp thở tự nhiên
      const pulseAlpha = p.baseAlpha * (0.85 + Math.sin(time * 0.5 + p.seed) * 0.2);

      const grad = this.ctx.createRadialGradient(p.x, waveY, 0, p.x, waveY, p.radius);
      grad.addColorStop(0, `rgba(255, 248, 235, ${pulseAlpha})`);
      grad.addColorStop(0.4, `rgba(250, 235, 210, ${pulseAlpha * 0.6})`);
      grad.addColorStop(0.75, `rgba(240, 215, 180, ${pulseAlpha * 0.2})`);
      grad.addColorStop(1, 'rgba(200, 180, 150, 0)');

      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      // Vẽ dạng elip dẹp ngang để khói trải phẳng là là sát mặt sàn
      this.ctx.ellipse(p.x, waveY, p.radius * 1.3, p.radius * 0.55, 0, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.restore();
  }

  // =========================================================================
  // 2. HẠT BỤI VÀNG LẤP LÁNH TOÀN MÀN HÌNH (FULL-SCREEN GOLDEN SPARKLES)
  // =========================================================================
  initGoldenSparkles() {
    this.goldenSparkles = [];
    // Phân bổ hạt bụi vàng trải đều TOÀN MÀN HÌNH (khoảng 80 hạt)
    const sparkleCount = Math.max(65, Math.floor((this.width * this.height) / 16000));

    for (let i = 0; i < sparkleCount; i++) {
      this.goldenSparkles.push(this.createSparkle(true));
    }
  }

  createSparkle(randomY = false) {
    return {
      x: Math.random() * this.width,
      y: randomY ? Math.random() * this.height : this.height + 15,
      radius: 0.9 + Math.random() * 2.2, // Kích thước hạt từ nhỏ li ti tới hạt sáng
      vx: (Math.random() - 0.48) * 0.35, // Bay lượn nhẹ nhàng
      vy: -0.22 - Math.random() * 0.45,   // Bay từ từ lên trên
      alpha: 0.2 + Math.random() * 0.7,   // Độ sáng rực
      twinkleSpeed: 1.8 + Math.random() * 3.2,
      twinkleOffset: Math.random() * Math.PI * 2,
      isStarGlint: Math.random() < 0.22,  // 22% hạt có tia lấp lánh hình ngôi sao 4 cánh
      hueShift: Math.random() * 15 - 7    // Chênh lệch sắc vàng ấm
    };
  }

  renderGoldenSparkles(time) {
    this.ctx.save();

    for (let i = 0; i < this.goldenSparkles.length; i++) {
      const sp = this.goldenSparkles[i];

      // Chuyển động bay lên và lượn sóng ngang nhẹ
      sp.y += sp.vy;
      sp.x += sp.vx + Math.sin(time * 0.8 + sp.twinkleOffset) * 0.22;

      // Tái sinh hạt khi bay vượt đỉnh màn hình hoặc ra khỏi viền
      if (sp.y < -20) {
        Object.assign(sp, this.createSparkle(false));
      }
      if (sp.x < -20) sp.x = this.width + 10;
      if (sp.x > this.width + 20) sp.x = -10;

      // Độ lấp lánh theo hàm sin (nhấp nháy lung linh)
      const twinkle = 0.5 + Math.sin(time * sp.twinkleSpeed + sp.twinkleOffset) * 0.5;
      const currentAlpha = Math.min(1, sp.alpha * (0.35 + twinkle * 0.85));

      if (currentAlpha < 0.05) continue;

      const r = sp.radius * (0.8 + twinkle * 0.4);

      // 1. Quầng hào quang vàng tỏa rộng quanh hạt
      const glowGrad = this.ctx.createRadialGradient(sp.x, sp.y, 0, sp.x, sp.y, r * 3.5);
      glowGrad.addColorStop(0, `rgba(255, 245, 200, ${currentAlpha * 0.9})`);
      glowGrad.addColorStop(0.3, `rgba(251, 191, 36, ${currentAlpha * 0.55})`);
      glowGrad.addColorStop(0.7, `rgba(217, 119, 6, ${currentAlpha * 0.18})`);
      glowGrad.addColorStop(1, 'rgba(245, 158, 11, 0)');

      this.ctx.fillStyle = glowGrad;
      this.ctx.beginPath();
      this.ctx.arc(sp.x, sp.y, r * 3.5, 0, Math.PI * 2);
      this.ctx.fill();

      // 2. Tâm hạt trắng vàng rực rỡ
      this.ctx.fillStyle = `rgba(255, 255, 245, ${currentAlpha})`;
      this.ctx.beginPath();
      this.ctx.arc(sp.x, sp.y, r, 0, Math.PI * 2);
      this.ctx.fill();

      // 3. Hiệu ứng tia sao lấp lánh 4 cánh (cho các hạt lấp lánh nổi bật)
      if (sp.isStarGlint && twinkle > 0.65) {
        const starFlareAlpha = (twinkle - 0.65) / 0.35 * currentAlpha * 0.85;
        const starLen = r * 3.8;

        this.ctx.strokeStyle = `rgba(255, 250, 220, ${starFlareAlpha})`;
        this.ctx.lineWidth = 0.85;

        // Tia ngang
        this.ctx.beginPath();
        this.ctx.moveTo(sp.x - starLen, sp.y);
        this.ctx.lineTo(sp.x + starLen, sp.y);
        this.ctx.stroke();

        // Tia dọc
        this.ctx.beginPath();
        this.ctx.moveTo(sp.x, sp.y - starLen);
        this.ctx.lineTo(sp.x, sp.y + starLen);
        this.ctx.stroke();
      }
    }

    this.ctx.restore();
  }

  // =========================================================================
  // 3. KHÓI TRẦM TỰ NHIÊN TỪ LƯ HƯƠNG TRÊN BÀN THỜ
  // =========================================================================
  emitBurnerSmoke(count = 1) {
    const originX = this.width * this.burnerPos.x;
    const originY = this.height * this.burnerPos.y;

    for (let i = 0; i < count; i++) {
      this.incenseSmoke.push({
        x: originX + (Math.random() - 0.5) * 6,
        y: originY + (Math.random() - 0.5) * 4,
        vx: (Math.random() - 0.5) * 0.2,
        vy: -0.45 - Math.random() * 0.35,
        size: 2.5 + Math.random() * 2.5,
        maxSize: 14 + Math.random() * 10,
        alpha: 0.16 + Math.random() * 0.12,
        life: 0,
        maxLife: 130 + Math.random() * 60,
        seed: Math.random() * 20
      });
    }
  }

  renderBurnerSmoke() {
    if (Math.random() < 0.26) {
      this.emitBurnerSmoke(1);
    }

    this.ctx.save();
    for (let i = this.incenseSmoke.length - 1; i >= 0; i--) {
      const p = this.incenseSmoke[i];
      p.life++;
      const progress = p.life / p.maxLife;

      p.x += p.vx + Math.sin(progress * 6 + p.seed) * 0.25;
      p.y += p.vy;
      p.size += 0.08;

      const currentAlpha = p.alpha * (1 - progress);

      if (progress >= 1 || p.y < this.height * 0.52) {
        this.incenseSmoke.splice(i, 1);
        continue;
      }

      const grad = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
      grad.addColorStop(0, `rgba(255, 250, 240, ${currentAlpha})`);
      grad.addColorStop(0.4, `rgba(240, 230, 215, ${currentAlpha * 0.45})`);
      grad.addColorStop(1, 'rgba(210, 195, 180, 0)');

      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    }
    this.ctx.restore();
  }

  // =========================================================================
  // VÒNG LẶP RENDER CHÍNH (60 FPS)
  // =========================================================================
  updateAndRender() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    const time = performance.now() * 0.001;

    // 1. Khói là là dưới đáy màn hình
    this.renderGroundFog(time);

    // 2. Khói trầm mảnh mai từ bát hương
    this.renderBurnerSmoke();

    // 3. Hạt bụi vàng lấp lánh bay toàn màn hình
    this.renderGoldenSparkles(time);
  }
}
