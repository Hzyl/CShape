// File: AudioGuide.Api/Program.cs
using Microsoft.EntityFrameworkCore;
using AudioGuide.Api.Data;
using AudioGuide.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();

// Cấu hình Entity Framework Core với SQL Server
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString, sqlOptions =>
    {
        sqlOptions.MigrationsAssembly("AudioGuide.Api");
        sqlOptions.CommandTimeout(30);
    }));

// Đăng ký các Service
builder.Services.AddScoped<IPoiService, PoiService>();

// Cấu hình CORS để cho phép request từ mobile app (Android 10.0.2.2)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });

    options.AddPolicy("AllowMobileApps", policy =>
    {
        var allowedOrigins = builder.Configuration.GetSection("AppSettings:AllowedOrigins").Get<string[]>();
        if (allowedOrigins != null)
        {
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        }
        else
        {
            policy.AllowAnyOrigin()
                  .AllowAnyMethod()
                  .AllowAnyHeader();
        }
    });
});

// Thêm Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
    {
        Title = "Audio Guide API",
        Version = "v1",
        Description = "API cho hệ thống thuyết minh du lịch đa ngôn ngữ với GPS & QR Code"
    });
});

// Thêm Logging
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

var app = builder.Build();

// Auto-migrate database on startup
using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    try
    {
        Console.WriteLine("🔄 Đang kiểm tra và cập nhật database...");
        dbContext.Database.Migrate();
        Console.WriteLine("✅ Database đã sẵn sàng");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"❌ Lỗi khi cập nhật database: {ex.Message}");
    }
}

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(options =>
    {
        options.SwaggerEndpoint("/swagger/v1/swagger.json", "Audio Guide API v1");
        options.RoutePrefix = string.Empty; // Swagger ở root path
    });
}

app.UseHttpsRedirection();

// Sử dụng CORS
app.UseCors("AllowMobileApps");

app.UseAuthorization();

app.MapControllers();

Console.WriteLine("🎧 ========================================");
Console.WriteLine("   Audio Guide API - Khởi động");
Console.WriteLine("🎧 ========================================");
Console.WriteLine($"📍 Base URL: http://localhost:5000");
Console.WriteLine($"📚 Swagger: http://localhost:5000/swagger");
Console.WriteLine("🎧 ========================================");

app.Run();
