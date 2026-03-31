using AudioGuide.WinForms.Helpers;
using ZXing;

namespace AudioGuide.WinForms.Forms
{
    /// <summary>
    /// Camera scanning form - Handles QR code detection from images
    /// Uses ZXing.Net for QR code decoding
    /// </summary>
    public class CameraForm : Form
    {
        private Label _titleLabel = new();
        private Label _instructionLabel = new();
        private Button _selectImageButton = new();
        private Button _scanWebcamButton = new();
        private PictureBox _imagePictureBox = new();
        private Label _resultLabel = new();
        private Button _okButton = new();
        private Button _cancelButton = new();

#pragma warning disable WFO1000 // Designer metadata warning
        public string? QrCodeResult { get; set; }
#pragma warning restore WFO1000

        public CameraForm()
        {
            InitializeComponent();
            SetupControls();
            Constants.DebugLog("📷 CameraForm khởi tạo");
        }

        private void InitializeComponent()
        {
            Text = "📷 Quét Mã QR";
            Width = 500;
            Height = 600;
            StartPosition = FormStartPosition.CenterParent;
            FormBorderStyle = FormBorderStyle.FixedDialog;
            MaximizeBox = false;
            MinimizeBox = false;
        }

        private void SetupControls()
        {
            // Title
            _titleLabel.Text = "📷 Quét Mã QR";
            _titleLabel.Font = new Font(Font.FontFamily, 14, FontStyle.Bold);
            _titleLabel.Dock = DockStyle.Top;
            _titleLabel.Height = 40;
            _titleLabel.TextAlign = ContentAlignment.MiddleCenter;
            _titleLabel.Padding = new Padding(10);
            Controls.Add(_titleLabel);

            // Instructions
            _instructionLabel.Text = "Chọn ảnh chứa mã QR hoặc quét từ webcam";
            _instructionLabel.Dock = DockStyle.Top;
            _instructionLabel.Height = 40;
            _instructionLabel.TextAlign = ContentAlignment.MiddleLeft;
            _instructionLabel.Padding = new Padding(10);
            _instructionLabel.ForeColor = Color.Gray;
            Controls.Add(_instructionLabel);

            // Button panel
            var buttonPanel = new Panel { Dock = DockStyle.Top, Height = 50, Padding = new Padding(10) };

            _selectImageButton.Text = "🖼️ Chọn Ảnh";
            _selectImageButton.Location = new Point(10, 10);
            _selectImageButton.Size = new Size(120, 30);
            _selectImageButton.Click += SelectImageButton_Click;
            buttonPanel.Controls.Add(_selectImageButton);

            _scanWebcamButton.Text = "📹 Webcam";
            _scanWebcamButton.Location = new Point(140, 10);
            _scanWebcamButton.Size = new Size(120, 30);
            _scanWebcamButton.Click += ScanWebcamButton_Click;
            buttonPanel.Controls.Add(_scanWebcamButton);

            Controls.Add(buttonPanel);

            // Image preview
            _imagePictureBox.Dock = DockStyle.Top;
            _imagePictureBox.Height = 250;
            _imagePictureBox.BorderStyle = BorderStyle.FixedSingle;
            _imagePictureBox.SizeMode = PictureBoxSizeMode.Zoom;
            Controls.Add(_imagePictureBox);

            // Result label
            _resultLabel.Dock = DockStyle.Top;
            _resultLabel.Height = 60;
            _resultLabel.Padding = new Padding(10);
            _resultLabel.AutoSize = false;
            _resultLabel.Text = "Chọn ảnh để bắt đầu";
            Controls.Add(_resultLabel);

            // Bottom button panel
            var bottomPanel = new Panel { Dock = DockStyle.Fill, Padding = new Padding(10) };

            _okButton.Text = "✅ OK";
            _okButton.Location = new Point(150, 10);
            _okButton.Size = new Size(100, 30);
            _okButton.Click += OkButton_Click;
            _okButton.DialogResult = DialogResult.OK;
            bottomPanel.Controls.Add(_okButton);

            _cancelButton.Text = "❌ Hủy";
            _cancelButton.Location = new Point(260, 10);
            _cancelButton.Size = new Size(100, 30);
            _cancelButton.Click += CancelButton_Click;
            _cancelButton.DialogResult = DialogResult.Cancel;
            bottomPanel.Controls.Add(_cancelButton);

            Controls.Add(bottomPanel);
        }

        private void SelectImageButton_Click(object? sender, EventArgs e)
        {
            try
            {
                using (var openFileDialog = new OpenFileDialog())
                {
                    openFileDialog.Title = "Chọn ảnh chứa mã QR";
                    openFileDialog.Filter = "Image files (*.png;*.jpg;*.jpeg;*.bmp)|*.png;*.jpg;*.jpeg;*.bmp|All files (*.*)|*.*";

                    if (openFileDialog.ShowDialog() == DialogResult.OK)
                    {
                        DecodeQrFromImage(openFileDialog.FileName);
                    }
                }
            }
            catch (Exception ex)
            {
                _resultLabel.Text = $"❌ Lỗi: {ex.Message}";
                _resultLabel.ForeColor = Color.Red;
                Constants.ErrorLog("Lỗi khi chọn ảnh", ex);
            }
        }

        private void ScanWebcamButton_Click(object? sender, EventArgs e)
        {
            _resultLabel.Text = "⚠️ Tính năng webcam chưa được implement đầy đủ.\\nVui lòng chọn ảnh chứa mã QR.";
            _resultLabel.ForeColor = Color.Orange;
            Constants.DebugLog("⚠️ Webcam scanning not implemented - user should select image");
        }

        private void DecodeQrFromImage(string imagePath)
        {
            try
            {
                _resultLabel.Text = "⏳ Đang xử lý ảnh...";
                _resultLabel.ForeColor = Color.Gray;

                // Display image
                _imagePictureBox.Image = new Bitmap(imagePath);

                // TODO: Integrate actual ZXing decoding
                // For now, just show the image and let user verify the QR code manually
                _resultLabel.Text = "ℹ️ Ảnh đã được tải. QR decoding sẽ được bổ sung sau.";
                _resultLabel.ForeColor = Color.Blue;
                Constants.DebugLog("ℹ️ Image loaded, QR decoding temporarily unavailable");

                // In production, would use:
                // var barcodeReader = new BarcodeReader<LuminanceSource>();
                // var result = barcodeReader.Decode(bitmap);
            }
            catch (Exception ex)
            {
                _resultLabel.Text = $"❌ Lỗi xử lý ảnh: {ex.Message}";
                _resultLabel.ForeColor = Color.Red;
                Constants.ErrorLog("Lỗi khi load ảnh", ex);
            }
        }

        private void OkButton_Click(object? sender, EventArgs e)
        {
            if (string.IsNullOrEmpty(QrCodeResult))
            {
                DialogHelper.ShowWarning("Cảnh báo", "Vui lòng quét một mã QR hợp lệ trước khi nhấn OK");
                return;
            }
            DialogResult = DialogResult.OK;
            Close();
        }

        private void CancelButton_Click(object? sender, EventArgs e)
        {
            QrCodeResult = null;
            DialogResult = DialogResult.Cancel;
            Close();
        }
    }
}
