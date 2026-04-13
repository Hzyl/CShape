# PRD: Ứng dụng Thuyết minh Đa ngôn ngữ Phố Ẩm thực Vĩnh Khánh 

| Trường | Nội dung |
|---|---|
| Tên dự án | Ứng dụng Thuyết minh Đa ngôn ngữ Phố Ẩm thực Vĩnh Khánh |
| Phiên bản | 1.0 — MVP |
| Trạng thái | Final |
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

## 5. Technical Considerations
* **Backend:** C# ASP.NET Core 10 (async), Architecture chuẩn REST.
* **Database:** MongoDB Atlas (NoSQL Document Store).
* **Frontend Mobile / Web CMS:** Progressive Web App (PWA) dùng Vanilla JS, CSS3, HTML5 thay cho React Native. Tận dụng Service Worker và IndexedDB lưu Offline.
* **Bản đồ:** Leaflet.js sử dụng OpenStreetMap.
* **Audio TTS Engine:** Client-side Window Web Speech API. Fallback sang Google Translate API Endpoint nếu thiết bị không có Voice pack.
* **Dịch tự động (Auto-Translation):** Google Translate API (`translate.googleapis.com`) client-side. Admin chỉ cần nhập tiếng Việt hoặc tiếng Anh (có 1 trong 2 là đủ), hệ thống tự dịch sang 18 ngôn ngữ còn lại khi du khách chọn, kết quả được cache trong bộ nhớ.
* **AAC Language Detection:** Bộ nhận diện ngôn ngữ tự viết dựa trên Unicode Range + Pattern Matching, hỗ trợ nhận diện tự động 50+ ngôn ngữ từ văn bản đầu vào.

## 6. Business Rules
| Rule | Diễn giải |
|---|---|
| BR-01 | Nếu user khoảng cách ≤ radius -> Quét vùng nhập, tự động kích hoạt Audio. |
| BR-02 | Không spam audio nếu người dùng bấm Dừng (Stop) hoặc thoát vùng nhanh. |
| BR-03 | Chỉ Track lượt nghe (Analytics) khi audio phát END hoặc khi người dùng tác động nút STOP. |
| BR-04 | Quét mã QR là tác vụ chủ động -> Truy cập POI và Audio luôn, không cần check dải tọa độ GPS ngoài khu vực. |
| BR-05 | Client-side TTS: Âm thanh không được tạo dưới backend để tránh sập máy chủ. Text sẽ được Frontend gửi thẳng ra các API âm thanh. |
| BR-06 | Khi du khách chọn ngôn ngữ chưa có sẵn trong DB (vd: Tiếng Hàn) → hệ thống tự động dịch ttsScript từ tiếng Việt sang tiếng Hàn qua Google Translate API → Cache kết quả → Phát Audio bằng đúng ngôn ngữ đã chọn. |
| BR-07 | AAC "Nói giúp tôi" sử dụng AI nhận biết tự động hệ ngôn ngữ từ ký tự Unicode mà không cần chọn thủ công. |

---

## 7. Dữ Liệu Lịch Sử (Data Schema MongoDB — 4 Collections)
* **`pois`**: `id`, `name` (đa ngôn ngữ), `description` (đa ngôn ngữ), `category`, `latitude`, `longitude`, `radius`, `priority`, `ttsScript` (đa ngôn ngữ), `qrCode`, `address`, `openingHours`, `priceRange`, `isActive`, `createdAt`.
* **`analytics`**: `id`, `sessionId`, `eventType` (`poi_enter`, `poi_listen`, `poi_complete`, `qr_scan`, `location_update`), `poiId`, `duration`, `latitude`, `longitude`, `timestamp`.
* **`tours`**: `id`, `name` (đa ngôn ngữ), `description` (đa ngôn ngữ), `poiIds` (danh sách POI theo thứ tự), `estimatedDuration` (phút), `estimatedDistance` (km), `isActive`, `createdAt`.
* **`users`**: `id`, `username`, `passwordHash`, `role` (`admin`, `editor`), `createdAt`.

---

## 8. Sơ Đồ Kiến Trúc Hệ Thống (System Architecture Diagram)

```mermaid
graph TD
    subgraph Client [Tầng Client - Frontend PWA & Web Admin]
        UI[Giao diện Dùng chung HTML/CSS]
        SW[Service Worker - Offline Cache]
        AppJS[Logic Khách hàng - app.js]
        AdminJS[Logic Admin - admin.js]
        Map[Bản đồ Map Leaflet.js]
        Audio[Bộ xử lý Audio Engine TTS]
        QRScanner[Trình Quét Hình QR]
        AI[AI Language/Unicode Detector]
    end

    subgraph External [Dịch vụ Bên Thứ 3 - 3rd Party API]
        OSM[OpenStreetMap]
        Translate[Google Translate API]
        QRGen[QRServer API Sinh Hình Ảnh]
    end

    subgraph Backend [Tầng Backend - ASP.NET Core 10]
        API_Auth[Auth Controller]
        API_POI[POI Controller]
        API_Analytics[Analytics Controller]
        API_Tour[Tour Controller]
    end

    subgraph Database [Tầng Dữ liệu Data]
        Mongo[(MongoDB Atlas Cloud)]
    end

    %% Mối liên kết Client - External
    Map -->|Load Tile Map| OSM
    Audio -->|Dịch & Fallback Giọng Đọc Google| Translate
    AdminJS -->|Tạo mã QR Admin Print| QRGen
    
    %% Gọi API
    AppJS -->|Tương Tác API Rest| Backend
    AdminJS -->|Admin Quản Trị JSON API| Backend
    
    %% Mối liên kết nội bộ thiết bị
    UI --> AppJS
    UI --> AdminJS
    UI --> SW
    AppJS --> AI
    AppJS --> Audio
    AppJS --> QRScanner

    %% Mối liên kết Backend - DB
    API_Auth --> Mongo
    API_POI --> Mongo
    API_Analytics --> Mongo
    API_Tour --> Mongo
```

---

## 9. Sơ Đồ Chuỗi Xử Lý (Sequence Diagrams)

### 9.1 Luồng Xử Lý Quét Mã QR

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

### 9.2 Luồng Phát Thuyết Minh Đa Ngôn Ngữ (Có Dịch Thuật AI Tự Động)

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
    API-->>App: Trả về ttsScript (chỉ có vi/en)
    
    alt Có sẵn ttsScript cho ngôn ngữ đang chọn
        App->>App: Dùng text có sẵn
    else Chưa có bản địa hóa
        App->>GTranslate: Dịch ttsScript.vi → tiếng Hàn
        GTranslate-->>App: Trả về text đã dịch
        App->>App: Cache kết quả dịch vào bộ nhớ RAM
    end
    
    App->>BrowserTTS: Gửi Text đã dịch yêu cầu đọc
    
    alt Thiết bị có Voice đọc tiếng bản địa
        BrowserTTS-->>App: Phát âm thanh thành công
        App-->>User: Nghe Audio đúng ngôn ngữ
    else Thiết bị Không có Voice TTS ngôn ngữ lạ
         App->>GoogleTTS: Gọi GET API Fallback Audio Của Google
         GoogleTTS-->>App: Trả về luồng tập tin MP3/Audio
         App-->>User: Phát File Audio
    end
    
    App->>API: Gửi thông số Analytics JSON (poi_listen / poi_complete)
```

### 9.3 Luồng Tính Năng Bản Đồ và Geofencing Hàng Rào Ảo

```mermaid
sequenceDiagram
    actor User as Người dùng
    participant App as Frontend (Leaflet.js)
    participant Geo as Geolocation API (Trình duyệt)
    participant API as Backend (ASP.NET Core)
    
    User->>App: Mở ứng dụng
    App->>Geo: Yêu cầu quyền truy cập Vị Trí (GPS)
    Geo-->>App: Trả về Tọa độ (Lat/Lng) liên tục mỗi 1-5s
    App->>API: Khởi tạo dữ liệu bằng (GET /api/poi/all)
    API-->>App: Dữ liệu mảng toàn bộ Quán ăn trên đường
    
    loop Mỗi khi vị trí thay đổi (Khách di chuyển)
        App->>App: Tính toán khoảng cách hiện tại đến các tập POI bằng Haversine formula
        alt Khoảng cách < Bán kính POI quy định (vd: 50m)
            App-->>User: Bật thẻ Popup trên màn hình "Nghe ngay" thông báo đã tới nơi
        end
    end
```

### 9.4 Luồng Xác Thực và Quản Trị Hệ Thống (CMS Admin)

```mermaid
sequenceDiagram
    actor Admin as Quản trị viên
    participant Web as Admin Dashboard
    participant API as AuthController (ASP.NET)
    participant DB as MongoDB Atlas
    participant QRGen as QRServer API

    Admin->>Web: Nhập Username/Password đăng nhập
    Web->>API: Gửi POST Request /api/auth/login
    API->>DB: Tìm user và So sánh Hash Password
    DB-->>API: Match True
    API-->>Web: Kết xuất token JWT (JSON Web Token)
    Web->>Web: Lưu JWT vào Session Storage trình duyệt
    Web-->>Admin: Render bảng điều khiển (Dashboard)
    
    Admin->>Web: Thêm POI Mới (Nhập tên quán, script thuyết minh, vị trí LatLng)
    Web->>API: Request POST /api/poi (Có Auth Bearer Header)
    API->>DB: Đẩy Schema mới vào kho dữ liệu
    DB-->>Web: Trả về trạng thái Status Created
    
    Admin->>Web: Nhấn xem mã QRCode của quán vừa tạo
    Web->>QRGen: Truyền URL Web App (Tham số ID) đến API Gen Hình ảnh web thứ 3
    QRGen-->>Web: Gửi Cdn File PNG / SVG của mã phân giải
    Web-->>Admin: Hiển thị giao diện In ấn trực tiếp Print View Modal
```

### 9.5 Luồng Giao Tiếp Người Khuyết Tật Hỗ Trợ Đa Ngôn Ngữ (AAC) (Nhận Diện Ngôn Ngữ Thông Minh AI)

```mermaid
sequenceDiagram
    actor User as Du khách / Người Khuyết Tật
    participant C as Frontend (PWA App JS)
    participant U as Unicode String Parser Math
    participant TSS as Window Browser Web Speech API
    participant GF as Google Translate Audio (Fallback)

    User->>C: Bấm chọn các icon tình huống để nhờ giao tiếp, nói giúp với chủ quán
    C->>U: Truyền chuỗi String văn bản nội dung hiện tại
    U->>U: Tính toán Regex quét mảng ký tự dựa vào Cấu trúc Hệ chữ Unicode toàn cầu
    U-->>C: Trả về Mã BCP47 chính xác tuyệt đối loại ngôn ngữ văn bản (ja, ko, th, ru, de...)
    
    C->>TSS: Ra lệnh gọi Engine đọc ngầm Text theo mã Code Language vừa quét được
    
    alt Xử Lý Native Đạt Yêu Cầu
        TSS-->>C: Đã kích hoạt Voice
        C-->>User: Phát loa ngoài ngôn ngữ tương thích lập tức
    else Máy cấu hình yếu/Không Tải Voice OS
         C->>GF: Gọi lên API dự phòng Google với String Text mã hóa URL Encode
         GF-->>C: Generate mảng byte Audio File Buffer
         C-->>User: Phát Audio Fallback để chủ cửa hàng nghe thấy
    end
```

### 9.6 Luồng Xử Lý Mất Kết Nối Mạng Tạm Thời PWA (Offline Capability)

```mermaid
sequenceDiagram
    actor User as Du Khách Nước Ngoài Sài 3G
    participant B as Mobile Chrome/Safari
    participant SW as Worker Đóng Ngầm (Service Worker PWA)
    participant Cache as Network Cache Storage (Trình Duyệt)
    participant Server as Cloud Backend ASP.NET

    Note over User,Server: Luồng tải lên lần đầu (Khi còn sóng 4G/Wifi kết nối)
    User->>B: Truy cập Domain đường link Web/App Lần đầu
    B->>SW: Register Cài Đặt Ứng Dụng Service Worker PWA
    SW->>Server: Kéo toàn bộ File tĩnh Asset (Font/CSS/JS/Hình nền/Audio Intro)
    Server-->>SW: Xả Stream Payload
    SW->>Cache: Lưu lại ghi đè vào Disk bộ nhớ lưu trữ Offline trong thiết bị

    Note over User,Server: Luồng sụp ngầm (Khi Du khách thám hiểm sâu / Mất Sóng)
    User->>B: Ấn vào Menu chức năng hoặc reload
    B->>SW: Đang chuẩn bị gọi các HTTP Fetch qua mạng
    SW->>Server: Kích hoạt request Ping tới Cloud
    Server--xB: Lỗ hổng timeout kết nối API
    
    SW->>Cache: Fall mode - Ưu tiên truy xuất Cache Memory Local
    Cache-->>SW: Lôi file và text lưu tạm lên lại
    SW-->>B: Render Trả về Web DOM Component và báo lỗi Offline Đỏ góc màn hình
```
