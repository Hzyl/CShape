using Microsoft.Extensions.DependencyInjection;
using AudioGuide.WinForms.Forms;
using AudioGuide.WinForms.Services;
using AudioGuide.WinForms.Helpers;

namespace AudioGuide.WinForms;

static class Program
{
    private static ServiceProvider? _serviceProvider;

    /// <summary>
    ///  The main entry point for the application.
    /// </summary>
    [STAThread]
    static void Main()
    {
        try
        {
            // Initialize logging first
            LoggingHelper.ConfigureLogger();

            // To customize application configuration such as set high DPI settings or default font,
            // see https://aka.ms/applicationconfiguration.
            ApplicationConfiguration.Initialize();

            // Configure DI
            var services = new ServiceCollection();
            ConfigureServices(services);
            _serviceProvider = services.BuildServiceProvider();

            // Initialize localization
            var languageService = _serviceProvider.GetRequiredService<IAppLanguageService>();
            LocalizationHelper.Initialize(languageService.GetCurrentLanguage());

            // Get main form and run
            var mainForm = _serviceProvider.GetRequiredService<MainForm>();
            Application.Run(mainForm);
        }
        catch (Exception ex)
        {
            Constants.ErrorLog("❌ Ứng dụng gặp lỗi không thể khôi phục", ex);
            MessageBox.Show(
                $"Ứng dụng gặp lỗi: {ex.Message}",
                "Lỗi Ứng Dụng",
                MessageBoxButtons.OK,
                MessageBoxIcon.Error
            );
        }
        finally
        {
            // Shutdown logging
            LoggingHelper.Shutdown();
        }
    }

    /// <summary>
    /// Cấu hình Dependency Injection
    /// </summary>
    static void ConfigureServices(IServiceCollection services)
    {
        // Configure HttpClient
        services.AddHttpClient<IApiService, ApiService>(client =>
        {
            client.BaseAddress = new Uri(Constants.ApiBaseUrl);
            client.Timeout = TimeSpan.FromMilliseconds(Constants.HttpRequestTimeoutMs);
        });

        // Register Services
        services.AddSingleton<IAppLanguageService, AppLanguageService>();
        services.AddSingleton<IAudioQueueService, AudioQueueService>();
        services.AddSingleton<IGeofenceService, GeofenceService>();
        services.AddSingleton<IQrScannerService, QrScannerService>();
        services.AddSingleton<IMockGpsService, MockGpsService>();

        // Register Forms
        services.AddSingleton<MainForm>();
    }
}