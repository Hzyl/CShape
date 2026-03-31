using Serilog;
using System.Collections.Concurrent;

namespace AudioGuide.WinForms.Helpers
{
    /// <summary>
    /// Serilog configuration and management
    /// Centralizes logging setup for file and console output
    /// </summary>
    public static class LoggingHelper
    {
        private static ILogger? _logger;
        private static readonly object _lockObject = new();

        /// <summary>
        /// Initialize Serilog logger with file and console sinks
        /// Must be called early in Program.Main()
        /// </summary>
        public static ILogger ConfigureLogger()
        {
            lock (_lockObject)
            {
                if (_logger != null)
                    return _logger;

                try
                {
                    // Create logs directory if not exists
                    var logsDir = Path.Combine(
                        Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData),
                        "AudioGuide", "logs"
                    );
                    Directory.CreateDirectory(logsDir);

                    // Configure Serilog with file and console sinks
                    var logTemplate = "[{Timestamp:yyyy-MM-dd HH:mm:ss.fff zzz}] [{Level:u3}] {Message:lj}{NewLine}{Exception}";

                    _logger = new LoggerConfiguration()
                        .MinimumLevel.Debug()
                        .WriteTo.File(
                            path: Path.Combine(logsDir, "audioquide-.txt"),
                            rollingInterval: RollingInterval.Day,
                            retainedFileCountLimit: 7,
                            outputTemplate: logTemplate
                        )
                        .WriteTo.Console(outputTemplate: logTemplate)
                        .CreateLogger();

                    Log.Logger = _logger;

                    _logger.Information("🚀 AudioGuide WinForms application started");
                    _logger.Debug($"Logs directory: {logsDir}");

                    return _logger;
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"❌ Failed to configure Serilog: {ex.Message}");

                    // Fallback to console-only logger
                    _logger = new LoggerConfiguration()
                        .WriteTo.Console()
                        .CreateLogger();

                    return _logger;
                }
            }
        }

        /// <summary>
        /// Get the current logger instance
        /// </summary>
        public static ILogger GetLogger()
        {
            return _logger ?? Log.Logger;
        }

        /// <summary>
        /// Dispose the logger and flush pending logs
        /// Call this in application shutdown
        /// </summary>
        public static void Shutdown()
        {
            try
            {
                if (_logger != null)
                {
                    _logger.Information("👋 AudioGuide WinForms application shutting down");
                    Log.CloseAndFlush();
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error during logger shutdown: {ex.Message}");
            }
        }
    }
}
