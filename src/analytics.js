// Module kết nối MySQL API để ghi nhận & lấy thống kê lượt truy cập
export class AnalyticsTracker {
  static async getData() {
    try {
      const res = await fetch('/api/analytics/dashboard');
      if (res.ok) {
        const data = await res.json();
        // Đồng bộ bản sao vào localStorage để dự phòng
        localStorage.setItem('pagoda_analytics_cache', JSON.stringify(data));
        return data;
      }
    } catch (e) {
      console.warn('Lỗi gọi API thống kê MySQL, chuyển sang cache cục bộ:', e);
    }

    // Dự phòng khi offline
    const cached = localStorage.getItem('pagoda_analytics_cache');
    if (cached) {
      try { return JSON.parse(cached); } catch (e) {}
    }

    return {
      totalVisits: 0,
      todayVisits: 0,
      totalOfferings: 0,
      todayOfferings: 0,
      totalBlessings: 0,
      todayBlessings: 0,
      history: [],
      recentLogs: []
    };
  }

  static async sendEvent(type, label) {
    try {
      await fetch('/api/analytics/event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, label })
      });
    } catch (e) {
      console.warn('Không thể gửi sự kiện thống kê tới MySQL:', e);
    }
  }

  static trackVisit() {
    this.sendEvent('visit', 'Khách thập phương viếng thăm Chính Điện Tam Bảo');
  }

  static trackOffering() {
    this.sendEvent('offering', 'Phật tử thành kính dâng 3 nén tâm hương thơm');
  }

  static trackBlessing() {
    this.sendEvent('blessing', 'Phật tử rút thẻ Cầu An & lắng nghe Lời Phật Dạy');
  }
}
