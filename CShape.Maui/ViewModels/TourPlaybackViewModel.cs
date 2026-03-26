using System.Collections.ObjectModel;
using CommunityToolkit.Mvvm.ComponentModel;
using CommunityToolkit.Mvvm.Input;
using CShape.Shared.Models;
using CShape.Maui.Services;

namespace CShape.Maui.ViewModels;

public partial class TourPlaybackViewModel : ObservableObject
{
    private readonly IApiClient _apiClient;

    [ObservableProperty]
    private Tour? currentTour;

    [ObservableProperty]
    private ObservableCollection<POI> tourPois = new();

    [ObservableProperty]
    private POI? currentPoi;

    [ObservableProperty]
    private int currentPoiIndex;

    [ObservableProperty]
    private bool isLoading;

    [ObservableProperty]
    private string? errorMessage;

    [ObservableProperty]
    private bool isPlaying;

    public TourPlaybackViewModel(IApiClient apiClient)
    {
        _apiClient = apiClient;
    }

    [RelayCommand]
    public async Task LoadTour(string tourId)
    {
        try
        {
            IsLoading = true;
            ErrorMessage = null;

            var tour = await _apiClient.GetTourByIdAsync(tourId);
            if (tour == null)
            {
                ErrorMessage = "Tour not found";
                return;
            }

            CurrentTour = tour;

            // Load POIs for this tour
            var pois = await _apiClient.GetPOIsByTourAsync(tour.POIIds);
            TourPois.Clear();
            foreach (var poi in pois)
            {
                TourPois.Add(poi);
            }

            if (TourPois.Count > 0)
            {
                CurrentPoiIndex = 0;
                CurrentPoi = TourPois[0];
            }
        }
        catch (Exception ex)
        {
            ErrorMessage = $"Error loading tour: {ex.Message}";
        }
        finally
        {
            IsLoading = false;
        }
    }

    [RelayCommand]
    public void NextPoi()
    {
        if (CurrentPoiIndex < TourPois.Count - 1)
        {
            CurrentPoiIndex++;
            CurrentPoi = TourPois[CurrentPoiIndex];
        }
    }

    [RelayCommand]
    public void PreviousPoi()
    {
        if (CurrentPoiIndex > 0)
        {
            CurrentPoiIndex--;
            CurrentPoi = TourPois[CurrentPoiIndex];
        }
    }

    [RelayCommand]
    public async Task PlayAudio()
    {
        if (CurrentPoi?.AudioUrl == null)
            return;

        try
        {
            IsPlaying = true;
            // TODO: Implement audio playback using MediaElement or similar
            await Task.Delay(2000); // Simulate audio playback
        }
        finally
        {
            IsPlaying = false;
        }
    }
}
