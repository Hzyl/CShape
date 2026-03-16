# 🔧 HƯỚNG DẪN KHẮC PHỤC SỰ CỐ

## 🚨 Các lỗi phổ biến và cách khắc phục

### 1. **"dotnet: command not found" hoặc "dotnet không được nhận diện"**

#### Nguyên nhân:
- .NET SDK chưa được cài đặt
- .NET không được thêm vào PATH của hệ thống
- Cần khởi động lại máy sau khi cài đặt

#### Khắc phục:
```bash
# Kiểm tra phiên bản .NET
dotnet --version

# Nếu không tìm thấy:
# 1. Cài đặt .NET 6.0 SDK từ https://dotnet.microsoft.com/download
# 2. Khởi động lại máy tính
# 3. Mở Command Prompt mới
# 4. Thử lại
```

---

### 2. **"Cannot find project file" hoặc Build Failed**

#### Nguyên nhân:
- Không ở đúng thư mục project
- File `WeatherApp.csproj` bị xóa
- Syntax lỗi trong .csproj file

#### Khắc phục:
```bash
# 1. Kiểm tra đúng thư mục
cd path\to\WeatherApp
dir WeatherApp.csproj    # Phải thấy file này

# 2. Clean và rebuild
dotnet clean
dotnet restore
dotnet build

# 3. Nếu vẫn lỗi, xóa thư mục bin và obj
rmdir /s bin
rmdir /s obj
dotnet restore
dotnet build
```

---

### 3. **"Error: API Connection Failed" - Kết nối API thất bại**

#### Nguyên nhân:
- Không có kết nối Internet
- API key hết hạn
- OpenWeather server down
- Tường lửa chặn kết nối

#### Khắc phục:
```bash
# 1. Kiểm tra kết nối Internet
ping google.com

# 2. Kiểm tra kết nối OpenWeather API
# Mở trình duyệt và truy cập:
# https://api.openweathermap.org/data/2.5/weather?q=Tokyo&appid=YOUR_API_KEY&units=metric

# 3. Nếu thất bại, thay đổi API key:
# File: ApiService.cs
# Dòng: private const string API_KEY = "YOUR_API_KEY";
# Lấy API key mới từ: https://openweathermap.org/api

# 4. Kiểm tra firewall/proxy
# Cho phép ứng dụng qua firewall trong Security Settings
```

---

### 4. **"City not found" - Không tìm thấy thành phố**

#### Nguyên nhân:
- Tên thành phố bị đánh máy sai
- Dùng tiếng Việt thay vì tiếng Anh
- Thành phố quá nhỏ, API không nhận diện

#### Khắc phục:
```
✅ Đúng: Hanoi, Tokyo, New York
❌ Sai: Hà Nội, Tôkyô, Ny

# Thử các tên tiếng Anh phổ biến:
- Hanoi (không đánh dấu)
- Ho Chi Minh City
- Da Nang
- Bangkok
- Tokyo
- Seoul
- Paris
- London
- New York
```

#### Kiểm tra tên chính xác:
```bash
# Sử dụng API trực tiếp
# https://api.openweathermap.org/data/2.5/weather?q=ThanhPho&appid=API_KEY
# Xem tên trong response JSON
```

---

### 5. **"Exception in JSON Parsing" - Lỗi parse JSON**

#### Nguyên nhân:
- API trả về format không expected
- Newtonsoft.Json package không tương thích
- API response không hợp lệ

#### Khắc phục:
```bash
# 1. Cập nhật Newtonsoft.Json
dotnet add package Newtonsoft.Json --version 13.0.3

# 2. ReBuild
dotnet clean
dotnet restore
dotnet build

# 3. Nếu vẫn lỗi, kiểm tra API key
# Thay API key mới trong ApiService.cs
```

---

### 6. **Weather icon không hiển thị**

#### Nguyên nhân:
- Không có kết nối Internet khi tải icon
- OpenWeather CDN chậm/không hoạt động
- Timeout khi tải ảnh

#### Khắc phục:
```bash
# 1. Kiểm tra kết nối Internet
ping openweathermap.org

# 2. Kiểm tra URL icon
# URL: https://openweathermap.org/img/wn/{iconCode}@2x.png
# Ví dụ: https://openweathermap.org/img/wn/01d@2x.png
# Thử mở trực tiếp trong trình duyệt

# 3. Tăng timeout trong ApiService.cs
client.Timeout = TimeSpan.FromSeconds(10); // Mặc định là 5s
```

---

### 7. **File history.txt bị lỗi hoặc không lưu được**

#### Nguyên nhân:
- Không có quyền truy cập thư mục
- File corrupt
- Ứng dụng không có quyền ghi file

#### Khắc phục:
```bash
# 1. Xóa file history.txt cũ
del history.txt

# 2. Chạy ứng dụng (file sẽ được tạo mới)
dotnet run

# 3. Nếu vẫn không được:
#    - Chạy Command Prompt với quyền Admin
#    - cd path\to\WeatherApp
#    - dotnet run

# 4. Kiểm tra quyền folder
# Properties > Security > Edit > cho Full Control
```

---

### 8. **"System.Net.Http.HttpRequestException"**

#### Nguyên nhân:
- Mạng kém/unstable
- SSL Certificate error
- API server down

#### Khắc phục:
```bash
# 1. Kiểm tra kết nối
ping -c 4 8.8.8.8

# 2. Upgrade TLS version trong ApiService.cs
System.Net.ServicePointManager.SecurityProtocol =
    System.Net.SecurityProtocolType.Tls12 |
    System.Net.SecurityProtocolType.Tls13;

# 3. Thêm timeout
HttpClient client = new HttpClient();
client.Timeout = TimeSpan.FromSeconds(10);
```

---

### 9. **Form1 không hiển thị hoặc ứng dụng crash**

#### Nguyên nhân:
- Constructor lỗi
- Control bị duplicate
- Memory issue

#### Khắc phục:
```bash
# 1. Clean build
dotnet clean
dotnet build

# 2. Kiểm tra Forms trong Program.cs
# Phải có: Application.Run(new Form1());

# 3. Kiểm tra Form1.Designer.cs
# Tìm dòng: this.ResumeLayout(false);
# Phải ở cuối InitializeComponent()

# 4. Nếu vẫn crash, thử:
dotnet run --configuration Release
```

---

### 10. **"NullReferenceException" hoặc crash ngẫu nhiên**

#### Nguyên nhân:
- Biến chưa được initialize
- Click control trước khi load xong
- Race condition

#### Khắc phục:
```csharp
// Thêm null check:
if (weatherData != null)
{
    DisplayWeather(weatherData);
}

// Hoặc sử dụng?.
weather?.City;

// Disable button ngay đầu
btnSearch.Enabled = false;
// Enable sau khi form load xong
Form1_Load() { btnSearch.Enabled = true; }
```

---

## 🔍 Debug Tips

### 1. **Xem thông chi tiết lỗi**
```bash
# Run với debug mode
dotnet run --configuration Debug

# Break point: Thêm vào code
System.Diagnostics.Debugger.Break();
```

### 2. **Xem API response nguyên bản**
```csharp
// Thêm vào ApiService.cs trước khi parse:
StreamReader reader = new StreamReader(response.Content.ReadAsStream());
string jsonContent = reader.ReadToEnd();
Console.WriteLine(jsonContent); // In ra console
```

### 3. **Log các sự kiện**
```csharp
// Thêm logging:
Console.WriteLine($"Searching for city: {cityName}");
Console.WriteLine($"Response received: {jsonContent}");
Console.WriteLine($"History count: {historyService.GetCount()}");
```

---

## 📋 Checklist Debug

- [ ] Kiểm tra phiên bản .NET (`dotnet --version`)
- [ ] Kiểm tra file cấu hình (`.csproj`)
- [ ] Kiểm tra kết nối Internet (`ping google.com`)
- [ ] Kiểm tra API key hợp lệ
- [ ] Kiểm tra logs/console output
- [ ] Xóa `bin` và `obj` folders
- [ ] Chạy `dotnet clean && dotnet build`
- [ ] Kiểm tra firewall/antivirus
- [ ] Thử restart máy tính

---

## 🎛️ Performance Issues

### Ứng dụng chạy chậm?

```csharp
// 1. Thêm timeout cho HTTP request:
client.Timeout = TimeSpan.FromSeconds(5);

// 2. Cache API responses:
// (xem CONFIG.md cho ví dụ)

// 3. Xóa icon cache:
// Giảm file size được tải

// 4. Sử dụng Release build:
dotnet run --configuration Release
```

---

## 🌐 Network Issues

### VPN/Proxy?

```csharp
// Thêm vào ApiService.cs nếu dùng proxy:
var handler = new HttpClientHandler
{
    Proxy = new WebProxy("proxy.example.com:8080"),
    UseProxy = true
};
HttpClient client = new HttpClient(handler);
```

---

## 💾 Storage Issues

Nếu file không lưu được:

```bash
# 1. Kiểm tra quyền folder
icacls . /grant Users:F

# 2. Đổi đường dẫn history.txt
# Từ: history.txt
# Thành: C:\Users\{username}\AppData\Local\WeatherApp\history.txt

# 3. Tạo thư mục nếu chưa tồn tại
if (!Directory.Exists(path))
{
    Directory.CreateDirectory(path);
}
```

---

## 📞 Khi nào cần tìm kiếm trợ giúp thêm

Nếu sau khi thử tất cả mẹo trên vẫn không khắc phục được:

1. **Kiểm tra lại hướng dẫn INSTALL.md**
2. **Tìm kiếm lỗi trên Google** (copy đầy đủ error message)
3. **Liên hệ với team support**
4. **Kiểm tra GitHub Issues** có người gặp lỗi tương tự không

---

## 🆘 Emergency Reset

Nếu mọi thứ hỏng:

```bash
# 1. Xóa toàn bộ build artifacts
rmdir /s /q bin
rmdir /s /q obj

# 2. Xóa file history
del history.txt

# 3. Xóa NuGet cache (tùy chọn)
nuget locals all -clear

# 4. Fresh install
dotnet restore

# 5. Build lại
dotnet build

# 6. Chạy
dotnet run
```

---

## 📝 Report Bug

**Nếu tìm thấy bug, vui lòng report với thông tin:**

```
Title: [BUG] Short description
Environment:
- OS: Windows 10/11
- .NET Version: (output of dotnet --version)
- Application Version: 1.0.0

Steps to reproduce:
1. ...
2. ...
3. ...

Expected behavior:
...

Actual behavior:
...

Error message:
(paste full error here)

Screenshots:
(attach if relevant)
```

---

**Chúc bạn khắc phục sự cố thành công!** 🎉

Nếu vẫn gặp vấn đề không được liệt kê ở đây, vui lòng kiểm tra lại:
- INSTALL.md
- README_VI.md
- CONFIG.md

Hoặc liên hệ support để được hỗ trợ! 📧
