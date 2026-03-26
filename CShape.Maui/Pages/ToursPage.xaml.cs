using CShape.Maui.ViewModels;

namespace CShape.Maui.Pages;

public partial class ToursPage : ContentPage
{
    public ToursPage(ToursViewModel viewModel)
    {
        InitializeComponent();
        BindingContext = viewModel;
    }

    protected override async void OnNavigatedTo(NavigatedToEventArgs args)
    {
        base.OnNavigatedTo(args);
        if (BindingContext is ToursViewModel viewModel)
        {
            await viewModel.LoadToursCommand.ExecuteAsync(null);
        }
    }
}
