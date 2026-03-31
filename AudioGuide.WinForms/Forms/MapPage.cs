using AudioGuide.WinForms.Services;
using AudioGuide.WinForms.Models;
using AudioGuide.WinForms.Helpers;

namespace AudioGuide.WinForms.Forms
{
    /// <summary>
    /// Map Page - Hiển thị danh sách POI gần vị trí
    /// </summary>
    public class MapPage : UserControl
    {
        private readonly IApiService _apiService;
        private readonly IAudioQueueService _audioQueueService;
        private readonly IAppLanguageService _languageService;
        private readonly IGeofenceService _geofenceService;
        private readonly IMockGpsService _mockGpsService;

        private decimal _userLatitude = 0;
        private decimal _userLongitude = 0;
        private int _searchRadius = Constants.DefaultSearchRadiusMeters;

        // UI Controls
        private Label _titleLabel = new();
        private GroupBox _gpsBox = new();
        private Label _latitudeLabel = new();
        private TextBox _latitudeTextBox = new();
        private Label _longitudeLabel = new();
        private TextBox _longitudeTextBox = new();
        private Button _setLocationButton = new();
        private GroupBox _searchBox = new();
        private Label _radiusLabel = new();
        private TrackBar _radiusSlider = new();
        private Label _radiusValueLabel = new();
        private Button _searchButton = new();
        private Button _refreshButton = new();
        private Button _startGeofencingButton = new();
        private Label _statusLabel = new();
        private DataGridView _poiGrid = new();
        private Label _messageLabel = new();

        public MapPage(IApiService apiService, IAudioQueueService audioQueueService, IAppLanguageService languageService, IGeofenceService geofenceService, IMockGpsService mockGpsService)
        {
            _apiService = apiService;
            _audioQueueService = audioQueueService;
            _languageService = languageService;
            _geofenceService = geofenceService;
            _mockGpsService = mockGpsService;

            InitializeComponent();
            SetupControls();

            // Initialize location from mock service
            var (lat, lng) = _mockGpsService.GetCurrentLocation();
            UpdateUserLocation(lat, lng);

            Constants.DebugLog("🗺️ MapPage khởi tạo");
        }

        private void InitializeComponent()
        {
            Dock = DockStyle.Fill;
            AutoScroll = true;
        }

        private void SetupControls()
        {
            // Title
            _titleLabel.Text = "🗺️ Bản Đồ - Tìm POI Gần Vị Trí";
            _titleLabel.Font = new Font(Font.FontFamily, 14, FontStyle.Bold);
            _titleLabel.Dock = DockStyle.Top;
            _titleLabel.Height = 30;
            _titleLabel.Padding = new Padding(10);
            Controls.Add(_titleLabel);

            // GPS Input Box
            _gpsBox.Text = "📍 GPS Mock - Nhập Tọa Độ";
            _gpsBox.Dock = DockStyle.Top;
            _gpsBox.Height = 100;
            _gpsBox.Padding = new Padding(10);

            // Latitude Label and TextBox
            _latitudeLabel.Text = "Vĩ độ (Latitude):";
            _latitudeLabel.Location = new Point(10, 20);
            _latitudeLabel.Size = new Size(120, 20);
            _gpsBox.Controls.Add(_latitudeLabel);

            _latitudeTextBox.Location = new Point(140, 20);
            _latitudeTextBox.Size = new Size(100, 24);
            _latitudeTextBox.PlaceholderText = "21.0285";
            _gpsBox.Controls.Add(_latitudeTextBox);

            // Longitude Label and TextBox
            _longitudeLabel.Text = "Kinh độ (Longitude):";
            _longitudeLabel.Location = new Point(250, 20);
            _longitudeLabel.Size = new Size(130, 20);
            _gpsBox.Controls.Add(_longitudeLabel);

            _longitudeTextBox.Location = new Point(390, 20);
            _longitudeTextBox.Size = new Size(100, 24);
            _longitudeTextBox.PlaceholderText = "105.8542";
            _gpsBox.Controls.Add(_longitudeTextBox);

            // Set Location Button
            _setLocationButton.Text = "📌 Đặt Vị Trí";
            _setLocationButton.Location = new Point(10, 55);
            _setLocationButton.Size = new Size(100, 35);
            _setLocationButton.Click += SetLocationButton_Click;
            _gpsBox.Controls.Add(_setLocationButton);

            Controls.Add(_gpsBox);

            // Search Box
            _searchBox.Text = "Tìm Kiếm";
            _searchBox.Dock = DockStyle.Top;
            _searchBox.Height = 120;
            _searchBox.Padding = new Padding(10);

            // Radius Label and Value
            _radiusLabel.Text = "Bán kính tìm kiếm (m):";
            _radiusLabel.Location = new Point(10, 20);
            _radiusLabel.Size = new Size(150, 20);
            _searchBox.Controls.Add(_radiusLabel);

            _radiusValueLabel.Text = $"{_searchRadius}m";
            _radiusValueLabel.Location = new Point(180, 20);
            _radiusValueLabel.Size = new Size(100, 20);
            _radiusValueLabel.TextAlign = ContentAlignment.MiddleLeft;
            _searchBox.Controls.Add(_radiusValueLabel);

            // Radius Slider
            _radiusSlider.Minimum = Constants.MinSearchRadiusMeters;
            _radiusSlider.Maximum = Constants.MaxSearchRadiusMeters;
            _radiusSlider.Value = _searchRadius;
            _radiusSlider.Location = new Point(10, 45);
            _radiusSlider.Size = new Size(400, 25);
            _radiusSlider.TickStyle = TickStyle.Both;
            _radiusSlider.TickFrequency = 5000;
            _radiusSlider.ValueChanged += RadiusSlider_ValueChanged;
            _searchBox.Controls.Add(_radiusSlider);

            // Buttons
            _searchButton.Text = "🔍 Tìm Kiếm";
            _searchButton.Location = new Point(10, 75);
            _searchButton.Size = new Size(100, 35);
            _searchButton.Click += SearchButton_Click;
            _searchBox.Controls.Add(_searchButton);

            _refreshButton.Text = "🔄 Làm Mới";
            _refreshButton.Location = new Point(120, 75);
            _refreshButton.Size = new Size(100, 35);
            _refreshButton.Click += RefreshButton_Click;
            _searchBox.Controls.Add(_refreshButton);

            _startGeofencingButton.Text = "🚀 Geofencing";
            _startGeofencingButton.Location = new Point(230, 75);
            _startGeofencingButton.Size = new Size(100, 35);
            _startGeofencingButton.Click += StartGeofencingButton_Click;
            _searchBox.Controls.Add(_startGeofencingButton);

            Controls.Add(_searchBox);

            // Status Label
            _statusLabel.Text = "Nhập vị trí GPS của bạn để bắt đầu";
            _statusLabel.Dock = DockStyle.Top;
            _statusLabel.Font = new Font(Font.FontFamily, 10, FontStyle.Italic);
            _statusLabel.Height = 25;
            _statusLabel.Padding = new Padding(10);
            Controls.Add(_statusLabel);

            // POI Grid
            _poiGrid.Dock = DockStyle.Fill;
            _poiGrid.AutoGenerateColumns = true;
            _poiGrid.AllowUserToAddRows = false;
            _poiGrid.ReadOnly = true;
            _poiGrid.SelectionMode = DataGridViewSelectionMode.FullRowSelect;
            _poiGrid.DoubleClick += PoiGrid_DoubleClick;
            Controls.Add(_poiGrid);

            // Message Label
            _messageLabel.Dock = DockStyle.Bottom;
            _messageLabel.Height = 30;
            _messageLabel.Padding = new Padding(10);
            _messageLabel.ForeColor = Color.Red;
            Controls.Add(_messageLabel);
        }

        private void SetLocationButton_Click(object? sender, EventArgs e)
        {
            try
            {
                // Parse latitude
                if (!decimal.TryParse(_latitudeTextBox.Text, out decimal latitude) || latitude < -90 || latitude > 90)
                {
                    _messageLabel.Text = "❌ Vĩ độ không hợp lệ (phải từ -90 đến 90)";
                    DialogHelper.ShowError("Lỗi GPS", "Vĩ độ không hợp lệ (phải từ -90 đến 90)");
                    return;
                }

                // Parse longitude
                if (!decimal.TryParse(_longitudeTextBox.Text, out decimal longitude) || longitude < -180 || longitude > 180)
                {
                    _messageLabel.Text = "❌ Kinh độ không hợp lệ (phải từ -180 đến 180)";
                    DialogHelper.ShowError("Lỗi GPS", "Kinh độ không hợp lệ (phải từ -180 đến 180)");
                    return;
                }

                // Set location in mock GPS service
                _mockGpsService.SetMockLocation(latitude, longitude);

                // Update UI
                UpdateUserLocation(latitude, longitude);
                _messageLabel.Text = $"✅ Đã đặt vị trí: {latitude:F6}, {longitude:F6}";
                DialogHelper.ShowSuccess("GPS", $"Vị trí đã được đặt: {latitude:F6}, {longitude:F6}");

                Constants.DebugLog($"📍 Đặt vị trí GPS Mock: {latitude}, {longitude}");
            }
            catch (Exception ex)
            {
                _messageLabel.Text = $"❌ Lỗi: {ex.Message}";
                Constants.ErrorLog("Lỗi khi đặt vị trí GPS", ex);
                DialogHelper.ShowError("Lỗi GPS", $"Không thể đặt vị trí: {ex.Message}", ex);
            }
        }

        private void RadiusSlider_ValueChanged(object? sender, EventArgs e)
        {
            _searchRadius = _radiusSlider.Value;
            _radiusValueLabel.Text = $"{_searchRadius}m";
        }

        private async void SearchButton_Click(object? sender, EventArgs e)
        {
            try
            {
                if (_userLatitude == 0 && _userLongitude == 0)
                {
                    _messageLabel.Text = "❌ Vui lòng nhập tọa độ GPS";
                    return;
                }

                _messageLabel.Text = "⏳ Đang tìm kiếm...";
                _searchButton.Enabled = false;

                var response = await _apiService.GetNearbyPoisAsync(_userLatitude, _userLongitude, _searchRadius);

                if (response.Success && response.Data != null)
                {
                    // Bind data to grid
                    _poiGrid.DataSource = response.Data;
                    _messageLabel.Text = $"✅ Tìm thấy {response.Data.Count} POI";
                }
                else
                {
                    _messageLabel.Text = $"❌ {response.Message}";
                }
            }
            catch (Exception ex)
            {
                _messageLabel.Text = $"❌ Lỗi: {ex.Message}";
                Constants.ErrorLog("Lỗi khi tìm kiếm POI", ex);
            }
            finally
            {
                _searchButton.Enabled = true;
            }
        }

        private async void RefreshButton_Click(object? sender, EventArgs e)
        {
            SearchButton_Click(sender, e);
        }

        private async void StartGeofencingButton_Click(object? sender, EventArgs e)
        {
            try
            {
                if (_poiGrid.DataSource is not List<PoiMapDto> pois || pois.Count == 0)
                {
                    _messageLabel.Text = "❌ Vui lòng tìm kiếm POI trước";
                    return;
                }

                _messageLabel.Text = "🚀 Đang bắt đầu geofencing...";
                await _geofenceService.StartGeofencingAsync(pois);
                _messageLabel.Text = "✅ Geofencing đã bắt đầu";
            }
            catch (Exception ex)
            {
                _messageLabel.Text = $"❌ Lỗi: {ex.Message}";
                Constants.ErrorLog("Lỗi khi bắt đầu geofencing", ex);
            }
        }

        private void PoiGrid_DoubleClick(object? sender, EventArgs e)
        {
            if (_poiGrid.SelectedRows.Count == 0) return;

            var selectedRow = _poiGrid.SelectedRows[0];
            if (selectedRow.DataBoundItem is PoiMapDto poi)
            {
                // Show POI detail
                ShowPoiDetail(poi);
            }
        }

        private void ShowPoiDetail(PoiMapDto poi)
        {
            // TODO: Open POI detail form
            _messageLabel.Text = $"📍 Chi tiết: {poi.Name} - Khoảng cách: {poi.DistanceInMeters}m";
        }

        /// <summary>
        /// Cập nhật vị trí người dùng từ bên ngoài
        /// </summary>
        public void UpdateUserLocation(decimal latitude, decimal longitude)
        {
            _userLatitude = latitude;
            _userLongitude = longitude;
            _statusLabel.Text = $"📍 Vị trí hiện tại: {latitude:F6}, {longitude:F6}";
        }
    }
}
