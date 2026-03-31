using AudioGuide.WinForms.Models;

namespace AudioGuide.WinForms.Services
{
    /// <summary>
    /// Interface quản lý hàng đợi audio
    /// </summary>
    public interface IAudioQueueService
    {
        event EventHandler<AudioGuide.WinForms.Helpers.AudioQueueChangedEventArgs>? OnQueueChanged;

        bool TryEnqueueAudio(AudioContent audioContent);
        AudioContent? GetCurrentAudio();
        AudioContent? GetNextAudio();
        void RemoveCurrentAudio();
        void ClearQueue();
        int GetQueueCount();
        bool CanEnqueuePoi(Guid poiId);
        TimeSpan GetCooldownRemaining(Guid poiId);
        List<AudioContent> GetQueue();
    }

    /// <summary>
    /// Interface quản lý ngôn ngữ ứng dụng
    /// </summary>
    public interface IAppLanguageService
    {
        event EventHandler<AudioGuide.WinForms.Helpers.LanguageChangedEventArgs>? OnLanguageChanged;

        string GetCurrentLanguage();
        void SetLanguage(string languageCode);
        string GetLanguageDisplayName(string languageCode);
        string[] GetSupportedLanguages();
        Dictionary<string, string> GetLanguageDictionary();
    }

    /// <summary>
    /// Interface quản lý Geofence
    /// </summary>
    public interface IGeofenceService
    {
        event EventHandler<AudioGuide.WinForms.Helpers.GeofenceEventArgs>? OnGeofenceEntered;
        event EventHandler<AudioGuide.WinForms.Helpers.GeofenceEventArgs>? OnGeofenceExited;

        bool IsGeofencingActive { get; }
        Task StartGeofencingAsync(List<PoiMapDto> pois);
        Task StopGeofencingAsync();
    }

    /// <summary>
    /// Interface dùng cho QR Scanner
    /// </summary>
    public interface IQrScannerService
    {
        Task<string?> ScanQrCodeAsync();
    }
}
