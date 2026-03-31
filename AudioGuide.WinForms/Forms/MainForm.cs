using AudioGuide.WinForms.Services;
using AudioGuide.WinForms.Helpers;

namespace AudioGuide.WinForms.Forms
{
    public class MainForm : Form
    {
        private readonly IApiService _apiService;
        private readonly IAudioQueueService _audioQueueService;
        private readonly IAppLanguageService _languageService;
        private readonly IGeofenceService _geofenceService;
        private readonly IMockGpsService _mockGpsService;

        private MapPage? _mapPage;
        private AudioPlayerPage? _playerPage;
        private QrScannerPage? _qrPage;
        private SettingsPage? _settingsPage;

        public MainForm(IApiService apiService, IAudioQueueService audioQueueService, IAppLanguageService languageService, IGeofenceService geofenceService, IMockGpsService mockGpsService)
        {
            _apiService = apiService;
            _audioQueueService = audioQueueService;
            _languageService = languageService;
            _geofenceService = geofenceService;
            _mockGpsService = mockGpsService;

            SetupUI();
        }

        private void SetupUI()
        {
            // Main Form settings
            Text = "Audio Guide - Hướng dẫn Du lịch Đa Phương Tiện";
            Width = 1024;
            Height = 768;
            StartPosition = FormStartPosition.CenterScreen;

            // Try to load application icon
            try
            {
                var iconPath = Path.Combine(AppContext.BaseDirectory, "Resources", "app_icon.ico");
                if (File.Exists(iconPath))
                {
                    Icon = new Icon(iconPath);
                    Constants.DebugLog("📁 Tải biểu tượng ứng dụng thành công");
                }
                else
                {
                    Constants.DebugLog("⚠️ Tệp biểu tượng không tìm thấy: " + iconPath);
                }
            }
            catch (Exception ex)
            {
                Constants.ErrorLog("❌ Lỗi khi tải biểu tượng ứng dụng", ex);
            }

            // Create TabControl
            var tabControl = new TabControl
            {
                Dock = DockStyle.Fill,
                Padding = new Point(5, 5)
            };

            // Create tabs
            var mapTab = new TabPage
            {
                Text = "🗺️ Bản Đồ",
                Name = "MapTab"
            };

            var playerTab = new TabPage
            {
                Text = "🎵 Phát Nhạc",
                Name = "PlayerTab"
            };

            var qrTab = new TabPage
            {
                Text = "📱 Quét QR",
                Name = "QrTab"
            };

            var settingsTab = new TabPage
            {
                Text = "⚙️ Cài Đặt",
                Name = "SettingsTab"
            };

            // Create page instances
            _mapPage = new MapPage(_apiService, _audioQueueService, _languageService, _geofenceService, _mockGpsService);
            _mapPage.Dock = DockStyle.Fill;
            mapTab.Controls.Add(_mapPage);

            _playerPage = new AudioPlayerPage(_audioQueueService, _languageService);
            _playerPage.Dock = DockStyle.Fill;
            playerTab.Controls.Add(_playerPage);

            _qrPage = new QrScannerPage(_apiService, _languageService);
            _qrPage.Dock = DockStyle.Fill;
            qrTab.Controls.Add(_qrPage);

            _settingsPage = new SettingsPage(_languageService);
            _settingsPage.Dock = DockStyle.Fill;
            settingsTab.Controls.Add(_settingsPage);

            // Add tabs to tab control
            tabControl.TabPages.Add(mapTab);
            tabControl.TabPages.Add(playerTab);
            tabControl.TabPages.Add(qrTab);
            tabControl.TabPages.Add(settingsTab);

            // Add tab control to form
            Controls.Add(tabControl);

            // Set form events
            FormClosing += MainForm_FormClosing;
        }

        private void MainForm_FormClosing(object? sender, FormClosingEventArgs e)
        {
            // Cleanup
            _mapPage?.Dispose();
            _playerPage?.Dispose();
            _qrPage?.Dispose();
            _settingsPage?.Dispose();
        }
    }
}
