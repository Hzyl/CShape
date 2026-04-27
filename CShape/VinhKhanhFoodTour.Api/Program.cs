using System.Net;
using System.Net.NetworkInformation;
using System.Net.Sockets;
using MongoDB.Driver;
using VinhKhanhFoodTour.Api.Models;
using VinhKhanhFoodTour.Api.Services;

var builder = WebApplication.CreateBuilder(args);
builder.Configuration.AddJsonFile("appsettings.Local.json", optional: true, reloadOnChange: true);

var configuredUrls = Environment.GetEnvironmentVariable("ASPNETCORE_URLS") ?? builder.Configuration["urls"];
if (string.IsNullOrWhiteSpace(configuredUrls))
{
    builder.WebHost.UseUrls("http://0.0.0.0:5000");
}

// Add controllers
builder.Services.AddControllers();

// OpenAPI
builder.Services.AddOpenApi();

// MongoDB Configuration
var connectionString = builder.Configuration["MongoDB:ConnectionString"];
var databaseName = builder.Configuration["MongoDB:DatabaseName"];
var hasMongoConnection = !string.IsNullOrWhiteSpace(connectionString);

if (hasMongoConnection)
{
    // Thêm timeout settings để không bị treo khi MongoDB không kết nối được
    var mongoSettings = MongoClientSettings.FromConnectionString(connectionString);
    mongoSettings.ConnectTimeout = TimeSpan.FromSeconds(5);
    mongoSettings.ServerSelectionTimeout = TimeSpan.FromSeconds(5);

    builder.Services.AddSingleton<IMongoClient>(sp => new MongoClient(mongoSettings));
    builder.Services.AddScoped<IMongoDatabase>(sp =>
        sp.GetRequiredService<IMongoClient>().GetDatabase(databaseName));
}

// Register Services
if (hasMongoConnection)
{
    builder.Services.AddScoped<PoiService>();
    builder.Services.AddScoped<TourService>();
    builder.Services.AddScoped<AnalyticsService>();
    builder.Services.AddScoped<AuthService>();
}

// CORS - cho phép frontend gọi API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure pipeline
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("AllowAll");

app.UseStaticFiles();

// Route "/" → tự động redirect sang /index.html
app.MapGet("/", context =>
{
    context.Response.Redirect("/index.html", permanent: false);
    return Task.CompletedTask;
});

app.MapGet("/api/system/network", (HttpRequest request) =>
{
    var port = request.Host.Port ?? GetDemoPort(app.Configuration);
    var scheme = request.Scheme;
    var currentOrigin = $"{scheme}://{request.Host.Value}";
    var lanOrigins = GetLanIpAddresses()
        .Select(ip => $"{scheme}://{ip}:{port}")
        .Distinct()
        .ToList();
    var preferredOrigin = lanOrigins.FirstOrDefault() ?? currentOrigin;

    return Results.Ok(new
    {
        currentOrigin,
        preferredOrigin,
        lanOrigins,
        userAppUrl = $"{preferredOrigin}/index.html",
        adminUrl = $"{preferredOrigin}/admin.html",
        port,
        note = "Dùng userAppUrl/adminUrl cho điện thoại hoặc máy giảng viên cùng WiFi/LAN."
    });
});

if (hasMongoConnection)
{
    app.MapControllers();
}
else
{
    MapDemoApi(app);
}

// Seed dữ liệu mẫu khi khởi động (với timeout)
if (hasMongoConnection)
{
    try
    {
        using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(10));
        using var scope = app.Services.CreateScope();
        
        var poiService = scope.ServiceProvider.GetRequiredService<PoiService>();
        var tourService = scope.ServiceProvider.GetRequiredService<TourService>();
        var authService = scope.ServiceProvider.GetRequiredService<AuthService>();

        await poiService.SeedDataAsync();
        
        var pois = await poiService.GetAllAsync();
        var poiIds = pois.Select(p => p.Id!).ToList();
        await tourService.SeedDataAsync(poiIds);
        
        await authService.SeedDataAsync();
        
        Console.WriteLine("✅ Seed dữ liệu mẫu thành công!");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"⚠️ Lỗi seed data: {ex.Message}");
        Console.WriteLine("📌 Hãy kiểm tra lại connection string trong appsettings.Local.json hoặc biến môi trường MongoDB__ConnectionString");
        Console.WriteLine("📌 Ứng dụng vẫn chạy; frontend có demo fallback khi API chưa sẵn sàng.");
    }
}
else
{
    Console.WriteLine("⚠️ Chưa cấu hình MongoDB__ConnectionString/appsettings.Local.json; bỏ qua MongoDB services.");
    Console.WriteLine("📌 Frontend vẫn chạy bằng demo fallback để phục vụ bảo vệ/demo.");
}

Console.WriteLine();
Console.WriteLine("🍜 Ứng dụng Thuyết Minh Phố Ẩm Thực Vĩnh Khánh đã khởi động!");
Console.WriteLine("📱 User App máy chạy:  http://localhost:5000/index.html");
Console.WriteLine("⚙️  Admin CMS máy chạy: http://localhost:5000/admin.html");
var demoPort = GetDemoPort(app.Configuration);
var lanOriginsForConsole = GetLanIpAddresses().Select(ip => $"http://{ip}:{demoPort}").ToList();
if (lanOriginsForConsole.Count > 0)
{
    Console.WriteLine("🌐 Demo LAN cho điện thoại/giảng viên cùng WiFi:");
    foreach (var origin in lanOriginsForConsole)
    {
        Console.WriteLine($"   • User App:  {origin}/index.html");
        Console.WriteLine($"   • Admin CMS: {origin}/admin.html");
    }
}
else
{
    Console.WriteLine("🌐 Demo LAN: http://<IP-LAN-của-máy>:5000/index.html");
}
Console.WriteLine("📌 Nếu điện thoại không mở được: kiểm tra cùng WiFi và cho phép firewall port 5000.");
Console.WriteLine("📡 OpenAPI: http://localhost:5000/openapi/v1.json");
Console.WriteLine();

app.Run();

static int GetDemoPort(IConfiguration configuration)
{
    var urls = Environment.GetEnvironmentVariable("ASPNETCORE_URLS")
        ?? configuration["urls"]
        ?? "http://0.0.0.0:5000";

    foreach (var part in urls.Split(';', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
    {
        var normalized = part.Replace("0.0.0.0", "127.0.0.1", StringComparison.OrdinalIgnoreCase)
            .Replace("*", "127.0.0.1", StringComparison.OrdinalIgnoreCase)
            .Replace("+", "127.0.0.1", StringComparison.OrdinalIgnoreCase);
        if (Uri.TryCreate(normalized, UriKind.Absolute, out var uri) && uri.Port > 0)
        {
            return uri.Port;
        }
    }

    return 5000;
}

static List<string> GetLanIpAddresses()
{
    try
    {
        return NetworkInterface.GetAllNetworkInterfaces()
            .Where(adapter => adapter.OperationalStatus == OperationalStatus.Up)
            .Where(adapter => adapter.NetworkInterfaceType != NetworkInterfaceType.Loopback)
            .SelectMany(adapter => adapter.GetIPProperties().UnicastAddresses)
            .Select(address => address.Address)
            .Where(IsUsableLanAddress)
            .Select(address => address.ToString())
            .Distinct()
            .OrderBy(GetLanAddressPriority)
            .ThenBy(address => address)
            .ToList();
    }
    catch
    {
        return [];
    }
}

static bool IsUsableLanAddress(IPAddress address)
{
    if (address.AddressFamily != AddressFamily.InterNetwork)
    {
        return false;
    }

    var bytes = address.GetAddressBytes();
    return bytes[0] != 0
        && bytes[0] != 127
        && !(bytes[0] == 169 && bytes[1] == 254);
}

static int GetLanAddressPriority(string address)
{
    if (address.StartsWith("192.168.", StringComparison.Ordinal)) return 0;
    if (address.StartsWith("10.", StringComparison.Ordinal)) return 1;
    if (address.StartsWith("172.", StringComparison.Ordinal)) return 2;
    return 3;
}

static void MapDemoApi(WebApplication app)
{
    var demoPois = CreateDemoPois();
    var analyticsEvents = new List<AnalyticsEvent>();

    app.MapPost("/api/auth/login", IResult (LoginRequest request) =>
    {
        if (!string.Equals(request.Username, "admin", StringComparison.OrdinalIgnoreCase) || request.Password != "admin123")
        {
            return Results.Unauthorized();
        }

        return Results.Ok(new LoginResponse
        {
            Token = AdminTokenHelper.CreateToken("admin", "admin"),
            Username = "admin",
            Role = "admin"
        });
    });

    app.MapGet("/api/poi", () => Results.Ok(demoPois.Where(p => p.IsActive).OrderBy(p => p.Priority)));
    app.MapGet("/api/poi/{id}", IResult (string id) =>
        demoPois.FirstOrDefault(p => p.Id == id) is { } poi ? Results.Ok(poi) : Results.NotFound());
    app.MapGet("/api/poi/qr/{qrCode}", IResult (string qrCode) =>
        demoPois.FirstOrDefault(p => p.QrCode == qrCode || p.Id == qrCode) is { } poi ? Results.Ok(poi) : Results.NotFound());

    app.MapGet("/api/poi/all", IResult (HttpRequest request) =>
    {
        if (!AdminTokenHelper.IsAuthorized(request)) return Results.Unauthorized();
        return Results.Ok(demoPois.OrderBy(p => p.Priority));
    });

    app.MapPost("/api/poi", IResult (HttpRequest request, Poi poi) =>
    {
        if (!AdminTokenHelper.IsAuthorized(request)) return Results.Unauthorized();
        poi.Id = string.IsNullOrWhiteSpace(poi.Id) ? Guid.NewGuid().ToString("N") : poi.Id;
        poi.CreatedAt = DateTime.UtcNow;
        poi.UpdatedAt = DateTime.UtcNow;
        demoPois.Add(poi);
        return Results.Created($"/api/poi/{poi.Id}", poi);
    });

    app.MapPut("/api/poi/{id}", IResult (HttpRequest request, string id, Poi poi) =>
    {
        if (!AdminTokenHelper.IsAuthorized(request)) return Results.Unauthorized();
        var index = demoPois.FindIndex(p => p.Id == id);
        if (index < 0) return Results.NotFound();
        poi.Id = id;
        poi.UpdatedAt = DateTime.UtcNow;
        demoPois[index] = poi;
        return Results.NoContent();
    });

    app.MapDelete("/api/poi/{id}", IResult (HttpRequest request, string id) =>
    {
        if (!AdminTokenHelper.IsAuthorized(request)) return Results.Unauthorized();
        var removed = demoPois.RemoveAll(p => p.Id == id);
        return removed > 0 ? Results.NoContent() : Results.NotFound();
    });

    app.MapGet("/api/tour", () => Results.Ok(Array.Empty<Tour>()));
    app.MapGet("/api/tour/{id}", IResult (string id) => Results.NotFound());

    app.MapPost("/api/analytics/event", IResult (AnalyticsEvent ev) =>
    {
        ev.Id ??= Guid.NewGuid().ToString("N");
        ev.Timestamp = DateTime.UtcNow;
        analyticsEvents.Add(ev);
        return Results.Ok(ev);
    });
    app.MapGet("/api/analytics/stats", IResult (HttpRequest request) =>
    {
        if (!AdminTokenHelper.IsAuthorized(request)) return Results.Unauthorized();
        return Results.Ok(new
        {
            eventCounts = analyticsEvents.GroupBy(e => e.EventType).ToDictionary(g => g.Key, g => g.Count()),
            uniqueSessions = analyticsEvents.Select(e => e.SessionId).Where(s => !string.IsNullOrWhiteSpace(s)).Distinct().Count(),
            generatedAt = DateTime.UtcNow
        });
    });
    app.MapGet("/api/analytics/top-pois", IResult (HttpRequest request, int limit = 10) =>
    {
        if (!AdminTokenHelper.IsAuthorized(request)) return Results.Unauthorized();
        var safeLimit = Math.Clamp(limit, 1, 50);
        var stats = analyticsEvents
            .Where(e => e.EventType == "poi_listen" && !string.IsNullOrWhiteSpace(e.PoiId))
            .GroupBy(e => e.PoiId!)
            .Select(g =>
            {
                var poi = demoPois.FirstOrDefault(p => p.Id == g.Key || p.QrCode == g.Key);
                return new PoiStats
                {
                    PoiId = g.Key,
                    PoiName = poi?.Name.GetValueOrDefault("vi") ?? poi?.Name.GetValueOrDefault("en") ?? g.Key,
                    ListenCount = g.Count(),
                    AvgDuration = g.Average(e => e.Duration ?? 0)
                };
            })
            .OrderByDescending(s => s.ListenCount)
            .Take(safeLimit)
            .ToList();
        return Results.Ok(stats);
    });
    app.MapGet("/api/analytics/heatmap", IResult (HttpRequest request) =>
    {
        if (!AdminTokenHelper.IsAuthorized(request)) return Results.Unauthorized();
        var points = analyticsEvents
            .Where(e => e.Latitude.HasValue && e.Longitude.HasValue)
            .GroupBy(e => new
            {
                Lat = Math.Round(e.Latitude!.Value, 4),
                Lng = Math.Round(e.Longitude!.Value, 4)
            })
            .Select(g => new HeatmapPoint
            {
                Latitude = g.Key.Lat,
                Longitude = g.Key.Lng,
                Intensity = g.Count()
            })
            .ToList();
        return Results.Ok(points);
    });
    app.MapGet("/api/analytics/recent", IResult (HttpRequest request, int limit = 50) =>
    {
        if (!AdminTokenHelper.IsAuthorized(request)) return Results.Unauthorized();
        var safeLimit = Math.Clamp(limit, 1, 200);
        return Results.Ok(analyticsEvents.TakeLast(safeLimit).Reverse());
    });
}

static List<Poi> CreateDemoPois() =>
[
    new Poi
    {
        Id = "demo-oc-dao",
        Name = new() { ["vi"] = "Ốc Đào Vĩnh Khánh", ["en"] = "Oc Dao Vinh Khanh" },
        Description = new()
        {
            ["vi"] = "Quán ốc nổi tiếng trên phố Vĩnh Khánh, phù hợp để giới thiệu trải nghiệm ẩm thực đường phố Sài Gòn.",
            ["en"] = "A famous snail restaurant on Vinh Khanh Street, ideal for introducing Saigon street food culture."
        },
        TtsScript = new()
        {
            ["vi"] = "Xin chào! Bạn đang ở gần Ốc Đào Vĩnh Khánh, một địa điểm ẩm thực nổi bật của Quận 4.",
            ["en"] = "Hello! You are near Oc Dao Vinh Khanh, a well-known food stop in District 4."
        },
        Latitude = 10.7559,
        Longitude = 106.6944,
        Radius = 40,
        Priority = 1,
        Category = "seafood",
        Address = "212B Vĩnh Khánh, Quận 4, TP.HCM",
        OpeningHours = "16:00 - 23:00",
        PriceRange = "50.000 - 150.000 VNĐ",
        QrCode = "VK-DEMO-001"
    },
    new Poi
    {
        Id = "demo-lau-bo",
        Name = new() { ["vi"] = "Lẩu Bò Vĩnh Khánh", ["en"] = "Vinh Khanh Beef Hotpot" },
        Description = new()
        {
            ["vi"] = "Điểm ăn tối quen thuộc với món lẩu bò nóng, thích hợp để demo danh mục, bản đồ, QR và thuyết minh tự động.",
            ["en"] = "A familiar dinner stop with hot beef hotpot, useful for demonstrating filters, map, QR and automatic narration."
        },
        TtsScript = new()
        {
            ["vi"] = "Đây là điểm lẩu bò demo trên phố Vĩnh Khánh. Ứng dụng có thể dịch runtime sang ngôn ngữ khách chọn.",
            ["en"] = "This is a demo beef hotpot stop on Vinh Khanh Street. The app can translate this text at runtime."
        },
        Latitude = 10.7570,
        Longitude = 106.6950,
        Radius = 35,
        Priority = 2,
        Category = "hotpot",
        Address = "Vĩnh Khánh, Quận 4, TP.HCM",
        OpeningHours = "17:00 - 22:30",
        PriceRange = "80.000 - 180.000 VNĐ",
        QrCode = "VK-DEMO-002"
    }
];
