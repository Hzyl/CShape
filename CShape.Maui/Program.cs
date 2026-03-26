using CShape.Maui;
using CShape.Maui.Pages;
using CShape.Maui.ViewModels;
using CShape.Maui.Services;
using CShape.Maui.Converters;

var builder = MauiApp.CreateBuilder();
builder
    .UseMauiApp<App>()
    .ConfigureFonts(fonts =>
    {
        fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
        fonts.AddFont("OpenSans-Semibold.ttf", "OpenSansSemibold");
    });

// Register Services
builder.Services.AddSingleton<IApiClient, ApiClient>();

// Register ViewModels
builder.Services.AddSingleton<ToursViewModel>();
builder.Services.AddSingleton<TourPlaybackViewModel>();

// Register Pages
builder.Services.AddSingleton<ToursPage>();
builder.Services.AddSingleton<TourPlaybackPage>();

// Register Value Converters
builder.Services.AddSingleton<InvertedBoolConverter>();
builder.Services.AddSingleton<IsNotNullOrEmptyConverter>();
builder.Services.AddSingleton<FirstImageConverter>();

var app = builder.Build();

#if DEBUG
    builder.Logging.AddDebug();
#endif

return app.Run();
