# Huong Dan Demo, Vi Tri Ham Va Chinh So Dashboard

File nay dung khi bao ve do an. Muc tieu la tra loi nhanh cho thay: chuc nang nam o dau, ham nao goi ham nao, va muon thay doi so thong ke tren Dashboard thi sua du lieu/logic backend o dau.

## 1. Cau Truc Quan Trong

```text
CShape/VinhKhanhFoodTour.Api/
|-- Program.cs                         # Cau hinh server, demo API khi khong co MongoDB, /api/tts, /api/presence
|-- Controllers/
|   |-- AnalyticsController.cs          # Analytics API khi co MongoDB
|   |-- AuthController.cs               # Dang nhap admin
|   |-- PoiController.cs                # CRUD POI
|   `-- TourController.cs               # CRUD Tour va QR Tour
|-- Services/
|   |-- AnalyticsService.cs             # Truy van MongoDB cho Dashboard
|   |-- UserPresenceService.cs          # Online users va kick session
|   |-- PoiService.cs
|   |-- TourService.cs
|   |-- AuthService.cs
|   `-- AdminTokenHelper.cs
`-- wwwroot/
    |-- index.html                      # Web app du khach
    |-- admin.html                      # CMS Admin
    `-- js/
        |-- app.js                      # QR Tour, ngon ngu, heartbeat online
        |-- admin.js                    # Dashboard, Online Users, CRUD
        |-- audio-manager.js            # TTS Web Speech + Google TTS fallback
        |-- qr-scanner.js
        |-- map.js
        |-- geofence.js
        `-- offline-db.js
```

## 2. Sequence Chuc Nang De Demo

### 2.1. QR Tour Tai Cong

```text
Du khach quet QR cong tour
  -> qr-scanner.js: QRScannerManager._onScanSuccess(decodedText)
  -> app.js: handleQrCode(rawQrCode)
  -> app.js: handleTourQrCode(rawQrCode)
  -> app.js: extractTourQrCode(rawQrCode)
  -> app.js: resolveTourByQrCode(qrCode)
  -> Backend: GET /api/tour/qr/{qrCode}
     - Demo mode: Program.cs MapGet("/api/tour/qr/{qrCode}") gan dong 339
     - MongoDB mode: TourController + TourService
  -> app.js: openTourFromQr(payload, qrCode)
  -> app.js: renderTourPoiList()
  -> app.js: showPoiDetail(firstPoi)
  -> app.js: trackTourQrScan() gui POST /api/analytics/event { eventType: "qr_scan" }
```

Luu y khi giai thich: QR khong con la tung quan rieng le. QR that te la QR tour o cong, quet mot lan se mo danh sach quan cua tour va di chuyen tung quan theo thu tu.

### 2.2. Dashboard Analytics

```text
Frontend gui event
  - app.js: trackTourQrScan() -> POST /api/analytics/event, eventType = "qr_scan"
  - audio-manager.js: _trackListen(poiId) -> POST /api/analytics/event, eventType = "poi_listen"

Backend luu event
  - Demo mode: Program.cs MapPost("/api/analytics/event") dong 397
  - MongoDB mode: AnalyticsController.TrackEvent() -> AnalyticsService.TrackEventAsync()

Admin doc dashboard
  - admin.js: loadDashboardData() dong 422
  - Goi song song:
    GET /api/analytics/stats
    GET /api/analytics/top-pois
    GET /api/analytics/recent
    GET /api/poi/all
  - admin.js: renderTopPoisChart(topPois) dong 459
  - admin.js: renderRecentEvents(events) dong 484
  - admin.js: initHeatmap() dong 513
```

Y nghia cac o Dashboard:

```text
Tong POI      -> admin.js dong 439 -> adminPois.length
Sessions      -> admin.js dong 440 -> stats.uniqueSessions
Luot nghe     -> admin.js dong 443 -> stats.eventCounts.poi_listen
QR Scans      -> admin.js dong 444 -> stats.eventCounts.qr_scan
Top POIs      -> renderTopPoisChart(), du lieu tu /api/analytics/top-pois
Recent        -> renderRecentEvents(), du lieu tu /api/analytics/recent
Heatmap       -> initHeatmap(), du lieu tu /api/analytics/heatmap
```

### 2.3. Audio Va Dich Ngon Ngu

```text
User chon ngon ngu
  -> app.js: changeLanguage(lang) dong 1373
  -> app.js: normalizeAppLanguage(lang) dong 117
  -> app.js: applyUILanguage(lang)
  -> app.js: queuePoiTranslationWarmup(lang) dong 225
  -> app.js: translateWithCache(...) dong 165
  -> app.js: translateText(...) dong 811

User bam nghe
  -> app.js: getPoiScript(poi, lang) dong 784
  -> audio-manager.js: playDirect(poiId, script, name) dong 222
  -> audio-manager.js: _speak(text, lang) dong 252
  -> Neu co voice: _speakWithWebSpeech() dong 286
  -> Neu thieu voice: _speakWithGoogleTTS() dong 354
  -> Backend: Program.cs MapGet("/api/tts") dong 452
```

Luu y khi demo: VI/EN la source text. Ngon ngu khac duoc dich runtime, co cache RAM + localStorage, doi ngon ngu khong bi tre vi UI render truoc bang source/cache roi warm-up ban dich POI o nen.

### 2.4. Online Users Va Kick

```text
Du khach mo web app
  -> app.js: startPresenceHeartbeat() dong 569
  -> app.js: sendPresenceHeartbeat() dong 577
  -> Backend: POST /api/presence/heartbeat dong 130
  -> UserPresenceService.Upsert() dong 11

Admin mo CMS -> Online Users
  -> admin.js: loadOnlineUsers() dong 365
  -> Backend: GET /api/admin/online-users dong 145
  -> UserPresenceService.GetOnlineSessions()

Admin bam Kick
  -> admin.js: kickOnlineUser(sessionId) dong 403
  -> Backend: POST /api/admin/online-users/{sessionId}/kick dong 156
  -> UserPresenceService.Kick(sessionId)

Heartbeat tiep theo cua user
  -> API tra { kicked: true }
  -> app.js: handleSessionKicked() dong 613
  -> App dung audio, dung GPS, hien man hinh "Phien da bi ngat"
```

Quy tac online: session duoc xem la online neu heartbeat trong 45 giay gan nhat va chua bi kick. Heartbeat gui moi 15 giay. Trang CMS Online Users refresh moi 5 giay.

## 3. Cach Chinh So Dashboard Tu CSDL/Backend

Quan trong: khong sua so truc tiep tren giao dien. Giao dien chi render response API. Muon "nhan so" de demo thi sua du lieu trong MongoDB hoac sua logic dem trong backend.

### 3.1. Che Do Demo Khong MongoDB

File: `CShape/VinhKhanhFoodTour.Api/Program.cs`, ham `MapDemoApi()`.

Tang Sessions:

```csharp
// Trong GET /api/analytics/stats, gan dong 404
uniqueSessions = analyticsEvents
    .Select(e => e.SessionId)
    .Where(s => !string.IsNullOrWhiteSpace(s))
    .Distinct()
    .Count() * 2 + 15
```

Tang QR Scans:

```csharp
// Trong GET /api/analytics/stats
eventCounts = analyticsEvents
    .GroupBy(e => e.EventType)
    .ToDictionary(g => g.Key, g => g.Key == "qr_scan" ? g.Count() * 2 : g.Count())
```

Tang Luot nghe tren Top POIs:

```csharp
// Trong GET /api/analytics/top-pois
ListenCount = g.Count() * 2
```

Tang rieng mot quan demo:

```csharp
ListenCount = g.Key == "demo-oc-dao" ? g.Count() * 5 : g.Count()
```

### 3.2. Che Do MongoDB That

File: `CShape/VinhKhanhFoodTour.Api/Services/AnalyticsService.cs`.

Top POIs nghe nhieu nhat:

```csharp
// GetTopPoiStatsAsync() dong 26
ListenCount = g.Count() * 2
```

QR Scans:

```csharp
// GetEventCountsAsync()
var count = await _events.CountDocumentsAsync(e => e.EventType == type);
result[type] = type == "qr_scan" ? count * 2 : count;
```

Sessions:

```csharp
// GetUniqueSessionsAsync()
return sessions.Count(s => !string.IsNullOrWhiteSpace(s)) * 2;
```

Khuyen nghi khi bao ve: neu muon so lieu that, dung MongoDB Compass them document vao collection `analytics` thay vi sua code. Moi document can cac field chinh:

```json
{
  "sessionId": "demo-session-001",
  "eventType": "poi_listen",
  "poiId": "<id cua POI>",
  "language": "vi",
  "duration": 30,
  "timestamp": "2026-05-11T00:00:00Z"
}
```

Muon tang QR Scans thi doi `eventType` thanh `qr_scan`. Muon tang Top POIs thi them nhieu document `poi_listen` cung `poiId`.

## 4. Bien Thong Ke Nghe Nhieu Nhat Nam O Dau?

`ListenCount` la bien quyet dinh quan nao len top trong bieu do "POI duoc nghe nhieu nhat".

| Che do | File | Ham | Dong hien tai | Bien |
|---|---|---|---:|---|
| Demo | `Program.cs` | `/api/analytics/top-pois` | gan 378 | `ListenCount` |
| MongoDB | `Services/AnalyticsService.cs` | `GetTopPoiStatsAsync()` | 26 | `ListenCount` |
| Frontend | `wwwroot/js/admin.js` | `renderTopPoisChart()` | 459 | doc `p.listenCount` |

Thanh dai nhat tren bieu do la POI co `ListenCount` cao nhat.

## 5. Sau Khi Sua

1. Neu sua backend (`Program.cs` hoac `Services/`): tat server bang `Ctrl+C`, chay lai:

```bash
dotnet run --project CShape/VinhKhanhFoodTour.Api/VinhKhanhFoodTour.Api.csproj
```

2. Neu sua frontend (`admin.js`, `app.js`, CSS/HTML): refresh browser. Neu khong thay doi thi dung `Ctrl+F5`.

3. Neu muon kiem tra nhanh truoc khi push:

```bash
node --check CShape/VinhKhanhFoodTour.Api/wwwroot/js/app.js
node --check CShape/VinhKhanhFoodTour.Api/wwwroot/js/admin.js
dotnet build CShape/VinhKhanhFoodTour.Api/VinhKhanhFoodTour.Api.csproj
```

4. Git:

```bash
git status --short
git add .
git commit -m "docs: update demo guide"
git push
```
