using MongoDB.Driver;
using VinhKhanhFoodTour.Api.Services;

var builder = WebApplication.CreateBuilder(args);

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

app.MapControllers();

// Seed dữ liệu mẫu khi khởi động (với timeout)
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
    Console.WriteLine("📌 Ứng dụng vẫn chạy, frontend sẽ hiển thị nhưng API sẽ trả lỗi 500.");
}

Console.WriteLine();
Console.WriteLine("🍜 Ứng dụng Thuyết Minh Phố Ẩm Thực Vĩnh Khánh đã khởi động!");
Console.WriteLine("📱 User App:  http://localhost:5000");
Console.WriteLine("⚙️  Admin CMS: http://localhost:5000/admin.html");
Console.WriteLine("📡 OpenAPI:   http://localhost:5000/openapi/v1.json");
Console.WriteLine();

app.Run();
