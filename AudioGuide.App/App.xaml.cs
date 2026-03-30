// File: AudioGuide.App/App.xaml.cs
using AudioGuide.App.Views;
using AudioGuide.App.Helpers;

namespace AudioGuide.App
{
    /// <summary>
    /// Main Application class - Khởi tạo App Shell và routing
    /// </summary>
    public partial class App : Application
    {
        public App()
        {
            InitializeComponent();

            Constants.DebugLog("🚀 Ứng dụng Audio Guide đang khởi động");

            MainPage = new AppShell();
        }

        /// <summary>
        /// Xử lý khi ứng dụng được resume từ background
        /// Dùng để cập nhật vị trí, geofence, audio player, v.v.
        /// </summary>
        protected override void OnResumed()
        {
            base.OnResumed();
            Constants.DebugLog("📱 Ứng dụng được resume từ background");
            // TODO: Restart location tracking, audio player, etc.
        }

        /// <summary>
        /// Xử lý khi ứng dụng bị suspend
        /// Dùng để tạm dừng các service tiêu tốn pin
        /// </summary>
        protected override void OnStopped()
        {
            base.OnStopped();
            Constants.DebugLog("📱 Ứng dụng bị suspend");
            // TODO: Pause non-essential services
        }
    }
}
