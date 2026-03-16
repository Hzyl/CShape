# ⚙️ HƯỚNG DẪN CẤU HÌNH

## Các cài đặt có thể tùy chỉnh

### 1. API Configuration

**File**: `ApiService.cs`

#### Thay đổi API Key:
```csharp
// Dòng hiện tại:
private const string API_KEY = "85a4e3c55f351fda9950632b67b39dea";

// Đổi thành API key của bạn:
private const string API_KEY = "YOUR_API_KEY_HERE";
```

#### Thay đổi Ngôn ngữ API:
```csharp
// Dòng hiện tại:
string url = $"{API_BASE_URL}?q={Uri.EscapeDataString(cityName)}&appid={API_KEY}&units=metric&lang=vi";

// Để tiếng Anh, thay "vi" bằng "en":
string url = $"{API_BASE_URL}?q={Uri.EscapeDataString(cityName)}&appid={API_KEY}&units=metric&lang=en";
```

#### Thay đổi đơn vị nhiệt độ:
```csharp
// Hiện tại: metric (Celsius)
// Đổi "metric" thành "imperial" để sử dụng Fahrenheit:
string url = $"{API_BASE_URL}?q={Uri.EscapeDataString(cityName)}&appid={API_KEY}&units=imperial&lang=vi";
```

### 2. History Configuration

**File**: `HistoryService.cs`

#### Thay đổi đường dẫn file lịch sử:
```csharp
// Trong Form1_Load():
// Thay từ:
historyService = new HistoryService();

// Thành:
historyService = new HistoryService("C:\\Users\\YourName\\AppData\\Local\\WeatherApp\\history.txt");
```

#### Thay đổi số lượng lịch sử tối đa:
```csharp
// Trong AddCity() method:
// Dòng hiện tại:
if (history.Count > 20)
{
    history = history.Take(20).ToList();
}

// Đổi 20 thành số lượng mong muốn (ví dụ: 50):
if (history.Count > 50)
{
    history = history.Take(50).ToList();
}
```

### 3. UI Configuration

**File**: `Form1.Designer.cs`

#### Đổi kích thước cửa sổ chính:
```csharp
// Dòng hiện tại:
this.ClientSize = new System.Drawing.Size(550, 510);

// Đổi thành:
this.ClientSize = new System.Drawing.Size(700, 600); // Rộng 700, cao 600 pixels
```

#### Đổi font chữ:
```csharp
// Dùng một trong những cách sau:

// 1. Trong Form1_Load():
this.Font = new System.Drawing.Font("Segoe UI", 9F);

// 2. Hoặc cho từng control:
txtCity.Font = new System.Drawing.Font("Tahoma", 10F);
lblTitle.Font = new System.Drawing.Font("Arial", 16F, System.Drawing.FontStyle.Bold);
```

#### Đổi màu sắc:
```csharp
// Đổi màu nền form:
this.BackColor = System.Drawing.Color.LightBlue;

// Đổi màu text:
lblTitle.ForeColor = System.Drawing.Color.DarkBlue;

// Đổi màu nền label:
lblStatus.BackColor = System.Drawing.Color.LightGray;
```

#### Đổi vị trí các control:
```csharp
// Ví dụ đổi vị trí nút Search:
btnSearch.Location = new System.Drawing.Point(450, 95); // X = 450, Y = 95
```

### 4. Form1.cs Configuration

#### Thay đổi thông báo lỗi:
```csharp
// Dòng hiện tại:
MessageBox.Show("Vui lòng nhập tên thành phố!", "Thông báo", ...);

// Đổi thành:
MessageBox.Show("Nhập tên thành phố vào ô trên!", "Nhắc nhở", ...);
```

#### Thay đổi text nút:
```csharp
// Trong Form1_Load() thêm:
btnSearch.Text = "Tìm kiếm";
btnClearHistory.Text = "Xóa toàn bộ";
```

## Ví dụ: Tùy chỉnh hoàn chỉnh

### Tạo ứng dụng với cài đặt tùy chỉnh

1. **Sử dụng Fahrenheit thay vì Celsius**:
   - File: `ApiService.cs`
   - Thay `units=metric` thành `units=imperial`
   - Thay biểu tượng `°C` thành `°F` trong Form

2. **Lưu lịch sử vào AppData**:
   - File: `Form1.cs`
   ```csharp
   string appDataPath = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData);
   string historyPath = System.IO.Path.Combine(appDataPath, "WeatherApp", "history.txt");
   historyService = new HistoryService(historyPath);
   ```

3. **Tăng số lừa lịch sử lên 50**:
   - File: `HistoryService.cs`
   - Thay `if (history.Count > 20)` thành `if (history.Count > 50)`

4. **Đổi giao diện Dark Mode**:
   - Trong `Form1.cs` thêm vào `Form1_Load()`:
   ```csharp
   this.BackColor = System.Drawing.Color.FromArgb(30, 30, 30);
   foreach (Control control in this.Controls)
   {
       if (control is Label)
           control.ForeColor = System.Drawing.Color.White;
   }
   ```

## Biến môi trường (Environment Variables)

Nếu muốn lưu API key trong biến môi trường:

### Windows:
1. Right-click "My Computer" → Properties
2. Click "Advanced system settings"
3. Click "Environment Variables"
4. Click "New" dưới "User variables"
5. Tên biến: `OPENWEATHER_API_KEY`
6. Giá trị: `YOUR_API_KEY`

### Trong code:
```csharp
private const string API_KEY = Environment.GetEnvironmentVariable("OPENWEATHER_API_KEY");
```

## Các cài đặt nâng cao

### Thêm retry logic:
```csharp
// Trong ApiService.cs thêm đoạn code:
private static int MAX_RETRIES = 3;
private static int RETRY_DELAY = 1000; // milliseconds

public async Task<WeatherData> GetWeatherByCityAsyncWithRetry(string cityName)
{
    for (int i = 0; i < MAX_RETRIES; i++)
    {
        try
        {
            return await GetWeatherByCityAsync(cityName);
        }
        catch (Exception ex)
        {
            if (i == MAX_RETRIES - 1) throw;
            await Task.Delay(RETRY_DELAY);
        }
    }
    return null;
}
```

### Thêm caching:
```csharp
private Dictionary<string, (WeatherData, DateTime)> cache = new();
private const int CACHE_MINUTES = 10;

public async Task<WeatherData> GetWeatherByCityCached(string cityName)
{
    if (cache.ContainsKey(cityName))
    {
        var (data, time) = cache[cityName];
        if ((DateTime.Now - time).TotalMinutes < CACHE_MINUTES)
            return data;
    }

    var weather = await GetWeatherByCityAsync(cityName);
    cache[cityName] = (weather, DateTime.Now);
    return weather;
}
```

---

**Lưu ý**: Sau khi thay đổi cấu hình, nhất định phải rebuild project:
```bash
dotnet clean
dotnet build
dotnet run
```

Có gì thắc mắc, hãy kontakt support! 📧
