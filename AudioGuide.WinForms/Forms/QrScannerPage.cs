using AudioGuide.WinForms.Services;
using AudioGuide.WinForms.Helpers;

namespace AudioGuide.WinForms.Forms
{
    /// <summary>
    /// QR Scanner Page - Quét mã QR để tìm POI
    /// </summary>
    public class QrScannerPage : UserControl
    {
        private readonly IApiService _apiService;
        private readonly IAppLanguageService _languageService;
        private readonly IQrScannerService _qrScannerService;

        // UI Controls
        private Label _titleLabel = new();
        private Button _scanButton = new();
        private TextBox _qrInputTextBox = new();
        private Button _searchButton = new();
        private Label _resultLabel = new();
        private RichTextBox _detailRichTextBox = new();

        public QrScannerPage(IApiService apiService, IAppLanguageService languageService, IQrScannerService qrScannerService)
        {
            _apiService = apiService;
            _languageService = languageService;
            _qrScannerService = qrScannerService;

            InitializeComponent();
            SetupControls();

            Constants.DebugLog("📱 QrScannerPage khởi tạo");
        }

        private void InitializeComponent()
        {
            Dock = DockStyle.Fill;
            AutoScroll = true;
        }

        private void SetupControls()
        {
            // Title
            _titleLabel.Text = "📱 Quét Mã QR";
            _titleLabel.Font = new Font(Font.FontFamily, 14, FontStyle.Bold);
            _titleLabel.Dock = DockStyle.Top;
            _titleLabel.Height = 30;
            _titleLabel.Padding = new Padding(10);
            Controls.Add(_titleLabel);

            // Scan Panel
            var scanPanel = new GroupBox { Text = "Quét QR Code" };
            scanPanel.Dock = DockStyle.Top;
            scanPanel.Height = 80;
            scanPanel.Padding = new Padding(10);

            _scanButton.Text = "📷 Quét Từ Camera";
            _scanButton.Location = new Point(10, 20);
            _scanButton.Size = new Size(150, 35);
            _scanButton.Click += ScanButton_Click;
            scanPanel.Controls.Add(_scanButton);

            var manualLabel = new Label { Text = "Hoặc nhập mã QR:" };
            manualLabel.Location = new Point(10, 60);
            manualLabel.Size = new Size(100, 20);
            scanPanel.Controls.Add(manualLabel);

            Controls.Add(scanPanel);

            // Input Panel
            var inputPanel = new Panel { Dock = DockStyle.Top, Height = 50, Padding = new Padding(10) };

            _qrInputTextBox.Location = new Point(10, 10);
            _qrInputTextBox.Size = new Size(300, 20);
            _qrInputTextBox.PlaceholderText = "Nhập mã QR hoặc hash...";
            inputPanel.Controls.Add(_qrInputTextBox);

            _searchButton.Text = "🔍 Tìm";
            _searchButton.Location = new Point(320, 8);
            _searchButton.Size = new Size(80, 25);
            _searchButton.Click += SearchButton_Click;
            inputPanel.Controls.Add(_searchButton);

            Controls.Add(inputPanel);

            // Result Label
            _resultLabel.Dock = DockStyle.Top;
            _resultLabel.Height = 25;
            _resultLabel.Padding = new Padding(10);
            Controls.Add(_resultLabel);

            // Detail RichTextBox
            _detailRichTextBox.Dock = DockStyle.Fill;
            _detailRichTextBox.ReadOnly = true;
            Controls.Add(_detailRichTextBox);
        }

        private async void ScanButton_Click(object? sender, EventArgs e)
        {
            try
            {
                _resultLabel.Text = "⏳ Mở camera scanning...";
                _resultLabel.ForeColor = Color.Gray;

                var qrCode = await _qrScannerService.ScanQrCodeAsync();

                if (qrCode != null)
                {
                    _qrInputTextBox.Text = qrCode;
                    _resultLabel.Text = $"✅ Mã QR quét được: {qrCode}";
                    _resultLabel.ForeColor = Color.Green;

                    // Tự động tìm kiếm
                    SearchButton_Click(sender, e);
                }
                else
                {
                    _resultLabel.Text = "❌ Quét bị hủy hoặc không thành công";
                    _resultLabel.ForeColor = Color.Red;
                }
            }
            catch (Exception ex)
            {
                _resultLabel.Text = $"❌ Lỗi: {ex.Message}";
                _resultLabel.ForeColor = Color.Red;
                Constants.ErrorLog("Lỗi khi quét QR", ex);
                DialogHelper.ShowError("Lỗi Quét QR", $"Không thể quét QR code: {ex.Message}", ex);
            }
        }

        private async void SearchButton_Click(object? sender, EventArgs e)
        {
            try
            {
                var qrHash = _qrInputTextBox.Text.Trim();
                if (string.IsNullOrEmpty(qrHash))
                {
                    _resultLabel.Text = "❌ Vui lòng nhập mã QR";
                    _resultLabel.ForeColor = Color.Red;
                    return;
                }

                _resultLabel.Text = "⏳ Đang tìm kiếm...";
                _resultLabel.ForeColor = Color.Gray;

                var language = _languageService.GetCurrentLanguage();
                var response = await _apiService.GetPoiByQrCodeAsync(qrHash, language);

                if (response.Success && response.Data != null)
                {
                    _resultLabel.Text = $"✅ Tìm thấy: {response.Data.Name}";
                    _resultLabel.ForeColor = Color.Green;

                    _detailRichTextBox.Clear();
                    _detailRichTextBox.AppendText($"Tên: {response.Data.Name}\n\n");
                    _detailRichTextBox.AppendText($"Vị trí: {response.Data.Latitude:F6}, {response.Data.Longitude:F6}\n\n");
                    _detailRichTextBox.AppendText($"Ngôn ngữ: {response.Data.LanguageCode}\n\n");
                    _detailRichTextBox.AppendText($"Thuyết minh:\n{response.Data.TextDescription}\n\n");
                    if (response.Data.DurationInSeconds.HasValue)
                    {
                        _detailRichTextBox.AppendText($"Thời lượng: {response.Data.DurationInSeconds} giây\n");
                    }
                    if (!string.IsNullOrEmpty(response.Data.LanguageFallbackNote))
                    {
                        _detailRichTextBox.AppendText($"\n⚠️ {response.Data.LanguageFallbackNote}\n");
                    }
                }
                else
                {
                    _resultLabel.Text = $"❌ {response.Message}";
                    _resultLabel.ForeColor = Color.Red;
                    _detailRichTextBox.Clear();
                }
            }
            catch (Exception ex)
            {
                _resultLabel.Text = $"❌ Lỗi: {ex.Message}";
                _resultLabel.ForeColor = Color.Red;
                Constants.ErrorLog("Lỗi khi tìm QR", ex);
            }
        }
    }
}
