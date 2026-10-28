// Hoạt ảnh dâng hương góc nhìn thứ nhất (FPOV) - Chỉ hiển thị khi vái Tam Bảo
// Que nhang thật thon mảnh, đầu tàn ửng sáng nhẹ tự nhiên, khói trầm thưa mỏng thanh thoát
import { soundEngine } from './audio.js';
import confetti from 'canvas-confetti';

export class IncenseOfferingRitual {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.isOffering = false;
    this.offerPhase = 'idle'; // 'idle' | 'entering' | 'bowing' | 'exiting'

    // Vị trí đôi tay và 3 nén nhang trong hoạt ảnh FPOV
    this.handPos = {
      x: this.width * 0.5,
      y: this.height * 1.15,
      targetY: this.height * 0.77,
      bowOffset: 0,
      opacity: 0
    };

    // Hạt khói trầm thưa mỏng từ 3 nén nhang
    this.incenseSmoke = [];

    this.init();
    this.setupResize();
  }

  init() {
    this.resize();
  }

  setupResize() {
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    if (this.offerPhase === 'idle') {
      this.handPos.x = this.width * 0.5;
      this.handPos.y = this.height * 1.15;
      this.handPos.targetY = this.height * 0.77;
    }
  }

  // Khởi động nghi thức vái Tam Bảo
  startOffering(onProgress, onComplete) {
    if (this.isOffering) return;
    this.isOffering = true;
    this.offerPhase = 'entering';

    try {
      if (soundEngine && typeof soundEngine.playIncenseIgnite === 'function') soundEngine.playIncenseIgnite();
      if (soundEngine && typeof soundEngine.ensureContext === 'function') soundEngine.ensureContext();
    } catch (e) {}

    this.handPos.x = this.width * 0.5;
    this.handPos.y = this.height * 1.15;
    this.handPos.opacity = 0;
    this.handPos.bowOffset = 0;

    let enterStart = null;
    const enterDuration = 1200; // 1.2s dâng 3 nén hương chậm rãi, trang nghiêm

    // Đôi tay dâng 3 nén hương từ từ xuất hiện ở cự ly trang nghiêm
    const animateEnter = (now) => {
      if (!enterStart) enterStart = now;
      const elapsed = now - enterStart;
      const t = Math.min(1, elapsed / enterDuration);
      const ease = 0.5 - Math.cos(t * Math.PI) / 2;

      this.handPos.y = this.height * 1.15 - (this.height * 1.15 - this.handPos.targetY) * ease;
      this.handPos.opacity = ease;

      if (t < 1) {
        requestAnimationFrame(animateEnter);
      } else {
        if (onProgress) {
          onProgress({
            step: 1,
            message: 'Thành tâm dâng 3 nén tâm hương...'
          });
        }

        setTimeout(() => {
          // Bắt đầu 3 vái Tam Bảo với tốc độ chậm rãi, cung kính
          this.performThreeBows(onProgress, () => {
            // Sau khi vái xong: Đôi tay hạ xuống và mờ dần
            this.finishBowing(onComplete);
          });
        }, 800);
      }
    };

    requestAnimationFrame(animateEnter);
  }

  // Thực hiện 3 Vái Tam Bảo tôn nghiêm (tốc độ chậm rãi, thư thái theo chuẩn thiền môn)
  performThreeBows(onProgress, onFinished) {
    this.offerPhase = 'bowing';

    const bowChants = [
      'Cung kính kính lễ Phật Bảo (Đấng Đại Từ Đại Bi)',
      'Cung kính kính lễ Pháp Bảo (Chân Lý Tỉnh Thức Soi Đường)',
      'Cung kính kính lễ Tăng Bảo (Thánh Chúng Thanh Tịnh Hòa Hợp)'
    ];

    let currentBow = 0;

    const doNextBow = () => {
      if (currentBow >= 3) {
        onFinished();
        return;
      }

      currentBow++;
      try {
        if (soundEngine && typeof soundEngine.playChime === 'function') soundEngine.playChime();
        if (soundEngine && typeof soundEngine.playWoodenFish === 'function') soundEngine.playWoodenFish();
      } catch (audioErr) {
        console.warn('Lỗi âm thanh vái:', audioErr);
      }

      if (onProgress) {
        onProgress({
          step: 2,
          bowIndex: currentBow,
          message: `Vái lần ${currentBow}: ${bowChants[currentBow - 1]}`
        });
      }

      let bowStart = null;
      // Tốc độ vái chậm lại (2.6 giây cho mỗi lần vái cúi xuống và ngẩng lên)
      const bowDuration = 2600;

      const bowLoop = (now) => {
        if (!bowStart) bowStart = now;
        const elapsed = now - bowStart;
        const p = Math.min(1, elapsed / bowDuration);
        
        // Chuyển động cúi vái nhịp nhàng, chậm rãi, tôn kính
        this.handPos.bowOffset = Math.sin(p * Math.PI) * 75;

        if (p < 1) {
          requestAnimationFrame(bowLoop);
        } else {
          this.handPos.bowOffset = 0;
          // Khoảng lặng an tịnh giữa các lần vái (750ms)
          setTimeout(doNextBow, 750);
        }
      };

      requestAnimationFrame(bowLoop);
    };

    doNextBow();
  }

  // Sau khi hoàn thành 3 vái: Đôi tay cung kính hạ xuống và mờ dần
  finishBowing(onComplete) {
    this.offerPhase = 'exiting';
    let exitStart = null;
    const exitDuration = 1200; // 1.2s hạ tay chậm rãi

    const animateExit = (now) => {
      if (!exitStart) exitStart = now;
      const elapsed = now - exitStart;
      const t = Math.min(1, elapsed / exitDuration);
      const ease = 0.5 - Math.cos(t * Math.PI) / 2;

      this.handPos.y = this.handPos.targetY + 70 * ease;
      this.handPos.opacity = Math.max(0, 1 - ease);

      if (t < 1) {
        requestAnimationFrame(animateExit);
      } else {
        this.offerPhase = 'idle';
        this.isOffering = false;
        this.handPos.opacity = 0;
        this.handPos.bowOffset = 0;

        try {
          if (soundEngine && typeof soundEngine.playBell === 'function') soundEngine.playBell(1.0);
        } catch (e) {}

        // Rơi nhẹ vài cánh hoa sen vàng chúc phúc (zIndex 30 để tuyệt đối không che chắn hay cản trở Modal thiệp)
        confetti({
          particleCount: 50,
          spread: 75,
          origin: { y: 0.65 },
          colors: ['#ffd700', '#ff99aa', '#f59e0b', '#ffffff'],
          zIndex: 30
        });

        if (onComplete) onComplete();
      }
    };

    requestAnimationFrame(animateExit);
  }

  // Sinh khói từ đầu que nhang: Mật độ thưa, hạt nhỏ mỏng, không bị dày đặc
  emitIncenseSmoke(x, y) {
    if (Math.random() < 0.45) { // Chỉ thỉnh thoảng sinh hạt khói
      this.incenseSmoke.push({
        x: x + (Math.random() - 0.5) * 2,
        y: y,
        vx: (Math.random() - 0.5) * 0.18,
        vy: -0.6 - Math.random() * 0.4,
        size: 2.0 + Math.random() * 2.0,
        alpha: 0.22 + Math.random() * 0.1, // Rất mỏng nhẹ
        life: 0,
        maxLife: 80 + Math.random() * 45,
        seed: Math.random() * 20
      });
    }
  }

  updateAndRender() {
    this.ctx.clearRect(0, 0, this.width, this.height);
    const time = performance.now() * 0.001;

    // CHỈ VẼ KHI ĐANG VÁI TAM BẢO
    if (this.isOffering && this.handPos.opacity > 0.01) {
      const curX = this.handPos.x;
      const curY = this.handPos.y + this.handPos.bowOffset;
      this.drawRealisticHandsWithIncense(curX, curY, this.handPos.opacity, time);
    }

    // Cập nhật khói trầm
    this.renderIncenseSmokeParticles();
  }

  // Vẽ đôi tay và 3 nén hương trầm chân thực
  drawRealisticHandsWithIncense(x, y, opacity, time) {
    this.ctx.save();
    this.ctx.globalAlpha = opacity;
    this.ctx.translate(x, y);

    const stickLength = 180;
    // Tọa độ 3 đầu nén nhang
    const stickTips = [
      { x: -10, y: -stickLength - 2 },
      { x: 0,   y: -stickLength - 8 },
      { x: 10,  y: -stickLength - 2 }
    ];

    // 1. VẼ 3 QUE NHANG TRẦM TỰ NHIÊN (Thon mảnh, màu nâu quế trầm)
    stickTips.forEach((tip, idx) => {
      // Thân que nhang mảnh mai ~1.8px
      this.ctx.strokeStyle = '#5a2e1d'; // Màu nâu bột trầm tự nhiên
      this.ctx.lineWidth = 2.0;
      this.ctx.beginPath();
      this.ctx.moveTo(tip.x * 0.4, 15);
      this.ctx.lineTo(tip.x, tip.y);
      this.ctx.stroke();

      // Phần chân tăm nhang màu đỏ sẫm mộc mạc phía dưới
      this.ctx.strokeStyle = '#7c1c18';
      this.ctx.lineWidth = 1.6;
      this.ctx.beginPath();
      this.ctx.moveTo(tip.x * 0.4, 8);
      this.ctx.lineTo(tip.x * 0.4, 28);
      this.ctx.stroke();

      // ĐẦU QUE NHANG: "Đầu hơi sáng, không phải cháy"
      // Chấm tàn tro xám nhạt với điểm than hồng li ti nhỏ nhẹ
      this.ctx.fillStyle = '#9e9994'; // Lớp tro xám mỏng
      this.ctx.beginPath();
      this.ctx.arc(tip.x, tip.y, 1.8, 0, Math.PI * 2);
      this.ctx.fill();

      // Đốm than hồng li ti ửng sáng nhẹ (Ember nhỏ ~2px)
      const emberFlicker = 0.8 + Math.sin(time * 6 + idx * 2) * 0.25;
      const grad = this.ctx.createRadialGradient(tip.x, tip.y, 0, tip.x, tip.y, 4.5 * emberFlicker);
      grad.addColorStop(0, '#fff4e6');             // Tâm trắng ngà ấm
      grad.addColorStop(0.3, '#ff7034');           // Chấm cam đỏ than trầm
      grad.addColorStop(0.7, 'rgba(255, 90, 30, 0.25)'); // Quầng mờ rất nhẹ
      grad.addColorStop(1, 'rgba(255, 90, 30, 0)');

      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(tip.x, tip.y, 4.5 * emberFlicker, 0, Math.PI * 2);
      this.ctx.fill();

      // Sinh khói từ đầu que nhang
      const screenTipX = x + tip.x;
      const screenTipY = y + tip.y;
      this.emitIncenseSmoke(screenTipX, screenTipY);
    });

    // 2. VẼ ĐÔI BÀN TAY CHẮP KÍNH CẨN (Mềm mại, thanh thoát)
    // Ống tay áo nâu sồng giản dị
    this.ctx.fillStyle = '#3a1f14';

    // Ống tay trái
    this.ctx.beginPath();
    this.ctx.moveTo(-85, 170);
    this.ctx.quadraticCurveTo(-65, 80, -22, 38);
    this.ctx.lineTo(-40, 170);
    this.ctx.closePath();
    this.ctx.fill();

    // Ống tay phải
    this.ctx.beginPath();
    this.ctx.moveTo(85, 170);
    this.ctx.quadraticCurveTo(65, 80, 22, 38);
    this.ctx.lineTo(40, 170);
    this.ctx.closePath();
    this.ctx.fill();

    // Đôi bàn tay màu da tự nhiên
    this.ctx.fillStyle = '#e5be9d';
    this.ctx.strokeStyle = '#cfa07e';
    this.ctx.lineWidth = 1.2;

    // Mu bàn tay trái
    this.ctx.beginPath();
    this.ctx.ellipse(-16, 22, 14, 24, -0.25, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();

    // Mu bàn tay phải
    this.ctx.beginPath();
    this.ctx.ellipse(16, 22, 14, 24, 0.25, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.stroke();

    // Các ngón tay chắp nâng chân hương
    this.ctx.fillStyle = '#edd1b8';
    this.ctx.beginPath();
    this.ctx.ellipse(0, 15, 15, 10, 0, 0, Math.PI * 2);
    this.ctx.fill();

    this.ctx.restore();
  }

  // Cập nhật và làm mờ các hạt khói bay lên (rất mỏng nhẹ, thanh thoát)
  renderIncenseSmokeParticles() {
    for (let i = this.incenseSmoke.length - 1; i >= 0; i--) {
      const p = this.incenseSmoke[i];
      p.life++;
      const prog = p.life / p.maxLife;

      p.x += p.vx + Math.sin(prog * 5 + p.seed) * 0.22;
      p.y += p.vy;
      p.size += 0.08;

      const alpha = p.alpha * (1 - prog);

      if (prog >= 1 || p.y < 0) {
        this.incenseSmoke.splice(i, 1);
        continue;
      }

      const grad = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size);
      grad.addColorStop(0, `rgba(255, 252, 245, ${alpha})`);
      grad.addColorStop(0.4, `rgba(240, 230, 220, ${alpha * 0.5})`);
      grad.addColorStop(1, 'rgba(215, 205, 195, 0)');

      this.ctx.fillStyle = grad;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    }
  }
}
