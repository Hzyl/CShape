**PRD v1.0 — Ứng dụng Thuyết minh Đa ngôn ngữ Phố Ẩm thực Vĩnh Khánh**    |    TÀI LIỆU YÊU CẦU SẢN PHẨM
|<p>**TÀI LIỆU YÊU CẦU SẢN PHẨM (PRD)**</p><p>**Ứng dụng Thuyết minh Đa ngôn ngữ**</p><p>**Phố Ẩm thực Vĩnh Khánh — TP.HCM**</p><p>*Vinh Khanh Audio Guide*</p><p>Version 1.0  |  MVP Release  |  2025</p>|
| :-: |

|**Trường**|**Nội dung**|
| :- | :- |
|Tên dự án|Ứng dụng Thuyết minh Đa ngôn ngữ Phố Ẩm thực Vĩnh Khánh|
|Phiên bản|1\.0 — MVP|
|Trạng thái|Draft — Chờ review kỹ thuật|
|Phạm vi hệ thống|Mobile App (React Native/Expo) + Web CMS (Admin) + Backend API (FastAPI + Node.js)|
|Địa bàn|Phố Vĩnh Khánh, Quận 4, TP.HCM|
|Ngôn ngữ hỗ trợ|Tiếng Việt (vi), Tiếng Anh (en), Tiếng Nhật (jp) — mở rộng được|
|Mục tiêu học thuật|Đồ án môn học / Tài liệu lưu trữ dự án|


# **Mục lục**
1\. Tổng quan & Mục tiêu dự án

2\. Phạm vi hệ thống (Scope)

3\. Personas & Roles

4\. Kiến trúc hệ thống tổng quan

5\. Module APP-1: Mobile App — Bản đồ & Khám phá

6\. Module APP-2: Mobile App — POI Detail & Audio Player

7\. Module APP-3: Mobile App — QR Scanner

8\. Module CMS-1: Web CMS — Dashboard & Analytics

9\. Module CMS-2: Web CMS — POI Management

10\. Module CMS-3: Web CMS — Tours Management

11\. Module AI: Tạo nội dung thuyết minh tự động

12\. Module Offline: Hoạt động không cần mạng

13\. Module i18n: Đa ngôn ngữ & TTS

14\. User Stories tổng hợp

15\. Functional Requirements (FR)

16\. Acceptance Criteria (Given-When-Then)

17\. Business Rules

18\. Data Requirements (Schema)

19\. API Specification (~60 endpoints)

20\. Non-Functional Requirements

21\. Tech Stack & Dependencies

22\. Key Constants & Configuration

23\. Dependencies & Risks

24\. Open Questions

25\. Future Enhancements


# **1. Tổng quan & Mục tiêu dự án**
## **1.1 Mô tả sản phẩm**
"Ứng dụng Thuyết minh Đa ngôn ngữ Phố Ẩm thực Vĩnh Khánh" là một hệ thống du lịch thông minh giúp du khách khám phá các địa điểm ẩm thực nổi tiếng tại phố Vĩnh Khánh (Quận 4, TP.HCM) thông qua bản đồ tương tác và hướng dẫn âm thanh tự động đa ngôn ngữ.

Hệ thống gồm ba thành phần chính: (1) Ứng dụng di động (Mobile App) dành cho du khách — phát audio thuyết minh tự động khi người dùng đến gần địa điểm, (2) Web CMS cho quản trị viên quản lý nội dung POI và tour, (3) Backend API xử lý dữ liệu, TTS, phân tích và AI.

## **1.2 Vấn đề cần giải quyết**
- Du khách nước ngoài và người Việt không quen khu vực không có hướng dẫn viên phù hợp khi khám phá phố Vĩnh Khánh.
- Thông tin về các địa điểm ẩm thực đặc trưng chưa được số hóa, thiếu nội dung đa ngôn ngữ.
- Khách du lịch phải chủ động tìm kiếm thông tin từ nhiều nguồn rời rạc.
- Thiếu công cụ giúp admin quản lý và cập nhật nội dung thuyết minh một cách linh hoạt.

## **1.3 Goals (Mục tiêu)**

|**#**|**Mục tiêu**|**Đo lường thành công**|
| :- | :- | :- |
|G1|Phát audio thuyết minh tự động khi user vào bán kính POI (Geofencing)|Audio phát trong ≤ 3s sau khi enter zone|
|G2|Hỗ trợ đa ngôn ngữ: vi, en, jp (mở rộng được)|Khách quốc tế luôn có nội dung nghe — fallback en nếu thiếu|
|G3|Tích hợp QR Scanner — không cần GPS|Quét QR tại trạm xe buýt → audio phát trong ≤ 5s|
|G4|Admin quản lý POI & Tour đầy đủ qua Web CMS|CRUD POI/Tour không cần can thiệp kỹ thuật|
|G5|AI hỗ trợ viết nội dung thuyết minh|Generate mô tả POI chất lượng trong < 30s|
|G6|Offline mode — hoạt động không cần mạng|App dùng được khi mất sóng sau khi đã tải dữ liệu|
|G7|Analytics — Admin xem thống kê, heatmap|Dashboard hiển thị Top POI, lượt nghe, heatmap di chuyển|


# **2. Phạm vi hệ thống (Scope)**
## **2.1 In-Scope — MVP**

|**Module ID**|**Tên module**|**Platform**|**Mô tả ngắn**|
| :- | :- | :- | :- |
|APP-1|Map & Home|Mobile App|Bản đồ tương tác, hiển thị POI, GPS tracking, geofencing auto-play audio|
|APP-2|POI Detail & Player|Mobile App|Nghe thuyết minh chi tiết, play/pause/seek, đổi ngôn ngữ|
|APP-3|QR Scanner|Mobile App|Quét QR tại trạm xe buýt, không cần GPS|
|CMS-1|Dashboard & Analytics|Web CMS|Thống kê Top POI, avg time, Heatmap bản đồ|
|CMS-2|POI Management|Web CMS|CRUD POI: tọa độ, bán kính, audio, text, phân loại|
|CMS-3|Tours Management|Web CMS|Tạo tour từ POI, sắp xếp lộ trình|
|AI|AI Content Generator|Backend|Gemini/free LLM tạo nội dung thuyết minh tự động|
|OFFLINE|Offline Mode|Mobile App|Tải trước dữ liệu, nghe audio khi mất mạng|
|i18n|Đa ngôn ngữ & TTS|Backend + App|Edge-TTS / free TTS engine, dịch tự động, fallback chain|
|AUTH|Authentication|Web CMS + API|Admin login JWT, bảo vệ toàn bộ route CMS|

## **2.2 Out-of-Scope**
- Thanh toán / đặt chỗ tại nhà hàng.
- Bản đồ offline PMTiles tự host (dùng map cloud: Google Maps/Mapbox free tier).
- Push notification / marketing campaign.
- Đa user role phức tạp (Owner Portal, poi\_owner tự đăng ký) — Future Enhancement.
- Đánh giá / review địa điểm từ người dùng cuối.
- Tích hợp thanh toán, voucher, subscription.


# **3. Personas & Roles**

|**Persona**|**Mô tả**|**Kịch bản điển hình**|**Nhu cầu chính**|
| :- | :- | :- | :- |
|Du khách nước ngoài|Khách du lịch không nói tiếng Việt, lần đầu đến Vĩnh Khánh|Đi bộ qua phố, muốn biết đang đứng trước quán gì|Audio en/jp tự động, không cần thao tác phức tạp|
|Du khách trong nước|Người Việt muốn tìm hiểu lịch sử/văn hóa các quán đặc trưng|Đang đứng trước quán Ốc Oanh, muốn nghe thuyết minh|Audio vi chất lượng, thông tin phong phú|
|Khách đi xe buýt|Người đứng tại trạm xe buýt Xóm Chiếu|Thấy biển QR, muốn nghe nội dung nhưng không bật GPS|QR Scanner hoạt động offline, không cần tài khoản|
|Admin (Quản trị viên)|Nhân viên vận hành nội dung của hệ thống|Cần thêm POI mới, upload audio, xem thống kê tuần|CMS dễ dùng, CRUD nhanh, xem analytics trực quan|

## **Bảng quyền hạn**

|**Role**|**Quyền hạn**|**Route**|
| :- | :- | :- |
|End User (Guest)|Xem map, nghe audio, quét QR — không cần đăng nhập|Mobile App (public)|
|Admin|Full CRUD POI/Tour, xem Analytics, quản lý Audio/AI|CMS /admin/\* (cần login)|
|Super Admin (Future)|Quản lý tài khoản Admin, cấu hình hệ thống|Out of scope MVP|


# **4. Kiến trúc hệ thống tổng quan**
## **4.1 Sơ đồ thành phần (mô tả văn bản)**

|**Layer**|**Thành phần**|**Công nghệ**|**Ghi chú**|
| :- | :- | :- | :- |
|Client — Mobile|React Native / Expo App|React Native, Expo SDK, MapLibre GL / Google Maps|iOS & Android. Geofencing, QR, Audio Player, Offline|
|Client — Web|Admin CMS Dashboard|React / Vite (hoặc Next.js), Google Maps JS SDK|Desktop browser. CRUD POI, Tour, Analytics|
|API Gateway|REST API (chính)|FastAPI (Python) — prefix /api/v1|Module: content, audio, admin, ai, analytics, localization|
|API — Node layer|Webhook / helper tasks|Node.js / Express|Optional: xử lý file upload, QR generation|
|Database|Document store|MongoDB (Motor async driver)|Collections: pois, audio\_content, tours, admin\_users, analytics\_logs|
|File Storage|Audio MP3, ảnh POI|Local disk / S3-compatible|Cache key: MD5(text:lang)|
|TTS Engine|Text-to-Speech|Edge-TTS (Microsoft — free) + SpeechSynthesis fallback|5 ngôn ngữ, offline fallback|
|Translation|Dịch tự động|deep-translator (Google Translate free wrapper)|Dịch trước khi TTS|
|AI|Viết nội dung thuyết minh|Google Gemini Flash (free tier) hoặc Groq|Rate limit: 10 req/ngày/admin. Fallback: manual|
|Analytics|Log hành vi ẩn danh|Time-series logs trong MongoDB|Session ID reset mỗi lần mở app|

## **4.2 Data Flow tóm tắt**
- User mở app → GPS → Geofence check (Haversine/Turf.js) → Enter POI zone → TTS audio play (4-tier: cache → on-demand → cloud TTS → local SpeechSynthesis).
- User quét QR → lookup qr\_code\_hash → load POI Detail → auto play audio.
- Admin CMS → CRUD POI/Tour → REST API → MongoDB → Background Task: dịch + TTS 3 ngôn ngữ.
- Analytics batch gửi mỗi 60s, ẩn danh Session ID.



# **5. Module APP-1: Mobile App — Bản đồ & Khám phá**
## **5.1 Mô tả màn hình**
Màn hình chính của app. Hiển thị bản đồ tương tác với vị trí user (GPS) và các POI xung quanh phố Vĩnh Khánh. Tích hợp Geofencing tự động phát audio khi user đi vào bán kính POI.

## **5.2 UI Blocks**

|**Component**|**Mô tả**|**Trạng thái**|
| :- | :- | :- |
|Map Component|Bản đồ vector (Google Maps/MapLibre) hiển thị toàn bộ khu vực Vĩnh Khánh|Loading / Ready / Error|
|User Marker|Chấm xanh hiển thị vị trí real-time (GPS throttle 5s)|Tracking / GPS Disabled|
|POI Markers (Pins)|Icon pin màu theo loại (major=cam, minor=xám). Tap để xem nhanh.|Normal / Active / Nearby|
|Bottom Sheet (Mini Player)|Kéo từ dưới lên khi đang phát audio: tên POI, tiến trình, play/pause|Hidden / Mini / Expanded|
|Nút QR Scanner|FAB button góc phải để mở camera QR|Default|
|Cảnh báo GPS|Banner trên cùng khi GPS tắt hoặc từ chối quyền|Visible / Hidden|

## **5.3 States**

|**State**|**Trigger**|**UI hiển thị**|
| :- | :- | :- |
|Loading (Map load)|App khởi động, đang tải POI list và map tiles|Skeleton map + spinner|
|Tracking (GPS on)|GPS được cấp quyền, đang theo dõi|Chấm xanh nhấp nháy|
|Playing Audio|User vào zone POI, audio đang phát|Bottom Sheet mini hiện lên, POI marker highlight|
|GPS Disabled|User tắt GPS hoặc từ chối quyền|Banner cảnh báo + gợi ý dùng QR Scanner|
|No POI Nearby|User ở khu vực không có POI nào|Bản đồ hiển thị bình thường, không có notification|

## **5.4 Geofencing Logic — Business Rules**

|**Rule**|**Điều kiện**|**Hành vi**|
| :- | :- | :- |
|BR-01|user\_distance ≤ POI.trigger\_radius|Kích hoạt ENTER event, đẩy audio vào Queue, Play|
|BR-02|Đang phát POI\_A, bước vào POI\_B|POI\_A tiếp tục phát đến hết. POI\_B vào Queue.|
|BR-03|User ra ngoài rồi quay lại trong < 5 phút|KHÔNG phát lại — chống spam GPS boundary noise|
|BR-04|2 POI overlap (bán kính giao nhau)|Phát POI có priority cao hơn (1–10, số nhỏ = cao hơn)|
|BR-05|Cuộc gọi điện đến khi đang phát audio|Auto Pause. Sau cuộc gọi → giữ Pause, không auto-resume|
|BR-06|GPS throttle|watchPosition() → throttle 5s để tiết kiệm pin|
|BR-07|Geofence debounce|Confirm ENTER sau 3s liên tục trong zone (chống GPS jitter)|


# **6. Module APP-2: Mobile App — POI Detail & Audio Player**
## **6.1 Mô tả màn hình**
Màn hình hiển thị chi tiết một POI: ảnh minh họa, tên, mô tả text, và trình phát audio thuyết minh. Người dùng có thể chủ động Play/Pause, tua, đổi ngôn ngữ.

## **6.2 UI Blocks & Actions**

|**UI Block**|**Mô tả**|**Actions**|
| :- | :- | :- |
|Ảnh minh họa|Carousel ảnh POI (max 8 ảnh)|Swipe left/right|
|Tiêu đề + Tag|Tên POI, loại (major/minor), địa chỉ|—|
|Text mô tả|Đoạn văn thuyết minh theo ngôn ngữ hiện tại|Scroll|
|Audio Controls|Play/Pause button, Seek bar (00:00/02:30), tốc độ phát|Play, Pause, Seek, Speed|
|Nút đổi ngôn ngữ|Dropdown: 🇻🇳 VI / 🇬🇧 EN / 🇯🇵 JP|Switch language → reload audio + text|
|Nút Share|Chia sẻ link deep-link đến POI|Share sheet|

## **6.3 States**

|**State**|**Mô tả**|
| :- | :- |
|Buffering|Audio đang tải (network request). Hiển thị spinner trên play button.|
|Playing|Audio đang phát. Progress bar chạy. Màn hình tắt không ngắt audio (background audio).|
|Paused|User bấm Pause. Progress giữ nguyên.|
|Error — No Network|Không tải được audio. Hiển thị: "Không thể tải nội dung. Kiểm tra kết nối." Fallback: hiển thị text (nếu có cache).|
|Language Switching|Đang tải audio ngôn ngữ mới. Hiển thị loading state trên player.|
|Completed|Audio phát xong. Reset về đầu. Badge "Đã nghe" trên marker.|

## **6.4 4-Tier Audio Playback**

|**Tier**|**Tên**|**Điều kiện**|**Thời gian phản hồi**|
| :- | :- | :- | :- |
|1|Pre-generated Audio|audio\_url có sẵn + Service Worker cache HIT|~0ms (cache)|
|1\.5|On-demand Translate + TTS|audio\_url thiếu hoặc is\_fallback=true|2–5s (backend dịch + TTS)|
|2|Cloud TTS Stream|Không có cache, gọi POST /audio/tts|3–8s (Edge-TTS stream)|
|3|Local SpeechSynthesis|Mất mạng hoàn toàn|~0ms (device TTS, chất lượng thấp)|


# **7. Module APP-3: Mobile App — QR Scanner**
## **7.1 Mô tả**
Màn hình camera quét mã QR được gắn tại các trạm xe buýt và biển báo trên phố Vĩnh Khánh. Không yêu cầu GPS — phù hợp với khách không muốn chia sẻ vị trí.

## **7.2 UI Blocks & States**

|**Component**|**Mô tả**|**States**|
| :- | :- | :- |
|Camera View|Toàn màn hình camera|Scanning / Permission Denied|
|Viewfinder Frame|Khung hình chữ nhật overlay, animation quét|Idle / Scanning / Success flash|
|Nút Flash|Bật/tắt đèn flash|On / Off|
|Nút Cancel|Đóng camera, quay về Home|—|
|Toast Message|Thông báo kết quả quét|Success (redirect) / Invalid QR / Network Error|

## **7.3 Business Rules — QR**

|**Rule**|**Điều kiện**|**Hành vi**|
| :- | :- | :- |
|BR-QR-01|QR hợp lệ (hash khớp trong DB)|Navigate sang APP-2 với POI tương ứng. Audio auto-play.|
|BR-QR-02|QR không hợp lệ / không thuộc hệ thống|Toast: "Mã QR không hợp lệ". Giữ nguyên màn hình quét.|
|BR-QR-03|Mất mạng khi vừa quét xong|Error state ở Player. Fallback: hiển thị text nếu đã cache.|
|BR-QR-04|Quét lại cùng mã trong vòng 10 giây|Bỏ qua action — chống load lại giao diện và audio nhiều lần.|



# **8. Module CMS-1: Web CMS — Dashboard & Analytics**
## **8.1 Mô tả**
Màn hình tổng quan dành cho Admin. Hiển thị các chỉ số vận hành hệ thống theo thời gian thực: lượt phát audio, top POI được nghe nhiều nhất, thời gian nghe trung bình, và heatmap di chuyển của du khách.

## **8.2 UI Blocks**

|**Block**|**Mô tả**|**Nguồn dữ liệu**|
| :- | :- | :- |
|Lưới KPI (4 thẻ)|Tổng lượt play hôm nay, Top POI, Avg listening time, Users active|Analytics logs (batch 60s)|
|Bảng Top POI|Top 10 POI được phát nhiều nhất trong khoảng thời gian lọc|GET /analytics/top-pois|
|Map Heatmap|Bản đồ overlay heatmap mật độ user di chuyển|GET /analytics/heatmap-data|
|Biểu đồ lượt phát theo giờ|Bar chart hoặc line chart theo ngày/tuần|GET /analytics/plays-by-hour|
|Bộ lọc thời gian|Dropdown: Hôm nay / 7 ngày / 30 ngày / Tùy chỉnh|Client-side filter + API param|

|Analytics data được gửi ẩn danh từ app: chỉ Session ID (reset mỗi lần mở app) + poi\_id + timestamp + event\_type. Không thu thập PII.|
| :- |


# **9. Module CMS-2: Web CMS — POI Management**
## **9.1 Màn hình danh sách POI**

|**Feature**|**Mô tả**|
| :- | :- |
|Table + Map dual view|Bên trái: bảng danh sách. Bên phải: map với markers tương ứng.|
|Filter bar|Lọc theo: Tên (search), Loại (Major/Minor), Ngôn ngữ audio có sẵn, Trạng thái|
|Pagination|20 items/trang. Tổng số hiển thị.|
|States|Loading skeleton, Empty state: "Chưa có POI nào. Nhấn + Thêm mới.", Error state|

## **9.2 Form Thêm/Sửa POI**

|**Field**|**Type**|**Required**|**Mô tả**|
| :- | :- | :- | :- |
|name|String|Yes|Tên hiển thị trên map và CMS|
|type|Enum: major/minor|Yes|Major = địa điểm chính. Minor = tiện ích (WC, bán vé, gửi xe, bến thuyền)|
|latitude|Decimal|Yes|Click trên map để auto-fill. Range: -90 to 90|
|longitude|Decimal|Yes|Click trên map để auto-fill. Range: -180 to 180|
|trigger\_radius|Integer (meters)|Yes|Bán kính kích hoạt geofence. Khuyến nghị: 20–50m|
|priority|Integer 1–10|Yes|Số nhỏ = ưu tiên cao hơn. Dùng khi 2 POI overlap.|
|description\_vi|Text|Yes|Nội dung thuyết minh tiếng Việt|
|description\_en|Text|No|Nội dung tiếng Anh (AI generate hoặc nhập tay)|
|description\_jp|Text|No|Nội dung tiếng Nhật|
|image\_urls|Array of String|No|URLs ảnh. Max 8. Upload qua API hoặc nhập URL.|
|audio\_url\_vi/en/jp|String|No|URL MP3. Tự động generate khi save (background task).|
|qr\_code\_hash|String|Auto|Server generate khi tạo POI. Dùng cho QR matching.|

## **9.3 AI Content Assistant (tích hợp trong form)**
- Nút "✨ Generate với AI" bên cạnh field description.
- Gọi POST /ai/enhance-description với text gốc → nhận description chất lượng hơn.
- Admin review và chỉnh sửa trước khi lưu.
- Rate limit: 10 req/ngày (free tier AI).


# **10. Module CMS-3: Web CMS — Tours Management**
## **10.1 Mô tả**
Admin tạo các lộ trình tour có chủ đề từ danh sách POI có sẵn. Tour được hiển thị trong app dưới dạng gợi ý lộ trình tham quan với polyline nối các điểm theo thứ tự.

## **10.2 Tour Builder UI**

|**Component**|**Mô tả**|
| :- | :- |
|Form thông tin Tour|Tên, mô tả, ảnh thumbnail|
|Panel trái — POI picker|Danh sách tất cả POI có thể tìm kiếm/lọc. Nút "+" thêm vào tour.|
|Panel phải — Ordered list|Danh sách POI đã chọn theo thứ tự. Drag-and-drop để sắp xếp. Nút "x" xóa.|
|Map Preview|Hiển thị polyline nối các POI theo thứ tự tour.|
|Validation|Tối thiểu 1 POI, tên không rỗng.|



# **11. Module AI: Tạo nội dung thuyết minh tự động**
## **11.1 Tổng quan**
Sử dụng Google Gemini Flash (hoặc Groq free tier) để hỗ trợ admin viết nội dung thuyết minh chất lượng cao cho từng POI. AI được gọi qua REST API nội bộ, kết quả được admin review trước khi publish.

## **11.2 Prompt Engineering**

|**Tham số**|**Giá trị / Mô tả**|
| :- | :- |
|Model|Google Gemini 2.0 Flash hoặc Groq llama-3-70b-instruct (miễn phí)|
|Ràng buộc nội dung|KHÔNG bịa thông tin, CÓ THỂ thêm tính từ tích cực, ngắn gọn 200–300 từ|
|Ngôn ngữ output|Theo ngôn ngữ yêu cầu (vi/en/jp)|
|Input|Tên POI + mô tả gốc ngắn + địa chỉ + loại địa điểm|
|Timeout|30 giây|
|Rate limit|10 req/ngày/admin (lưu trong ai\_usage\_limits collection)|
|Fallback|Nếu AI không khả dụng, trả empty và admin nhập thủ công|


# **12. Module Offline: Hoạt động không cần mạng**
## **12.1 Chiến lược Offline**

|**Layer**|**Công nghệ**|**Dữ liệu lưu trữ**|**Chiến lược**|
| :- | :- | :- | :- |
|SW Cache|Service Worker (Workbox)|Audio MP3, ảnh POI, App shell|CacheFirst cho audio; NetworkFirst 8s cho POI data|
|IndexedDB|idb wrapper|POI list theo ngôn ngữ (key: lang:poi\_id)|Offline fallback: target→en→vi|
|Language Shard|SW per-lang cache|Audio theo ngôn ngữ|Max 300 files/lang, max 3 langs, LRU eviction|
|Local TTS|window.speechSynthesis|Không cần file|Tier 3 fallback khi mất mạng hoàn toàn|

## **12.2 Offline Flows**
- Khi mở app lần đầu có mạng: Tải POI list → lưu IndexedDB. Tải audio hotset 10 POI gần nhất (1.5km).
- Khi mở app lần sau không mạng: Đọc từ IndexedDB → hiển thị bản đồ với POI đã cache.
- Khi audio chưa cache mà mất mạng: Tier 3 — Local SpeechSynthesis đọc text description.
- Khi có mạng trở lại: Background sync cập nhật POI data.


# **13. Module i18n: Đa ngôn ngữ & TTS**
## **13.1 Ngôn ngữ hỗ trợ**

|**Code**|**Ngôn ngữ**|**Voice (Edge-TTS)**|**Trạng thái MVP**|
| :- | :- | :- | :- |
|vi|Tiếng Việt|HoaiMyNeural (female)|Required — nội dung gốc|
|en|Tiếng Anh|JennyNeural (female)|Required — fallback quốc tế|
|jp|Tiếng Nhật|NanamiNeural (female)|Required — target market|
|zh|Tiếng Trung|XiaoxiaoNeural|Future Enhancement|
|ko|Tiếng Hàn|SunHiNeural|Future Enhancement|

## **13.2 3-Tier Content Fallback**

|**Tier**|**Mô tả**|**Hành vi**|
| :- | :- | :- |
|1|Ngôn ngữ user yêu cầu|Trả về bản dịch + audio URL theo ngôn ngữ đó|
|2|Tiếng Anh (fallback quốc tế)|Nếu thiếu ngôn ngữ yêu cầu → trả en, đánh dấu is\_fallback=true|
|3|Tiếng Việt gốc|Fallback cuối cùng. audio\_url=null (tránh phát audio vi cho khách ngoại)|

## **13.3 Audio Generation Pipeline**
- Nguồn: text description tiếng Việt (gốc)
- Bước 1: deep-translator (Google Translate free) → dịch sang ngôn ngữ đích
- Bước 2: Cache check — MD5(text:lang) → nếu file tồn tại: Cache HIT, zero cost
- Bước 3: Edge-TTS synthesis → MP3 file → lưu disk
- Bước 4: Upsert vào collection audio\_content với audio\_url + duration



# **14. User Stories tổng hợp**
## **14.1 Mobile App — End User**

|**Story ID**|**As a...**|**I want to...**|**So that...**|**Priority**|
| :- | :- | :- | :- | :- |
|US-01|Du khách|Mở app và xem bản đồ phố Vĩnh Khánh với các POI|Tôi biết mình đang ở đâu và có gì xung quanh|Must|
|US-02|Du khách|Tự động nghe audio thuyết minh khi đến gần POI|Không cần thao tác — trải nghiệm tự nhiên|Must|
|US-03|Du khách|Chọn ngôn ngữ thuyết minh (vi/en/jp)|Nghe được nội dung bằng tiếng mẹ đẻ|Must|
|US-04|Du khách|Play/Pause/Seek audio thủ công|Kiểm soát việc nghe theo ý muốn|Must|
|US-05|Du khách|Xem ảnh và mô tả chi tiết POI|Có thêm thông tin trực quan về địa điểm|Must|
|US-06|Du khách|Quét QR tại trạm xe buýt mà không cần GPS|Nghe thuyết minh ngay tại điểm dừng|Must|
|US-07|Du khách|Nghe audio khi tắt màn hình điện thoại|Tiết kiệm pin khi đi bộ dài|Must|
|US-08|Du khách|Dùng app khi mất sóng (đã tải trước)|Không bị gián đoạn trải nghiệm|Should|
|US-09|Du khách nước ngoài|Nhận content tiếng Anh khi ngôn ngữ khác chưa có|Luôn có nội dung để nghe dù ngôn ngữ hiếm|Must|
|US-10|Du khách|Xem gợi ý lộ trình Tour có chủ đề|Không phải tự lên kế hoạch từ đầu|Should|

## **14.2 Web CMS — Admin**

|**Story ID**|**As a...**|**I want to...**|**So that...**|**Priority**|
| :- | :- | :- | :- | :- |
|US-11|Admin|Đăng nhập CMS bằng email/password|Truy cập dashboard an toàn|Must|
|US-12|Admin|Xem dashboard thống kê và heatmap|Biết POI nào được quan tâm nhất|Must|
|US-13|Admin|Thêm POI mới bằng click trên bản đồ|Xác định tọa độ chính xác, nhanh hơn nhập tay|Must|
|US-14|Admin|Upload ảnh và nhập nội dung thuyết minh cho POI|Đảm bảo nội dung phong phú, đúng|Must|
|US-15|Admin|Dùng AI generate nội dung thuyết minh|Tiết kiệm thời gian viết nội dung|Should|
|US-16|Admin|Sửa/Xóa POI (có confirm)|Cập nhật thông tin khi cần|Must|
|US-17|Admin|Tạo Tour từ danh sách POI, sắp xếp thứ tự|Xây dựng lộ trình tham quan hoàn chỉnh|Must|
|US-18|Admin|Xem trạng thái xử lý audio (đang generate/hoàn tất/lỗi)|Kiểm soát quy trình TTS background|Should|
|US-19|Admin|Đăng xuất khỏi CMS|Kết thúc phiên làm việc an toàn|Must|
|US-20|Admin|Lọc, tìm kiếm POI theo tên/loại|Tìm nhanh trong danh sách lớn|Should|


# **15. Functional Requirements (FR)**
## **FR-01: Authentication**

|**ID**|**Requirement**|**Notes**|
| :- | :- | :- |
|FR-01.1|Form login với Email + Password. Client validate trước khi gửi.||
|FR-01.2|Đăng nhập thành công → lưu JWT access token (30 phút) + refresh token (7 ngày) vào httpOnly cookie.|XSS-safe|
|FR-01.3|Sai credentials → toast "Email hoặc mật khẩu không đúng." Không phân biệt email/pass.|Security|
|FR-01.4|Sau 5 lần sai → khóa 5 phút, hiển thị countdown.|Rate limit|
|FR-01.5|Mọi route /cms/\* chặn redirect /login nếu không có token hợp lệ.|Auth guard|
|FR-01.6|Logout → xóa cookie, redirect /login.||

## **FR-02: Geofencing & Audio Trigger**

|**ID**|**Requirement**|**Notes**|
| :- | :- | :- |
|FR-02.1|App yêu cầu quyền Location (Foreground + Background) khi mở lần đầu.||
|FR-02.2|watchPosition() với throttle 5s. Haversine/turf.distance() tính khoảng cách đến từng POI.||
|FR-02.3|Khi distance ≤ POI.trigger\_radius trong 3s liên tục → trigger ENTER.|Debounce 3s|
|FR-02.4|ENTER trigger → playWithFallback(poi\_id, language) theo 4-tier.||
|FR-02.5|Cooldown 5 phút sau khi phát xong — không phát lại nếu vào lại zone trong 5 phút.|BR-03|
|FR-02.6|Overlap 2 POI → chọn POI có priority nhỏ hơn (cao hơn).|BR-04|
|FR-02.7|Điện thoại nhận cuộc gọi → auto Pause. Sau call → giữ Pause.|BR-05|

## **FR-03: QR Scanner**

|**ID**|**Requirement**|**Notes**|
| :- | :- | :- |
|FR-03.1|Camera view fullscreen. Overlay viewfinder frame animation.||
|FR-03.2|Scan success → GET /poi/by-qr?hash={qr\_hash} → navigate APP-2.||
|FR-03.3|QR không hợp lệ → toast 3s "Mã QR không hợp lệ". Giữ màn hình quét.||
|FR-03.4|Spam quét cùng mã trong 10s → bỏ qua.|BR-QR-04|
|FR-03.5|Bật/tắt flash. Nút Cancel đóng camera.||

## **FR-04: POI Management (CMS)**

|**ID**|**Requirement**|**Notes**|
| :- | :- | :- |
|FR-04.1|Hiển thị danh sách POI dạng bảng + map dual view. Pagination 20/trang.||
|FR-04.2|Click trên map → auto-fill lat/long vào form.||
|FR-04.3|Lưu POI → background task: dịch 3 ngôn ngữ + Edge-TTS → lưu audio\_url.|async|
|FR-04.4|Xóa POI → cascade xóa audio\_content liên quan + log warning nếu POI trong tour.||
|FR-04.5|Trạng thái audio: processing / completed / failed — hiển thị badge trong table.||

## **FR-05: Tour Management (CMS)**

|**ID**|**Requirement**|**Notes**|
| :- | :- | :- |
|FR-05.1|Tạo Tour: tên (\*), mô tả, thumbnail URL.||
|FR-05.2|Thêm POI vào Tour từ picker. Drag-drop sắp xếp thứ tự (order\_index).||
|FR-05.3|Xóa POI khỏi Tour không xóa POI gốc.||
|FR-05.4|Preview lộ trình Tour trên map với polyline nối các POI theo order\_index.||
|FR-05.5|Validate: ≥ 1 POI, tên không rỗng.||

## **FR-06: Analytics**

|**ID**|**Requirement**|**Notes**|
| :- | :- | :- |
|FR-06.1|App gửi event log: poi\_enter, audio\_play, audio\_complete, qr\_scan kèm session\_id ẩn danh.|Batch 60s|
|FR-06.2|Dashboard hiển thị: tổng lượt play, top 10 POI, avg listen time, plays by hour.||
|FR-06.3|Heatmap overlay trên map: mật độ event theo tọa độ.|Dùng thư viện heatmap|
|FR-06.4|Filter theo thời gian: Hôm nay / 7 ngày / 30 ngày.||



# **16. Acceptance Criteria (Given-When-Then)**
## **Authentication**

|**Story**|**Given**|**When**|**Then**|
| :- | :- | :- | :- |
|US-11|Admin ở /cms/login|Nhập đúng email + password, nhấn Đăng nhập|Redirect /cms/dashboard. httpOnly cookie được set. Sidebar hiển thị.|
|US-11|Không có token, truy cập /cms/pois|Hệ thống kiểm tra token|Redirect /cms/login?redirect=/cms/pois. Sau login → redirect đúng trang.|
|US-11|Nhập sai password 5 lần liên tiếp|Lần thứ 5 fail|Form lock 5 phút. Hiển thị đồng hồ đếm ngược. Nút submit disabled.|

## **Geofencing**

|**Story**|**Given**|**When**|**Then**|
| :- | :- | :- | :- |
|US-02|App đang mở, GPS on, user cách POI 100m|User đi bộ vào bán kính 30m và ở đó 3s|Audio phát tự động. Bottom sheet mini hiện lên với tên POI.|
|US-02|Đang phát POI A|User bước vào bán kính POI B|POI A tiếp tục. POI B vào queue. Sau khi A xong → B phát.|
|US-02|User vừa nghe POI A xong (< 5 phút)|User ra ngoài rồi đi vào lại bán kính POI A|Audio KHÔNG phát lại. Không toast, không notification.|

## **QR Scanner**

|**Story**|**Given**|**When**|**Then**|
| :- | :- | :- | :- |
|US-06|Màn hình QR Scanner mở|User quét QR hợp lệ của POI Quán Ốc Oanh|Navigate sang APP-2. Audio tiếng Việt tự động phát sau ≤ 5s.|
|US-06|Màn hình QR Scanner mở|User quét QR không thuộc hệ thống|Toast đỏ "Mã QR không hợp lệ" trong 3s. Camera tiếp tục scanning.|
|US-06|User quét QR hợp lệ|Quét lại cùng mã đó trong vòng 10s|Không có action nào xảy ra.|

## **POI Management (CMS)**

|**Story**|**Given**|**When**|**Then**|
| :- | :- | :- | :- |
|US-13|Trang POI Management, map hiển thị|Admin click vào điểm trên bản đồ|Modal mở với lat/long tự động điền. Admin điền tiếp các field còn lại.|
|US-14|Modal Thêm POI, đủ thông tin hợp lệ|Admin nhấn Lưu|Modal đóng. Marker xuất hiện trên map. Badge "Processing" trên table row. Toast "Lưu thành công".|
|US-14|Modal Thêm POI, trường Tên rỗng|Admin nhấn Lưu|Inline error dưới field Tên. Request không gửi. Modal vẫn mở.|
|US-16|Bảng POI có entry đang thuộc Tour|Admin click Xóa POI|Dialog 1: confirm xóa. Dialog 2: cảnh báo POI đang trong N Tour. Confirm lần 2 → xóa cascade.|

## **Đa ngôn ngữ & Fallback**

|**Story**|**Given**|**When**|**Then**|
| :- | :- | :- | :- |
|US-09|POI chưa có audio tiếng Nhật|User jp mở APP-2 cho POI đó|Hiển thị content tiếng Anh (fallback). Badge "EN" nhỏ trên audio player.|
|US-03|APP-2 đang phát audio vi|User chuyển sang EN|Audio pause. Load audio EN (từ cache hoặc on-demand). Phát từ đầu bằng EN.|


# **17. Business Rules**

|**Rule ID**|**Condition**|**Expected Outcome**|**Notes**|
| :- | :- | :- | :- |
|BR-01|user\_distance ≤ POI.trigger\_radius|Trigger ENTER, queue audio, play|Background location service|
|BR-02|Đang phát POI\_A, enter POI\_B|POI\_A tiếp tục, POI\_B queue|Chống gián đoạn|
|BR-03|Vào lại zone trong < 5 phút|KHÔNG phát lại|Chống GPS boundary spam|
|BR-04|2 POI overlap|Phát POI priority nhỏ hơn (cao hơn)|Tie-break by distance nếu priority bằng nhau|
|BR-05|Cuộc gọi đến|Auto Pause, sau call giữ Pause|Không auto-resume|
|BR-06|Ngôn ngữ thiết bị không có content|Fallback EN → vi|BR-04 trong file gốc|
|BR-07|Gửi analytics|Chỉ Session ID ẩn danh, batch 60s|Bảo vệ privacy, tối ưu băng thông|
|BR-08|QR quét lại trong 10s|Bỏ qua|Chống duplicate load|
|BR-09|AI rate limit|Max 10 req/ngày/admin|Free tier quota|
|BR-10|Audio cache hit|Không gọi TTS lại — MD5(text:lang) match|Zero cost repeat plays|



# **18. Data Requirements (Schema)**
## **Collection: pois**

|**Field**|**Type**|**Required**|**Validation**|**Dùng ở đâu**|
| :- | :- | :- | :- | :- |
|\_id|ObjectId|Auto|MongoDB auto-generate|Internal ID|
|poi\_id|UUID string|Auto|server generate|QR payload, FK|
|name|String 255|Yes|Non-empty|Map marker, CMS, Tour builder|
|type|Enum: major|minor|Yes|Enum constraint|Icon, filter|
|category|Enum: wc|ban\_ve|gui\_xe|ben\_thuyen|null|If minor|Required khi type=minor|Icon mapping, filter|
|latitude|Decimal 10,7|Yes|−90 to 90|Map render, geofence|
|longitude|Decimal 10,7|Yes|−180 to 180|Map render, geofence|
|trigger\_radius|Integer meters|Yes|Min 1, rec 20–50|Geofence activation|
|priority|Integer 1–10|Yes|Range 1–10|Overlap resolution|
|description\_vi|Text|Yes|Max 2000 chars|Nguồn dịch + TTS|
|image\_urls|Array String|No|Max 8 items, URL format|Carousel ảnh|
|qr\_code\_hash|String|Auto|Server generate on create|QR matching|
|audio\_status|Enum: pending|processing|completed|failed|Auto|Server managed|CMS badge hiển thị|
|created\_at|DateTime|Auto|Server timestamp|Audit|
|updated\_at|DateTime|Auto|Server timestamp|Audit|

## **Collection: audio\_content**

|**Field**|**Type**|**Required**|**Ghi chú**|
| :- | :- | :- | :- |
|\_id|ObjectId|Auto||
|poi\_id|String UUID|Yes|FK → pois.poi\_id|
|language\_code|Enum: vi|en|jp|Yes||
|text\_description|Text|Yes|Nội dung đã dịch sang language\_code|
|audio\_url|String URL|No|Null khi chưa generate xong|
|duration|Integer seconds|No|Dùng cho progress bar player|
|is\_fallback|Boolean|No|True nếu là fallback từ tier cao hơn|
|created\_at|DateTime|Auto||

## **Collection: tours**

|**Field**|**Type**|**Required**|**Ghi chú**|
| :- | :- | :- | :- |
|\_id|ObjectId|Auto||
|tour\_id|UUID string|Auto||
|name|String 255|Yes||
|description|Text|No|Max 2000 chars|
|thumbnail\_url|String URL|No||
|created\_at|DateTime|Auto||
|updated\_at|DateTime|Auto||

## **Collection: tour\_pois (embedded array trong tours)**

|**Field**|**Type**|**Required**|**Ghi chú**|
| :- | :- | :- | :- |
|poi\_id|UUID string|Yes|FK → pois.poi\_id|
|order\_index|Integer|Yes|0-based. Unique per tour. Dùng cho drag-drop sort, polyline render|

## **Collection: analytics\_logs**

|**Field**|**Type**|**Required**|**Ghi chú**|
| :- | :- | :- | :- |
|session\_id|String UUID|Yes|Anonymous. Reset mỗi lần mở app|
|event\_type|Enum: poi\_enter|audio\_play|audio\_complete|qr\_scan|Yes||
|poi\_id|String|Yes||
|language\_code|String|No||
|latitude|Decimal|No|Tọa độ tại thời điểm event (tùy chọn)|
|longitude|Decimal|No||
|timestamp|DateTime|Yes||

## **Collection: admin\_users**

|**Field**|**Type**|**Required**|**Ghi chú**|
| :- | :- | :- | :- |
|\_id|ObjectId|Auto||
|email|String|Yes|Unique. Login credential|
|password\_hash|String|Yes|bcrypt|
|role|Enum: admin|super\_admin|Yes||
|is\_active|Boolean|Yes|Disable account không xóa|
|created\_at|DateTime|Auto||
|last\_login|DateTime|No||

## **Collection: ai\_usage\_limits**

|**Field**|**Type**|**Required**|**Ghi chú**|
| :- | :- | :- | :- |
|admin\_id|String|Yes|FK → admin\_users.\_id|
|date|Date|Yes|YYYY-MM-DD|
|count|Integer|Yes|Reset daily. Max 10.|



# **19. API Specification (~60 Endpoints)**

|Base URL: /api/v1 — Tất cả endpoint CMS yêu cầu Bearer token (JWT trong httpOnly cookie). Mobile App endpoints là public (không cần auth) trừ analytics write.|
| :- |

## **19.1 Authentication — /admin/auth**

|**Method**|**Endpoint**|**Body / Params**|**Response**|**Auth**|
| :- | :- | :- | :- | :- |
|POST|/admin/auth/login|{ email, password }|{ access\_token, expires\_at }|Public|
|POST|/admin/auth/logout|Cookie token|{ success: true }|Admin|
|GET|/admin/auth/me|Cookie token|{ admin\_id, email, role }|Admin|
|POST|/admin/auth/change-password|{ old\_password, new\_password }|{ success: true }|Admin|

## **19.2 POI Content — /poi**

|**Method**|**Endpoint**|**Body / Params**|**Response**|**Auth**|
| :- | :- | :- | :- | :- |
|GET|/poi/load-all|?lang=vi&page=&limit=|{ data: POI[], total }|Public|
|GET|/poi/nearby|?lat=&lng=&radius=&lang=|{ data: POI[] }|Public|
|GET|/poi/:id|?lang=vi|{ data: POI with audio\_content }|Public|
|GET|/poi/by-qr|?hash={qr\_code\_hash}|{ data: POI }|Public|
|POST|/poi|POI object|{ data: POI } + background TTS task|Admin|
|PUT|/poi/:id|Partial POI|{ data: POI }|Admin|
|DELETE|/poi/:id||{ success, affected\_tours }|Admin|
|POST|/poi/:id/images|multipart/form-data|{ image\_urls[] }|Admin|
|DELETE|/poi/:id/images/:index||{ image\_urls[] }|Admin|

## **19.3 Audio & TTS — /audio**

|**Method**|**Endpoint**|**Body / Params**|**Response**|**Auth**|
| :- | :- | :- | :- | :- |
|POST|/audio/tts|{ text, lang, voice? }|Stream MP3 + X-Cache: HIT/MISS|Public|
|GET|/audio/pack-manifest|?lang=vi|{ lang, total\_files, files[] with sha256 }|Public|
|GET|/audio/tasks|SSE stream|task\_id, status, progress events|Admin|
|POST|/audio/tasks/:id/pause||{ status: paused }|Admin|
|POST|/audio/tasks/:id/resume||{ status: running }|Admin|
|POST|/audio/tasks/:id/cancel||{ status: cancelled }|Admin|
|GET|/audio/voices|?lang=vi|{ voices[] }|Admin|

## **19.4 Localization — /localizations**

|**Method**|**Endpoint**|**Body / Params**|**Response**|**Auth**|
| :- | :- | :- | :- | :- |
|POST|/localizations/on-demand|{ poi\_id, lang }|{ audio\_url, is\_fallback }|Public (rate limited 30/10min)|
|POST|/localizations/prepare-hotset|{ poi\_ids[], lang }|{ queued: N }|Public|
|POST|/localizations/warmup|{ lang }|{ status: started }|Public|
|GET|/localizations/:poi\_id|?lang=vi|{ data: audio\_content }|Public|
|PUT|/localizations/:poi\_id/:lang|{ text\_description, audio\_url }|{ data: audio\_content }|Admin|
|DELETE|/localizations/:poi\_id/:lang||{ success: true }|Admin|

## **19.5 Tours — /tours**

|**Method**|**Endpoint**|**Body / Params**|**Response**|**Auth**|
| :- | :- | :- | :- | :- |
|GET|/tours|?search=&page=&limit=|{ data: Tour[], total }|Public|
|GET|/tours/:id||{ data: Tour with ordered pois }|Public|
|POST|/tours|{ name, description?, thumbnail\_url?, pois[] }|{ data: Tour }|Admin|
|PUT|/tours/:id|Partial Tour|{ data: Tour }|Admin|
|DELETE|/tours/:id||{ success: true }|Admin|
|PUT|/tours/:id/pois|{ pois: [{ poi\_id, order\_index }] }|{ data: Tour }|Admin|

## **19.6 Analytics — /analytics**

|**Method**|**Endpoint**|**Body / Params**|**Response**|**Auth**|
| :- | :- | :- | :- | :- |
|POST|/analytics/events|{ session\_id, events[] }|{ accepted: N }|Public (anonymous)|
|GET|/analytics/top-pois|?period=7d&limit=10|{ data: [{poi\_id, play\_count}] }|Admin|
|GET|/analytics/plays-by-hour|?period=7d|{ data: [{hour, count}] }|Admin|
|GET|/analytics/heatmap-data|?period=7d|{ data: [{lat, lng, weight}] }|Admin|
|GET|/analytics/summary|?period=today|{ total\_plays, unique\_sessions, avg\_duration }|Admin|

## **19.7 AI Advisor — /ai**

|**Method**|**Endpoint**|**Body / Params**|**Response**|**Auth**|
| :- | :- | :- | :- | :- |
|POST|/ai/enhance-description|{ poi\_name, original\_text, lang, poi\_type }|{ enhanced\_text, tokens\_used }|Admin (rate limited 10/day)|
|GET|/ai/usage-today||{ used: N, limit: 10, remaining: N }|Admin|

## **19.8 Maps — /maps**

|**Method**|**Endpoint**|**Body / Params**|**Response**|**Auth**|
| :- | :- | :- | :- | :- |
|GET|/maps/offline-manifest||{ bbox, version, checksums, asset\_urls }|Public|
|GET|/maps/packs/:version/:file|Range header support|Binary PMTiles (partial)|Public|
|GET|/maps/styles/:path||Style JSON / sprites|Public|
|GET|/maps/fonts/:fontstack/:range.pbf||Glyph PBFs|Public|

## **19.9 Admin Management — /admin**

|**Method**|**Endpoint**|**Body / Params**|**Response**|**Auth**|
| :- | :- | :- | :- | :- |
|GET|/admin/users|?page=&limit=|{ data: AdminUser[] }|Super Admin|
|POST|/admin/users|{ email, password, role }|{ data: AdminUser }|Super Admin|
|PUT|/admin/users/:id|{ role, is\_active }|{ data: AdminUser }|Super Admin|
|DELETE|/admin/users/:id||{ success: true }|Super Admin|
|GET|/admin/audit-logs|?page=&limit=&action=|{ data: AuditLog[] }|Admin|



# **20. Non-Functional Requirements**

|**Category**|**Requirement**|**Target / Metric**|
| :- | :- | :- |
|Performance|POI list load (≤ 500 items)|< 2 giây với pagination + lazy map markers|
|Performance|Audio Tier-1 (cache HIT)|~0ms|
|Performance|Audio Tier-2 (on-demand TTS)|≤ 5 giây|
|Performance|App startup đến bản đồ hiển thị|< 3 giây (offline data từ IndexedDB)|
|Security|JWT stored in httpOnly cookie|Chống XSS. SameSite=Lax chống CSRF|
|Security|Password storage|bcrypt hashing, không log|
|Security|Analytics data|Ẩn danh: chỉ Session ID (reset/session), không PII|
|Security|Map file serving|Path Traversal guard: resolve() phải nằm trong base dir|
|Auth|Route guard|100% route /cms/\* bị chặn nếu unauthenticated|
|Validation|Client + Server independent validation|Không gửi request không hợp lệ|
|Error Handling|Network/5xx error|Toast lỗi + giữ nguyên form, không crash UI|
|Offline|App sau lần mở đầu tiên|Hoạt động offline với dữ liệu đã cache|
|Offline|Audio khi mất mạng|Tier 3 SpeechSynthesis luôn khả dụng|
|Battery|GPS tracking|Throttle 5s — không gọi liên tục|
|Battery|Analytics batch|Gửi batch 60s, không gửi từng event riêng lẻ|
|Logging|Audit log|Server-side: action, admin\_id, resource, timestamp|
|Responsiveness|Mobile App|iOS 14+ / Android 10+|
|Responsiveness|Web CMS|Desktop ≥ 1280px (Chrome 110+, Edge 110+, Firefox 110+)|


# **21. Tech Stack & Dependencies**

|**Layer**|**Công nghệ**|**License / Cost**|**Ghi chú**|
| :- | :- | :- | :- |
|Mobile App|React Native / Expo|MIT / Free|iOS + Android từ 1 codebase|
|Web CMS|React 18 + Vite|MIT / Free|SPA admin dashboard|
|Backend API|FastAPI (Python)|MIT / Free|async, /api/v1 prefix|
|Backend helper|Node.js / Express|MIT / Free|File upload, QR generation|
|Database|MongoDB + Motor|SSPL / Free tier|Async driver cho FastAPI|
|Map (mobile)|MapLibre GL JS hoặc Google Maps SDK|Open-source / Free tier|Vector maps|
|Map (CMS)|Google Maps JS SDK|Free tier (28k load/tháng)|Admin POI placement|
|Geofencing|Turf.js (Haversine)|MIT / Free|Client-side distance calc|
|TTS Engine|Edge-TTS (Microsoft Neural)|Free (unofficial API)|300+ voices, 5 ngôn ngữ|
|Translation|deep-translator (Google Translate)|MIT / Free|Wrapper miễn phí|
|AI Content|Google Gemini Flash|Free tier (15 RPM)|Enhance description|
|Offline — SW|Workbox|Apache 2.0 / Free|Service Worker toolkit|
|Offline — IDB|idb wrapper|ISC / Free|IndexedDB typed wrapper|
|State (mobile)|Zustand|MIT / Free|Lightweight state management|
|QR Scanning|expo-camera / react-native-vision-camera|MIT / Free||
|Audio Playback|expo-av / react-native-track-player|MIT / Free|Background audio support|
|Auth tokens|PyJWT (Python)|MIT / Free|HS256 JWT|
|Password|bcrypt (Python)|Apache 2.0 / Free||



# **22. Key Constants & Configuration**

|**Constant**|**Value**|**File / Module**|**Ý nghĩa**|
| :- | :- | :- | :- |
|ACCESS\_TOKEN\_EXPIRE|30 phút|backend config|JWT access token TTL|
|REFRESH\_TOKEN\_EXPIRE|7 ngày|backend config|JWT refresh token TTL|
|GPS\_THROTTLE|5 giây|LocationService.js|watchPosition throttle|
|GEOFENCE\_DEBOUNCE|3 giây|GeofenceEngine.js|Confirm ENTER sau N giây|
|GEOFENCE\_DEFAULT\_RADIUS|30 m|GeofenceEngine.js|Bán kính mặc định nếu POI không set|
|GEOFENCE\_COOLDOWN|5 phút|GeofenceEngine.js|Không phát lại trong N phút|
|HEARTBEAT\_INTERVAL|1 giây|GeofenceEngine.js|Vòng lặp kiểm tra zone|
|QR\_SPAM\_COOLDOWN|10 giây|QRScanner.js|Bỏ qua quét lại cùng mã|
|ANALYTICS\_BATCH\_INTERVAL|60 giây|analyticsService.js|Gửi log theo batch|
|HOTSET\_NEARBY\_RADIUS|1500 m|localization/service|Bán kính tải trước ngôn ngữ|
|HOTSET\_MAX\_POI|10|localization/service|Số POI tối đa trong hotset|
|ON\_DEMAND\_RATE\_LIMIT|30 req / 10 phút|localization/service|Chống spam dịch on-demand|
|AI\_DAILY\_LIMIT (Admin)|10 req / ngày|ai\_advisor/service|Free tier Gemini quota|
|MAX\_TTS\_CONCURRENT|3 (Semaphore)|audio/task\_manager|Số task TTS song song|
|VOICE\_CATALOG\_TTL|6 giờ|audio/service|Cache danh sách voices Edge-TTS|
|POI\_CACHE\_TTL|15 phút|sw.js / poiStore|Service Worker NetworkFirst TTL|
|AUDIO\_MAX\_PER\_LANG|300 files|sw.js|LRU eviction threshold|
|MAX\_LANGUAGE\_CACHES|3|sw.js|Số ngôn ngữ tối đa cache đồng thời|
|MAX\_POI\_IMAGES|8|content/service|Số ảnh tối đa mỗi POI|
|MAX\_IMAGE\_SIZE|5 MB|content/service|Giới hạn file upload ảnh|
|PREFETCH\_QUEUE\_LIMIT|3 POI / batch, gate ≥ 30s|useGeofence.js|Background prefetch throttle|


# **23. Dependencies & Risks**
## **23.1 Dependencies**

|**#**|**Dependency**|**Loại**|**Tác động nếu thiếu / fail**|
| :- | :- | :- | :- |
|D1|Google Maps / MapLibre API Key|Third-party|Bản đồ không render. Blocker cho APP-1, APP-3 navigate, CMS POI placement.|
|D2|Edge-TTS (Microsoft)|Free API (unofficial)|Audio generation fail. Fallback: SpeechSynthesis (Tier 3) vẫn dùng được.|
|D3|deep-translator / Google Translate|Free scraping wrapper|Dịch tự động fail. Admin phải nhập text đa ngôn ngữ thủ công.|
|D4|Google Gemini Flash free tier|Third-party API|AI enhance fail. Admin nhập nội dung thủ công — acceptable.|
|D5|MongoDB Atlas free tier|Cloud DB|Downtime = toàn hệ thống không hoạt động. Cần connection pooling.|
|D6|File storage (disk / S3)|Infrastructure|Audio MP3 không lưu được. Cần mount volume ổn định.|

## **23.2 Risks**

|**#**|**Risk**|**Khả năng**|**Mức độ**|**Mitigation**|
| :- | :- | :- | :- | :- |
|R1|Edge-TTS bị block/rate limit (unofficial API)|Medium|High|Cache aggressively (MD5 key). Fallback: SpeechSynthesis. Long-term: Azure TTS có quota.|
|R2|GPS accuracy kém trong hẻm phố, nhà cao tầng|High|Medium|Debounce 3s + cooldown 5 phút. QR Scanner là alternative chính thức.|
|R3|Background geofencing bị iOS kill process|Medium|High|Test kỹ trên iOS. Sử dụng expo-location background task đúng cách.|
|R4|Free tier AI (Gemini) đổi quota/policy|Low|Medium|Rate limit nghiêm ngặt ở BE. Feature không blocking — admin vẫn nhập thủ công được.|
|R5|Dữ liệu analytics gây lo ngại privacy|Low|Medium|Không thu thập PII. Session ID reset mỗi session. Ghi rõ trong app.|
|R6|Offline audio cache chiếm quá nhiều dung lượng|Medium|Low|LRU eviction, max 300/lang, max 3 langs. purgeOnQuotaError.|


# **24. Open Questions & Assumptions**

|Các câu hỏi sau cần được quyết định trước khi bắt đầu sprint. Assumptions được ghi rõ để team có thể override.|
| :- |

|**#**|**Open Question**|**Assumption hiện tại**|**Owner**|
| :- | :- | :- | :- |
|OQ-01|Map provider: Google Maps SDK cho mobile hay MapLibre GL (open-source)?|Dùng MapLibre + Google Maps free tile cho CMS (admin không cần offline)|Tech Lead|
|OQ-02|Backend: FastAPI đảm nhận toàn bộ hay cần Node.js layer riêng?|FastAPI là primary API. Node.js chỉ cho QR generation + file upload helper.|Tech Lead|
|OQ-03|Edge-TTS có ổn định đủ cho production? Có cần plan B?|Dùng Edge-TTS + SpeechSynthesis fallback. Azure TTS là plan B nếu cần.|Tech Lead|
|OQ-04|Offline map: PMTiles self-host hay dùng cloud map API?|Cloud map API (free tier). PMTiles là Future Enhancement.|Tech Lead / DevOps|
|OQ-05|Gemini free tier có đủ quota cho demo/đồ án không (15 RPM)?|Đủ cho demo. Rate limit 10/ngày/admin để không vượt quota.|Dev team|
|OQ-06|Audio background playback trên iOS cần entitlement đặc biệt?|Cần cấu hình Background Modes trong Xcode. Expo bare workflow hoặc expo-av.|Mobile Dev|
|OQ-07|QR code format: chứa poi\_id trực tiếp hay qr\_code\_hash?|Hash (không expose internal ID trực tiếp). Format: vinhkhanh://poi/{hash}|Backend Dev|
|OQ-08|Analytics: có cần GDPR/privacy notice trong app không?|Cần hiển thị notice đơn giản lần đầu mở app: "App thu thập dữ liệu ẩn danh để cải thiện dịch vụ."|PO / Nhóm|


# **25. Future Enhancements (Post-MVP)**

|Các tính năng này KHÔNG thuộc scope MVP. Ghi nhận để tránh scope creep và lên roadmap phase 2.|
| :- |

|**#**|**Tính năng**|**Lý do defer**|
| :- | :- | :- |
|FE-01|Offline Map PMTiles (self-hosted Quận 4/Vĩnh Khánh bbox)|Cần infrastructure phức tạp hơn. Cloud API đủ cho MVP.|
|FE-02|Thêm ngôn ngữ: zh, ko, fr|Core 3 ngôn ngữ đủ cho đồ án. Mở rộng dễ sau khi có pipeline.|
|FE-03|Owner Portal — chủ quán tự đăng ký và quản lý POI|B2B feature. Cần RBAC phức tạp hơn, workflow duyệt.|
|FE-04|Đánh giá & review địa điểm từ người dùng|Community feature. Cần moderation.|
|FE-05|Audio Pack download — tải trọn bộ audio 1 ngôn ngữ|UX tốt hơn cho offline. Cần manifest + SHA-256 verify.|
|FE-06|AI auto-generate mô tả khi tạo POI (không cần nhấn nút)|Tiện lợi hơn. Cần quota ổn định.|
|FE-07|Multi-admin role management — Super Admin UI|Only CLI seeding trong MVP. UI sau.|
|FE-08|Bulk import POI từ CSV / GeoJSON|Nice-to-have cho onboarding data lớn.|
|FE-09|QR Code generation UI trong CMS (tự in/download QR)|MVP dùng qr\_code\_hash tĩnh. UI sau.|
|FE-10|User account & tour history (nghe POI nào rồi)|Cần backend auth cho end-user. Privacy phức tạp hơn.|
|FE-11|PII Encryption tự động redact sau N ngày|Enterprise compliance. Không cần cho MVP academic.|
|FE-12|Push notification khi có POI mới gần vị trí|Marketing/UX. Cần FCM integration.|



# **Phụ lục A: Revision History**

|**Phiên bản**|**Ngày**|**Tác giả**|**Thay đổi**|
| :- | :- | :- | :- |
|v1.0|2025|Nhóm phát triển|PRD khởi tạo — Full system MVP. Nguồn: StepLowCode\_UI\_Flow\_Rule.txt + system-presentation.html (tham khảo)|


# **Phụ lục B: Ghi chú kỹ thuật tham khảo**
Tài liệu này được xây dựng dựa trên:

- StepLowCode\_UI\_Flow\_Rule.txt — UI flows, business rules, data fields gốc của dự án Vĩnh Khánh
- system-presentation-standalone.html — tài liệu tham khảo kiến trúc hệ thống du lịch tương tự (Quận 4 Culinary Tourism) để cross-check patterns và constants
- Kinh nghiệm best practices: iOS CLLocationManager patterns, OWASP Session Management, Google Workbox, ICU locale fallback chain


*— END OF DOCUMENT — PRD v1.0 — Ứng dụng Thuyết minh Đa ngôn ngữ Phố Ẩm thực Vĩnh Khánh —*
Đồ án môn học — Nhóm phát triển Vĩnh Khánh Guide	
