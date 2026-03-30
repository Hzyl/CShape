// File: AudioGuide.App/MauiProgram.cs
using CommunityToolkit.Maui;
using CommunityToolkit.Mvvm;
using AudioGuide.App.Helpers;
using AudioGuide.App.Services;
using AudioGuide.App.ViewModels;
using AudioGuide.App.Views;

namespace AudioGuide.App
{
    /// <summary>
    /// Cấu hình hệ thống DI (Dependency Injection) cho MAUI Application
    /// </summary>
    public static class MauiProgram
    {
        /// <summary>
        /// Khởi tạo MAUI Application
        /// </summary>
        public static MauiApp CreateMauiApp()
        {
            var builder = MauiApp.CreateBuilder();

            builder
                .UseMauiApp&lt;App&gt;()
                .ConfigureFonts(fonts =&gt;
                {
                    fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
                    fonts.AddFont("OpenSans-SemiBold.ttf", "OpenSansSemiBold");
                })
                // ====== MAUI Community Toolkit ======
                .UseMauiCommunityToolkit()
                .UseMauiCommunityToolkitMediaElement()
                // ====== ZXing.NET MAUI for QR Scanner ======
                .ConfigureZXing()
                // ====== Custom Configuration ======
                .ConfigureDependencyInjection();

#if DEBUG
            builder.Logging.AddDebug();
            Constants.DebugLog("🔧 MAUI App khởi động ở DEBUG mode");
#endif

            return builder.Build();
        }

        /// <summary>
        /// Cấu hình Dependency Injection cho toàn bộ ứng dụng
        /// </summary>
        private static MauiAppBuilder ConfigureDependencyInjection(this MauiAppBuilder builder)
        {
            // ========== Services ==========
            // HTTP Client Factory
            builder.Services.AddSingleton&lt;HttpClient&gt;(provider =&gt;
            {
                var httpClient = new HttpClient(new HttpClientHandler
                {
                    // Android emulator may need special handling
                    ServerCertificateCustomValidationCallback = (message, cert, chain, errors) =&gt;
                    {
#if DEBUG
                        // Cho phép cert không hợp lệ ở DEBUG
                        return true;
#else
                        // Production: validate properly
                        return errors == System.Net.Security.SslPolicyErrors.None;
#endif
                    }
                })
                {
                    BaseAddress = new Uri(Constants.ApiBaseUrl),
                    Timeout = TimeSpan.FromMilliseconds(Constants.HttpRequestTimeoutMs)
                };

                return httpClient;
            });

            // API Service
            builder.Services.AddSingleton&lt;IApiService, ApiService&gt;();

            // Geofence Service
            builder.Services.AddSingleton&lt;IGeofenceService, GeofenceService&gt;();

            // Audio Queue Service
            builder.Services.AddSingleton&lt;IAudioQueueService, AudioQueueService&gt;();

            // App Language Service
            builder.Services.AddSingleton&lt;IAppLanguageService, AppLanguageService&gt;();

            // QR Scanner Service
            builder.Services.AddSingleton&lt;IQrScannerService, QrScannerService&gt;();

            // ========== ViewModels ==========
            builder.Services.AddSingleton&lt;MapViewModel&gt;();
            builder.Services.AddSingleton&lt;PoiDetailViewModel&gt;();
            builder.Services.AddSingleton&lt;QrScannerViewModel&gt;();
            builder.Services.AddSingleton&lt;SettingsViewModel&gt;();
            builder.Services.AddSingleton&lt;AudioPlayerViewModel&gt;();

            // ========== Views ==========
            builder.Services.AddSingleton&lt;MapPage&gt;();
            builder.Services.AddSingleton&lt;PoiDetailPage&gt;();
            builder.Services.AddSingleton&lt;QrScannerPage&gt;();
            builder.Services.AddSingleton&lt;SettingsPage&gt;();
            builder.Services.AddSingleton&lt;AudioPlayerPage&gt;();

            Constants.DebugLog("✅ Dependency Injection đã được cấu hình");

            return builder;
        }
    }
}
