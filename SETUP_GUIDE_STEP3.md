# 🎧 Audio Guide System - Setup Guide (BƯỚC 3)

## 📋 Mục lục
1. [Cấu hình MAUI Constants](#cấu-hình-maui-constants)
2. [Cấu hình Android for Cleartext Traffic](#cấu-hình-android-for-cleartext-traffic)
3. [Cấu hình iOS](#cấu-hình-ios)
4. [Chạy trên Emulator](#chạy-trên-emulator)
5. [Troubleshooting](#troubleshooting)

---

## 🔧 Cấu hình MAUI Constants

### File: `AudioGuide.App/Helpers/Constants.cs`

Constants.cs chứa tất cả cấu hình chính cho mobile app:

```csharp
// API Base URL - TỰ ĐỘNG PHÁT HIỆN PLATFORM
public static string ApiBaseUrl
{
    get
    {
        return DeviceInfo.Platform == DevicePlatform.Android
            ? "http://10.0.2.2:5000"  // Android Emulator
            : "http://localhost:5000"; // iOS Simulator, Windows, Physical Device
    }
}
```

### Các cấu hình quan trọng:

| Cấu hình | Giá trị | Ghi chú |
|---------|--------|--------|
| `HttpRequestTimeoutMs` | 30000ms | Timeout cho HTTP requests |
| `GpsAccuracyThresholdMeters` | 50m | Độ chính xác GPS tối thiểu |
| `DefaultSearchRadiusMeters` | 5000m | Bán kính tìm kiếm POI (5km) |
| `AudioQueueCooldownMinutes` | 5 phút | Chống spam phát audio |
| `DefaultLanguage` | "vi" | Tiếng Việt mặc định |

---

## 🤖 Cấu hình Android for Cleartext Traffic

### QUAN TRỌNG: Android 8.0+ không cho phép HTTP mặc định

#### Cách 1: AndroidManifest.xml

**File: `AudioGuide.App/Platforms/Android/AndroidManifest.xml`**

```xml
<application
    android:usesCleartextTraffic="true"
    ...>
</application>
```

**Quyền cần thiết:**
```xml
<!-- GPS Location -->
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />

<!-- Network -->
<uses-permission android:name="android.permission.INTERNET" />

<!-- Camera (QR Scanner) -->
<uses-permission android:name="android.permission.CAMERA" />

<!-- Background Location (Android 8.0+) -->
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
```

#### Cách 2: Network Security Config (Chi tiết hơn) - **KHUYẾN NGHỊ**

**File: `AudioGuide.App/Platforms/Android/Resources/xml/network_security_config.xml`**

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <!-- Cho phép HTTP cho emulator & localhost -->
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="true">10.0.2.2</domain>
        <domain includeSubdomains="true">localhost</domain>
        <domain includeSubdomains="true">127.0.0.1</domain>
    </domain-config>

    <!-- Production: Yêu cầu HTTPS -->
    <domain-config cleartextTrafficPermitted="false">
        <domain includeSubdomains="true">api.audioguidesystem.com</domain>
    </domain-config>
</network-security-config>
```

Sau đó cập nhật AndroidManifest.xml:
```xml
<application
    android:networkSecurityConfig="@xml/network_security_config"
    ...>
</application>
```

### ⚠️ IP Address Emulator - QUAN TRỌNG

| Platform | Base URL | Ghi chú |
|----------|----------|--------|
| **Android Emulator** | `http://10.0.2.2:5000` | IP ảo để trỏ tới localhost của máy chủ |
| **iOS Simulator** | `http://localhost:5000` | Kết nối trực tiếp |
| **Physical Android Device** | `http://192.168.x.x:5000` | Sử dụng IP máy chủ thực trên mạng LAN |

---

## 🍎 Cấu hình iOS

### Cho phép HTTP (Chỉ Development)

**File: `AudioGuide.App/Platforms/iOS/Info.plist`**

```xml
<key>NSAppTransportSecurity</key>
<dict>
    <key>NSAllowsArbitraryLoads</key>
    <true/>
    <key>NSExceptionDomains</key>
    <dict>
        <key>localhost</key>
        <dict>
            <key>NSIncludesSubdomains</key>
            <true/>
            <key>NSExceptionAllowsInsecureHTTPLoads</key>
            <true/>
        </dict>
        <key>127.0.0.1</key>
        <dict>
            <key>NSIncludesSubdomains</key>
            <true/>
            <key>NSExceptionAllowsInsecureHTTPLoads</key>
            <true/>
        </dict>
    </dict>
</dict>
```

### Quyền truy cập GPS

**File: `AudioGuide.App/Platforms/iOS/Info.plist`**

```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>Ứng dụng cần truy cập vị trí để hiển thị các địa điểm du lịch gần bạn</string>

<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>Ứng dụng cần truy cập vị trí luôn để thông báo khi bạn ghé thăm một địa điểm du lịch</string>

<key>NSCameraUsageDescription</key>
<string>Ứng dụng cần truy cập camera để quét mã QR</string>
```

---

## 🚀 Chạy trên Emulator

### Android Emulator

1. **Mở Android Studio**
   ```bash
   android studio
   ```

2. **Khởi động emulator (nếu chưa chạy)**
   ```bash
   # Liệt kê các emulator có sẵn
   emulator -list-avds

   # Khởi động emulator
   emulator -avd [tên_emulator]
   ```

3. **Chạy MAUI app**
   ```bash
   cd AudioGuide.App
   dotnet build -t:Run -f net9.0-android
   ```

4. **Kiểm tra IP emulator**
   ```bash
   # Trong emulator terminal
   adb shell
   netstat -an | grep 5000
   ```

### iOS Simulator

1. **Chạy MAUI app**
   ```bash
   cd AudioGuide.App
   dotnet build -t:Run -f net9.0-ios
   ```

2. **Debug trong Xcode**
   ```bash
   open -a Simulator
   ```

---

## 🔍 Troubleshooting

### ❌ Lỗi: Connection refused (10.0.2.2:5000)

**Nguyên nhân:** Backend API không chạy hoặc không lắng nghe trên cổng 5000

**Giải pháp:**
```bash
# Kiểm tra backend API
cd AudioGuide.Api
dotnet run

# Kiểm tra port 5000 có lắng nghe
netstat -ano | findstr :5000
```

### ❌ Lỗi: Permission denied (Location)

**Nguyên nhân:** Quyền GPS chưa được cấp

**Giải pháp:**
1. Mở Settings trên emulator
2. Vào Permissions → Location
3. Cho phép "Allow location"

### ❌ Lỗi: usesCleartextTraffic not allowed

**Nguyên nhân:** Cập hình cleartext traffic chưa đúng cho Android 8.0+

**Giải pháp:**
- Sử dụng `network_security_config.xml` (được khuyến nghị)
- Hoặc `android:usesCleartextTraffic="true"` trong AndroidManifest.xml

### ❌ Lỗi: QR Camera not working

**Nguyên nhân:** Quyền camera chưa được cấp

**Giải pháp:**
```xml
<!-- AndroidManifest.xml -->
<uses-permission android:name="android.permission.CAMERA" />

<!-- iOS Info.plist -->
<key>NSCameraUsageDescription</key>
<string>Ứng dụng cần truy cập camera để quét mã QR</string>
```

---

## ✅ Kiểm tra Cấu hình

Sau khi cấu hình, chạy các lệnh sau để kiểm tra:

### Backend API
```bash
cd AudioGuide.Api
dotnet run

# Test Health Check
curl http://localhost:5000/api/pois/health
```

### MAUI App
```bash
cd AudioGuide.App
dotnet build -f net9.0-android

# Chạy trên emulator
dotnet run -f net9.0-android
```

---

## 📚 Tài liệu Tham khảo

- [MAUI Documentation](https://learn.microsoft.com/en-us/dotnet/maui/)
- [Android Network Security Configuration](https://developer.android.com/training/articles/security-config)
- [iOS App Transport Security](https://developer.apple.com/documentation/bundleresources/information_property_list/nsapptransportsecurity)
- [Shiny.NET Location Guide](https://shiny.shinylib.dev/location/)
- [ZXing.NET MAUI QR Scanner](https://github.com/ddtigo/ZXing.Net.Maui)

---

**Hoàn tất BƯỚC 3! ✅** Sẵn sàng cho BƯỚC 4 - MAUI Services?
