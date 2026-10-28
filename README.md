# Website Phật Giáo - Chính Điện Tam Bảo

Trang web chủ đề Phật giáo với không gian Chính Điện Tam Bảo 2D uy nghiêm, trang trọng, kết hợp hoạt ảnh 3D góc nhìn thứ nhất (FPOV) lúc thắp hương, tương tác gõ mõ tích lũy công đức và bảng điều khiển Admin toàn diện.

---

## 🌟 Tính Năng Chính

### 1. Không Gian Chính Điện Tam Bảo 2D Uy Nghiêm
- **Hình ảnh Tam Bảo thật**: Hình ảnh chất lượng cao, trang nghiêm, ấm cúng. Cho phép thay đổi giữa các mẫu ảnh có sẵn hoặc **tải ảnh chùa thật từ máy tính**.
- **Vầng Hào Quang Phật (Phật Quang Phổ Chiếu)**: Tỏa sáng rực rỡ và quay nhẹ huyền ảo phía sau tượng Phật.
- **Đôi Ngọn Nến Lung Linh**: Hai ngọn nến bập bùng sống động hai bên bàn thờ.
- **Lồng Đèn Ấm Áp & Hạt Bụi Vàng**: Ánh sáng vàng cam thanh tịnh tỏa khắp chánh điện.

### 2. Người Dùng Thắp Nén Hương Thơm (Hoạt Ảnh 3D Góc Nhìn Thứ Nhất - FPOV)
- Bấm nút **"THẮP NÉN HƯƠNG THƠM"** (hoặc phím `H`):
  - Chuyển vào góc nhìn thứ nhất (FPOV).
  - Xuất hiện đôi bàn tay chắp kính cẩn cầm **3 nén hương thơm** màu đỏ truyền thống với đầu tàn nhang than hồng cháy đỏ.
  - Làn khói trầm nghi ngút uốn lượn bay lên từ 3 nén hương.
  - **Nghi lễ 3 Vái Tam Bảo tôn nghiêm**:
    - *Vái 1: Cung kính kính lễ Phật Bảo* (kèm tiếng chuông khánh và mõ gỗ ngân vang)
    - *Vái 2: Cung kính kính lễ Pháp Bảo*
    - *Vái 3: Cung kính kính lễ Tăng Bảo*
  - **Cắm 3 nén hương vào Bát Nhang**: Đôi tay từ từ tiến sát bát hương đồng trên bàn thờ, cắm thẳng đứng 3 nén nhang.
  - Khói hương bốc lên nghi ngút, hoa sen rơi chúc phúc và hiển thị **Thiệp Cầu An & Lời Phật Dạy**.

### 3. Người Dùng Tương Tác Gõ Mõ Tụng Kinh
- Nhấp trực tiếp vào quả **Mõ Chùa** trên bàn thờ hoặc bấm nút **"Gõ Mõ"** (hoặc phím `Space` / `M`):
  - Phát ra tiếng Mõ tụng kinh trầm ấm, vang rỗng (`Web Audio API`).
  - Hoạt ảnh mõ nảy nhịp nhàng.
  - Hiệu ứng bay chữ công đức ngẫu nhiên: *"Công Đức +1"*, *"Phiền Não Tiêu Trừ"*, *"Thân Tâm An Lạc"*, *"Nam Mô A Di Đà Phật"*.
  - Bảng đếm số lần gõ mõ công đức lưu trữ tự động (`localStorage`).

### 4. Bảng Quản Trị Viên (Admin Dashboard)
- Nhấp nút **"⚙️ Admin"** ở góc phải trên cùng để mở bảng quản trị:
  - **Quản lý Nhạc Thiền**:
    - Xem danh sách bài nhạc thiền hiện có.
    - Thêm nhạc thiền mới bằng **URL MP3** hoặc **tải tệp MP3 từ máy tính lên**.
    - Nghe thử, chọn bài phát chính hoặc xóa bài hát.
  - **Quản lý Chuông Chùa**:
    - Nghe thử tiếng chuông Đại Hồng Chung.
    - Thay thế âm thanh chuông riêng bằng cách nhập link âm thanh hoặc tải file chuông từ máy tính.
    - Khôi phục tiếng chuông mặc định bất cứ lúc nào.
  - **Tùy Chỉnh Bàn Thờ & Hào Quang**:
    - Điều chỉnh kích thước và độ cao của vầng Hào Quang để khớp hoàn hảo với bất kỳ ảnh Phật nào bạn tải lên.

---

## ⌨️ Phím Tắt Tiện Dụng

- `Space` hoặc `M`: Gõ Mõ tụng kinh tích lũy công đức
- `B`: Gõ chuông chùa Đại Hồng Chung ngân vang
- `H`: Thắp nén hương thơm dâng Tam Bảo
- `Esc`: Đóng các bảng pop-up / modal

---

## 🚀 Khởi Chạy

```bash
npm install
npm run dev
# Mở trình duyệt tại: http://localhost:5173
```
