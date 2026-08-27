# NGUYEN HUYNH TAN PHAT - 23678301 - https://github.com/nguyenphat/23678301.git - #355913

## BÀI THI THỰC HÀNH 1 - LẬP TRÌNH CHO THIẾT BỊ DI ĐỘNG (TH)
**Trường Đại học Công nghiệp TP. Hồ Chí Minh - Khoa CN Điện tử**

### 1. Thông tin sinh viên & Định danh
- **Họ và tên**: NGUYEN HUYNH TAN PHAT
- **MSSV**: 23678301
- **Chữ số cuối MSSV**: 1
- **STUDENT_SEED**: 301
- **Mã Stamp**: `#355913`
- **Dòng định danh App**: `TH1 · 23678301 · NGUYEN HUYNH TAN PHAT · #355913`
- **Link GitHub nộp bài (clone HTTPS)**: `https://github.com/nguyenphat/23678301.git`

### 2. Thông số và Biến thể theo MSSV (Số cuối = 1)
- **Vị trí Watermark**: Dưới chân màn hình (`watermarkAtTop: false`)
- **Nút chuyển đổi Sáng/Tối**: `Pressable` ("🌙 Tối" / "☀️ Sáng")
- **Kiểu mở Modal**: `fade` (`modalAnimation: 'fade'`)
- **Thứ tự 4 Chip Danh mục (Đảo ngược)**: `Học tập` → `Nước` → `Đồ ăn` → `Tất cả`
- **Thời gian Flash-sale**: `181` giây (03:01)
- **ID Ảnh Banner Picsum**: `201` (`https://picsum.photos/id/201/800/320`)
- **Hệ số nhân giá**: `20100` VNĐ

### 3. Cấu trúc thư mục dự án
```
CampusMart_23678301/
├── README.md
├── App.tsx
├── package.json
├── babel.config.js
├── metro.config.js
├── tsconfig.json
├── docs/
│   └── screenshot-th1.png
└── src/
    ├── constants/
    │   ├── student.ts
    │   └── theme.ts
    ├── contexts/
    │   └── ThemeContext.tsx
    ├── hooks/
    │   └── useCountdown.ts
    ├── services/
    │   └── productApi.ts
    ├── components/
    │   └── ui/
    │       ├── Typography.tsx
    │       ├── ShopInput.tsx
    │       └── ShopButton.tsx
    └── screens/
        └── HomeScreen.tsx
```

### 4. Báo cáo thực hiện các câu hỏi
- **Câu 1 (3.0đ)**: Khởi tạo React Native CLI + TypeScript, cấu hình Babel & TSConfig Path Aliases (`@constants`, `@contexts`, `@hooks`, `@services`, `@components`, `@screens`), cài đặt bộ Design System Atoms (`Typography`, `ShopInput`, `ShopButton`) với `StyleSheet.create` và `React.memo`.
- **Câu 2 (3.0đ)**: Thiết kế Giao diện Home với Header, Banner Picsum, 4 Chip đảo, FlatList tích hợp 3 trạng thái (Đang tải, Có dữ liệu, Lỗi mạng + Thử lại) và `ListEmptyComponent` khi không tìm thấy món. Dùng `useMemo` lọc tức thì và `useCallback` xử lý tương tác.
- **Câu 3 (4.0đ)**: Hộp thoại Modal Transparent dạng `fade`, quản lý số lượng bằng `useReducer` (không giảm dưới 1), bật `Alert.alert` xác nhận đúng định dạng, tích hợp `ThemeContext` (Dark/Light Mode), đồng hồ đếm ngược `useCountdown` tự động vô hiệu hóa nút đặt khi hết giờ.
