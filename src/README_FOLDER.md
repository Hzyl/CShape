# 💻 Source Code

This folder contains all C# source code for the Weather App.

## 📋 Files

| File | Lines | Purpose |
|------|-------|---------|
| **Program.cs** | 16 | Entry point - Starts the application |
| **Form1.cs** | 178 | Main form - Logic & event handlers |
| **Form1.Designer.cs** | 203 | UI Design - Controls & layout |
| **WeatherModel.cs** | 57 | Models - Data structures |
| **ApiService.cs** | 81 | API Service - OpenWeather integration |
| **HistoryService.cs** | 124 | History Service - File I/O |

**Total**: 659 lines of clean, well-organized code

---

## 🎯 Quick File Guide

### 🔴 **Program.cs**
```csharp
Entry point of the application
- Initializes Windows Forms
- Runs Form1
```

### 🟠 **Form1.cs**
```csharp
Main form with logic
- Search button handler
- Display weather results
- Manage history
- Event handlers
```

### 🟡 **Form1.Designer.cs**
```csharp
Auto-generated UI design
- Control definitions
- Layout & positioning
- InitializeComponent()
```

### 🟢 **WeatherModel.cs**
```csharp
Data models
- WeatherData class
- OpenWeatherResponse classes
- API response structures
```

### 🔵 **ApiService.cs**
```csharp
API integration
- GetWeatherByCityAsync()
- HTTP requests
- JSON parsing
- Error handling
```

### 🟣 **HistoryService.cs**
```csharp
History management
- Load/Save history
- File I/O operations
- History data persistence
```

---

## 📂 Architecture

```
src/
├── Entry Point
│   └── Program.cs
│
├── Presentation Layer
│   ├── Form1.cs (Logic)
│   └── Form1.Designer.cs (Design)
│
├── Service Layer
│   ├── ApiService.cs
│   └── HistoryService.cs
│
└── Data Layer
    └── WeatherModel.cs
```

---

## 🚀 Key Classes

### WeatherData
```
Stores weather information for a city
- City name
- Temperature
- Humidity
- Wind speed
- Weather description
- Weather icon
```

### ApiService
```
Handles API calls to OpenWeather
- Builds API URL
- Makes HTTP GET request
- Parses JSON response
- Returns WeatherData object
```

### HistoryService
```
Manages search history
- Loads from history.txt
- Saves to history.txt
- Adds/removes cities
- Clears history
```

---

## 💡 Code Quality

✅ **Clean Code**
- Meaningful variable names
- Clear method names
- Proper indentation

✅ **Comments**
- XML documentation comments
- Explanation of complex logic
- Method summaries

✅ **Error Handling**
- Try-catch blocks
- Exception messages
- Graceful failure

✅ **Architecture**
- Separation of concerns
- Service layer pattern
- No code duplication

---

## 🔗 Related Folders

- **Documentation** → `../docs/`
- **POC/MVP/Roadmap** → `../poc-mvp/`
- **Configuration** → `../config/`
- **Project Root** → `../`

---

## 🎓 For Developers

### Understanding the Code
1. Start: `Program.cs` (entry point)
2. Then: `Form1.cs` (main logic)
3. Then: `ApiService.cs` (API calls)
4. Then: `HistoryService.cs` (data)
5. Finally: `WeatherModel.cs` (models)

### Building the Project
```bash
dotnet build
dotnet run
```

### Modifying Code
1. Edit files in src/
2. Save changes
3. Run `dotnet build` to compile
4. Run `dotnet run` to test

---

## 📝 File Dependencies

```
Program.cs
    └── Form1.cs
        ├── ApiService.cs
        │   └── WeatherModel.cs
        └── HistoryService.cs
```

---

**Happy coding!** 🚀
