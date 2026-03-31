namespace AudioGuide.WinForms.Helpers
{
    /// <summary>
    /// Event args khi language thay đổi
    /// </summary>
    public class LanguageChangedEventArgs : EventArgs
    {
        public string OldLanguage { get; set; } = string.Empty;
        public string NewLanguage { get; set; } = string.Empty;
    }

    /// <summary>
    /// Event args khi geofence boundary bị vượt
    /// </summary>
    public class GeofenceEventArgs : EventArgs
    {
        public Guid PoiId { get; set; }
        public string PoiName { get; set; } = string.Empty;
        public decimal Latitude { get; set; }
        public decimal Longitude { get; set; }
        public int TriggerRadius { get; set; }
    }

    /// <summary>
    /// Event args khi audio queue thay đổi
    /// </summary>
    public class AudioQueueChangedEventArgs : EventArgs
    {
        public AudioGuide.WinForms.Models.AudioContent? CurrentAudio { get; set; }
        public int QueueCount { get; set; }
    }
}
