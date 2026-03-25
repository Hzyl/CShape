# Mobile App Phase 8 - UI Polish & Testing

## Testing Checklist

### Smoke Tests (Basic Functionality)
- [ ] App launches without crashes
- [ ] Login screen loads and renders correctly
- [ ] Can log in with valid credentials
- [ ] Map screen displays and loads POIs
- [ ] POI markers appear on map
- [ ] Tapping POI marker navigates to detail screen
- [ ] POI detail screen loads with audio player
- [ ] Audio player plays/pauses correctly
- [ ] Language switcher (VI/EN/JP) works
- [ ] QR scanner opens camera and detects barcodes
- [ ] Tour list loads and displays tours
- [ ] Can navigate through tour playback
- [ ] Settings screen opens and dark mode toggles
- [ ] Analytics screen displays stats
- [ ] Nearby POIs modal shows within 1km
- [ ] Geofencing triggers entry events

### UI/UX Tests
- [ ] All screens use consistent spacing and colors
- [ ] Text is readable on both light and dark mode
- [ ] Buttons have proper touch feedback
- [ ] Loading states display spinners
- [ ] Error messages are user-friendly
- [ ] Empty states are informative
- [ ] Navigation back button works on all screens
- [ ] Status bar is visible and proper contrast

### Performance Tests
- [ ] App doesn't freeze when loading POIs
- [ ] Scrolling is smooth without lags
- [ ] Audio playback doesn't stutter
- [ ] Map renders markers without delay
- [ ] App handles 1000+ POIs without crashing

### Offline Tests
- [ ] App works without internet (cached data)
- [ ] Events queue when offline
- [ ] Events sync when comes online
- [ ] Cache auto-expires after TTL

### Real Device Testing Recommended
- Test on Android 12+ (target API level 33+)
- Test location permissions flow
- Test camera permissions flow
- Test audio playback with speaker/headphones
- Test battery drain during GPS tracking

## Theme System (Phase 8)
- Light theme: Clean, bright interface
- Dark theme: Reduced eye strain in low light
- Theme preference persists across sessions
- All screens support both themes

## Error Handling (Phase 8)
- Network errors show connection message
- 401/403 redirects to login
- 404 shows item not found message
- Server errors show retry button
- Validation errors show input hints

## Dark Mode Implementation
- All color values centralized in themeStore.ts
- Dynamic theme switching via useTheme hook
- Settings screen toggle for manual theme control
- Proper contrast ratios for accessibility

## Known Limitations (Phase 8)
- Dark mode requires app restart (can be improved)
- Cache clearing requires manual selection
- No analytics sync status indicator
- QR scanner doesn't handle all barcode types

## Next Steps (Phase 9)
- APK generation and signing
- Play Store preparation
- Release notes and screenshots
- Beta testing with real users
