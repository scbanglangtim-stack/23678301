# ĐỀ KIỂM TRA THỰC HÀNH 1 (TH1) - LẬP TRÌNH CHO THIẾT BỊ DI ĐỘNG (TH)
**Trường Đại học Công nghiệp TP. Hồ Chí Minh - Khoa CN Điện tử**

---

## 1. Thông Tin Sinh Viên & Biến Thể Thực Hiện

- **Họ và tên thí sinh**: NGUYEN HUYNH TAN PHAT
- **MSSV**: `23678301`
- **Chữ số cuối MSSV**: `1`
- **STUDENT_SEED**: `301`
- **FLASH_SECONDS**: `181` giây (03:01)
- **BANNER_IMAGE_ID**: `201` (`https://picsum.photos/id/201/800/320`)
- **PRICE_MULTIPLIER**: `20100` VNĐ
- **Mã Stamp**: `#355913`
- **Dòng định danh**: `TH1 · 23678301 · NGUYEN HUYNH TAN PHAT · #355913`
- **Vị trí Watermark**: **Dưới chân màn hình** (`watermarkAtTop: false`) do số cuối `1` lẻ
- **Nút chuyển Sáng/Tối**: `Pressable` ("Sáng / Tối" dạng pill)
- **Kiểu mở Modal**: `fade` (`modalAnimation: 'fade'`)
- **Thứ tự 4 Chip**: `Học tập` → `Nước` → `Đồ ăn` → `Tất cả` (Thứ tự đảo)
- **Link GitHub nộp bài (clone HTTPS)**: `https://github.com/nguyenphat/23678301.git`

---

## 2. Nội Dung Gốc Của Đề Bài

### Mô tả bài toán
Ký túc xá có cửa hàng tiện lợi mở 24/7 tên CampusMart. Sinh viên đặt đồ ăn vặt, nước uống, đồ dùng học tập trên điện thoại rồi ra quầy lấy — không ship, không thanh toán trong app, không làm giỏ hàng nhiều món.
Bạn dựng một app React Native chạy trên máy ảo, một màn Home và một hộp thoại (Modal) khi bấm Đặt. Ba câu dưới đây là cùng một project, không nộp 3 bài rời.
Phạm vi: Chương 1 (RN CLI, Git) · Chương 2 (JSX, Props/State, StyleSheet, Core Components, Fetch) · Chương 3 (Design System, UI Kit, useContext, useReducer, Custom Hook, memo / useMemo / useCallback).

### Bảng Biến Thể Theo Chữ Số Cuối MSSV
| Số cuối | Watermark | Nút Sáng/Tối | Mở Modal | Thứ tự 4 chip |
| :---: | :---: | :---: | :---: | :--- |
| 0 | Trên | Switch | fade | Tất cả → Đồ ăn → Nước → Học tập |
| **1** | **Dưới** | **Pressable** | **fade** | **Học tập → Nước → Đồ ăn → Tất cả** |
| 2 | Trên | Pressable | fade | Tất cả → Đồ ăn → Nước → Học tập |
| 3 | Dưới | Switch | fade | Học tập → Nước → Đồ ăn → Tất cả |
| 4 | Trên | Pressable | fade | Tất cả → Đồ ăn → Nước → Học tập |
| 5 | Dưới | Pressable | slide | Học tập → Nước → Đồ ăn → Tất cả |
| 6 | Trên | Switch | slide | Tất cả → Đồ ăn → Nước → Học tập |
| 7 | Dưới | Pressable | slide | Học tập → Nước → Đồ ăn → Tất cả |
| 8 | Trên | Pressable | slide | Tất cả → Đồ ăn → Nước → Học tập |
| 9 | Dưới | Switch | slide | Học tập → Nước → Đồ ăn → Tất cả |

### Màu CampusMart (trong `theme.ts`):
- `primary: #0F766E` — nút chính, chữ CAMPUSMART, chip đang chọn, giá
- `secondary: #F59E0B` — chữ Flash
- `background: #F0FDFA` — nền màn sáng
- `surface: #FFFFFF` — card, ô tìm, Modal
- `text: #134E4A` — chữ thường
- `textLight: #5F7A77` — chữ phụ, placeholder
- `border: #CCFBF1` — viền
- `error: #DC2626` — lỗi; `success: #16A34A`
- **Dark Mode**: nền `#042F2E`, card `#0B4F4A`, chữ `#F0FDFA`, không đổi primary.

---

## 3. Các Câu Hỏi Trong Đề Thi

### Câu 1: (3 điểm, CLO 1)
- **a) (1,5đ)**: Tạo project React Native CLI + TypeScript `campusmart-23678301`, cấu hình path alias (`@constants`, `@contexts`, `@hooks`, `@services`, `@components`, `@screens`), cài đặt `src/constants/student.ts`, `src/constants/theme.ts`, `App.tsx` có comment đúng chuẩn.
- **b) (1,5đ)**: Xây dựng 3 UI atom dùng `StyleSheet.create` và `React.memo`:
  - `Typography.tsx`: Bọc Text, variant lấy từ FONTS, có color, numberOfLines, children.
  - `ShopInput.tsx`: Ô nhập liệu controlled, value + onChangeText, label, error.
  - `ShopButton.tsx`: Nút bấm title, onPress, isLoading, disabled, variant primary / outline / danger.

### Câu 2: (3 điểm, CLO 2)
- **a) (1,5đ)**: Dựng giao diện Home đủ các khối (0), (A), (B), (C), (D):
  - (0) Watermark đặt dưới chân màn hình (do số cuối 1 lẻ).
  - (A) Header nền teal, chữ CAMPUSMART, Tiện lợi KTX, nút Sáng/Tối, đồng hồ Flash.
  - (B) Ô tìm kiếm placeholder có MSSV: `Tìm món, nước, đồ dùng — 23678301`.
  - (C) Banner Picsum ID 201 (`https://picsum.photos/id/201/800/320`).
  - (D) 4 Chip theo thứ tự đảo: `Học tập` → `Nước` → `Đồ ăn` → `Tất cả`.
- **b) (1,5đ)**: Fetch API FakeStore bằng `fetch` + `res.ok`, đủ 3 trạng thái (Đang tải, Có dữ liệu, Lỗi mạng + Thử lại) và `ListEmptyComponent` ("Không có món phù hợp"). Dùng `useMemo` lọc tức thì.

### Câu 3: (4 điểm, CLO 3)
- **a) (2đ)**: Modal transparent mở dạng `fade`, bọc đầy đủ watermark, ảnh, tên, giá, loại, mô tả 2 dòng, bộ đếm số lượng dùng `useReducer` (không giảm dưới 1). Xác nhận đặt bật `Alert.alert` đúng cú pháp:
  `NGUYEN HUYNH TAN PHAT (#355913) đã ghi nhận: {tên món} × {số lượng}. Nhận tại quầy KTX.`
- **b) (2đ)**: `ThemeContext` + `ThemeProvider` (chuyển đổi Sáng/Tối), hook `useCountdown(FLASH_SECONDS)` (hết giờ khóa nút đặt và hiện thông báo). Chụp ảnh máy ảo lưu tại `docs/screenshot-th1.png`. Commit Git >= 3 lần có MSSV.
