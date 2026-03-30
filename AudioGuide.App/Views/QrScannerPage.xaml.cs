// File: AudioGuide.App/Views/QrScannerPage.xaml.cs
using AudioGuide.App.ViewModels;
using AudioGuide.App.Helpers;

namespace AudioGuide.App.Views
{
    /// <summary>
    /// QrScannerPage - Quét QR Code để lấy thông tin POI
    /// </summary>
    public partial class QrScannerPage : ContentPage
    {
        private readonly QrScannerViewModel _viewModel;

        public QrScannerPage(QrScannerViewModel viewModel)
        {
            InitializeComponent();

            _viewModel = viewModel;
            BindingContext = viewModel;

            Constants.DebugLog("📷 QrScannerPage đã được khởi tạo");
        }
    }
}
