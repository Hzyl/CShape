# 🍜 Vĩnh Khánh Food Tour - PWA Đa Ngôn Ngữ

Vĩnh Khánh Food Tour là một ứng dụng Web Tiến Bộ (Progressive Web App - PWA) hỗ trợ khách du lịch khi tham quan Phố ẩm thực Vĩnh Khánh (Quận 4, TP.HCM). Ứng dụng cung cấp bản đồ số, thuyết minh đa ngôn ngữ tự động (Audio Guide), quét mã QR, và tính năng hỗ trợ giao tiếp cho người khuyết tật/người khó nói (AAC).

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
   - QR thực tế encode URL dạng `/index.html?qr=<POI_CODE>`: quét bằng camera hệ thống hoặc scanner trong app đều mở đúng điểm thuyết minh.
   - Admin CMS tạo QR local bằng thư viện `qrcode`; nếu CDN lỗi mới fallback sang QR server bên ngoài.
   - Mobile browser thường chặn autoplay, nên sau khi quét QR app mở chi tiết POI và hiện nút “Nghe thuyết minh” để user bấm phát audio hợp lệ.

5. **💬 Nói Giúp Tôi (AAC Ngôn ngữ & Nhận diện tự động)**
   - Tính năng đặc biệt hỗ trợ quy trình giao tiếp hai chiều dành cho người câm/khuyết tật ngôn ngữ hoặc du khách nước ngoài mua hàng.
   - Tính năng Nhấn & Nhận diện: **Sử dụng thuật toán toán học Regex duyệt bảng nhóm mã Unicode** giúp nhận diện tự động cấu trúc ngôn ngữ chữ viết (hỗ trợ phân biệt **50+ ngôn ngữ** bao gồm tượng hình, Cyrillic, hệ Latin...).
   - Tự động lấy cấu trúc ngôn ngữ nhận diện điểu khiển Web Speech API giao tiếp thoại cho chủ quán ăn.

6. **📊 Xử lý & Quản Lý Dữ Liệu (Admin CMS & Analytics)**
   - Bảng điều khiển (Dashboard) đăng nhập bằng token HMAC ký server-side; token gửi qua `Authorization: Bearer ...` cho các API quản trị.
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

1. **Sửa cấu hình Database (không commit secret):**
   File `appsettings.json` không chứa mật khẩu thật. Khi cần kết nối MongoDB, tạo file local `appsettings.Local.json` từ mẫu `appsettings.Local.example.json` hoặc dùng biến môi trường `MongoDB__ConnectionString`:
   ```json
   {
     "MongoDB": {
       "ConnectionString": "mongodb+srv://<user>:<password>@cluster.mongodb.net/",
       "DatabaseName": "VinhKhanhFoodTour"
     }
   }
   ```
   Nếu chưa cấu hình MongoDB, backend tự mở demo API in-memory và frontend vẫn có demo fallback POI để bảo vệ chức năng UI/i18n/QR/TTS.
   Khi chạy thật, nên đặt thêm biến môi trường `AUTH_TOKEN_SECRET` để thay secret demo dùng ký token admin.

2. **Khởi Chạy Máy Chủ Backend API / LAN Demo:**
   Mở terminal tại thư mục dự án và chạy:
   ```bash
   dotnet run --project CShape/VinhKhanhFoodTour.Api/VinhKhanhFoodTour.Api.csproj
   ```
   App bind mặc định `0.0.0.0:5000`, nên máy khác cùng WiFi/LAN có thể truy cập bằng IP LAN của máy chạy demo.

3. **Truy Cập Ứng Dụng:**
   - Trên máy chạy demo: `http://localhost:5000/index.html` và `http://localhost:5000/admin.html`
   - Trên điện thoại/máy giảng viên cùng WiFi: `http://<IP-LAN-của-máy>:5000/index.html`
   - Trang Admin LAN: `http://<IP-LAN-của-máy>:5000/admin.html`
   - Có thể xem IP LAN app tự nhận tại `http://localhost:5000/api/system/network`
   - Tài khoản Admin cấp sẵn mặc định: `admin` / `admin123`
   - Khi mở modal QR trong Admin, QR sẽ ưu tiên sinh link LAN để điện thoại quét mở được; nếu máy có nhiều card mạng, nhập đúng `http://192.168.x.x:5000` vào ô LAN origin trong modal QR.

### 💡 Lưu ý về HTTPS và Phân quyền Máy ảnh Thực tế
Luồng thực tế khi demo QR là dùng camera mặc định của điện thoại quét mã QR đã in/dán, QR mở thẳng URL `http://<IP-LAN>:5000/index.html?qr=...`; luồng này không cần Web Camera API trong app. Riêng nút “Quét QR” bên trong web app dùng Camera API, nên khi chạy qua LAN dạng HTTP một số trình duyệt sẽ chặn camera; muốn demo nút này cần HTTPS hoặc bật Insecure Origins cho địa chỉ `http://<IP-LAN>:5000` trên Chrome.

## 🎓 Ghi Chú Demo / Bảo Vệ

- Mở `HUONG_DAN_BAO_VE_I18N_DEMO.md` để xem câu trả lời theo kiểu giảng viên hỏi sequence → method → code.
- Mô hình đa ngôn ngữ: Admin chỉ nhập `vi/en`; 18 ngôn ngữ còn lại dịch runtime ở frontend, cache bằng `localStorage` + RAM.
- Nút `record_voice_over` cạnh dropdown dùng để test nhanh TTS của ngôn ngữ đang chọn.
- Nếu Google Translate/TTS hoặc MongoDB không khả dụng, app fallback về `vi/en`, demo API in-memory và dữ liệu demo để buổi bảo vệ không bị trắng màn hình.
- QR là luồng thực tế nhất khi GPS trong phố nhỏ bị lệch; app có banner nhắc quét QR nếu GPS lỗi hoặc chưa bắt vị trí.
- Demo cho giảng viên/điện thoại phải dùng `http://<IP-LAN>:5000`, không dùng QR chứa `localhost` vì `localhost` trên điện thoại là chính điện thoại chứ không phải laptop chạy server.

## ⚠️ Giới Hạn MVP & Hướng Nâng Cấp

- Google Translate/TTS client-side phù hợp demo; triển khai thật nên dùng API chính thức hoặc backend proxy để kiểm soát quota/lỗi mạng.
- GPS trong phố nhỏ có thể sai lệch; QR dán tại quán là luồng thực tế và ổn định hơn.
- Mobile browser thường chặn autoplay; app dùng prompt/nút nghe để tuân thủ chính sách trình duyệt.
- Unicode regex của AAC là heuristic nhận diện hệ chữ, không phải mô hình AI phân loại ngôn ngữ tuyệt đối.
- Nâng cấp tiếp theo: lưu translation cache vào IndexedDB, xuất QR PDF theo lô để in/dán tại quán, triển khai HTTPS/public hosting, thêm backend translation proxy và quản lý nội dung ảnh/menu thật.

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
