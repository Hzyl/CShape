using AudioGuide.WinForms.Helpers;

namespace AudioGuide.WinForms.Services
{
    /// <summary>
    /// Mock GPS location provider implementation for testing
    /// Allows manual coordinates entry instead of real GPS hardware
    /// Default location: Hanoi, Vietnam (21.0285°N, 105.8542°E)
    /// </summary>
    public class MockGpsService : IMockGpsService
    {
        // Default location: Hanoi, Vietnam
        private const decimal DEFAULT_LATITUDE = 21.0285m;
        private const decimal DEFAULT_LONGITUDE = 105.8542m;

        // Current mock location
        private decimal _currentLatitude = DEFAULT_LATITUDE;
        private decimal _currentLongitude = DEFAULT_LONGITUDE;

        // GPS coordinate ranges
        private const decimal MIN_LATITUDE = -90m;
        private const decimal MAX_LATITUDE = 90m;
        private const decimal MIN_LONGITUDE = -180m;
        private const decimal MAX_LONGITUDE = 180m;

        public MockGpsService()
        {
            Constants.DebugLog($"📍 MockGpsService initialized with default location: {DEFAULT_LATITUDE:F4}, {DEFAULT_LONGITUDE:F4}");
        }

        /// <summary>
        /// Get current mock location
        /// </summary>
        public (decimal latitude, decimal longitude) GetCurrentLocation()
        {
            return (_currentLatitude, _currentLongitude);
        }

        /// <summary>
        /// Set mock location with validation
        /// </summary>
        public void SetMockLocation(decimal latitude, decimal longitude)
        {
            try
            {
                if (!ValidateCoordinates(latitude, longitude))
                {
                    var errorMsg = $"❌ Tọa độ không hợp lệ. Vĩ độ: -{MAX_LATITUDE} đến {MAX_LATITUDE}, Kinh độ: -{MAX_LONGITUDE} đến {MAX_LONGITUDE}";
                    Constants.ErrorLog(errorMsg);
                    throw new ArgumentException(errorMsg);
                }

                _currentLatitude = latitude;
                _currentLongitude = longitude;

                Constants.DebugLog($"📍 Mock GPS location updated: {latitude:F6}, {longitude:F6}");
            }
            catch (Exception ex)
            {
                Constants.ErrorLog($"❌ Lỗi khi đặt vị trí GPS", ex);
                throw;
            }
        }

        /// <summary>
        /// Get default location (Hanoi)
        /// </summary>
        public (decimal latitude, decimal longitude) GetDefaultLocation()
        {
            return (DEFAULT_LATITUDE, DEFAULT_LONGITUDE);
        }

        /// <summary>
        /// Reset to default location
        /// </summary>
        public void ResetToDefault()
        {
            _currentLatitude = DEFAULT_LATITUDE;
            _currentLongitude = DEFAULT_LONGITUDE;
            Constants.DebugLog($"📍 Mock GPS reset to default location");
        }

        /// <summary>
        /// Validate GPS coordinate ranges
        /// </summary>
        public bool ValidateCoordinates(decimal latitude, decimal longitude)
        {
            return latitude >= MIN_LATITUDE && latitude <= MAX_LATITUDE &&
                   longitude >= MIN_LONGITUDE && longitude <= MAX_LONGITUDE;
        }
    }
}
