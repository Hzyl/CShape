# 📖 HƯỚNG DẪN SỬ DỤNG ỨNG DỤNG

## Giao diện ứng dụng

```
┌─────────────────────────────────────────────────┐
│      ỨNG DỤNG TRA CỨU THỜI TIẾT              │
├─────────────────────────────────────────────────┤
│                                                 │
│  Nhập tên thành phố:                           │
│  [                              ] [Search]      │
│                                                 │
│  Thành phố: Hanoi                              │
│  Nhiệt độ: 28°C                                │
│  Độ ẩm: 75%                        [Weather]  │
│  Tốc độ gió: 3.5 m/s               [Icon]     │
│  Trạng thái: Partly Cloudy                     │
│                                                 │
│  Lịch sử tìm kiếm:                             │
│  [Hanoi                                       ]│
│  [Tokyo                                       ]│
│  [Paris                                       ]│
│  [London                                      ]│
│                                                 │
│  [Clear History]                               │
└─────────────────────────────────────────────────┘
```

## 🔍 Các bước sử dụng cơ bản

### Bước 1: Tìm kiếm thành phố

1. Khởi chạy ứng dụng
2. Nhìn vào ô nhập liệu "Nhập tên thành phố"
3. Gõ tên thành phố bằng **tiếng Anh**, ví dụ:
   - `Hanoi`, `Bangkok`, `Ho Chi Minh`
   - `Tokyo`, `Seoul`, `Beijing`
   - `Paris`, `London`, `New York`

4. Nhấn nút **"Search"** hoặc phím **Enter**

### Bước 2: Xem kết quả thời tiết

Nếu thành phố tồn tại, ứng dụng sẽ hiển thị:

- **Thành phố**: Tên chính xác của thành phố
- **Nhiệt độ**: Nhiệt độ hiện tại (Celsius)
- **Độ ẩm**: Độ ẩm không khí (%)
- **Tốc độ gió**: Vận tốc gió (m/s)
- **Trạng thái**: Mô tả thời tiết (Clear, Rainy, Cloudy, v.v.)
- **Icon**: Biểu tượng thời tiết tương ứng

### Bước 3: Sử dụng lịch sử

Mỗi lần tìm kiếm thành phố, nó tự động được thêm vào **Lịch sử tìm kiếm**:

#### Để xem lại thời tiết của thành phố cũ:
1. Click vào tên thành phố trong danh sách lịch sử
2. Ứng dụng tự động tìm kiếm thời tiết của thành phố đó

#### Để xóa toàn bộ lịch sử:
1. Nhấn nút **"Clear History"**
2. Xác nhận xóa khi được hỏi
3. Danh sách lịch sử sẽ được làm trống

---

## 💡 Mẹo sử dụng

### 1. Tìm kiếm hiệu quả

| Cách gõ | Kết quả | Ghi chú |
|---------|--------|--------|
| Hanoi | ✅ Thành công | Tên tiếng Anh |
| HaNoi | ✅ Thành công | Không phân biệt hoa/thường |
| Hà Nộι | ❌ Không tìm thấy | API chỉ hỗ trợ tiếng Anh |
| Ha Noi | ❌ Không tìm thấy | Dấu không được hỗ trợ |

### 2. Các thành phố phổ biến

```
Việt Nam:
- Hanoi (Hà Nội)
- Ho Chi Minh (Sài Gòn)
- Da Nang (Đà Nẵng)
- Hai Phong (Hải Phòng)

Châu Á:
- Tokyo, Bangkok, Seoul, Beijing
- Shanghai, Hong Kong, Singapore
- Manila, Jakarta, New Delhi

Thế giới:
- New York, Los Angeles, Chicago
- London, Paris, Berlin
- Sydney, Melbourne, Toronto
```

### 3. Xử lý lỗi

#### Lỗi: "Vui lòng nhập tên thành phố"
- Bạn chưa nhập gì hoặc nhập khoảng trắng
- **Giải pháp**: Nhập tên thành phố

#### Lỗi: "Lỗi kết nối"
- Không có kết nối Internet
- API server không hoạt động
- **Giải pháp**: Kiểm tra kết nối, thử lại sau

#### Lỗi: "Lỗi parse JSON"
- API trả về dữ liệu không hợp lệ
- API key hết hạn
- **Giải pháp**: Thay API key mới

#### Không tìm thấy thành phố
- Tên thành phố người dùng nhập sai
- Thành phố quá nhỏ hoặc ít nổi tiếng
- **Giải pháp**: Kiểm tra lại tên thành phố

### 4. Làm mới dữ liệu

Lần tìm kiếm lần thứ hai với cùng thành phố sẽ cập nhật thông tin:
- Icon sẽ được tải lại
- Nhiệt độ được cập nhật
- Tất cả dữ liệu đều fresh từ API

---

## 🌡️ Hiểu biết về thông tin thời tiết

### Nhiệt độ
- **20-25°C**: Thời tiết mát mẻ
- **25-30°C**: Thời tiết ấm áp
- **30+°C**: Thời tiết nóng

### Độ ẩm
- **0-30%**: Rất khô
- **30-60%**: Bình thường
- **60-100%**: Ẩm ướt

### Tốc độ gió
- **0-3 m/s**: Yên tĩnh
- **3-7 m/s**: Có gió nhẹ
- **7-12 m/s**: Gió mạnh
- **12+ m/s**: Gió rất mạnh / bão

### Mô tả thời tiết
| Mô tả | Ý nghĩa |
|-------|--------|
| Clear | Trời quang |
| Clouds | Nhiều mây |
| Cloudy | Mây |
| Rainy | Mưa |
| Rain | Đang mưa |
| Drizzle | Mưa nhẹ |
| Thunderstorm | Bão |
| Snow | Tuyết |
| Mist | Sương mù |

---

## 🔄 Chu trình sử dụng điển hình

```
1. Mở ứng dụng
        ↓
2. Nhập tên thành phố (ví dụ: Tokyo)
        ↓
3. Nhấn Search hoặc Enter
        ↓
4. Xem kết quả thời tiết
        ↓
5. Tokyo được thêm vào Lịch sử
        ↓
6. Có thể:
   - Tìm kiếm thêm thành phố khác
   - Click vào lịch sử để xem lại
   - Xóa lịch sử
```

---

## ⚙️ Cài đặt tối ưu

### Để có trải nghiệm tốt nhất:

1. **Kết nối Internet ổn định**: Đảm bảo có WiFi hoặc 4G
2. **API key hợp lệ**: Kiểm tra API key trong `ApiService.cs`
3. **Cập nhật .NET**: Sử dụng .NET 6.0 trở lên
4. **Ngoại lệ tường lửa**: Cho phép ứng dụng qua firewall

---

## 🆘 Câu hỏi thường gặp (FAQ)

**Q: Tại sao không tìm thấy thành phố?**
A:
- Kiểm tra tên tiếng Anh
- Chắc chắn không có lỗi đánh máy
- Thử tên chính thức của thành phố

**Q: Icon thời tiết không tải?**
A:
- Kiểm tra kết nối Internet
- Thử lại lần sau
- Icon có thể không tải nếu server API chậm

**Q: Lịch sử không lưu được?**
A:
- Kiểm tra quyền truy cập file directory
- Xóa file `history.txt` cũ
- Chạy ứng dụng với quyền Admin

**Q: Có thể lưu dữ liệu lâu dài không?**
A:
- Hiện tại lịch sử được lưu trong `history.txt`
- Có thể mở rộng để lưu vào database

**Q: Ứng dụng chậm?**
A:
- Kiểm tra kết nối Internet
- Đóng các chương trình khác
- Thử restart ứng dụng

---

## 📚 Các nguồn tài liệu

- [OpenWeather API Docs](https://openweathermap.org/api)
- [Weather Descriptions](https://openweathermap.org/weather-conditions)
- [API Response Format](https://openweathermap.org/current)

---

**Chúc bạn sử dụng ứng dụng một cách hiệu quả!** 🚀
