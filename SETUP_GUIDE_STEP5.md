# 🎧 Audio Guide System - BƯỚC 5 - MAUI ViewModels

## ✅ Hoàn thành BƯỚC 5

Tôi đã tạo hoàn chỉnh **5 MVVM ViewModels** sử dụng `CommunityToolkit.Mvvm` với tất cả business logic UI.

---

## 📁 Cấu Trúc File Tạo Ra

```
AudioGuide.App/
└── ViewModels/
    ├── MapViewModel.cs              ✅ (Bản đồ + danh sách POI)
    ├── PoiDetailViewModel.cs        ✅ (Chi tiết POI + thuyết minh)
    ├── QrScannerViewModel.cs        ✅ (Quét QR Code)
    ├── AudioPlayerViewModel.cs      ✅ (Trình phát audio + hàng đợi)
    └── SettingsViewModel.cs         ✅ (Cài đặt ứng dụng)
```

---

## 🎯 Chi Tiết 5 ViewModels

### 1️⃣ **MapViewModel** - Bản Đồ & Danh Sách POI

**Chức năng:**
- Hiển thị bản đồ với POI gần vị trị hiện tại
- Tìm kiếm POI với bán kính tuỳ chỉnh
- Quản lý geofencing

**Observable Properties:**
```csharp
ObservableCollection<PoiMapDto> NearbyPois    // Danh sách POI
bool IsLoading, HasError
string LoadingMessage, ErrorMessage
decimal UserLatitude, UserLongitude
int SearchRadius (100m - 50km)
bool IsGeofencingActive
int PoiCount
```

**Commands:**
```csharp
SearchNearbyPoisAsync()           // Tìm POI gần vị trí
StartGeofencingAsync()            // Bắt đầu geofencing
StopGeofencingAsync()             // Dừng geofencing
UpdateSearchRadiusAsync(radius)   // Thay đổi bán kính
RefreshAsync()                    // Refresh danh sách
```

**Events Lắng Nghe:**
- `ILanguageService.OnLanguageChanged` → Reload POI với ngôn ngữ mới
- `IGeofenceService.OnGeofenceEntered` → Tự động thêm audio vào hàng đợi
- `IGeofenceService.OnGeofenceExited` → Hiển thị thông báo

**Flow Chính:**
```
Người dùng mở Maps
↓
MapViewModel.SearchNearbyPoisAsync()
↓
APIService → Backend API
↓
Getنearby POIs (5km mặc định)
↓
Populate NearbyPois ObservableCollection
↓
Bind to XAML Map View
↓
StartGeofencing() tự động
↓
Lắng nghe OnGeofenceEntered events
↓
Khi vào POI: Load detail & thêm audio
```

---

### 2️⃣ **PoiDetailViewModel** - Chi Tiết POI

**Chức năng:**
- Hiển thị chi tiết một POI
- Xử lý fallback ngôn ngữ
- Quản lý thuyết minh audio và cooldown

**Observable Properties:**
```csharp
PoiDetailDto? PoiDetail           // Chi tiết POI
bool IsLoading, HasError
bool HasLanguageFallback
string LanguageFallbackNote       // "Tiếng Anh không có, dùng English"
bool CanPlayAudio                 // Có file audio?
bool IsInCooldown                 // Đang trong cooldown 5 phút?
string CooldownMessage            // "Chờ 120s nữa"
```

**Commands:**
```csharp
LoadPoiDetailAsync(Guid poiId)    // Tải chi tiết POI
PlayAudio()                       // Phát thuyết minh
SharePoiAsync()                   // Chia sẻ POI
```

**Events Lắng Nghe:**
- `ILanguageService.OnLanguageChanged` → Reload POI với ngôn ngữ mới

**Flow Chính:**
```
Người dùng chọn POI từ bản đồ
↓
MapViewModel pass Guid poiId → PoiDetailViewModel
↓
LoadPoiDetailAsync(poiId)
↓
APIService.GetPoiDetailAsync(poiId, lang)
↓
Backend xử lý Fallback:
  - Nếu có ngôn ngữ user: dùng
  - Nếu không: fallback → English
  - Nếu không có English: dùng ngôn ngữ đầu tiên
↓
Hiển thị PóiDetailDto
↓
Nếu có LanguageFallbackNote: hiển thị ⚠️
↓
Kiểm tra CanPlayAudio
↓
CheckCooldownStatus()
↓
Người dùng nhấn "Phát"
↓
TryEnqueueAudio(audioContent)
```

---

### 3️⃣ **QrScannerViewModel** - Quét QR Code

**Chức năng:**
- Mở camera để quét QR Code
- Xử lý kết quả quét
- Tự động thêm audio vào hàng đợi

**Observable Properties:**
```csharp
bool IsScanning
string ScanningMessage            // "Để camera vào QR..."
bool HasScanResult
string ScanResultMessage
string ScannedQrData
```

**Commands:**
```csharp
ScanQrCodeAsync()                 // Quét QR (camera)
ScanQrFromImageAsync(imagePath)   // Quét từ ảnh (testing)
PlayQrPoiAudio()                  // Phát audio QR POI
```

**Flow Chính:**
```
Người dùng nhấn "Quét QR" tab
↓
QrScannerViewModel.ScanQrCodeAsync()
↓
IQrScannerService.OpenQrScannerAsync()
↓
Camera mở → User quét QR
↓
QrScanResult.RawData = "abc123..." (QR hash)
↓
FetchPoiFromQrAsync(qrHash)
↓
APIService.GetPoiByQrCodeAsync(qrHash, lang)
↓
Hiển thị POI detail từ QR
↓
Tự động TryEnqueueAudio()
↓
Nếu cooldown: hiển thị "Chờ X giây"
```

---

### 4️⃣ **AudioPlayerViewModel** - Trình Phát Audio ⭐

**Chức năng:**
- Quản lý hàng đợi audio
- Play/Pause/Skip controls
- Hiển thị progress, duration
- Tự động phát audio tiếp theo

**Observable Properties:**
```csharp
AudioContent? CurrentAudio        // Audio đang phát
ObservableCollection<AudioContent> AudioQueue
bool IsPlaying
int PlaybackSeconds, TotalSeconds
double PlaybackProgress (0.0 - 1.0)
string PlaybackTimeDisplay        // "1:23 / 3:45"
string CurrentPoiName
int QueueCount
```

**Commands:**
```csharp
PlayPauseAsync()                  // Phát/Tạm dừng
SkipToNext()                      // Chuyển audio tiếp theo
RemoveCurrentAudio()              // Xóa audio hiện tại
ClearQueue()                      // Xóa tất cả
UpdatePlaybackProgress(double)    // Update thanh tiến độ
```

**Events Lắng Nghe:**
- `IAudioQueueService.OnQueueChanged` → Refresh UI hàng đợi

**Flow Chính:**
```
Audio được thêm vào hàng đợi từ:
  1. Geofence Enter (MapViewModel)
  2. POI Detail (PoiDetailViewModel)
  3. QR Scan (QrScannerViewModel)
↓
OnQueueChanged event bắn
↓
RefreshQueueDisplay()
↓
AudioQueue ObservableBinding update
↓
Người dùng nhấn "Play"
↓
PlayPauseAsync()
↓
IsPlaying = true
↓
SimulateAudioPlaybackAsync()
↓
Timer loop: 1s/lần Update PlaybackSeconds
↓
PlaybackProgress = PlaybackSeconds / TotalSeconds
↓
Khi audio hết (PlaybackSeconds >= TotalSeconds)
↓
SkipToNext() (Dequeue)
↓
Tự động phát audio tiếp theo
↓
Nếu hàng đợi trống: Stop
```

---

### 5️⃣ **SettingsViewModel** - Cài Đặt Ứng Dụng

**Chức năng:**
- Chọn ngôn ngữ (Vi, En, Jp)
- Kiểm tra kết nối API
- Xem thông tin ứng dụng
- Xóa cache

**Observable Properties:**
```csharp
ObservableCollection<LanguageOption> AvailableLanguages
LanguageOption SelectedLanguage
string AppVersion
bool IsDebugMode
string DebugInfo
string ApiConnectionStatus       // "🟢" / "🔴"
```

**Commands:**
```csharp
ChangeLanguage(LanguageOption)   // Đổi ngôn ngữ
CheckApiConnectionAsync()        // Test API health check
ShowAbout()                      // Thông tin ứng dụng
ClearCacheAsync()                // Xóa cache
OpenSystemSettingsAsync()        // Mở Settings hệ thống
```

**Flow Chính:**
```
Người dùng vào Settings tab
↓
SettingsViewModel.InitializeLanguages()
↓
Populate AvailableLanguages từ Constants
↓
Đặt SelectedLanguage = GetCurrentLanguage()
↓
Bind LanguageOptions to XAML Picker
↓
Người dùng chọn ngôn ngữ
↓
ChangeLanguage(language)
↓
IAppLanguageService.SetLanguage()
↓
OnLanguageChanged event bắn
↓
Tất cả ViewModels nhận sự kiện
↓
Reload dữ liệu với ngôn ngữ mới
```

---

## 🏗️ MVVM Architecture Pattern

### Base Class: `ObservableObject`
```csharp
public partial class MapViewModel : ObservableObject
{
    // Tất cả ViewModels kế thừa từ ObservableObject
    // Cung cấp INotifyPropertyChanged implementation
}
```

### Observable Properties: `[ObservableProperty]`
```csharp
[ObservableProperty]
private string loadingMessage = "Đang tải...";

// Tự động tạo property: LoadingMessage (PascalCase)
// Automation:
// - Setter với PropertyChanged notification
// - Backing field (_loadingMessage)
```

### Commands: `[RelayCommand]`
```csharp
[RelayCommand]
public async Task SearchNearbyPoisAsync()
{
    // Tự động tạo command: SearchNearbyPoisCommand (ICommand)
    // Có thể bind vào Button.Command trong XAML
}

// XAML:
// <Button Command="{Binding SearchNearbyPoisCommand}" />
```

---

## 🔌 Dependency Injection Integration

Tất cả ViewModels đã được đăng ký trong **MauiProgram.cs**:

```csharp
builder.Services.AddSingleton<MapViewModel>();
builder.Services.AddSingleton<PoiDetailViewModel>();
builder.Services.AddSingleton<QrScannerViewModel>();
builder.Services.AddSingleton<AudioPlayerViewModel>();
builder.Services.AddSingleton<SettingsViewModel>();
```

---

## 📊 MVVM Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      XAML View Layer                         │
│  (MapPage, PoiDetailPage, QrScannerPage, ...)                │
│                                                               │
│  • Binding to ViewModel properties                            │
│  • Binding to Commands                                        │
│  • Triggers user interactions → Commands                      │
└────────────────┬────────────────────────────────────────────┘
                 │ {Binding}
                 ↓
┌─────────────────────────────────────────────────────────────┐
│                   MVVM ViewModel Layer                        │
│  (MapViewModel, PoiDetailViewModel, ...)                      │
│                                                               │
│  • ObservableProperty: notify UI of data changes              │
│  • RelayCommand: handle user actions                          │
│  • Event handlers: respond to service events                  │
│  • Business logic: orchestrate services                       │
└────────────────┬────────────────────────────────────────────┘
                 │ Calls
                 ↓
┌─────────────────────────────────────────────────────────────┐
│                    Services Layer                             │
│  (IApiService, IAudioQueueService, IGeofenceService, ...)     │
│                                                               │
│  • HTTP calls to Backend API                                  │
│  • Business logic: cooldown, fallback, validation             │
│  • Event publishing: geofence, language change                │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────────┐
│              External Systems / Backend                       │
│  • Backend API (ASP.NET Core)                                 │
│  • Device Hardware (GPS, Camera, Audio)                       │
│  • Persistent Storage (Preferences)                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎛️ Property Binding Examples

### MapPage.xaml
```xaml
<CollectionView ItemsSource="{Binding NearbyPois}">
    <CollectionView.ItemTemplate>
        <DataTemplate>
            <StackLayout Padding="10">
                <Label Text="{Binding Name}" FontSize="18" />
                <Label Text="{Binding DistanceInMeters, StringFormat='{0:F0}m'}" />
            </StackLayout>
        </DataTemplate>
    </CollectionView.ItemTemplate>
</CollectionView>

<Button Text="Tìm kiếm"
        Command="{Binding SearchNearbyPoisCommand}" />

<ActivityIndicator IsRunning="{Binding IsLoading}" />
```

### AudioPlayerPage.xaml
```xaml
<Label Text="{Binding CurrentPoiName}" FontSize="20" FontAttributes="Bold" />
<Label Text="{Binding PlaybackTimeDisplay}" />
<Slider Value="{Binding PlaybackProgress}" />

<Button Text="▶" Command="{Binding PlayPauseCommand}" />
<Button Text="⏭" Command="{Binding SkipToNextCommand}" />
```

---

## 🛠️ Utilities dalam ViewModels

### MainThread.BeginInvokeOnMainThread()
```csharp
// Update UI từ background thread
MainThread.BeginInvokeOnMainThread(() =>
{
    // XAML binding chỉ hoạt động trên main thread
    NearbyPois.Clear();
    foreach (var poi in data)
    {
        NearbyPois.Add(poi);
    }
});
```

### FireAndForget() Pattern
```csharp
// Gọi async method mà không await
SkipToNext();
if (CurrentAudio != null)
{
    PlayPauseAsync().FireAndForget();
}
```

---

## ✅ BƯỚC 5 Hoàn Thành!

Tất cả ViewModels:
- ✅ Sử dụng CommunityToolkit.Mvvm
- ✅ ObservableProperty binding (auto INotifyPropertyChanged)
- ✅ RelayCommand cho interactions
- ✅ Event-driven architecture
- ✅ Comprehensive error handling
- ✅ Tiếng Việt UI messages
- ✅ Async/await patterns
- ✅ Persistent storage (Preferences)

---

## 📚 Tài Liệu Tham Khảo

- [CommunityToolkit.Mvvm](https://github.com/CommunityToolkit/dotnet)
- [MAUI Binding](https://learn.microsoft.com/en-us/dotnet/maui/fundamentals/data-binding)
- [MVVM Pattern](https://learn.microsoft.com/en-us/dotnet/maui/architecture/mvvm)
- [ObservableCollection](https://learn.microsoft.com/en-us/dotnet/api/system.collections.objectmodel.observablecollection-1)

---

## 🎯 Bước Tiếp Theo

### **BƯỚC 6 - MAUI Views (XAML UI)**
Tôi sẽ tạo 5 XAML Pages tương ứng với 5 ViewModels:
1. **MapPage.xaml** - Bản đồ + POI list
2. **PoiDetailPage.xaml** - Chi tiết POI + audio info
3. **QrScannerPage.xaml** - Camera + QR result
4. **AudioPlayerPage.xaml** - Trình phát + hàng đợi
5. **SettingsPage.xaml** - Cài đặt ngôn ngữ + info

**Bạn sẵn sàng bắt đầu BƯỚC 6 chứ?** (Vâng/Không)
