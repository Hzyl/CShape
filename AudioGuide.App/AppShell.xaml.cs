// File: AudioGuide.App/AppShell.xaml.cs
using AudioGuide.App.Views;
using AudioGuide.App.Helpers;

namespace AudioGuide.App
{
    /// <summary>
    /// AppShell - Định nghĩa routing và bottom navigation cho ứng dụng
    /// </summary>
    public partial class AppShell : Shell
    {
        public AppShell()
        {
            InitializeComponent();
            Constants.DebugLog("🧭 AppShell đã được khởi tạo");

            // Register routing pages
            RegisterRoutes();
        }

        /// <summary>
        /// Đăng ký các routes cho navigation
        /// </summary>
        private void RegisterRoutes()
        {
            // Main pages
            Routing.RegisterRoute(nameof(MapPage), typeof(MapPage));
            Routing.RegisterRoute(nameof(PoiDetailPage), typeof(PoiDetailPage));
            Routing.RegisterRoute(nameof(QrScannerPage), typeof(QrScannerPage));
            Routing.RegisterRoute(nameof(SettingsPage), typeof(SettingsPage));
            Routing.RegisterRoute(nameof(AudioPlayerPage), typeof(AudioPlayerPage));

            Constants.DebugLog("✅ Tất cả routes đã được đăng ký");
        }
    }
}
