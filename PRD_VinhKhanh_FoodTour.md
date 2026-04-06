# 📄 Product Requirements Document (PRD)

## Vĩnh Khánh Food Tour — Ứng dụng Du lịch Ẩm thực Phố Vĩnh Khánh, Quận 4, TP.HCM

---

| Thông tin tài liệu | Chi tiết |
|---|---|
| **Phiên bản** | v1.0.0 |
| **Trạng thái** | Draft — Chờ phê duyệt |
| **Tác giả** | Product Manager |
| **Ngày tạo** | Tháng 4, 2025 |
| **Nền tảng** | Progressive Web App (PWA) — Mobile-first |
| **Tech Stack** | ASP.NET Core 10 · MongoDB Atlas · Vanilla JS (ES6) · HTML5/CSS3 |

---

## Mục lục

1. [Executive Summary](#1-executive-summary)
2. [User Personas](#2-user-personas)
3. [User Stories & Acceptance Criteria](#3-user-stories--acceptance-criteria)
4. [Functional Requirements](#4-functional-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [System Architecture & Flow](#6-system-architecture--flow)
7. [Metrics & KPIs](#7-metrics--kpis)

---

## 1. Executive Summary

### 1.1 Bối cảnh & Vấn đề cần giải quyết

Phố ẩm thực Vĩnh Khánh (Quận 4, TP.HCM) là một trong những điểm đến ẩm thực về đêm sôi động bậc nhất Sài Gòn — nơi tập trung hàng chục quán hải sản, món nhậu đặc trưng và trải nghiệm văn hóa địa phương chân thực. Tuy nhiên, điểm đến này đang đối mặt với **ba rào cản lớn** kìm hãm tiềm năng du lịch quốc tế:

1. **Rào cản ngôn ngữ:** Hầu hết thực đơn và nhân viên phục vụ chỉ giao tiếp được bằng tiếng Việt, khiến du khách nước ngoài lúng túng khi đặt món và thanh toán.
2. **Thiếu công cụ định hướng thông minh:** Không có hệ thống dẫn đường hay thuyết minh tự động, du khách phụ thuộc hoàn toàn vào tour guide hoặc mò mẫm tự tìm.
3. **Rào cản tiếp cận cho người khuyết tật:** Người khiếm nói, khiếm nghe, hoặc du khách không biết tiếng Việt gần như không có công cụ hỗ trợ giao tiếp tại chỗ.

### 1.2 Giải pháp đề xuất

**Vĩnh Khánh Food Tour** là một Progressive Web App (PWA) ưu tiên Mobile-first, hoạt động hoàn toàn qua trình duyệt — **không cần cài đặt từ App Store hay Google Play**. Ứng dụng tích hợp bản đồ tương tác thời gian thực, hệ thống thuyết minh đa ngôn ngữ tự động (Geofencing + QR), và bộ công cụ AAC (Augmentative and Alternative Communication) hỗ trợ giao tiếp không lời — mang lại trải nghiệm khám phá ẩm thực tự động hóa, bao trùm và không phụ thuộc vào kết nối mạng liên tục.

### 1.3 Phạm vi dự án (In Scope / Out of Scope)

| In Scope | Out of Scope |
|---|---|
| PWA cho khách du lịch (User App) | Tính năng đặt bàn / đặt món trực tuyến |
| Web Admin Dashboard | Thanh toán / tích hợp ví điện tử |
| Geofencing & thuyết minh tự động | Hệ thống review / đánh giá quán |
| Quét QR tại bàn | Chức năng mạng xã hội (follow, share) |
| Công cụ AAC giao tiếp | App Native iOS / Android |
| Offline Mode (IndexedDB + Service Worker) | Hệ thống quản lý nhân viên quán |
| Analytics & Heatmap hành vi du khách | Tích hợp bên thứ ba ngoài Google TTS |

---

## 2. User Personas

### Persona 1 — "The Solo Backpacker" (Du khách Quốc tế Tự túc)

> **Tên:** Marcus Chen  
> **Tuổi:** 28 | **Quốc tịch:** Singapore  
> **Nghề nghiệp:** Kỹ sư phần mềm, du lịch solo 2–3 lần/năm

**Đặc điểm hành vi:**

- Sử dụng smartphone là công cụ du lịch chính (Google Maps, TripAdvisor, Grab).
- Thích khám phá ẩm thực địa phương "off-the-beaten-path", không thích tour package.
- Sử dụng tiếng Anh là ngôn ngữ chính, biết ít tiếng Việt.
- Tự chủ cao nhưng lo ngại bị "chặt chém" do không hiểu thực đơn.

**Pain Points:**

- Không đọc được thực đơn tiếng Việt, không biết món gì là đặc trưng.
- Ngại chỉ trỏ lung tung, sợ gọi nhầm món.
- Bỡ ngỡ khi không biết đi từ đầu phố đến cuối phố, quán nào nên ăn trước.

**Goals:**

- Biết món nào ngon nhất tại từng quán mà không cần hỏi.
- Tự trải nghiệm như người địa phương, không cần dùng tour guide.
- Có công cụ giao tiếp cơ bản với chủ quán khi cần.

---

### Persona 2 — "The Japanese Food Enthusiast" (Tín đồ Ẩm thực Nhật)

> **Tên:** Yuki Tanaka  
> **Tuổi:** 35 | **Quốc tịch:** Nhật Bản  
> **Nghề nghiệp:** Biên tập viên tạp chí ẩm thực

**Đặc điểm hành vi:**

- Nghiên cứu kỹ địa điểm trước chuyến đi qua blog và review tiếng Nhật.
- Quan tâm đến văn hóa và câu chuyện đằng sau từng món ăn.
- Không sử dụng được tiếng Anh lưu loát, phụ thuộc vào ứng dụng dịch thuật.
- Thường đi theo nhóm 2–4 người.

**Pain Points:**

- Khó tìm thông tin giới thiệu quán bằng tiếng Nhật.
- Mất nhiều thời gian dịch thực đơn bằng Google Lens — không hiệu quả khi quán đông.
- Lo ngại về dị ứng thực phẩm, không biết cách hỏi bằng tiếng Việt.

**Goals:**

- Nhận thông tin thuyết minh bằng tiếng Nhật ngay khi bước vào quán.
- Hiểu được câu chuyện văn hóa, nguồn gốc của từng món ăn.
- Có công cụ hỗ trợ giao tiếp cơ bản như "không cho ớt", "thêm đá".

---

### Persona 3 — "The Accessibility User" (Người dùng Khuyết tật / Rào cản ngôn ngữ nặng)

> **Tên:** Anh Tuấn  
> **Tuổi:** 42 | **Quốc tịch:** Việt Nam  
> **Đặc điểm:** Người khiếm nói bẩm sinh, sử dụng điện thoại thành thạo

**Đặc điểm hành vi:**

- Giao tiếp chủ yếu qua văn bản và ký hiệu.
- Dùng điện thoại như phương tiện giao tiếp chính trong cuộc sống hàng ngày.
- Thích đến quán ăn nhưng thường gặp khó khăn trong việc gọi món và yêu cầu thêm.

**Pain Points:**

- Không thể nói để gọi chủ quán.
- Viết tay thì chậm và không phải chủ quán nào cũng có thể đọc được.
- Cảm thấy không thoải mái, thiếu tự chủ khi ăn ở nơi đông người.

**Goals:**

- Gọi món và yêu cầu thêm/bớt hoàn toàn độc lập không cần trợ giúp.
- Sử dụng ứng dụng như một "cầu nối" giao tiếp nhanh với chủ quán.
- Trải nghiệm ăn uống thoải mái, không tạo áp lực cho bản thân và chủ quán.

---

### Persona 4 — "The Admin/Operator" (Quản trị viên Hệ thống)

> **Tên:** Chị Lan  
> **Tuổi:** 30 | **Vai trò:** Nhân viên Ban quản lý Phố Vĩnh Khánh

**Đặc điểm hành vi:**

- Quản lý thông tin của 50–100 điểm POI trên phố.
- Cần cập nhật thông tin quán nhanh khi có quán đóng/mở mới.
- Không có background kỹ thuật sâu, ưu tiên giao diện trực quan.

**Pain Points:**

- Không có hệ thống tập trung để quản lý dữ liệu điểm tham quan.
- Mất nhiều công để in/cấp mã QR mới khi có quán thay đổi vị trí.
- Không có dữ liệu để đánh giá hiệu quả du lịch của tuyến phố.

**Goals:**

- Thêm/sửa/xóa thông tin POI nhanh chóng, không cần nhờ dev.
- In mã QR cho từng quán chỉ bằng vài click.
- Theo dõi xu hướng: quán nào đang hot, giờ nào đông khách nhất.

---

## 3. User Stories & Acceptance Criteria

### Epic 1: Khám phá bản đồ & Đinh vị

---

**US-001** — Xem bản đồ tương tác các quán ăn

> **As a** du khách quốc tế,  
> **I want to** xem bản đồ tương tác hiển thị toàn bộ quán ăn trên Phố Vĩnh Khánh,  
> **So that** tôi có thể nắm bắt tổng quan và lên kế hoạch lộ trình ăn uống.

**Acceptance Criteria:**

- [ ] Bản đồ render sử dụng Leaflet.js, tải được trong ≤ 3 giây trên kết nối 4G.
- [ ] Mỗi POI được hiển thị bằng marker có màu theo phân loại (hải sản, bánh, nước uống...).
- [ ] Tap vào marker hiện popup tóm tắt: tên quán, ảnh đại diện, 1–2 món nổi bật.
- [ ] Bản đồ hỗ trợ pinch-to-zoom và drag trên mobile.
- [ ] Nút "Vị trí của tôi" hiển thị dot xanh định vị GPS thời gian thực.

---

**US-002** — Geofencing tự động thông báo khi vào gần quán

> **As a** du khách đang dạo bộ trên phố,  
> **I want to** nhận thông báo tự động khi tôi đi vào gần một quán ăn trong bán kính 50m,  
> **So that** tôi không bỏ lỡ những quán thú vị dọc đường mà không cần liên tục nhìn điện thoại.

**Acceptance Criteria:**

- [ ] Vị trí GPS được quét mỗi 5 giây khi ứng dụng đang mở (foreground).
- [ ] Khi khoảng cách đến POI ≤ 50m, hệ thống trigger banner notification trong app.
- [ ] Notification hiển thị: tên quán, ảnh thumbnail, nút "Nghe thuyết minh ngay".
- [ ] Không trigger lại cùng một POI trong vòng 5 phút (cooldown) tránh spam.
- [ ] Người dùng có thể tắt Geofencing trong Settings (opt-out).
- [ ] Nếu GPS không khả dụng, hệ thống fallback sang trạng thái "Manual Browse".

---

### Epic 2: Thuyết minh Đa ngôn ngữ

---

**US-003** — Nghe thuyết minh về quán ăn bằng ngôn ngữ ưa thích

> **As a** du khách Nhật Bản,  
> **I want to** nghe giới thiệu về quán và các món đặc trưng bằng tiếng Nhật,  
> **So that** tôi hiểu được văn hóa và đặc điểm của từng quán mà không cần phiên dịch.

**Acceptance Criteria:**

- [ ] Hỗ trợ 4 ngôn ngữ: Tiếng Việt (vi-VN), Anh (en-US), Nhật (ja-JP), Trung (zh-CN).
- [ ] Người dùng chọn ngôn ngữ một lần duy nhất ở onboarding; hệ thống ghi nhớ preference.
- [ ] Ưu tiên dùng Web Speech API (`SpeechSynthesisUtterance`) nếu trình duyệt hỗ trợ.
- [ ] Nếu Web Speech API không khả dụng hoặc không có voice cho ngôn ngữ đó, tự động fallback sang Google Translate TTS API.
- [ ] Nút Play/Pause/Stop hiển thị rõ ràng trên card thuyết minh.
- [ ] Thanh progress bar hiển thị tiến độ audio đang phát.
- [ ] Nội dung text thuyết minh cũng được hiển thị song song để người dùng có thể đọc.

---

**US-004** — Quét QR để mở thuyết minh tự động

> **As a** du khách đang ngồi tại bàn ăn,  
> **I want to** quét mã QR trên bàn để ngay lập tức xem thông tin và nghe thuyết minh về quán,  
> **So that** tôi không cần thao tác tìm kiếm thủ công trên bản đồ.

**Acceptance Criteria:**

- [ ] Nút "Quét QR" truy cập camera của thiết bị, hiển thị viewfinder fullscreen.
- [ ] QR code encode `poiId` dạng URL deep link: `https://app.vinhkhanh.vn/poi/{poiId}`.
- [ ] Sau khi quét thành công: chuyển đến POI detail page trong ≤ 1.5 giây.
- [ ] Tự động phát audio thuyết minh theo ngôn ngữ đã chọn.
- [ ] Hiển thị thông báo lỗi rõ ràng nếu QR không hợp lệ hoặc POI không tồn tại.
- [ ] Fallback dùng jsQR library nếu `BarcodeDetector API` không khả dụng (iOS Safari).

---

### Epic 3: Công cụ Giao tiếp AAC

---

**US-005** — Sử dụng bảng câu giao tiếp nhanh với chủ quán

> **As a** người khiếm nói / du khách không biết tiếng Việt,  
> **I want to** nhấn vào các nút giao tiếp nhanh đã được chuẩn bị sẵn,  
> **So that** tôi có thể truyền đạt nhu cầu cơ bản đến chủ quán thông qua loa của điện thoại.

**Acceptance Criteria:**

- [ ] Màn hình AAC có ít nhất 12 câu giao tiếp phổ biến, chia theo nhóm: Gọi món, Yêu cầu thêm/bớt, Thanh toán, Khác.
- [ ] Mỗi nút hiển thị icon + text ngôn ngữ gốc + nghĩa tiếng Việt nhỏ phía dưới.
- [ ] Nhấn nút → hệ thống phát audio tiếng Việt qua loa ngoài (volume tối đa).
- [ ] Ô text input tự do cho phép người dùng nhập câu bất kỳ.
- [ ] Auto-detect ngôn ngữ input (dùng `navigator.language` + pattern matching).
- [ ] Sau khi nhập, nhấn nút "Phát" → dịch sang tiếng Việt → phát audio.
- [ ] Lịch sử 5 câu vừa dùng gần nhất được lưu trong session để tái sử dụng nhanh.

---

### Epic 4: Offline Mode

---

**US-006** — Xem bản đồ và thông tin quán khi mất kết nối internet

> **As a** du khách đang ở nơi sóng yếu,  
> **I want to** vẫn xem được bản đồ và thông tin các quán đã từng load trước đó,  
> **So that** tôi không bị gián đoạn trải nghiệm khám phá.

**Acceptance Criteria:**

- [ ] Service Worker cache toàn bộ app shell (HTML, CSS, JS) khi lần đầu load.
- [ ] Dữ liệu POI (tên, tọa độ, mô tả, ảnh) được lưu vào IndexedDB khi có mạng.
- [ ] Khi offline: hiển thị banner "Bạn đang xem dữ liệu ngoại tuyến" màu amber.
- [ ] Bản đồ tile được cache theo khu vực Phố Vĩnh Khánh (zoom level 14–18).
- [ ] Các tính năng cần kết nối (GPS real-time, Audio TTS fallback) hiển thị tooltip giải thích lý do không khả dụng.
- [ ] Khi có kết nối trở lại, background sync tự động cập nhật dữ liệu POI mới nhất.

---

### Epic 5: Admin Dashboard

---

**US-007** — Quản lý thông tin POI

> **As an** Admin,  
> **I want to** thêm, sửa, xóa và ẩn/hiện thông tin quán ăn trực tiếp trên dashboard,  
> **So that** dữ liệu trên app luôn được cập nhật mà không cần deploy lại.

**Acceptance Criteria:**

- [ ] Form thêm POI bao gồm: Tên quán, Tọa độ (lat/lng với map picker), Phân loại, Mô tả (4 ngôn ngữ), Ảnh, Giờ mở cửa.
- [ ] Tọa độ có thể nhập tay hoặc ghim trực tiếp trên bản đồ mini.
- [ ] Nút Toggle "Hiển thị / Ẩn" trên mỗi row của danh sách POI, thực hiện được trong 1 click, phản hồi ngay lập tức (optimistic UI).
- [ ] Xóa POI yêu cầu confirm dialog để tránh thao tác nhầm.
- [ ] Tất cả thao tác CRUD được log vào audit trail (thời gian, user thực hiện).

---

**US-008** — Xuất và in mã QR cho từng POI

> **As an** Admin,  
> **I want to** tải xuống file mã QR của từng quán để in và gắn tại bàn,  
> **So that** khách hàng có thể quét và truy cập thông tin nhanh.

**Acceptance Criteria:**

- [ ] Mỗi POI trong dashboard có nút "Tải QR Code".
- [ ] File tải về dạng PNG, kích thước 1000×1000px, nền trắng, có logo app ở giữa.
- [ ] Tính năng "Xuất hàng loạt" cho phép chọn nhiều POI và tải về file ZIP chứa tất cả QR.
- [ ] QR encode URL deep link chuẩn: `https://app.vinhkhanh.vn/poi/{poiId}`.

---

## 4. Functional Requirements

### 4.1 User App — Chức năng chi tiết

#### Module M1: Bản đồ & Định vị

| ID | Requirement | Priority |
|---|---|---|
| FR-M1-01 | Render bản đồ Leaflet.js với tile từ OpenStreetMap | Must Have |
| FR-M1-02 | Load và hiển thị tất cả POI dạng marker có phân loại màu | Must Have |
| FR-M1-03 | Định vị GPS real-time người dùng với cập nhật mỗi 5 giây | Must Have |
| FR-M1-04 | Tính khoảng cách Haversine giữa user và từng POI | Must Have |
| FR-M1-05 | Filter POI theo danh mục (hải sản, đồ nướng, nước...) | Should Have |
| FR-M1-06 | Search POI theo tên quán | Should Have |
| FR-M1-07 | Hiển thị đường đi (routing) từ vị trí user đến POI chọn | Could Have |

#### Module M2: Geofencing

| ID | Requirement | Priority |
|---|---|---|
| FR-M2-01 | Polling GPS mỗi 5 giây khi app ở foreground | Must Have |
| FR-M2-02 | Trigger notification khi khoảng cách ≤ 50m đến POI | Must Have |
| FR-M2-03 | Cooldown 5 phút per POI tránh trigger lặp | Must Have |
| FR-M2-04 | Lưu trạng thái "đã đến" vào session storage | Should Have |
| FR-M2-05 | Cho phép người dùng tắt/bật Geofencing trong Settings | Must Have |

#### Module M3: Audio Guide

| ID | Requirement | Priority |
|---|---|---|
| FR-M3-01 | Phát audio thuyết minh dùng Web Speech API (SpeechSynthesisUtterance) | Must Have |
| FR-M3-02 | Fallback tự động sang Google Translate TTS khi Web Speech API thất bại | Must Have |
| FR-M3-03 | Hỗ trợ 4 ngôn ngữ: vi-VN, en-US, ja-JP, zh-CN | Must Have |
| FR-M3-04 | Giao diện Play/Pause/Stop/Replay | Must Have |
| FR-M3-05 | Điều chỉnh tốc độ phát (0.75x, 1x, 1.25x) | Should Have |
| FR-M3-06 | Hiển thị text transcript đồng bộ với audio đang phát | Should Have |

#### Module M4: QR Scanner

| ID | Requirement | Priority |
|---|---|---|
| FR-M4-01 | Truy cập camera dùng `getUserMedia` API | Must Have |
| FR-M4-02 | Decode QR code dùng BarcodeDetector API (Chrome/Android) | Must Have |
| FR-M4-03 | Fallback decode bằng thư viện jsQR (iOS Safari) | Must Have |
| FR-M4-04 | Parse URL deep link từ QR → extract poiId → redirect | Must Have |
| FR-M4-05 | Hiển thị toast error khi QR không hợp lệ | Must Have |

#### Module M5: AAC Communication

| ID | Requirement | Priority |
|---|---|---|
| FR-M5-01 | Grid 12+ câu giao tiếp nhanh có icon + text | Must Have |
| FR-M5-02 | Nhấn nút → phát audio tiếng Việt qua loa ngoài | Must Have |
| FR-M5-03 | Text input tự do + nút Dịch & Phát | Must Have |
| FR-M5-04 | Auto-detect ngôn ngữ input | Must Have |
| FR-M5-05 | Lưu lịch sử 5 câu gần nhất trong session | Should Have |
| FR-M5-06 | Tùy chỉnh thêm câu cá nhân hóa (lưu local) | Could Have |

#### Module M6: Offline Mode

| ID | Requirement | Priority |
|---|---|---|
| FR-M6-01 | Service Worker cache app shell (Cache-First strategy) | Must Have |
| FR-M6-02 | IndexedDB lưu dữ liệu POI (tên, tọa độ, mô tả) | Must Have |
| FR-M6-03 | Cache map tiles khu vực Vĩnh Khánh | Must Have |
| FR-M6-04 | Background Sync API cập nhật khi có mạng trở lại | Should Have |
| FR-M6-05 | Banner thông báo trạng thái offline/online | Must Have |

---

### 4.2 Admin Dashboard — Chức năng chi tiết

#### Module A1: POI Management

| ID | Requirement | Priority |
|---|---|---|
| FR-A1-01 | CRUD đầy đủ cho POI (Create, Read, Update, Delete) | Must Have |
| FR-A1-02 | Map picker để chọn tọa độ trực tiếp | Must Have |
| FR-A1-03 | Toggle Hiển thị/Ẩn POI — cập nhật real-time (≤ 500ms) | Must Have |
| FR-A1-04 | Upload ảnh quán (max 5MB, JPEG/PNG/WebP) | Must Have |
| FR-A1-05 | Bulk actions: ẩn/xóa nhiều POI cùng lúc | Should Have |
| FR-A1-06 | Audit log: ghi lại mọi thao tác với timestamp và user | Must Have |

#### Module A2: QR Code Management

| ID | Requirement | Priority |
|---|---|---|
| FR-A2-01 | Generate QR code PNG cho từng POI | Must Have |
| FR-A2-02 | Export hàng loạt QR dạng ZIP | Should Have |
| FR-A2-03 | Preview QR trước khi tải xuống | Should Have |

#### Module A3: Analytics

| ID | Requirement | Priority |
|---|---|---|
| FR-A3-01 | Dashboard tổng quan: Lượt xem, Lượt quét QR, Thời gian nghe TB | Must Have |
| FR-A3-02 | Biểu đồ đường: xu hướng theo ngày/tuần/tháng | Must Have |
| FR-A3-03 | Bảng xếp hạng Top 10 POI nhiều lượt xem/quét nhất | Must Have |
| FR-A3-04 | Heatmap hành vi di chuyển du khách | Must Have |
| FR-A3-05 | Phân tích ngôn ngữ: % người dùng theo từng ngôn ngữ | Should Have |
| FR-A3-06 | Export dữ liệu analytics dạng CSV | Should Have |

---

## 5. Non-Functional Requirements

### 5.1 Performance

| Tiêu chí | Yêu cầu |
|---|---|
| First Contentful Paint (FCP) | ≤ 1.5 giây trên 4G |
| Time to Interactive (TTI) | ≤ 3 giây trên 4G |
| Lighthouse PWA Score | ≥ 90/100 |
| Leaflet.js render 100 markers | ≤ 2 giây |
| API response (GET /pois) | ≤ 300ms (p95) |
| Geofencing polling CPU overhead | ≤ 5% CPU trên mid-range device |

### 5.2 Availability & Reliability

| Tiêu chí | Yêu cầu |
|---|---|
| Uptime SLA | 99.5% (≈ 3.65 giờ downtime/tháng) |
| Offline availability | 100% core features hoạt động offline sau lần đầu load |
| Audio TTS fallback | < 2 giây để detect và switch sang Google TTS |
| QR scan accuracy | ≥ 98% trong điều kiện ánh sáng bình thường |

### 5.3 Security

| Tiêu chí | Yêu cầu |
|---|---|
| HTTPS | Bắt buộc 100% (điều kiện PWA) |
| Admin authentication | JWT Bearer Token, expiry 8 giờ |
| Admin authorization | Role-based: SuperAdmin / Operator |
| Input validation | Server-side validation cho mọi endpoint |
| Rate limiting | 100 requests/phút per IP cho public API |
| CORS | Whitelist domain cụ thể, không dùng `*` |

### 5.4 Accessibility (A11y)

| Tiêu chí | Yêu cầu |
|---|---|
| WCAG Standard | Tuân thủ WCAG 2.1 mức AA |
| Font size tối thiểu | 16px body text |
| Color contrast ratio | ≥ 4.5:1 (text trên nền) |
| Touch target size | Tối thiểu 44×44px |
| Screen reader | Semantic HTML + ARIA labels đầy đủ |
| Keyboard navigation | Toàn bộ chức năng có thể thao tác bằng bàn phím |

### 5.5 Compatibility

| Tiêu chí | Yêu cầu |
|---|---|
| Mobile browsers | Chrome 90+, Safari 14+, Samsung Internet 14+ |
| Desktop browsers | Chrome 90+, Firefox 88+, Edge 90+ |
| Screen sizes | 320px – 1440px width (responsive) |
| PWA installability | Đáp ứng đủ tiêu chí Add to Home Screen |
| Camera API | Hỗ trợ cả iOS và Android |

### 5.6 Localization & Internationalization

- Ngôn ngữ giao diện app: Tiếng Việt (default), Tiếng Anh.
- Nội dung thuyết minh: 4 ngôn ngữ (vi, en, ja, zh).
- Format ngày/giờ theo locale của người dùng.
- RTL layout không cần hỗ trợ trong v1.0.

---

## 6. System Architecture & Flow

### 6.1 Kiến trúc tổng thể

```
┌──────────────────────────────────────────────────────────────────────┐
│                         CLIENT TIER                                  │
│                                                                      │
│  ┌─────────────────────┐          ┌──────────────────────────────┐  │
│  │   PWA User App      │          │   Admin Web Dashboard        │  │
│  │  (Vanilla JS/HTML5) │          │   (Vanilla JS/HTML5)         │  │
│  │                     │          │                              │  │
│  │  • Leaflet.js Map   │          │  • POI Management CRUD       │  │
│  │  • Geofencing Logic │          │  • Analytics Charts          │  │
│  │  • QR Scanner       │          │  • QR Export                 │  │
│  │  • AAC Module       │          │  • Heatmap Viewer            │  │
│  │  • Service Worker   │          │                              │  │
│  │  • IndexedDB Cache  │          │                              │  │
│  └──────────┬──────────┘          └──────────────┬───────────────┘  │
└─────────────┼───────────────────────────────────┼──────────────────┘
              │ HTTPS / REST API                  │ HTTPS / REST API
              │ (JWT Bearer)                      │ (JWT Bearer)
┌─────────────┼───────────────────────────────────┼──────────────────┐
│                         API TIER                                     │
│                                                                      │
│         ┌───┴─────────────────────────────────┴────┐                │
│         │         ASP.NET Core 10 Web API           │                │
│         │                                           │                │
│         │  ┌─────────────┐   ┌─────────────────┐   │                │
│         │  │ POI Endpoint│   │Analytics Endpoint│   │                │
│         │  ├─────────────┤   ├─────────────────┤   │                │
│         │  │ Auth Endpoint│  │ QR Gen Endpoint │   │                │
│         │  └─────────────┘   └─────────────────┘   │                │
│         │                                           │                │
│         │  ┌──────────────────────────────────────┐│                │
│         │  │         Business Logic Layer          ││                │
│         │  │  Geofencing Validator · TTS Proxy     ││                │
│         │  │  Analytics Aggregator · QR Generator  ││                │
│         │  └──────────────────────────────────────┘│                │
│         └───────────────────┬──────────────────────┘                │
└─────────────────────────────┼────────────────────────────────────── ┘
                              │ MongoDB Driver
┌─────────────────────────────┼──────────────────────────────────────┐
│                         DATA TIER                                    │
│                                                                      │
│         ┌───────────────────┴──────────────────────┐                │
│         │              MongoDB Atlas                │                │
│         │                                           │                │
│         │  Collections:                             │                │
│         │  • pois          • analytics_events       │                │
│         │  • users         • audit_logs             │                │
│         └───────────────────────────────────────────┘               │
│                                                                      │
│   External Services: Google Translate TTS · OpenStreetMap Tiles     │
└──────────────────────────────────────────────────────────────────────┘
```

---

### 6.2 MongoDB Schema Design

#### Collection: `pois`

```json
{
  "_id": "ObjectId",
  "slug": "quan-hai-san-ba-khue",
  "name": {
    "vi": "Quán Hải Sản Bà Khuê",
    "en": "Ba Khue Seafood Restaurant",
    "ja": "バ・クエ・シーフード",
    "zh": "坝葵海鲜餐厅"
  },
  "description": {
    "vi": "...",
    "en": "...",
    "ja": "...",
    "zh": "..."
  },
  "location": {
    "type": "Point",
    "coordinates": [106.6947, 10.7593]
  },
  "category": "seafood",
  "imageUrl": "https://cdn.../img.jpg",
  "openHours": "16:00-02:00",
  "isActive": true,
  "createdAt": "ISODate",
  "updatedAt": "ISODate"
}
```

#### Collection: `analytics_events`

```json
{
  "_id": "ObjectId",
  "eventType": "poi_view | qr_scan | audio_play | audio_complete",
  "poiId": "ObjectId",
  "sessionId": "string",
  "language": "vi | en | ja | zh",
  "duration": 45,
  "userLocation": { "lat": 10.759, "lng": 106.694 },
  "timestamp": "ISODate"
}
```

---

### 6.3 Flowchart 1: Luồng Geofencing Detection

> **Ghi chú tư vấn cho dev:** Sơ đồ dưới đây có thể render bằng Mermaid.js (tích hợp vào README hoặc Notion). Paste code block vào `https://mermaid.live` để preview.

```
┌──────────────────────────────────────────────────────────────────┐
│                  GEOFENCING FLOW DIAGRAM                         │
└──────────────────────────────────────────────────────────────────┘

         ┌─────────────────┐
         │  App khởi động  │
         │  (foreground)   │
         └────────┬────────┘
                  │
                  ▼
         ┌────────────────────────────────────┐
         │  Kiểm tra quyền Geolocation API    │
         └────────┬────────────────┬──────────┘
                  │ Granted        │ Denied / Not Supported
                  ▼                ▼
    ┌─────────────────┐   ┌────────────────────────────┐
    │  Start polling  │   │  Hiển thị thông báo:       │
    │  GPS mỗi 5 giây │   │  "Bật GPS để dùng tính     │
    └────────┬────────┘   │  năng Geofencing"           │
             │            └────────────────────────────┘
             ▼
    ┌────────────────────────┐
    │  Lấy vị trí hiện tại   │
    │  getCurrentPosition()  │
    └──────────┬─────────────┘
               │
               ▼
    ┌──────────────────────────────────────────┐
    │  Tính khoảng cách Haversine              │
    │  đến TẤT CẢ POI đang active              │
    │  distance = haversine(userLat, userLng,  │
    │                       poi.lat, poi.lng)  │
    └──────────────┬───────────────────────────┘
                   │
                   ▼
    ┌──────────────────────────────────────────┐
    │  Có POI nào có distance ≤ 50m?           │
    └──────────┬────────────────┬──────────────┘
               │ KHÔNG          │ CÓ
               ▼                ▼
    ┌─────────────────┐  ┌──────────────────────────────────┐
    │  Chờ 5 giây     │  │  Kiểm tra Cooldown Cache         │
    │  → Poll lại     │  │  (sessionStorage per poiId)      │
    └─────────────────┘  └──────────────┬─────────────┬─────┘
                                        │ Đã trigger  │ Chưa trigger
                                        │ trong 5p    │ hoặc hết cooldown
                                        ▼             ▼
                             ┌──────────────┐  ┌───────────────────────────┐
                             │  Skip, chờ  │  │  Trigger In-App Banner:   │
                             │  poll tiếp  │  │  "📍 [Tên quán] ở gần đây!│
                             └─────────────┘  │   Nghe thuyết minh ngay?" │
                                              └──────────────┬────────────┘
                                                             │
                                              ┌──────────────┴────────────┐
                                              │  Ghi Cooldown timestamp   │
                                              │  vào sessionStorage       │
                                              │  key: `cooldown_{poiId}`  │
                                              └──────────────┬────────────┘
                                                             │
                                              ┌──────────────┴────────────┐
                                              │  User tap banner?         │
                                              └───────────┬───────────────┘
                                             Có ▼         │ Không / Dismiss
                                 ┌────────────────────┐   │
                                 │  Mở POI Detail     │   ▼
                                 │  → Auto play audio │  (Banner tự đóng
                                 └────────────────────┘   sau 8 giây)
```

---

### 6.4 Flowchart 2: Luồng Audio TTS với Fallback

> **Ghi chú tư vấn:** Flowchart này mô tả logic fallback quan trọng nhất của hệ thống audio. Nên implement dưới dạng một `AudioService` module độc lập với interface `play(text, lang)` để dễ test và thay thế engine.

```
┌──────────────────────────────────────────────────────────────────┐
│                  AUDIO TTS FALLBACK FLOW                         │
└──────────────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────┐
    │  Trigger phát audio:                            │
    │  - Geofencing banner tap                        │
    │  - QR scan thành công                           │
    │  - User nhấn nút Play                           │
    │  - User nhấn nút Phát trong AAC                 │
    └─────────────────────┬───────────────────────────┘
                          │
                          ▼
    ┌─────────────────────────────────────────────────┐
    │  Xác định: text content + target language       │
    │  (từ user preference setting)                   │
    └─────────────────────┬───────────────────────────┘
                          │
                          ▼
    ┌─────────────────────────────────────────────────┐
    │  STRATEGY 1: Web Speech API                     │
    │  Kiểm tra: 'speechSynthesis' in window?         │
    └────────┬────────────────────────────┬───────────┘
             │ CÓ                         │ KHÔNG
             ▼                            ▼
    ┌──────────────────────────┐  ┌──────────────────────────────┐
    │  Lấy danh sách voice     │  │  NHẢY THẲNG → Strategy 2    │
    │  speechSynthesis         │  └──────────────────────────────┘
    │  .getVoices()            │
    └──────────┬───────────────┘
               │
               ▼
    ┌──────────────────────────────────────────────────┐
    │  Có voice phù hợp với lang (vi/en/ja/zh)?        │
    └──────────┬────────────────────────┬──────────────┘
               │ CÓ                     │ KHÔNG
               ▼                        ▼
    ┌────────────────────────┐  ┌────────────────────────────────┐
    │  Tạo                   │  │  NHẢY → Strategy 2             │
    │  SpeechSynthesisUtterd.│  └────────────────────────────────┘
    │  utterance.text = text │
    │  utterance.voice = v   │
    │  utterance.lang = lang │
    │  utterance.rate = rate │
    └──────────┬─────────────┘
               │
               ▼
    ┌────────────────────────────────────────────────┐
    │  speechSynthesis.speak(utterance)              │
    │                                                │
    │  → onstart: Cập nhật UI state = "playing"     │
    │  → onend:   Cập nhật UI state = "idle"        │
    │  → onerror: Log error → Fallback Strategy 2   │
    └────────────────────────────────────────────────┘


                    ─── STRATEGY 2: Google TTS ───

    ┌────────────────────────────────────────────────────────────┐
    │  Gọi Google Translate TTS Endpoint:                        │
    │  GET https://translate.google.com/translate_tts            │
    │      ?ie=UTF-8&q={encodeURIComponent(text)}                │
    │      &tl={lang}&client=tw-ob&ttsspeed=1                    │
    │  (Proxy qua BE để tránh CORS & giấu Referrer)              │
    └────────────────────┬──────────────────────────────────────┘
                         │
                         ▼
    ┌────────────────────────────────────────────────────────────┐
    │  Nhận response:                                            │
    │  → Status 200: Blob MP3 audio                             │
    │  → Status khác / Network Error: →  Strategy 3             │
    └────────────────────┬──────────────────────────────────────┘
                         │ Success
                         ▼
    ┌────────────────────────────────────────────────────────────┐
    │  objectURL = URL.createObjectURL(blob)                     │
    │  const audio = new Audio(objectURL)                        │
    │  audio.play()                                              │
    │  → onended: URL.revokeObjectURL(objectURL)                 │
    └────────────────────────────────────────────────────────────┘


                     ─── STRATEGY 3: Fallback cuối ───

    ┌────────────────────────────────────────────────────────────┐
    │  Cả 2 strategy đều thất bại:                               │
    │  → Hiển thị toast: "Không thể phát audio.                 │
    │    Vui lòng đọc nội dung bên dưới."                        │
    │  → Tự động scroll đến phần text transcript                 │
    │  → Highlight text content để dễ đọc                       │
    └────────────────────────────────────────────────────────────┘
```

---

### 6.5 API Endpoint Reference

| Method | Endpoint | Auth | Mô tả |
|---|---|---|---|
| GET | `/api/v1/pois` | Public | Lấy danh sách tất cả POI đang active |
| GET | `/api/v1/pois/{id}` | Public | Lấy chi tiết 1 POI |
| POST | `/api/v1/pois` | Admin | Tạo POI mới |
| PUT | `/api/v1/pois/{id}` | Admin | Cập nhật POI |
| DELETE | `/api/v1/pois/{id}` | Admin | Xóa POI |
| PATCH | `/api/v1/pois/{id}/toggle` | Admin | Bật/tắt hiển thị POI |
| GET | `/api/v1/pois/{id}/qrcode` | Admin | Tải QR code PNG |
| POST | `/api/v1/analytics/event` | Public | Ghi nhận sự kiện analytics |
| GET | `/api/v1/analytics/summary` | Admin | Dashboard tổng quan |
| GET | `/api/v1/analytics/heatmap` | Admin | Dữ liệu heatmap |
| POST | `/api/v1/auth/login` | Public | Admin login → trả JWT |
| POST | `/api/v1/tts/proxy` | Public | Proxy Google TTS (rate-limited) |

---

## 7. Metrics & KPIs

### 7.1 KPIs Kinh doanh (Business KPIs)

| KPI | Định nghĩa | Target (6 tháng đầu) | Nguồn dữ liệu |
|---|---|---|---|
| **MAU (Monthly Active Users)** | Số session unique trong 30 ngày | ≥ 1,000 MAU | Analytics events |
| **% Du khách Quốc tế** | % session dùng ngôn ngữ không phải vi-VN | ≥ 40% | Language preference log |
| **QR Scan Rate** | Số QR scans / tổng lượt xem POI | ≥ 25% | analytics_events |
| **AAC Usage Rate** | % session có dùng tính năng AAC | ≥ 10% | analytics_events |
| **POI Coverage** | % quán trên phố đã có QR được gắn | ≥ 80% | Admin CMS |

### 7.2 KPIs Sản phẩm (Product KPIs)

| KPI | Định nghĩa | Target | Nguồn dữ liệu |
|---|---|---|---|
| **Audio Completion Rate** | % lượt phát audio nghe đến cuối (>80% duration) | ≥ 60% | analytics_events.duration |
| **Geofencing Trigger Rate** | Số trigger / số session có GPS bật | ≥ 30% | analytics_events |
| **Offline Fallback Rate** | % request được serve từ cache offline | Tracked (no target) | Service Worker log |
| **TTS Fallback Rate** | % lượt phát audio phải dùng Google TTS thay Web Speech | ≤ 30% | Client log |
| **Avg. Session Duration** | Thời gian trung bình 1 session | ≥ 8 phút | analytics_events |

### 7.3 KPIs Kỹ thuật (Technical KPIs)

| KPI | Định nghĩa | Target | Công cụ đo |
|---|---|---|---|
| **API P95 Latency** | 95th percentile response time của BE API | ≤ 300ms | Application monitoring |
| **PWA Lighthouse Score** | Lighthouse audit overall PWA score | ≥ 90/100 | Lighthouse CI |
| **Uptime** | % thời gian hệ thống hoạt động bình thường | ≥ 99.5% | Uptime monitor |
| **Error Rate** | % request trả về status 5xx | ≤ 0.5% | Server logs |
| **Crash-Free Sessions** | % session không gặp lỗi JS unhandled | ≥ 98% | Error tracking |

### 7.4 Heatmap Analytics — Định nghĩa dữ liệu

Dữ liệu cho heatmap được thu thập từ `analytics_events` với `eventType = "user_location"`, ghi nhận tọa độ người dùng mỗi 30 giây trong suốt session. Điều kiện:

- Chỉ thu thập khi người dùng đã cấp quyền GPS.
- Dữ liệu được **anonymize** — không lưu session ID hay bất kỳ PII nào cùng với tọa độ.
- Render heatmap phía Admin bằng thư viện Leaflet.heat.

### 7.5 Review Cadence (Chu kỳ đánh giá)

| Tần suất | Nội dung review |
|---|---|
| Hàng tuần | Số liệu MAU, QR Scan, Error Rate — báo cáo nhanh 15 phút |
| Hàng tháng | Full KPI dashboard, so sánh với target, phân tích heatmap |
| Hàng quý | Review chiến lược, đánh giá roadmap v2.0, phỏng vấn user |

---

## Phụ lục

### A. Tech Stack Summary

| Layer | Technology | Lý do chọn |
|---|---|---|
| **Frontend** | Vanilla JS (ES6), HTML5, CSS3 | Không có framework overhead, bundle size nhỏ, phù hợp PWA |
| **Backend** | ASP.NET Core 10 Web API | Performance cao, .NET 10 AOT compilation, cross-platform |
| **Database** | MongoDB Atlas | Flexible schema cho POI data đa ngôn ngữ, GeoJSON native support |
| **Bản đồ** | Leaflet.js | Open source, lightweight (42KB), tốt trên mobile |
| **TTS Primary** | Web Speech API | Native, không tốn bandwidth |
| **TTS Fallback** | Google Translate TTS | Proxy qua BE, hỗ trợ đủ 4 ngôn ngữ |
| **QR Decode** | BarcodeDetector API + jsQR | Native API với thư viện fallback cho iOS |
| **Offline** | Service Worker + IndexedDB | PWA standard, không cần thư viện thêm |
| **Heatmap** | Leaflet.heat | Plugin nhẹ, tích hợp với Leaflet map đã có |

### B. Rủi ro & Giảm thiểu

| Rủi ro | Mức độ | Kế hoạch giảm thiểu |
|---|---|---|
| Google Translate TTS thay đổi endpoint (unofficial API) | Cao | Theo dõi API changes; chuẩn bị sẵn Google Cloud TTS có trả phí như backup |
| GPS accuracy thấp trong hẻm nhỏ/nhà hàng kín | Trung bình | Tăng radius Geofencing lên 75m trong khu vực dense; cho phép manual trigger |
| IndexedDB bị clear bởi browser (Low Storage mode) | Thấp | Hiển thị cảnh báo; re-download data khi mở app |
| Quyền camera bị từ chối trên iOS Safari | Trung bình | Hướng dẫn user bật trong Settings; fallback nhập URL thủ công |
| Performance kém trên thiết bị Android giá rẻ | Trung bình | Lazy-load markers; giới hạn polling frequency trên battery saver mode |

---
