using AudioGuide.WinForms.Models;
using AudioGuide.WinForms.Helpers;

namespace AudioGuide.WinForms.Forms
{
    /// <summary>
    /// POI Detail Form - Displays detailed information about a Point of Interest
    /// Shows images, description, and metadata
    /// </summary>
    public class PoiDetailForm : Form
    {
        private PictureBox _imagePictureBox = new();
        private Label _nameLabel = new();
        private RichTextBox _descriptionRichTextBox = new();
        private Label _coordinatesLabel = new();
        private Label _languageLabel = new();
        private Label _durationLabel = new();
        private Button _playAudioButton = new();
        private Button _closeButton = new();

        private readonly PoiMapDto _poi;
        private readonly Action<PoiMapDto>? _onPlayAudio;

        public PoiDetailForm(PoiMapDto poi, Action<PoiMapDto>? onPlayAudio = null)
        {
            _poi = poi;
            _onPlayAudio = onPlayAudio;
            InitializeComponent();
            SetupControls();
            LoadPoiData();
            Constants.DebugLog($"📍 PoiDetailForm khởi tạo cho POI: {poi.Name}");
        }

        private void InitializeComponent()
        {
            Text = "📍 Chi Tiết POI";
            Width = 600;
            Height = 700;
            StartPosition = FormStartPosition.CenterParent;
            FormBorderStyle = FormBorderStyle.FixedDialog;
            MaximizeBox = false;
            MinimizeBox = false;
        }

        private void SetupControls()
        {
            // Title/Name
            _nameLabel.Font = new Font(Font.FontFamily, 14, FontStyle.Bold);
            _nameLabel.Dock = DockStyle.Top;
            _nameLabel.Height = 35;
            _nameLabel.Padding = new Padding(10);
            Controls.Add(_nameLabel);

            // Image
            _imagePictureBox.Dock = DockStyle.Top;
            _imagePictureBox.Height = 250;
            _imagePictureBox.SizeMode = PictureBoxSizeMode.Zoom;
            _imagePictureBox.BorderStyle = BorderStyle.FixedSingle;
            _imagePictureBox.BackColor = Color.LightGray;
            Controls.Add(_imagePictureBox);

            // Metadata Panel
            var metadataPanel = new Panel { Dock = DockStyle.Top, Height = 80, Padding = new Padding(10) };

            _coordinatesLabel.Text = "📍 Tọa độ: 0, 0";
            _coordinatesLabel.Location = new Point(10, 10);
            _coordinatesLabel.Size = new Size(300, 20);
            metadataPanel.Controls.Add(_coordinatesLabel);

            _languageLabel.Text = "🗣️ Ngôn ngữ: VI";
            _languageLabel.Location = new Point(10, 35);
            _languageLabel.Size = new Size(300, 20);
            metadataPanel.Controls.Add(_languageLabel);

            _durationLabel.Text = "⏱️ Thời lượng: -";
            _durationLabel.Location = new Point(10, 60);
            _durationLabel.Size = new Size(300, 20);
            metadataPanel.Controls.Add(_durationLabel);

            Controls.Add(metadataPanel);

            // Description
            var descLabel = new Label
            {
                Text = "📝 Mô tả:",
                Font = new Font(Font.FontFamily, 10, FontStyle.Bold),
                Dock = DockStyle.Top,
                Height = 25,
                Padding = new Padding(10)
            };
            Controls.Add(descLabel);

            _descriptionRichTextBox.Dock = DockStyle.Fill;
            _descriptionRichTextBox.ReadOnly = true;
            _descriptionRichTextBox.BorderStyle = BorderStyle.FixedSingle;
            Controls.Add(_descriptionRichTextBox);

            // Button Panel
            var buttonPanel = new Panel { Dock = DockStyle.Bottom, Height = 50, Padding = new Padding(10) };

            _playAudioButton.Text = "🎵 Phát Audio";
            _playAudioButton.Location = new Point(10, 10);
            _playAudioButton.Size = new Size(120, 30);
            _playAudioButton.Click += PlayAudioButton_Click;
            buttonPanel.Controls.Add(_playAudioButton);

            _closeButton.Text = "❌ Đóng";
            _closeButton.Location = new Point(460, 10);
            _closeButton.Size = new Size(100, 30);
            _closeButton.Click += CloseButton_Click;
            buttonPanel.Controls.Add(_closeButton);

            Controls.Add(buttonPanel);
        }

        private void LoadPoiData()
        {
            try
            {
                // Name
                _nameLabel.Text = _poi.Name;

                // Coordinates
                _coordinatesLabel.Text = $"📍 Tọa độ: {_poi.Latitude:F6}, {_poi.Longitude:F6}";

                // Language - show available language count
                _languageLabel.Text = $"🗣️ Ngôn ngữ: {_poi.AvailableLanguagesCount} ngôn ngữ";

                // Metadata
                _durationLabel.Text = $"📊 Ưu tiên: {_poi.Priority} | Bán kính: {_poi.TriggerRadius}m";

                // Description - use POI metadata since TextDescription not available in map DTO
                _descriptionRichTextBox.Clear();
                _descriptionRichTextBox.AppendText($"POI: {_poi.Name}\n\n");
                _descriptionRichTextBox.AppendText($"📊 Ưu tiên: {_poi.Priority}\n");
                _descriptionRichTextBox.AppendText($"⭕ Bán kính kích hoạt: {_poi.TriggerRadius}m\n");
                _descriptionRichTextBox.AppendText($"🗣️ Ngôn ngữ hỗ trợ: {_poi.AvailableLanguagesCount}\n");

                // Image - try to load from URL
                LoadImageFromUrl(_poi.ImageUrl);

                // Distance info
                if (_poi.DistanceInMeters.HasValue)
                {
                    var distanceText = _poi.DistanceInMeters < 1000
                        ? $"{_poi.DistanceInMeters:F0}m"
                        : $"{_poi.DistanceInMeters / 1000.0:F1}km";
                    _descriptionRichTextBox.AppendText($"\n📍 Khoảng cách: {distanceText}");
                }

                Constants.DebugLog($"✅ POI data loaded: {_poi.Name}");
            }
            catch (Exception ex)
            {
                Constants.ErrorLog("Lỗi khi tải dữ liệu POI", ex);
                _descriptionRichTextBox.Text = $"❌ Lỗi tải dữ liệu: {ex.Message}";
            }
        }

        private void LoadImageFromUrl(string? imageUrl)
        {
            if (string.IsNullOrEmpty(imageUrl))
            {
                _imagePictureBox.Image = null;
                Constants.DebugLog("⚠️ Không có URL ảnh");
                return;
            }

            try
            {
                using (var client = new System.Net.WebClient())
                {
                    var imageData = client.DownloadData(imageUrl);
                    using (var ms = new System.IO.MemoryStream(imageData))
                    {
                        _imagePictureBox.Image = System.Drawing.Image.FromStream(ms);
                        Constants.DebugLog($"✅ Ảnh tải thành công: {imageUrl}");
                    }
                }
            }
            catch (Exception ex)
            {
                Constants.DebugLog($"⚠️ Không thể tải ảnh từ {imageUrl}: {ex.Message}");
                // Show placeholder or skip image
                _imagePictureBox.Image = null;
            }
        }

        private void PlayAudioButton_Click(object? sender, EventArgs e)
        {
            try
            {
                _onPlayAudio?.Invoke(_poi);
                DialogResult = DialogResult.OK;
                Close();
            }
            catch (Exception ex)
            {
                Constants.ErrorLog("Lỗi khi phát audio", ex);
                DialogHelper.ShowError("Lỗi", $"Không thể phát audio: {ex.Message}", ex);
            }
        }

        private void CloseButton_Click(object? sender, EventArgs e)
        {
            DialogResult = DialogResult.Cancel;
            Close();
        }
    }
}
