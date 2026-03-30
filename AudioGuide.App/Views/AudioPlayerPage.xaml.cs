// File: AudioGuide.App/Views/AudioPlayerPage.xaml.cs
using AudioGuide.App.ViewModels;
using AudioGuide.App.Helpers;

namespace AudioGuide.App.Views
{
    /// <summary>
    /// AudioPlayerPage - Trình phát audio với hàng đợi
    /// </summary>
    public partial class AudioPlayerPage : ContentPage
    {
        private readonly AudioPlayerViewModel _viewModel;

        public AudioPlayerPage(AudioPlayerViewModel viewModel)
        {
            InitializeComponent();

            _viewModel = viewModel;
            BindingContext = viewModel;

            Constants.DebugLog("🎵 AudioPlayerPage đã được khởi tạo");
        }

        protected override void OnAppearing()
        {
            base.OnAppearing();
            Constants.DebugLog("🎵 AudioPlayerPage appearing");
        }
    }
}
