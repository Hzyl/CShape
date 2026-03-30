// File: AudioGuide.App/Services/IQrScannerService.cs
namespace AudioGuide.App.Services
{
    /// <summary>
    /// Model kết quả quét QR Code
    /// </summary>
    public class QrScanResult
    {
        /// <summary>
        /// Dữ liệu QR Code đã quét
        /// </summary>
        public string RawData { get; set; } = string.Empty;

        /// <summary>
        /// Loại dữ liệu (1D barcode, 2D QR, v.v.)
        /// </summary>
        public string? BarcodeFormat { get; set; }

        /// <summary>
        /// Thời gian quét
        /// </summary>
        public DateTime ScanTime { get; set; } = DateTime.Now;

        /// <summary>
        /// Có phải là QR Code hợp lệ cho hệ thống không
        /// (Kiểm tra format, hash, v.v.)
        /// </summary>
        public bool IsValid { get; set; } = true;

        /// <summary>
        /// Thông báo lỗi (nếu không hợp lệ)
        /// </summary>
        public string? ErrorMessage { get; set; }
    }

    /// <summary>
    /// Interface định nghĩa QR Scanner service
    /// Sử dụng ZXing.NET.Maui để quét QR Code
    /// </summary>
    public interface IQrScannerService
    {
        /// <summary>
        /// Mở màn hình quét QR Code
        /// </summary>
        /// <returns>Kết quả quét QR</returns>
        Task<QrScanResult?> OpenQrScannerAsync();

        /// <summary>
        /// Quét QR Code từ file hình ảnh (cho testing)
        /// </summary>
        /// <param name="imagePath">Đường dẫn file hình ảnh</param>
        /// <returns>Kết quả quét QR</returns>
        Task<QrScanResult?> ScanQrCodeFromImageAsync(string imagePath);

        /// <summary>
        /// Xác thực xem dữ liệu QR có phải là QR Code hợp lệ không
        /// </summary>
        /// <param name="qrData">Dữ liệu QR</param>
        /// <returns>True nếu hợp lệ, False nếu không</returns>
        bool ValidateQrCode(string qrData);
    }
}
