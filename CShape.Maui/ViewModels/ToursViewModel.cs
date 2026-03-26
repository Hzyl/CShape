using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using CShape.Shared.Models;
using CShape.Maui.Services;

namespace CShape.Maui.ViewModels;

public partial class ToursViewModel : ObservableObject
{
    private readonly IApiClient _apiClient;

    [ObservableProperty]
    private ObservableCollection<Tour> tours = new();

    [ObservableProperty]
    private bool isLoading;

    [ObservableProperty]
    private string? errorMessage;

    public ToursViewModel(IApiClient apiClient)
    {
        _apiClient = apiClient;
    }

    [RelayCommand]
    public async Task LoadTours()
    {
        try
        {
            IsLoading = true;
            ErrorMessage = null;

            var tourList = await _apiClient.GetToursAsync();
            Tours.Clear();

            foreach (var tour in tourList)
            {
                Tours.Add(tour);
            }
        }
        catch (Exception ex)
        {
            ErrorMessage = $"Error loading tours: {ex.Message}";
        }
        finally
        {
            IsLoading = false;
        }
    }

    [RelayCommand]
    public async Task SelectTour(Tour tour)
    {
        if (tour?.Id == null)
            return;

        // Navigate to tour detail/playback page
        await Shell.Current.GoToAsync($"tour/{tour.Id}");
    }
}
