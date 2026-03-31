using AudioGuide.WinForms.Helpers;
using AudioGuide.WinForms.Forms;

namespace AudioGuide.WinForms.Services
{
    /// <summary>
    /// Thực thi IQrScannerService cho WinForms
    /// Sử dụng ZXing.Net cho QR decoding
    /// </summary>
    public class QrScannerService : IQrScannerService
    {
        public QrScannerService()
        {
            Constants.DebugLog("📷 QrScannerService khởi tạo");
        }

        /// <summary>
        /// Scan QR code từ camera (dạng hộp thoại modal)
        /// Người dùng có thể chọn ảnh chứa QR code để decode
        /// </summary>
        public async Task<string?> ScanQrCodeAsync()
        {
            try
            {
                Constants.DebugLog("📷 Bắt đầu scan QR code");

                // Mở dialog camera để người dùng chọn ảnh QR
                using (var cameraForm = new CameraForm())
                {
                    var dialogResult = cameraForm.ShowDialog();

                    if (dialogResult == DialogResult.OK && !string.IsNullOrEmpty(cameraForm.QrCodeResult))
                    {
                        Constants.DebugLog($"✅ QR Code quét được: {cameraForm.QrCodeResult}");
                        return cameraForm.QrCodeResult;
                    }
                    else
                    {
                        Constants.DebugLog("❌ QR scan bị hủy hoặc không thành công");
                        return null;
                    }
                }
            }
            catch (Exception ex)
            {
                Constants.ErrorLog("❌ Lỗi khi scan QR code", ex);
                return null;
            }
        }
    }
}
