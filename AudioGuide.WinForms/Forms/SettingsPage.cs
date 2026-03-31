using AudioGuide.WinForms.Services;
using AudioGuide.WinForms.Helpers;

namespace AudioGuide.WinForms.Forms
{
    /// <summary>
    /// Settings Page - Cấu hình ứng dụng
    /// </summary>
    public class SettingsPage : UserControl
    {
        private readonly IAppLanguageService _languageService;

        // UI Controls
        private Label _titleLabel = new();
        private GroupBox _languageBox = new();
        private RadioButton _viRadio = new();
        private RadioButton _enRadio = new();
        private RadioButton _jpRadio = new();
        private Label _messageLabel = new();

        public SettingsPage(IAppLanguageService languageService)
        {
            _languageService = languageService;

            InitializeComponent();
            SetupControls();

            // Subscribe to language changes
            _languageService.OnLanguageChanged += LanguageService_OnLanguageChanged;

            Constants.DebugLog("⚙️ SettingsPage khởi tạo");
        }

        private void InitializeComponent()
        {
            Dock = DockStyle.Fill;
            AutoScroll = true;
            Padding = new Padding(20);
        }

        private void SetupControls()
        {
            // Title
            _titleLabel.Text = "⚙️ Cài Đặt";
            _titleLabel.Font = new Font(Font.FontFamily, 14, FontStyle.Bold);
            _titleLabel.Dock = DockStyle.Top;
            _titleLabel.Height = 30;
            Controls.Add(_titleLabel);

            // Language Box
            _languageBox.Text = "Ngôn Ngữ";
            _languageBox.Dock = DockStyle.Top;
            _languageBox.Height = 150;
            _languageBox.Padding = new Padding(10);

            // Vietnamese
            _viRadio.Text = "Tiếng Việt (Vietnamese)";
            _viRadio.Location = new Point(10, 20);
            _viRadio.Size = new Size(250, 25);
            _viRadio.CheckedChanged += ViRadio_CheckedChanged;
            _languageBox.Controls.Add(_viRadio);

            // English
            _enRadio.Text = "English";
            _enRadio.Location = new Point(10, 55);
            _enRadio.Size = new Size(250, 25);
            _enRadio.CheckedChanged += EnRadio_CheckedChanged;
            _languageBox.Controls.Add(_enRadio);

            // Japanese
            _jpRadio.Text = "日本語 (Japanese)";
            _jpRadio.Location = new Point(10, 90);
            _jpRadio.Size = new Size(250, 25);
            _jpRadio.CheckedChanged += JpRadio_CheckedChanged;
            _languageBox.Controls.Add(_jpRadio);

            Controls.Add(_languageBox);

            // Message Label
            _messageLabel.Dock = DockStyle.Top;
            _messageLabel.Height = 25;
            _messageLabel.Padding = new Padding(10);
            _messageLabel.ForeColor = Color.Blue;
            Controls.Add(_messageLabel);

            // Load current language
            var currentLanguage = _languageService.GetCurrentLanguage();
            switch (currentLanguage)
            {
                case "en":
                    _enRadio.Checked = true;
                    break;
                case "jp":
                    _jpRadio.Checked = true;
                    break;
                default:
                    _viRadio.Checked = true;
                    break;
            }
        }

        private void ViRadio_CheckedChanged(object? sender, EventArgs e)
        {
            if (_viRadio.Checked)
            {
                _languageService.SetLanguage("vi");
            }
        }

        private void EnRadio_CheckedChanged(object? sender, EventArgs e)
        {
            if (_enRadio.Checked)
            {
                _languageService.SetLanguage("en");
            }
        }

        private void JpRadio_CheckedChanged(object? sender, EventArgs e)
        {
            if (_jpRadio.Checked)
            {
                _languageService.SetLanguage("jp");
            }
        }

        private void LanguageService_OnLanguageChanged(object? sender, LanguageChangedEventArgs e)
        {
            _messageLabel.Text = $"🌍 Ngôn ngữ đã được thay đổi: {e.NewLanguage}";
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                _languageService.OnLanguageChanged -= LanguageService_OnLanguageChanged;
            }
            base.Dispose(disposing);
        }
    }
}
