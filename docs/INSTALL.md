# 📦 HƯỚNG DẪN CÀI ĐẶT CHI TIẾT

## Yêu cầu tiên quyết

- **Hệ điều hành**: Windows 10/11
- **.NET Framework**: .NET 6.0 SDK trở lên
- **RAM**: Tối thiểu 2GB
- **Kết nối Internet**: Cần để kết nối API thời tiết

## Bước 1: Cài đặt .NET 6.0 SDK

### Kiểm tra xem đã cài đặt .NET chưa:
```bash
dotnet --version
```

Nếu chưa cài, hãy:

1. Truy cập [https://dotnet.microsoft.com/download](https://dotnet.microsoft.com/download)
2. Tải **".NET 6.0 SDK"** (Windows version - x64 hoặc x86 tùy máy)
3. Chạy installer (.exe) và làm theo hướng dẫn
4. Khởi động lại máy tính

### Xác nhận cài đặt thành công:
```bash
dotnet --version
# Kết quả: 6.0.x hoặc cao hơn
```

## Bước 2: Tải source code

### Tùy chọn 1: Clone từ Git (nếu project trên GitHub)
```bash
git clone <repository-url>
cd WeatherApp
```

### Tùy chọn 2: Tải file ZIP
1. Tải file từ repository
2. Giải nén vào thư mục bất kỳ
3. Mở Command Prompt (Cmd) hoặc PowerShell
4. Chuyển vào thư mục project

## Bước 3: Build Project

```bash
# Di chuyển vào thư mục project
cd path\to\WeatherApp

# Cài đặt dependencies
dotnet restore

# Build project
dotnet build

# Kết quả: Build successful (hoặc có thể có warning, nhưng không lỗi)
```

## Bước 4: Chạy ứng dụng

### Cách 1: Sử dụng Command Line
```bash
dotnet run
```

Ứng dụng sẽ mở lên trong vòng vài giây.

### Cách 2: Sử dụng Visual Studio
1. Mở file `WeatherApp.csproj` bằng Visual Studio 2022
2. Nhấn `F5` hoặc chọn `Debug > Start Debugging`
3. Ứng dụng sẽ khởi chạy

### Cách 3: Chạy file .exe (sau khi publish)
```bash
# Publish ứng dụng
dotnet publish -c Release -o ./publish

# Chạy file exe
./publish/WeatherApp.exe
```

## Bước 5: Sử dụng ứng dụng

1. **Nhập tên thành phố**: Gõ tên thành phố (ví dụ: Hanoi, Tokyo, Paris)
2. **Nhấn Search**: Để tìm kiếm thời tiết
3. **Xem kết quả**: Thông tin thời tiết sẽ hiển thị
4. **Lịch sử**: Thành phố sẽ được lưu vào lịch sử tự động

## 🔧 Cấu hình API

Ứng dụng đã có sẵn API key. Nếu muốn thay đổi:

1. Mở file `ApiService.cs`
2. Tìm dòng:
   ```csharp
   private const string API_KEY = "85a4e3c55f351fda9950632b67b39dea";
   ```
3. Thay đổi giá trị API key
4. Rebuild project

## ⚙️ Cài đặt tùy chỉnh

### Đổi vị trí file lịch sử:
Trong `Form1.cs`, sửa dòng:
```csharp
historyService = new HistoryService("history.txt");
```

Thành:
```csharp
historyService = new HistoryService("C:\\Users\\YourName\\history.txt");
```

## 🐛 Khắc phục sự cố

### Lỗi: "dotnet: command not found"
**Giải pháp**:
- Kiểm tra xem đã cài .NET SDK chưa
- Khởi động lại Command Prompt
- Hoặc thêm .NET vào PATH biến môi trường

### Lỗi: "Cannot find project file"
**Giải pháp**:
- Đảm bảo bạn đang trong thư mục chứa file `WeatherApp.csproj`
- Kiểm tra tên đúng của project

### Lỗi: Build failed
**Giải pháp**:
```bash
# Xóa các fol thư dự build trước
rm -r bin obj

# Restore lại dependencies
dotnet restore

# Build lại
dotnet build
```

### Ứng dụng không kết nối được API
**Giải pháp**:
1. Kiểm tra kết nối Internet
2. Kiểm tra API key có hợp lệ không
3. Thử nhập tên thành phố bằng tiếng Anh

### File history.txt bị lỗi
**Giải pháp**:
1. Xóa file `history.txt`
2. Chạy lại ứng dụng (file sẽ được tạo mới)

---

## 📖 Tài liệu tham khảo

- [.NET Documentation](https://docs.microsoft.com/dotnet/)
- [C# Language Documentation](https://docs.microsoft.com/en-us/dotnet/csharp/)
- [WinForms API](https://docs.microsoft.com/en-us/dotnet/api/system.windows.forms)
- [OpenWeatherMap API](https://openweathermap.org/api)
- [Newtonsoft.Json Documentation](https://www.newtonsoft.com/json)

---

**Nếu gặp vấn đề, hãy kiểm tra**:
1. Phiên bản .NET đúng chưa?
2. File `WeatherApp.csproj` có trong thư mục không?
3. Kết nối Internet có ok không?
4. Anti-virus có chặn ứng dụng không?

**Chúc bạn sử dụng ứng dụng vui vẻ!** 🎉
