namespace AudioGuide.WinForms.Services
{
    /// <summary>
    /// Interface for mock GPS location provider (for testing without real GPS hardware)
    /// </summary>
    public interface IMockGpsService
    {
        /// <summary>
        /// Get current mock location
        /// </summary>
        (decimal latitude, decimal longitude) GetCurrentLocation();

        /// <summary>
        /// Set mock location (validates coordinates)
        /// </summary>
        void SetMockLocation(decimal latitude, decimal longitude);

        /// <summary>
        /// Get default location (Hanoi)
        /// </summary>
        (decimal latitude, decimal longitude) GetDefaultLocation();

        /// <summary>
        /// Reset to default location
        /// </summary>
        void ResetToDefault();

        /// <summary>
        /// Validate GPS coordinate range
        /// </summary>
        bool ValidateCoordinates(decimal latitude, decimal longitude);
    }
}
