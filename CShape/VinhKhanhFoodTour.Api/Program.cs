using System.Net;
using System.Net.NetworkInformation;
using System.Net.Sockets;
using MongoDB.Driver;
using VinhKhanhFoodTour.Api.Services;

var builder = WebApplication.CreateBuilder(args);

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

// Thêm timeout settings để không bị treo khi MongoDB không kết nối được
var mongoSettings = MongoClientSettings.FromConnectionString(connectionString);
mongoSettings.ConnectTimeout = TimeSpan.FromSeconds(5);
mongoSettings.ServerSelectionTimeout = TimeSpan.FromSeconds(5);

builder.Services.AddSingleton<IMongoClient>(sp => new MongoClient(mongoSettings));
builder.Services.AddScoped<IMongoDatabase>(sp =>
    sp.GetRequiredService<IMongoClient>().GetDatabase(databaseName));

// Register Services
builder.Services.AddScoped<PoiService>();
builder.Services.AddScoped<TourService>();
builder.Services.AddScoped<AnalyticsService>();
builder.Services.AddScoped<AuthService>();

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

app.MapControllers();

// Seed dữ liệu mẫu chạy nền để demo LAN không bị kẹt nếu MongoDB/mạng chậm.
_ = Task.Run(async () =>
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
        Console.WriteLine("📌 Hãy kiểm tra lại connection string trong appsettings.json");
        Console.WriteLine("📌 Đảm bảo đã thay <db_password> bằng mật khẩu thật!");
        Console.WriteLine("📌 Ứng dụng vẫn chạy; nếu API POI lỗi, kiểm tra MongoDB hoặc dùng dữ liệu cache/offline.");
    }
});

Console.WriteLine();
Console.WriteLine("🍜 Ứng dụng Thuyết Minh Phố Ẩm Thực Vĩnh Khánh đã khởi động!");
Console.WriteLine("📱 User App máy chạy:  http://localhost:5000/index.html");
Console.WriteLine("⚙️  Admin CMS: http://localhost:5000/admin.html");
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
Console.WriteLine("📡 OpenAPI:   http://localhost:5000/openapi/v1.json");
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
