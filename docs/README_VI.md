# ỨNG DỤNG TRA CỨU THỜI TIẾT (Weather App)

Ứng dụng desktop C# WinForms cho phép tra cứu thời tiết của các thành phố thông qua OpenWeather API.

## 📋 Yêu cầu

- .NET 6.0 trở lên
- Visual Studio 2022 hoặc tương đương
- Kết nối Internet

## 🚀 Cài đặt

### 1. Clone hoặc tải source code
```bash
git clone <repository-url>
cd WeatherApp
```

### 2. Cài đặt dependencies
```bash
dotnet restore
```

### 3. Build project
```bash
dotnet build
```

### 4. Chạy ứng dụng
```bash
dotnet run
```

Hoặc mở file `.csproj` trong Visual Studio và chạy từ đó.

## ✨ Các chức năng chính

### 1. Tìm kiếm thời tiết
- Nhập tên thành phố vào ô nhập liệu
- Nhấn nút "Search" hoặc phím Enter
- Xem thông tin thời tiết:
  - Nhiệt độ (°C)
  - Độ ẩm (%)
  - Tốc độ gió (m/s)
  - Trạng thái thời tiết
  - Icon thời tiết

### 2. Lịch sử tìm kiếm
- Tự động lưu các thành phố bạn đã tìm kiếm
- Click vào thành phố trong danh sách để tìm lại
- Lịch sử được lưu trong file `history.txt`

### 3. Xóa lịch sử
- Nhấn nút "Clear History" để xóa toàn bộ lịch sử
- Sẽ có xác nhận trước khi xóa

## 📁 Cấu trúc Project

```
WeatherApp/
├── Program.cs              # Entry point của ứng dụng
├── Form1.cs               # Form chính - logic xử lý
├── Form1.Designer.cs      # Thiết kế UI (auto-generated)
├── WeatherModel.cs        # Models dữ liệu
├── ApiService.cs          # Service gọi OpenWeather API
├── HistoryService.cs      # Service quản lý lịch sử
├── WeatherApp.csproj      # Project file
├── history.txt            # File lưu lịch sử (tự sinh)
└── README.md              # File này
```

## 🔧 Công nghệ sử dụng

- **Ngôn ngữ**: C# 11+
- **Framework**: .NET 6.0 WinForms
- **API**: OpenWeather API (miễn phí)
- **JSON Parser**: Newtonsoft.Json
- **HTTP Client**: System.Net.Http.HttpClient

## 📝 API Configuration

Ứng dụng sử dụng OpenWeather API miễn phí. API key được cố định trong `ApiService.cs`:

```csharp
private const string API_KEY = "85a4e3c55f351fda9950632b67b39dea";
```

### Thay đổi API key:
1. Truy cập [OpenWeatherMap](https://openweathermap.org/api)
2. Lấy API key miễn phí
3. Cập nhật giá trị `API_KEY` trong `ApiService.cs`

## 🌐 Hỗ trợ ngôn ngữ

Hiện tại ứng dụng hỗ trợ:
- Tiếng Việt
- Thông tin thời tiết mô tả bằng tiếng Việt (nếu API hỗ trợ)

## ⚠️ Ghi chú quan trọng

1. **Kết nối Internet**: Ứng dụng cần kết nối internet để lấy dữ liệu thời tiết
2. **Rate Limit**: API miễn phí có giới hạn ~1000 requests/ngày
3. **Lịch sử**: Tối đa 20 thành phố được lưu trong lịch sử

## 🐛 Khắc phục sự cố

### Lỗi: "Không thể kết nối API"
- Kiểm tra kết nối Internet
- Kiểm tra xem API key còn hạn sử dụng không
- Kiểm tra tên thành phố đã nhập

### Lỗi: "Lỗi parse JSON"
- Thay đổi API key
- Xóa file `history.txt` nếu bị lỗi

### Icon thời tiết không tải
- Kiểm tra kết nối Internet
- Icon sẽ hiển thị nếu kết nối ổn định

## 📄 License

Project này được phát triển cho mục đích học tập.

## 👨‍💻 Phát triển

### Thêm chức năng mới:
1. Fork project
2. Tạo branch mới (`git checkout -b feature/tính-năng-mới`)
3. Commit changes (`git commit -m 'Thêm tính năng mới'`)
4. Push to branch (`git push origin feature/tính-năng-mới`)
5. Open a Pull Request

## 📞 Hỗ trợ

Nếu gặp vấn đề, vui lòng:
1. Kiểm tra file `history.txt` có lỗi không
2. Xóa thư mục `bin` và `obj` rồi rebuild
3. Kiểm tra đã cài .NET 6.0 chưa

---

**Phiên bản**: 1.0
**Ngày cập nhật**: 2024
**Trạng thái**: Hoàn thành
