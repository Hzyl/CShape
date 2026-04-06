# 🍜 Vĩnh Khánh Food Tour - PWA Đa Ngôn Ngữ

Vĩnh Khánh Food Tour là một ứng dụng Web Tiến Tiến (Progressive Web App - PWA) hỗ trợ cho khách du lịch khi tham quan Phố ẩm thực Vĩnh Khánh (Quận 4, TP.HCM). Ứng dụng cung cấp bản đồ số, thuyết minh đa ngôn ngữ tự động (Audio Guide), quét mã QR, và cả tính năng hỗ trợ giao tiếp cho người khuyết tật (AAC).

## ✨ Tính năng nổi bật (Features)

1. **🗺️ Bản Đồ Số & Định Vị GPS (Interactive Map)**
   - Sử dụng Leaflet.js để hiển thị bản đồ trực quan.
   - Định vị người dùng theo thời gian thực (Real-time GPS tracking).
   - Tự động phát hiện khi người dùng đi vào "vùng địa lý" của một quán ăn (Geofencing) và hiển thị gợi ý nghe thuyết minh.

2. **🔊 Thuyết Minh Tự Động Đa Ngôn Ngữ (Multilingual Audio Guide)**
   - Hỗ trợ 4 ngôn ngữ: Tiếng Việt (VI), Tiếng Anh (EN), Tiếng Nhật (JA), Tiếng Trung (ZH).
   - Sử dụng Web Speech API (tự động fallback sang Google Translate TTS trên điện thoại nếu thiết bị không có sẵn công cụ đọc).
   - Quản lý hàng chờ âm thanh, hệ thống chống trùng lặp chống phát nhiều lần liên tục.

3. **📱 Hỗ Trợ Offline & PWA (Offline Support)**
   - Có thể "Cài đặt" ứng dụng trực tiếp lên màn hình chính điện thoại (Thêm vào Home Screen) giống hệt một Native App.
   - Cache lại giao diện và lưu trữ thông tin các điểm tham quan (POIs) qua IndexedDB.
   - Vẫn có thể định vị và xem danh sách các quán ăn ngay cả khi **mất kết nối mạng (Offline)**. 

4. **📷 Quét Mã QR (QR Scanner Integration)**
   - Quản lý có thể in mã QR (có tích hợp sẵn ở trang Admin) để đặt tại các quán ăn.
   - Du khách dùng điện thoại quét mã bằng Camera hệ thống hoặc quét trực tiếp trong web thì thông tin và âm thanh thuyết minh sẽ tự động nhảy lên.

5. **💬 Nói Giúp Tôi (AAC - Augmentative and Alternative Communication)**
   - Tính năng đặc biệt hỗ trợ giao tiếp dành cho người câm/khuyết tật ngôn ngữ hoặc du khách không thạo tiếng địa phương.
   - Tự động phát hiện (Auto-detect) ngôn ngữ (Tiếng Việt, Trung, Nhật, Anh) qua văn bản và đọc to nội dung cần nói.
   - Tích hợp sẵn 16 cụm từ phổ biến (Tính tiền, Xin chào, Cho đá...) cho từng ngôn ngữ để chọn nhanh.

6. **📊 Xử lý & Quản Lý Dữ Liệu (Admin CMS & Analytics)**
   - Bảng điều khiển (Dashboard) theo dõi thống kê số phiên truy cập, biểu đồ POI được nghe nhiều nhất.
   - Lập bản đồ nhiệt (Heatmap) biểu thị mật độ di chuyển của du khách.
   - Quản lý POI toàn diện: Thêm, Sửa, Xóa, Bật/Tắt (Khóa hiển thị), Xem và In mã QR.

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

### Backend
- **Framework**: ASP.NET Core 10 Web API
- **Database**: MongoDB (Atlas)
- **Kiến trúc**: RESTful API, Dependency Injection, CORS, tích hợp Middleware xử lý Analytics.

### Frontend
- **Ngôn ngữ**: HTML5, Vanilla JavaScript, CSS3
- **Thư viện bản đồ**: Leaflet.js
- **Quét QR**: html5-qrcode
- **Lưu trữ**: Service Worker, Caches API, IndexedDB (hỗ trợ bởi thư viện Dexie.js / IdB Wrapper).
- **Audio TTS**: Window Web Speech API (Fallback qua Google Translate TTS Endpoint). 

## 🚀 Hướng Dẫn Chạy Dự Án (Getting Started)

### Yêu Cầu Hệ Thống
- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [MongoDB Atlas URI](https://www.mongodb.com/cloud/atlas) (Hoặc MongoDB Compass local).

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

2. **Chạy Project:**
   Mở terminal tại thư mục gốc của project (có chứa `.csproj`) và chạy:
   ```bash
   dotnet run
   ```

3. **Truy Cập:**
   - App người dùng: `http://localhost:5000/index.html` (Hoặc chạy qua IP mạng LAN để test trên điện thoại).
   - Trang Admin: `http://localhost:5000/admin.html`
   - Tài khoản Admin mặc định: `admin` / `admin123`

### 💡 Lưu ý về HTTPS và Test Thiết Bị Thực
Tính năng truy cập Camera (để quét QR) và Service Worker (PWA Offline) yêu cầu web phải chạy ở chuẩn **Bảo mật (Secure context)**. Do đó web phải chạy trên `localhost` hoặc chuẩn **HTTPS**.
- Nếu bạn test bằng IP LAN trên điện thoại (vd: `http://192.168.1.5:5000`), bạn cần phải [thiết lập cho phép truy cập Insecure Origins qua Flags](https://medium.com/@lokeshpathrabe/how-to-test-service-worker-pwa-on-mobile-devices-in-lan-3ab12398dfee) trên trình duyệt Chrome để cho phép camera và mic.

## 📁 Cấu Trúc Thư Mục (Folder Structure)

```
VinhKhanhFoodTour.Api/
├── Controllers/       # Controller xử lý API endpoints (POIs, Auth, Analytics).
├── Models/            # POCO C# đại diện cấu trúc CSDL MongoDB.
├── Services/          # Service xử lý tác vụ DB, thuật toán và logic kinh doanh.
├── wwwroot/           # Nơi chứa Web PWA Frontend
│   ├── css/           # System Design & UI Styling.
│   ├── js/            # Các modules Client, App logic, Service Worker.
│   ├── index.html     # Cổng giao diện chính của người dùng du lịch.
│   ├── admin.html     # Trang quản trị dành cho ban quản lý.
│   └── sw.js          # Khai báo Service Worker điều hướng cache cho App (PWA).
├── Program.cs         # Entry Point setup hệ thống ASP.NET Core Server.
└── appsettings.json   # Hệ thống cài đặt biến môi trường.
```
