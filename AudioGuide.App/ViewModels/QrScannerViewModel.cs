// File: AudioGuide.App/ViewModels/QrScannerViewModel.cs
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using AudioGuide.App.Helpers;
using AudioGuide.App.Services;

namespace AudioGuide.App.ViewModels
{
    /// <summary>
    /// ViewModel quản lý quét QR Code và xử lý kết quả
    /// </summary>
    public partial class QrScannerViewModel : ObservableObject
    {
        private readonly IQrScannerService _qrScannerService;
        private readonly IApiService _apiService;
        private readonly IAudioQueueService _audioQueueService;
        private readonly IAppLanguageService _languageService;

        // ========== Observable Properties ==========
        [ObservableProperty]
        private bool isScanning = false;

        [ObservableProperty]
        private string scanningMessage = "Để camera vào QR Code...";

        [ObservableProperty]
        private bool hasError = false;

        [ObservableProperty]
        private string errorMessage = string.Empty;

        [ObservableProperty]
        private bool hasScanResult = false;

        [ObservableProperty]
        private string scanResultMessage = string.Empty;

        [ObservableProperty]
        private string scannedQrData = string.Empty;

        [ObservableProperty]
        private string currentLanguage = "vi";

        public QrScannerViewModel(
            IQrScannerService qrScannerService,
            IApiService apiService,
            IAudioQueueService audioQueueService,
            IAppLanguageService languageService)
        {
            _qrScannerService = qrScannerService;
            _apiService = apiService;
            _audioQueueService = audioQueueService;
            _languageService = languageService;

            CurrentLanguage = _languageService.GetCurrentLanguage();

            Constants.DebugLog("📷 QrScannerViewModel đã được khởi tạo");

            // Subscribe to events
            _languageService.OnLanguageChanged += OnLanguageChanged;
        }

        // ========== Commands ==========

        /// <summary>
        /// Lệnh mở camera để quét QR Code
        /// </summary>
        [RelayCommand]
        public async Task ScanQrCodeAsync()
        {
            try
            {
                IsScanning = true;
                ScanningMessage = "📷 Đang mở camera...";
                HasError = false;
                ErrorMessage = string.Empty;
                HasScanResult = false;
                ScanResultMessage = string.Empty;

                Constants.DebugLog("📷 Mở camera để quét QR");

                // Mở camera
                var scanResult = await _qrScannerService.OpenQrScannerAsync();

                if (scanResult == null)
                {
                    Constants.DebugLog("⚠️ Người dùng hủy quét QR");
                    ScanningMessage = "⚠️ Quét bị hủy";
                    return;
                }

                if (!scanResult.IsValid)
                {
                    ErrorMessage = scanResult.ErrorMessage ?? "❌ QR Code không hợp lệ";
                    HasError = true;
                    Constants.ErrorLog($"❌ QR Code không hợp lệ: {scanResult.ErrorMessage}");
                    return;
                }

                // Lưu dữ liệu QR
                ScannedQrData = scanResult.RawData;
                ScanningMessage = $"✅ Đã quét QR: {scanResult.BarcodeFormat}";
                Constants.DebugLog($"✅ Quét QR thành công: {scanResult.RawData}");

                // Lấy chi tiết POI từ QR hash
                await FetchPoiFromQrAsync(scanResult.RawData);
            }
            catch (Exception ex)
            {
                Constants.ErrorLog("❌ Lỗi khi quét QR", ex);
                ErrorMessage = $"❌ Lỗi quét QR: {ex.Message}";
                HasError = true;
            }
            finally
            {
                IsScanning = false;
            }
        }

        /// <summary>
        /// Lệnh quét QR từ file hình ảnh (cho testing)
        /// </summary>
        [RelayCommand]
        public async Task ScanQrFromImageAsync(string imagePath)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(imagePath))
                {
                    ErrorMessage = "❌ Chưa chọn hình ảnh";
                    HasError = true;
                    return;
                }

                IsScanning = true;
                ScanningMessage = "🖼️ Đang quét QR từ hình ảnh...";
                HasError = false;

                Constants.DebugLog($"🖼️ Quét QR từ hình ảnh: {imagePath}");

                // Quét từ hình ảnh
                var scanResult = await _qrScannerService.ScanQrCodeFromImageAsync(imagePath);

                if (scanResult == null || !scanResult.IsValid)
                {
                    ErrorMessage = scanResult?.ErrorMessage ?? "❌ Không thể quét QR từ hình ảnh";
                    HasError = true;
                    return;
                }

                // Lưu dữ liệu QR
                ScannedQrData = scanResult.RawData;
                ScanningMessage = $"✅ Đã quét QR từ hình ảnh";

                // Lấy chi tiết POI từ QR hash
                await FetchPoiFromQrAsync(scanResult.RawData);
            }
            catch (Exception ex)
            {
                Constants.ErrorLog("❌ Lỗi khi quét QR từ hình ảnh", ex);
                ErrorMessage = $"❌ Lỗi: {ex.Message}";
                HasError = true;
            }
            finally
            {
                IsScanning = false;
            }
        }

        /// <summary>
        /// Lệnh phát audio POI từ QR
        /// </summary>
        [RelayCommand]
        public void PlayQrPoiAudio()
        {
            try
            {
                if (string.IsNullOrWhiteSpace(ScannedQrData))
                {
                    ErrorMessage = "❌ Chưa quét QR Code";
                    HasError = true;
                    return;
                }

                // TODO: Implement play audio from QR POI
                // Lấy POI detail từ QR data và phát audio
                ScanningMessage = "🎵 Đang phát thuyết minh...";
            }
            catch (Exception ex)
            {
                Constants.ErrorLog("❌ Lỗi khi phát audio QR", ex);
                ErrorMessage = $"❌ Lỗi: {ex.Message}";
                HasError = true;
            }
        }

        // ========== Private Methods ==========

        /// <summary>
        /// Lấy chi tiết POI từ QR hash
        /// </summary>
        private async Task FetchPoiFromQrAsync(string qrHash)
        {
            try
            {
                Constants.DebugLog($"🔲 Lấy POI từ QR hash: {qrHash}");

                var response = await _apiService.GetPoiByQrCodeAsync(qrHash, CurrentLanguage);

                if (!response.Success || response.Data == null)
                {
                    ErrorMessage = response.Message ?? "❌ Không tìm thấy POI cho QR Code này";
                    HasError = true;
                    Constants.DebugLog($"❌ QR Code không hợp lệ: {response.Message}");
                    return;
                }

                // Hiển thị kết quả
                var poi = response.Data;
                HasScanResult = true;
                ScanResultMessage = $"📍 {poi.Name}\n" +
                                  $"Ngôn ngữ: {poi.LanguageCode}\n" +
                                  $"Thời gian: {poi.DurationInSeconds ?? 0} giây";

                // Check fallback
                if (!string.IsNullOrWhiteSpace(poi.LanguageFallbackNote))
                {
                    ScanResultMessage += $"\n⚠️ {poi.LanguageFallbackNote}";
                }

                Constants.DebugLog($"✅ Đã lấy POI từ QR: {poi.Name}");

                // Tự động thêm audio vào hàng đợi
                var audioContent = new Models.AudioContent
                {
                    PoiId = poi.PoiId,
                    PoiName = poi.Name,
                    LanguageCode = poi.LanguageCode,
                    TextDescription = poi.TextDescription,
                    AudioUrl = poi.AudioUrl,
                    DurationInSeconds = poi.DurationInSeconds
                };

                bool added = _audioQueueService.TryEnqueueAudio(audioContent);
                if (added)
                {
                    ScanResultMessage += "\n🎵 ✅ Đã thêm vào hàng đợi phát";
                }
                else
                {
                    var remaining = _audioQueueService.GetCooldownRemaining(poi.PoiId);
                    ScanResultMessage += $"\n⏳ Cooldown: {remaining.TotalSeconds:F0}s";
                }
            }
            catch (Exception ex)
            {
                Constants.ErrorLog("❌ Lỗi khi lấy POI từ QR", ex);
                ErrorMessage = $"❌ Lỗi: {ex.Message}";
                HasError = true;
            }
        }

        /// <summary>
        /// Xử lý event khi ngôn ngữ thay đổi
        /// </summary>
        private void OnLanguageChanged(object? sender, LanguageChangedEventArgs args)
        {
            CurrentLanguage = args.NewLanguage;
            Constants.DebugLog($"🌍 QrScannerViewModel nhận thông báo thay đổi ngôn ngữ: {args.NewLanguage}");
        }
    }
}
