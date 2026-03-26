using CShape.Maui.ViewModels;

namespace CShape.Maui.Pages;

[QueryProperty(nameof(TourId), "id")]
public partial class TourPlaybackPage : ContentPage
{
    private string? _tourId;

    public string? TourId
    {
        get => _tourId;
        set
        {
            _tourId = Uri.UnescapeDataString(value ?? string.Empty);
        }
    }

    public TourPlaybackPage(TourPlaybackViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }

    protected override async void OnNavigatedTo(NavigatedToEventArgs args)
    {
        base.OnNavigatedTo(args);
        if (!string.IsNullOrEmpty(TourId) && BindingContext is TourPlaybackViewModel viewModel)
        {
            await viewModel.LoadTourCommand.ExecuteAsync(TourId);
        }
    }
}
