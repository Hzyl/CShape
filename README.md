# 🍜 Vĩnh Khánh Food Tour - PWA Đa Ngôn Ngữ

Vĩnh Khánh Food Tour là một ứng dụng Web Tiến Tiến (Progressive Web App - PWA) hỗ trợ cho khách du lịch khi tham quan Phố ẩm thực Vĩnh Khánh (Quận 4, TP.HCM). Ứng dụng cung cấp bản đồ số, thuyết minh đa ngôn ngữ tự động (Audio Guide), quét mã QR, và cả tính năng hỗ trợ giao tiếp cho người khuyết tật (AAC).

## ✨ Tính năng nổi bật (Features)

1. **🗺️ Bản Đồ Số & Định Vị GPS (Interactive Map)**
   - Sử dụng Leaflet.js để hiển thị bản đồ trực quan.
   - Định vị người dùng theo thời gian thực (Real-time GPS tracking).
   - Tự động phát hiện khi người dùng đi vào vùng địa lý của một quán ăn (Geofencing) bằng Haversine formula và hiển thị gợi ý mở thuyết minh.

2. **🔊 Thuyết Minh Tự Động Đa Ngôn Ngữ & Dịch AI (Multilingual Audio Guide)**
   - Hỗ trợ **20 ngôn ngữ quốc tế** phổ biến (VI, EN, JA, ZH, KO, TH, FR, ES, DE, RU, PT, IT, ID...).
   - **Tích hợp tính năng Dịch AI Tự Động**: Admin chỉ cần nhập văn bản nội dung quán ăn bằng Tiếng Việt hoặc Tiếng Anh. Hệ thống sẽ tự động gọi Google Translate API để dịch ẩn danh sang 18 ngôn ngữ còn lại khi du khách chọn.
   - Phát âm thanh thuyết minh sử dụng Web Speech API (tự động fallback gọi Google Translate Audio Endpoint cho các thiết bị cũ không nhận diện giọng).

3. **📱 Hỗ Trợ Offline & Cài Đặt PWA (Offline Support & Service Worker)**
   - Khả năng "Cài đặt" trực tiếp app web xuống màn hình Home Screen của điện thoại nhanh chóng.
   - Sử dụng Service Worker để bộ nhớ hệ thống (Cache Storage) giữ lại giao diện UI nội bộ dự phòng mất mạng.
   - Hiển thị thông báo khi mạng yếu, cho phép di chuyển bản đồ bình thường.

4. **📷 Quét Mã QR (QR Scanner Integration)**
   - Tích hợp HTML5-QRCode quét máy ảnh trực tiếp trên trình duyệt.
   - Du khách quét mã QR được dán tại các quán ăn để tự động hiển thị mô tả quán và mở audio thuyết minh nhà hàng. 
   - Admin CMS có sẵn chức năng gen hình mã QR dán cho từng nhà hàng khi tạo POI mới.

5. **💬 Nói Giúp Tôi (AAC Ngôn ngữ & Nhận diện tự động)**
   - Tính năng đặc biệt hỗ trợ quy trình giao tiếp hai chiều dành cho người câm/khuyết tật ngôn ngữ hoặc du khách nước ngoài mua hàng.
   - Tính năng Nhấn & Nhận diện: **Sử dụng thuật toán toán học Regex duyệt bảng nhóm mã Unicode** giúp nhận diện tự động cấu trúc ngôn ngữ chữ viết (hỗ trợ phân biệt **50+ ngôn ngữ** bao gồm tượng hình, Cyrillic, hệ Latin...).
   - Tự động lấy cấu trúc ngôn ngữ nhận diện điểu khiển Web Speech API giao tiếp thoại cho chủ quán ăn.

6. **📊 Xử lý & Quản Lý Dữ Liệu (Admin CMS & Analytics)**
   - Bảng điều khiển (Dashboard) thông qua xác thực bảo mật chuẩn JWT Authentication.
   - Theo dõi số phiên truy cập, lưu vết (Log) sự kiện nghe Audio và hoàn thành điểm đi.
   - Quản lý POI toàn diện: Thêm, Sửa, Xóa, Xem báo cáo theo chuẩn REST API.

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

### Backend
- **Framework**: ASP.NET Core 10 Web API
- **Database**: MongoDB (Atlas Cloud)
- **Kiến trúc**: RESTful API, Dependency Injection, CORS, tích hợp Middleware xử lý Analytics Auth.

### Frontend
- **Ngôn ngữ**: HTML5, Vanilla JavaScript, CSS3
- **Thư viện bản đồ**: Leaflet.js
- **Quét QR**: html5-qrcode
- **Lưu trữ Offline**: Service Worker PWA, Cache Storage API, Session Storage.
- **Engine Xử lý Text & Audio**: Google Translate API, Window Web Speech API.

## 🚀 Hướng Dẫn Chạy Dự Án (Getting Started)

### Yêu Cầu Hệ Thống
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [MongoDB Atlas URI](https://www.mongodb.com/cloud/atlas) (Hoặc cài đặt MongoDB Compass dưới Local).

### Cài Đặt (Setup)

1. **Sửa cấu hình Database:**
   Mở file `appsettings.json`, điền chuỗi kết nối MongoDB của bạn vào:
   ```json
   {
     "MongoDbSettings": {
       "ConnectionString": "mongodb+srv://<user>:<password>@cluster.mongodb.net/",
       "DatabaseName": "VinhKhanhDB"
     }
   }
   ```

2. **Khởi Chạy Máy Chủ Backend API:**
   Mở ứng dụng terminal/command line trỏ đường dẫn tại vị trí chứa code (`.csproj`) và nạp lệnh:
   ```bash
   dotnet run
   ```

3. **Truy Cập Ứng Dụng:**
   - Phiên bản PWA Khách Hàng: Truy cập `http://localhost:5033/index.html` (Hoặc lấy Local IP WiFi dán vào điện thoại để test PWA).
   - Trang Điều hành CMS: Truy cập `http://localhost:5033/admin.html`
   - Tài khoản Admin cấp sẵn mặc định: `admin` / `admin123`

### 💡 Lưu ý về HTTPS và Phân quyền Máy ảnh Thực tế
Quét mã QR (Camera API) và chế độ PWA Install bắt buộc chạy trên nền tảng **bảo mật HTTPS (Secure context)**. Nếu test bằng localhost máy tính, nó được mặc nhiên bỏ qua chuẩn này. Thế nhưng khi chạy qua IP điện thoại LAN mạng Wifi (ví dụ: `http://192.168.1.5:5033`), bạn cần cấu hình lại cho phép Insecure Origins trên Chrome để cấp quyền dùng Mic & Camera.

## 📁 Cấu Trúc Thư Mục Hệ Thống (Folder Structure)

```
VinhKhanhFoodTour.Api/
├── Controllers/       # Controller xử lý Endpoints (POIs, Auth Login, Analytics tracking).
├── Models/            # POCO C# đại diện JSON mapping cho Document MongoDB.
├── Services/          # Service xử lý tác vụ tương tác CRUD với DB.
├── wwwroot/           # Nơi chứa Web PWA UI Client (Tầng tĩnh)
│   ├── css/           # File Style định dạng giao diện PWA.
│   ├── js/            # Kiến trúc code Vanilla JS (app.js + admin.js).
│   ├── index.html     # Cổng giao diện View chính của du khách.
│   ├── admin.html     # Trang quản trị Backend cho Admin.
│   └── sw.js          # File trung tâm Service Worker Offline Catch API.
├── Program.cs         # Entry Point setup hệ thống Middleware ASP.NET.
└── appsettings.json   # Hệ thống cài đặt chuỗi kết nối Variables.
```
