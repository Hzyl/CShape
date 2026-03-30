// File: AudioGuide.App/Views/SettingsPage.xaml.cs
using AudioGuide.App.ViewModels;
using AudioGuide.App.Helpers;

namespace AudioGuide.App.Views
{
    /// <summary>
    /// SettingsPage - Cài đặt ứng dụng (ngôn ngữ, API,cache, etc.)
    /// </summary>
    public partial class SettingsPage : ContentPage
    {
        private readonly SettingsViewModel _viewModel;

        public SettingsPage(SettingsViewModel viewModel)
        {
            InitializeComponent();

            _viewModel = viewModel;
            BindingContext = viewModel;

            Constants.DebugLog("⚙️ SettingsPage đã được khởi tạo");
        }
    }
}
