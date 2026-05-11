# Hướng Dẫn Demo, Vị Trí Hàm Và Chỉnh Số Dashboard

File này là “phao demo” để trả lời nhanh khi bảo vệ đồ án. Mục tiêu là:
- Biết chức năng nằm ở đâu.
- Biết user bấm gì thì gọi hàm nào.
- Biết API nào chạy tiếp theo.
- Biết muốn chỉnh số dashboard thì sửa ở đâu trong demo mode và MongoDB mode.

---

## 1. Cấu trúc quan trọng

```text
CShape/VinhKhanhFoodTour.Api/
|-- Program.cs                         # Cấu hình server + demo mode + /api/tts + /api/presence + analytics seed
|-- Controllers/
|   |-- AuthController.cs              # Login admin trong MongoDB mode
|   |-- PoiController.cs               # CRUD POI
|   |-- TourController.cs              # CRUD Tour + QR Tour
|   `-- AnalyticsController.cs         # Stats, top-pois, recent, heatmap
|-- Services/
|   |-- AuthService.cs                 # Login bằng hash, seed user admin bằng hash
|   |-- PoiService.cs                  # CRUD POI + seed POI
|   |-- TourService.cs                 # Resolve QR Tour + CRUD Tour
|   |-- AnalyticsService.cs            # Tính dashboard trong MongoDB mode
|   |-- UserPresenceService.cs         # Online users + kick session
|   `-- AdminTokenHelper.cs            # Tạo/kiểm tra Bearer token admin
`-- wwwroot/
    |-- index.html                     # App du khách
    |-- admin.html                     # CMS Admin
    `-- js/
        |-- app.js                     # QR Tour, đổi ngôn ngữ, heartbeat, AAC
        |-- admin.js                   # Login admin, dashboard, CRUD POI/Tour, QR viewer
        |-- audio-manager.js           # Phát audio + fallback Google TTS
        |-- geofence.js                # GPS/geofence
        |-- qr-scanner.js              # Scanner QR
        `-- offline-db.js              # IndexedDB cache POI
```

---

## 2. Sequence chức năng demo

### 2.1. QR Tour tại cổng

```text
Du khách quét QR Tour tại cổng
  -> qr-scanner.js: QRScannerManager._onScanSuccess()
  -> app.js: handleQrCode()                 line 1085
  -> app.js: handleTourQrCode()             line 1103
  -> app.js: extractTourQrCode()
  -> app.js: resolveTourByQrCode()          line 1137
  -> GET /api/tour/qr/{qrCode}
     - MongoDB mode:
       TourController.GetByQrCode()         line 19
       -> TourService.GetActiveByQrCodeAsync() line 24
       -> TourService.GetOrderedPoisAsync()    line 38
     - Demo mode:
       Program.cs app.MapGet("/api/tour/qr/{qrCode}") line 376
  -> app.js: openTourFromQr()              line 1176
  -> app.js: renderTourPoiList()           line 1492
  -> app.js: showPoiDetail()
  -> app.js: trackTourQrScan()             ghi eventType = "qr_scan"
```

Câu trả lời ngắn khi thầy hỏi:
- “Quét QR gọi hàm nào?”
  - `handleQrCode()` -> `handleTourQrCode()` -> `resolveTourByQrCode()` -> API `/api/tour/qr/{qrCode}` -> `openTourFromQr()`.

---

### 2.2. Dashboard Analytics

```text
CMS mở Dashboard
  -> admin.js: loadDashboardData()         line 454
  -> gọi song song:
     GET /api/analytics/stats
     GET /api/analytics/top-pois
     GET /api/analytics/recent?limit=20
     GET /api/poi/all
  -> admin.js: renderTopPoisChart()        line 490
  -> admin.js: renderRecentEvents()        line 515
  -> admin.js: initHeatmap()               line 544
     -> GET /api/analytics/heatmap
```

Backend:
- MongoDB mode:
  - `AnalyticsController.cs`
    - `GET top-pois` line 27
    - `GET heatmap` line 36
    - `GET stats` line 45
    - `GET recent` line 61
  - `AnalyticsService.cs`
    - `GetTopPoiStatsAsync()` line 26
    - `GetHeatmapDataAsync()` line 45
    - `GetEventCountsAsync()` line 93
    - `GetUniqueSessionsAsync()` line 106
    - `GetRecentEventsAsync()` line 112
- Demo mode:
  - `Program.cs`
    - `/api/analytics/stats` line 431
    - `/api/analytics/top-pois` line 441
    - `/api/analytics/heatmap` line 464
    - `/api/analytics/recent` line 507
    - seed dữ liệu mẫu `CreateDemoAnalyticsEvents()` line 582

Câu trả lời ngắn khi thầy hỏi:
- “Số QR Scans lấy ở đâu?”
  - Từ `stats.eventCounts.qr_scan`, frontend đọc ở `admin.js:454`.
- “Top POI nghe nhiều nhất tính bằng biến nào?”
  - Biến `ListenCount` trong `PoiStats`, tính ở:
    - demo mode `Program.cs:446-459`, trong đó `ListenCount = g.Count()` ở line 455
    - MongoDB mode `AnalyticsService.GetTopPoiStatsAsync()` line 26.

---

### 2.3. Audio + dịch ngôn ngữ

```text
User đổi ngôn ngữ
  -> app.js: changeLanguage()              line 1440
  -> normalizeAppLanguage()
  -> applyUILanguage()
  -> translateWithCache()                  line 167
  -> translateText()                       line 878
  -> queuePoiTranslationWarmup()           line 227

User bấm nghe
  -> app.js: getPoiScript()                line 851
  -> audio-manager.js: playDirect()        line 222
  -> _speak()                              line 252
  -> _speakWithWebSpeech()                 line 286
     hoặc _speakWithGoogleTTS()            line 354
  -> GET /api/tts                          Program.cs line 515
```

Câu trả lời ngắn khi thầy hỏi:
- “Đổi ngôn ngữ gọi hàm nào?”
  - `changeLanguage()` -> `translateWithCache()` -> `queuePoiTranslationWarmup()`.
- “Audio fallback ra sao?”
  - `playDirect()` -> `_speak()`; nếu thiếu voice thì `_speakWithGoogleTTS()` hoặc backend `/api/tts`.

---

### 2.4. Online Users + Kick

```text
App du khách mở lên
  -> app.js: startPresenceHeartbeat()      line 569
  -> app.js: sendPresenceHeartbeat()       line 577
  -> POST /api/presence/heartbeat          Program.cs line 130
  -> UserPresenceService.Upsert()          line 11

CMS mở Online Users
  -> admin.js: loadOnlineUsers()           line 397
  -> GET /api/admin/online-users           Program.cs line 145

Admin bấm Kick
  -> admin.js: kickOnlineUser()            line 435
  -> POST /api/admin/online-users/{sessionId}/kick  Program.cs line 156
  -> UserPresenceService.Kick()            line 58

Heartbeat tiếp theo của client
  -> app.js: handleSessionKicked()         line 613
  -> dừng audio + dừng GPS + khóa màn hình
```

Câu trả lời ngắn khi thầy hỏi:
- “Kick user hoạt động ra sao?”
  - Admin gọi API kick -> service đánh dấu `IsKicked = true` -> heartbeat kế tiếp trả `kicked = true` -> client vào `handleSessionKicked()`.

---

### 2.5. Admin login + hash mật khẩu

```text
Admin submit form login
  -> admin.js: loginAdmin()                line 43
  -> POST /api/auth/login

MongoDB mode:
  -> AuthController.Login()                line 20
  -> AuthService.LoginAsync()              line 21
  -> AuthService.ComputePasswordHash()     line 41
  -> so sánh với users.passwordHash

Demo mode:
  -> Program.cs app.MapPost("/api/auth/login") line 317
  -> AuthService.VerifyPassword()          line 47
  -> so sánh với AuthService.DefaultAdminPasswordHash line 11
```

Câu trả lời ngắn khi thầy hỏi:
- “Password admin có lưu plaintext không?”
  - Không. Seed mặc định lưu ở dạng hash SHA-256 tại `AuthService.DefaultAdminPasswordHash`, login băm password nhập vào rồi so sánh hash.

---

### 2.6. CRUD POI/Tour

#### POI

```text
Admin bấm Lưu POI
  -> admin.js: savePoi()                   line 701
  -> POST /api/poi hoặc PUT /api/poi/{id}
  -> PoiController.Create()/Update()       line 55 / 64
  -> PoiService.CreateAsync()/UpdateAsync() line 27 / 35
```

#### Tour

```text
Admin bấm Lưu Tour
  -> admin.js: saveTour()                  line 893
  -> POST /api/tour hoặc PUT /api/tour/{id}
  -> TourController.Create()/Update()      line 46 / 54
  -> TourService.CreateAsync()/UpdateAsync() line 61 / 72

Demo mode:
  -> Program.cs app.MapPost("/api/tour")   line 397
  -> Program.cs app.MapPut("/api/tour/{id}") line 406
  -> Program.cs app.MapDelete("/api/tour/{id}") line 417
```

Câu trả lời ngắn khi thầy hỏi:
- “CRUD Tour có thật không?”
  - Có. Frontend dùng `openTourModal()` + `saveTour()`, backend có đủ `POST/PUT/DELETE /api/tour` ở cả MongoDB mode và demo mode.

---

## 3. Cách chỉnh số Dashboard

Quan trọng: giao diện **không tự bịa số**. Muốn đổi số thì sửa event analytics hoặc logic backend.

### 3.1. Demo mode không có MongoDB

File: `CShape/VinhKhanhFoodTour.Api/Program.cs`

- Seed dữ liệu demo ban đầu:
  - `CreateDemoAnalyticsEvents()` line 582
- Stats:
  - `/api/analytics/stats` line 431
- QR Scans:
  - nằm trong `eventCounts["qr_scan"]` ở line 437
- Top POIs:
  - `/api/analytics/top-pois` line 441
  - `ListenCount = g.Count()` ở line 455
- Recent:
  - `/api/analytics/recent` line 507
- Heatmap:
  - `/api/analytics/heatmap` line 464

Muốn tăng số demo:
- Thêm event mới trong `CreateDemoAnalyticsEvents()`
- Hoặc chỉnh logic `g.Count()` trong `/api/analytics/top-pois`

Ví dụ:
- Tăng QR scan: thêm một `AnalyticsEvent { EventType = "qr_scan" }`
- Tăng lượt nghe POI đầu: thêm event `poi_listen` cùng `PoiId`

### 3.2. MongoDB mode thật

File: `CShape/VinhKhanhFoodTour.Api/Services/AnalyticsService.cs`

- Ghi event:
  - `TrackEventAsync()` line 18
- Top POIs:
  - `GetTopPoiStatsAsync()` line 26
  - `ListenCount = g.Count()` ở line 34
- Heatmap:
  - `GetHeatmapDataAsync()` line 45
- Stats:
  - `GetEventCountsAsync()` line 93
  - `GetUniqueSessionsAsync()` line 106
- Recent:
  - `GetRecentEventsAsync()` line 112

Muốn tăng số demo:
- Cách đúng nhất là thêm document vào collection `analytics`
- Hoặc tạm chỉnh logic aggregate trong `AnalyticsService.cs`

Ví dụ document thêm tay:

```json
{
  "sessionId": "demo-session-999",
  "eventType": "poi_listen",
  "poiId": "<id-cua-poi>",
  "language": "vi",
  "duration": 30,
  "timestamp": "2026-05-11T00:00:00Z"
}
```

---

## 4. Câu trả lời nhanh khi bị hỏi

### “Số QR Scans lấy ở đâu?”
- Frontend dashboard đọc `stats.eventCounts.qr_scan` trong `admin.js:454`.
- Backend trả từ:
  - demo mode `Program.cs:431`
  - MongoDB mode `AnalyticsService.GetEventCountsAsync()` line 93.

### “Top POI nghe nhiều nhất tính bằng biến nào?”
- Biến `ListenCount` trong `PoiStats`.
- Demo mode: `Program.cs:446-459`, với `ListenCount = g.Count()` ở line 455.
- MongoDB mode: `AnalyticsService.cs:31-35`.

### “Quét QR gọi hàm nào?”
- `handleQrCode()` -> `handleTourQrCode()` -> `resolveTourByQrCode()` -> API `/api/tour/qr/{qrCode}` -> `openTourFromQr()`.

### “Đổi ngôn ngữ gọi hàm nào?”
- `changeLanguage()` -> `translateWithCache()` -> `translateText()` -> `queuePoiTranslationWarmup()`.

### “Kick user hoạt động ra sao?”
- `kickOnlineUser()` -> `/api/admin/online-users/{sessionId}/kick` -> `UserPresenceService.Kick()` -> client `handleSessionKicked()`.

### “Password admin có lưu plaintext không?”
- Không.
- Hash mặc định nằm ở `AuthService.DefaultAdminPasswordHash` line 11.
- Login băm đầu vào bằng `ComputePasswordHash()` line 41 rồi so sánh.

### “Tour QR khác gì QR điểm?”
- Demo chính dùng **QR Tour tại cổng** để mở danh sách quán theo thứ tự.
- QR điểm chỉ giữ để tương thích cũ, không phải luồng demo chính.

---

## 5. Sau khi sửa thì chạy gì

```bash
node --check CShape/VinhKhanhFoodTour.Api/wwwroot/js/app.js
node --check CShape/VinhKhanhFoodTour.Api/wwwroot/js/admin.js
dotnet build CShape/VinhKhanhFoodTour.Api/VinhKhanhFoodTour.Api.csproj
```

Nếu muốn chạy backend:

```bash
dotnet run --project CShape/VinhKhanhFoodTour.Api/VinhKhanhFoodTour.Api.csproj
```

Màn hình mở:
- User app: `http://localhost:5000/index.html` hoặc `https://localhost:5001/index.html`
- CMS admin: `http://localhost:5000/admin.html` hoặc `https://localhost:5001/admin.html`

---

## 6. Checklist demo nhanh

1. Đăng nhập CMS Admin.
2. Mở Dashboard, chỉ vào `QR Scans`, `Top POIs`, `Recent`, `Heatmap`.
3. Vào Tours, mở QR Tour.
4. Dùng điện thoại quét QR Tour tại cổng.
5. Trên app du khách, đổi ngôn ngữ và bấm nghe.
6. Mở Online Users trong CMS, xác nhận session online.
7. Bấm Kick để demo khóa phiên.

Nếu bị hỏi sâu, trả lời theo đúng flow và line number ở trên.
