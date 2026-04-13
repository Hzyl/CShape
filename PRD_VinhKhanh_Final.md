# PRD: Ứng dụng Thuyết minh Đa ngôn ngữ Phố Ẩm thực Vĩnh Khánh 

| Trường | Nội dung |
|---|---|
| Tên dự án | Ứng dụng Thuyết minh Đa ngôn ngữ Phố Ẩm thực Vĩnh Khánh |
| Phiên bản | 1.0 — MVP |
| Trạng thái | Final — Đã review kỹ thuật |
| Phạm vi hệ thống | Progressive Web App (Vanilla JS/HTML5/CSS3) + Web CMS (Admin) + Backend API (ASP.NET Core 10) + Database (MongoDB Atlas) |
| Địa bàn | Phố Vĩnh Khánh, Quận 4, TP.HCM |
| Ngôn ngữ hỗ trợ | 20 ngôn ngữ: VI, EN, JA, ZH, KO, TH, FR, ES, DE, RU, PT, IT, ID, HI, AR, MS, TL, NL, SV, PL — Admin chỉ nhập VI hoặc EN, 18 ngôn ngữ còn lại dịch tự động |
| Mục tiêu học thuật | Đồ án môn học / Tài liệu lưu trữ dự án |

---

## 1. TL;DR
Ứng dụng di động dạng web (PWA) hướng tới du khách tại Phố Vĩnh Khánh (Q4, TPHCM), tự động phát âm thanh thuyết minh đa ngôn ngữ khi đến gần điểm tham quan (POI) qua GPS hoặc quét QR code. Hỗ trợ **20 ngôn ngữ** — Admin chỉ cần nhập nội dung **tiếng Việt hoặc tiếng Anh**, hệ thống tự động dịch sang 18 ngôn ngữ còn lại bằng Google Translate API. Tính năng AAC "Nói giúp tôi" tích hợp AI nhận diện **50+ ngôn ngữ** qua Unicode.

## 2. Goals
### Business Goals
* Đảm bảo audio phát tự động trong vòng ≤3 giây khi kích hoạt qua GPS hoặc QR code.
* Hỗ trợ đầy đủ ngôn ngữ với hệ thống fallback qua Google Translate TTS nếu thiết bị không có sẵn giọng đọc.
* CMS quản lý POI, audio, analytics không cần kỹ năng lập trình cho admin.
* Báo cáo heatmap, bảng xếp hạng POI phổ biến.

### User Goals
* Trải nghiệm nghe thuyết minh tự động, không thao tác thủ công.
* Linh hoạt chọn/đổi ngôn ngữ, dễ dàng gọi người hỗ trợ giao tiếp qua tiếng bản địa.
* Quét QR khi định vị GPS kém ổn định.
* Hỗ trợ lưu trữ offline dữ liệu.

### Non-Goals
* Không tích hợp thanh toán hoặc mua bán trong phiên bản này.
* Không gửi push notification cho người dùng cuối qua server.
* Không yêu cầu tạo tài khoản cho người dùng cuối (du khách).

## 3. User Stories (Câu chuyện người dùng)
**Persona 1 — Du khách (End User)**
* Xem bản đồ các quán ăn (POI), tự động nghe audio thuyết minh khi đi gần quán, chọn ngôn ngữ, play/pause/seek, quét mã QR.
* Sử dụng bảng AAC "Nói giúp tôi" để giao tiếp bằng tiếng bản địa với chủ quán.

**Persona 2 — Admin (Quản trị viên)**
* Đăng nhập CMS bảo mật bằng JWT.
* Quản lý CRUD thông tin POI, tạo mã QR, theo dõi Analytics tải heatmap và danh sách quán hot.

## 4. Functional Requirements
* **Authentication & Authorization (High):** JWT-based authentication cho Admin.
* **Geofencing/GPS (High):** Bắt GPS liên tục. Overlapping POI: chọn ưu tiên khoảng cách gần.
* **QR Code Scanner (High):** Quét mã QR lấy POI Id -> Lấy dữ liệu và Phát Audio ngay lập tức.
* **CMS POI Management (High):** Quản lý Tên, tọa độ, mô tả thông tin quán.
* **Analytics (Medium):** Ghi dấu behavior, đếm số lượt nghe hoàn thành và lưu log heatmap. Tính trung bình thời gian nghe.

## 5. Technical Considerations (Đã chỉnh sửa thực tế)
* **Backend:** C# ASP.NET Core 10 (async), Architecture chuẩn REST.
* **Database:** MongoDB Atlas (NoSQL Document Store).
* **Frontend Mobile / Web CMS:** Progressive Web App (PWA) dùng Vanilla JS, CSS3, HTML5 thay cho React Native. Tận dụng Service Worker và IndexedDB lưu Offline.
* **Bản đồ:** Leaflet.js sử dụng OpenStreetMap.
* **Audio TTS Engine:** Client-side Window Web Speech API. Fallback sang Google Translate TTS Endpoint nếu thiết bị không có Voice pack.
* **Dịch tự động (Auto-Translation):** Google Translate API (`translate.googleapis.com`) client-side. Admin chỉ cần nhập tiếng Việt hoặc tiếng Anh (có 1 trong 2 là đủ), hệ thống tự dịch sang 18 ngôn ngữ còn lại khi du khách chọn, kết quả được cache trong bộ nhớ.
* **AAC Language Detection:** Bộ nhận diện ngôn ngữ tự viết dựa trên Unicode Range + Pattern Matching, hỗ trợ 50+ ngôn ngữ (25 hệ chữ viết + 16 ngôn ngữ Latin).

## 6. Business Rules
| Rule | Diễn giải |
|---|---|
| BR-01 | Nếu user khoảng cách ≤ radius -> Quét vùng nhập, tự động kích hoạt Audio. |
| BR-02 | Không spam audio nếu người dùng bấm Dừng (Stop) hoặc thoát vùng nhanh. |
| BR-03 | Chỉ Track lượt nghe (Analytics) khi audio phát END hoặc khi người dùng tác động nút STOP. |
| BR-04 | Quét mã QR là tác vụ chủ động -> Truy cập POI và Audio luôn, không cần check dải tọa độ GPS ngoài khu vực. |
| BR-05 | Client-side TTS: Âm thanh không được tạo dưới backend để tránh sập máy chủ. Text sẽ được Frontend gửi thẳng ra các API âm thanh. |
| BR-06 | Khi du khách chọn ngôn ngữ chưa có sẵn trong DB (vd: Tiếng Hàn) → hệ thống tự động dịch ttsScript từ tiếng Việt sang tiếng Hàn qua Google Translate API → Cache kết quả → Phát Audio bằng đúng ngôn ngữ đã chọn. |
| BR-07 | AAC "Nói giúp tôi" sử dụng AI nhận diện tự động ngôn ngữ từ ký tự Unicode, hỗ trợ 50+ ngôn ngữ mà không cần người dùng chọn tay. |

---

## 7. Dữ Liệu Lịch Sử (Data Schema MongoDB — 4 Collections)
* **`pois`**: `id`, `name` (đa ngôn ngữ), `description` (đa ngôn ngữ), `category`, `latitude`, `longitude`, `radius`, `priority`, `ttsScript` (đa ngôn ngữ), `qrCode`, `address`, `openingHours`, `priceRange`, `isActive`, `createdAt`.
* **`analytics`**: `id`, `sessionId`, `eventType` (`poi_enter`, `poi_listen`, `poi_complete`, `qr_scan`, `location_update`), `poiId`, `duration`, `latitude`, `longitude`, `timestamp`.
* **`tours`**: `id`, `name` (đa ngôn ngữ), `description` (đa ngôn ngữ), `poiIds` (danh sách POI theo thứ tự), `estimatedDuration` (phút), `estimatedDistance` (km), `isActive`, `createdAt`.
* **`users`**: `id`, `username`, `passwordHash`, `role` (`admin`, `editor`), `createdAt`.

---

## 8. Sơ Đồ Chuỗi Xử Lý (Sequence Diagrams)

### 8.1 Luồng Xử Lý Quét Mã QR (Đã Sửa Logic GPS)

```mermaid
sequenceDiagram
    actor User as Người dùng
    participant App as Frontend (PWA)
    participant Scanner as Html5-Qrcode
    participant API as Backend (ASP.NET Core)
    participant DB as MongoDB Atlas

    User->>App: Chọn tính năng Quét QR
    App->>Scanner: Mở Camera
    User->>Scanner: Quét mã QR tại quán
    Scanner-->>App: Trả về mã chuỗi QR (chứa POI ID)
    
    App->>API: GET /api/poi/{id}
    API->>DB: Truy vấn dữ liệu POI
    DB-->>API: Trả về document
    
    alt Lỗi không có dữ liệu
        API-->>App: Trả về lỗi 404
        App-->>User: Hiện thông báo: "QR không tìm thấy!"
    else Thành công
        API-->>App: Dữ liệu JSON quán ăn hợp lệ
        App-->>User: Hiện thông tin quán
        App->>App: Đẩy dữ liệu vào Audio Manager
        App-->>User: Phát Audio đọc giới thiệu
    end
```

### 8.2 Luồng Phát Thuyết Minh Đa Ngôn Ngữ (Có Dịch Tự Động)

```mermaid
sequenceDiagram
    actor User as Người dùng
    participant App as Frontend (PWA App)
    participant API as Backend (ASP.NET Core)
    participant GTranslate as Google Translate API
    participant BrowserTTS as Window Web Speech API
    participant GoogleTTS as Google Translate TTS (Fallback)

    User->>App: Chọn ngôn ngữ (vd: Hàn Quốc) + Bấm "Nghe"
    App->>API: GET /api/poi/{id}
    API-->>App: Trả về ttsScript (chỉ có vi/en/ja/zh)
    
    alt Có sẵn ttsScript cho ngôn ngữ đang chọn
        App->>App: Dùng text có sẵn
    else Chưa có (vd: ttsScript.ko không tồn tại)
        App->>GTranslate: Dịch ttsScript.vi → tiếng Hàn
        GTranslate-->>App: Trả về text đã dịch
        App->>App: Cache kết quả dịch vào bộ nhớ
    end
    
    App->>BrowserTTS: Gửi Text đã dịch yêu cầu đọc
    
    alt Thiết bị có Voice cho ngôn ngữ này
        BrowserTTS-->>App: Phát âm thanh thành công
        App-->>User: Nghe Audio đúng ngôn ngữ
    else Không có Voice
         App->>GoogleTTS: Fallback Google TTS
         GoogleTTS-->>App: Trả về file Audio
         App-->>User: Phát Fallback Audio
    end
    
    App->>API: Gửi Analytics poi_listen / poi_complete
```

### 8.3 Luồng Bản Đồ và Geofencing Nội Bộ (Đã Sửa Tech Stack)

```mermaid
sequenceDiagram
    actor User as Người dùng
    participant App as Frontend (Leaflet.js)
    participant Geo as Geolocation API (Trình duyệt)
    participant API as Backend (ASP.NET Core)
    
    User->>App: Mở ứng dụng
    App->>Geo: Yêu cầu quyền Vị Trí (GPS)
    Geo-->>App: Tọa độ (Lat/Lng) liên tục mỗi 1-5s
    App->>API: Khởi tạo GET /api/poi/all
    API-->>App: Dữ liệu mảng các Quán ăn
    
    loop Mỗi khi đổi vị trí
        App->>App: Tính toán khoảng cách (Turf.js / Haversine)
        alt Khoảng cách < Bán kính POI (50m)
            App-->>User: Bật Popup thông báo "Bạn đang ở gần quán X, có muốn nghe không?"
        end
    end
```

### 8.4 Luồng Xác Thực Admin (Auth)

```mermaid
sequenceDiagram
    actor Admin as Quản trị viên
    participant Web as Admin Dashboard
    participant API as AuthController (ASP.NET)
    participant DB as MongoDB

    Admin->>Web: Nhập Username/Password
    Web->>API: POST /api/auth/login
    API->>DB: Xác thực Hash Password
    DB-->>API: Match
    API-->>Web: Trả về JWT Token
    Web->>Web: Lưu Token vào `sessionStorage`
    Web-->>Admin: Vào bảng điều khiển (Dashboard)
```

