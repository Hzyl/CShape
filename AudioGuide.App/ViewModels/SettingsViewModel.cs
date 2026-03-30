// File: AudioGuide.App/ViewModels/SettingsViewModel.cs
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using AudioGuide.App.Helpers;
using AudioGuide.App.Services;
using System.Collections.ObjectModel;

namespace AudioGuide.App.ViewModels
{
    /// <summary>
    /// ViewModel quản lý các cài đặt của ứng dụng
    /// Ngôn ngữ, vị trí yêu thích, general settings
    /// </summary>
    public partial class SettingsViewModel : ObservableObject
    {
        private readonly IAppLanguageService _languageService;
        private readonly IApiService _apiService;

        // ========== Observable Properties ==========
        [ObservableProperty]
        private ObservableCollection<LanguageOption> availableLanguages = new();

        [ObservableProperty]
        private LanguageOption selectedLanguage;

        [ObservableProperty]
        private string appVersion = "1.0.0";

        [ObservableProperty]
        private bool isDebugMode = Constants.IsDebugMode;

        [ObservableProperty]
        private string debugInfo = string.Empty;

        [ObservableProperty]
        private string apiConnectionStatus = "🔴 Chưa kiểm tra";

        [ObservableProperty]
        private string settingsMessage = "Cài đặt";

        [ObservableProperty]
        private bool isLoading = false;

        public SettingsViewModel(IAppLanguageService languageService, IApiService apiService)
        {
            _languageService = languageService;
            _apiService = apiService;

            // Initialize
            InitializeLanguages();

            Constants.DebugLog("⚙️ SettingsViewModel đã được khởi tạo");

            // Subscribe to events
            _languageService.OnLanguageChanged += OnLanguageChanged;

            // Get app version
            AppVersion = AppInfo.Version.ToString();

            // Get debug info
            UpdateDebugInfo();
        }

        // ========== Commands ==========

        /// <summary>
        /// Lệnh đổi ngôn ngữ
        /// </summary>
        [RelayCommand]
        public void ChangeLanguage(LanguageOption language)
        {
            try
            {
                if (language == null) return;

                Constants.DebugLog($"🌍 Đổi ngôn ngữ sang: {language.Code}");
                _languageService.SetLanguage(language.Code);
                SelectedLanguage = language;

                SettingsMessage = $"✅ Đã chuyển sang {language.DisplayName}";
            }
            catch (Exception ex)
            {
                Constants.ErrorLog("❌ Lỗi khi đổi ngôn ngữ", ex);
                SettingsMessage = $"❌ Lỗi: {ex.Message}";
            }
        }

        /// <summary>
        /// Lệnh kiểm tra kết nối API
        /// </summary>
        [RelayCommand]
        public async Task CheckApiConnectionAsync()
        {
            try
            {
                IsLoading = true;
                SettingsMessage = "🔄 Đang kiểm tra kết nối API...";
                ApiConnectionStatus = "🟡 Đang kiểm tra...";

                Constants.DebugLog("🔍 Kiểm tra kết nối API Backend");

                // Gọi health check
                bool isHealthy = await _apiService.HealthCheckAsync();

                if (isHealthy)
                {
                    ApiConnectionStatus = "🟢 Kết nối tốt";
                    SettingsMessage = "✅ Backend API sẵn sàng";
                    Constants.DebugLog("✅ Backend API healthy");
                }
                else
                {
                    ApiConnectionStatus = "🔴 Không kết nối được";
                    SettingsMessage = "❌ Không thể kết nối tới Backend API";
                    Constants.DebugLog("❌ Backend API không respond");
                }
            }
            catch (Exception ex)
            {
                Constants.ErrorLog("❌ Lỗi khi kiểm tra kết nối", ex);
                ApiConnectionStatus = "🔴 Lỗi kết nối";
                SettingsMessage = $"❌ Lỗi: {ex.Message}";
            }
            finally
            {
                IsLoading = false;
            }
        }

        /// <summary>
        /// Lệnh xem thông tin ứng dụng
        /// </summary>
        [RelayCommand]
        public void ShowAbout()
        {
            try
            {
                var aboutMessage = $"""
                    🎧 Audio Guide System v{AppVersion}

                    Senior C# .NET Full-Stack Development
                    MVVM Architecture with CommunityToolkit

                    Công nghệ:
                    • Backend: ASP.NET Core 9, EF Core, SQL Server
                    • Mobile: .NET MAUI, CommunityToolkit.Mvvm
                    • Services: Shiny.NET, ZXing.Net.Maui

                    Đặc điểm:
                    ✅ GPS Geofencing (Shiny.NET)
                    ✅ Audio Queue với Cooldown 5 phút
                    ✅ Quét QR Code (ZXing.Net.Maui)
                    ✅ Đa ngôn ngữ (Vi, En, Jp)
                    ✅ Thuyết minh GPS & Interactive

                    © 2026 Audio Guide. Bảo lưu mọi quyền.
                    """;

                SettingsMessage = aboutMessage;
                Constants.DebugLog("ℹ️ Hiển thị thông tin ứng dụng");
            }
            catch (Exception ex)
            {
                Constants.ErrorLog("❌ Lỗi khi hiển thị About", ex);
            }
        }

        /// <summary>
        /// Lệnh xóa dữ liệu cache
        /// </summary>
        [RelayCommand]
        public async Task ClearCacheAsync()
        {
            try
            {
                IsLoading = true;
                SettingsMessage = "🗑️ Đang xóa cache...";

                // Xóa Preferences (ngoài ngôn ngữ)
                Preferences.Remove(Constants.PreferenceKeyAudioHistory);
                Preferences.Remove(Constants.PreferenceKeyLastLocation);

                await Task.Delay(500); // Simulate delay

                IsLoading = false;
                SettingsMessage = "✅ Đã xóa cache thành công";
                Constants.DebugLog("✅ Xóa cache thành công");
            }
            catch (Exception ex)
            {
                Constants.ErrorLog("❌ Lỗi khi xóa cache", ex);
                SettingsMessage = $"❌ Lỗi: {ex.Message}";
                IsLoading = false;
            }
        }

        /// <summary>
        /// Lệnh mở settings hệ thống
        /// </summary>
        [RelayCommand]
        public async Task OpenSystemSettingsAsync()
        {
            try
            {
                Constants.DebugLog("⚙️ Mở Settings hệ thống");
                await AppInfo.Current.ShowSettingsUI();
            }
            catch (Exception ex)
            {
                Constants.ErrorLog("❌ Lỗi khi mở Settings", ex);
            }
        }

        // ========== Private Methods ==========

        /// <summary>
        /// Khởi tạo danh sách ngôn ngữ
        /// </summary>
        private void InitializeLanguages()
        {
            try
            {
                AvailableLanguages.Clear();
                var languageDictionary = _languageService.GetLanguageDictionary();

                foreach (var (code, displayName) in languageDictionary)
                {
                    AvailableLanguages.Add(new LanguageOption
                    {
                        Code = code,
                        DisplayName = displayName
                    });
                }

                // Đặt ngôn ngữ hiện tại là selected
                var currentLanguage = _languageService.GetCurrentLanguage();
                SelectedLanguage = AvailableLanguages.FirstOrDefault(l => l.Code == currentLanguage)
                    ?? AvailableLanguages.First();

                Constants.DebugLog($"✅ Khởi tạo danh sách ngôn ngữ: {AvailableLanguages.Count}");
            }
            catch (Exception ex)
            {
                Constants.ErrorLog("❌ Lỗi khi khởi tạo ngôn ngữ", ex);
            }
        }

        /// <summary>
        /// Cập nhật thông tin debug
        /// </summary>
        private void UpdateDebugInfo()
        {
            try
            {
                if (!IsDebugMode) return;

                var debugInfo = new System.Text.StringBuilder();
                debugInfo.AppendLine($"Platform: {DeviceInfo.Platform}");
                debugInfo.AppendLine($"OS Version: {DeviceInfo.VersionString}");
                debugInfo.AppendLine($"Device Name: {DeviceInfo.Name}");
                debugInfo.AppendLine($"Device Idiom: {DeviceInfo.Idiom}");
                debugInfo.AppendLine($"API Base URL: {Constants.ApiBaseUrl}");
                debugInfo.AppendLine($"Debug Mode: {Constants.IsDebugMode}");

                DebugInfo = debugInfo.ToString();
            }
            catch (Exception ex)
            {
                Constants.ErrorLog("❌ Lỗi khi cập nhật debug info", ex);
            }
        }

        /// <summary>
        /// Xử lý event khi ngôn ngữ thay đổi từ nơi khác
        /// </summary>
        private void OnLanguageChanged(object? sender, LanguageChangedEventArgs args)
        {
            MainThread.BeginInvokeOnMainThread(() =>
            {
                var newLanguage = AvailableLanguages.FirstOrDefault(l => l.Code == args.NewLanguage);
                if (newLanguage != null)
                {
                    SelectedLanguage = newLanguage;
                }
                Constants.DebugLog($"🌍 SettingsViewModel: Ngôn ngữ đã thay đổi {args.OldLanguage} → {args.NewLanguage}");
            });
        }
    }

    /// <summary>
    /// Model cho tùy chọn ngôn ngữ
    /// </summary>
    public class LanguageOption
    {
        public string Code { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
    }
}
