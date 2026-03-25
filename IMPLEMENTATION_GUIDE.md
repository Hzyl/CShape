# Admin Dashboard — POC Implementation Guide
**Status:** Phase 1-3 완료 (Auth + POI + Tour UI)

## Quick Start

### Prerequisites
- Node.js 18+ (installed)
- npm 9+ (installed)
- Git (installed)

### Installation & Setup

```bash
# 1. Install dependencies
npm install

# 2. Create .env from example
cp .env.example .env.local

# 3. Update .env.local with your Google Maps API key
# VITE_MAP_API_KEY=<your-actual-key-here>

# 4. Start development server
npm run dev
```

The app will start at `http://localhost:5173`

---

## Demo Credentials (POC Mode)

**Email:** `admin@vinh-khanh.local`
**Password:** `password`

**Security Features Implemented:**
- Rate limiting: 5 failed attempts → 5 min lockout
- Mock JWT token storage in localStorage
- Protected routes with ProtectedRoute component

---

## Project Structure

```
src/
├── pages/
│   ├── LoginPage.tsx              # 🔐 Login form + auth
│   ├── DashboardPage.tsx          # 📊 Analytics dashboard (demo)
│   ├── POIManagementPage.tsx      # 📍 POI CRUD (table + map)
│   └── TourManagementPage.tsx     # 🎯 Tour builder
├── components/
│   ├── Layout.tsx                 # Header + Sidebar
│   ├── ProtectedRoute.tsx         # Auth guard
│   ├── POITable.tsx              # POI list table
│   ├── POIMap.tsx                # Google Maps placeholder
│   ├── POIForm.tsx               # POI add/edit form
│   └── Toast.tsx                 # Toast notifications
├── stores/
│   └── authStore.ts              # Zustand auth store
├── hooks/
│   └── useAuth.ts                # Auth hook
├── services/
│   └── poiService.ts             # 🔄 Mock API (replace with real)
├── App.tsx                        # Router setup
├── main.tsx                       # Entry point
└── index.css                      # Global styles (Tailwind)
```

---

## Key Features Implemented  ✅

### Phase 1: Authentication
- [x] Login page with email/password
- [x] Rate limiting (5 failed attempts → lock 5 min)
- [x] Protected routes redirect to /login
- [x] Zustand auth store (lightweight state management)

### Phase 2: POI Management
- [x] POI list table with pagination (20/page)
- [x] Search + filter by type (major/minor)
- [x] Add/Edit/Delete POI modal form
- [x] Form validation (required fields, lat/lng range)
- [x] Audio status badges (pending/processing/completed/failed)
- [x] Google Maps placeholder (ready for API integration)

### Phase 3: Tour Management
- [x] Tour builder form
- [x] POI picker (searchable list)
- [x] Drag-reorder POIs (up/down buttons)
- [x] Tour preview with selected POIs
- [x] Save tour with validation (min 1 POI)

### Phase 4: Analytics Dashboard (Demo)
- [x] 4 KPI cards (Total Plays, Active Users, Avg Duration, Top POI)
- [x] Top 10 POI table
- [x] Time period filter (Today/7d/30d/Custom)
- [x] Heatmap placeholder

### UI & UX
- [x] Toast notifications (success/error/info/warning)
- [x] Loading skeletons & spinners
- [x] Layout with sidebar navigation
- [x] Responsive styling (Tailwind CSS)
- [x] Form validation with inline errors

---

## API Integration Notes

### Current Status: MOCK API
All services use **mock data** for rapid POC development.

#### Mock Services:
- `src/services/poiService.ts` — All marked with `// MOCK` comments
- Mock data initialized with 3 sample POIs

#### Swap to Real Backend When Ready:

1. **Backend API should provide these endpoints:**
   ```
   POST   /api/v1/admin/auth/login
   POST   /api/v1/admin/auth/logout
   GET    /api/v1/poi/load-all
   POST   /api/v1/poi
   PUT    /api/v1/poi/:id
   DELETE /api/v1/poi/:id
   GET    /api/v1/tours
   POST   /api/v1/tours
   PUT    /api/v1/tours/:id
   DELETE /api/v1/tours/:id
   GET    /api/v1/analytics/top-pois
   GET    /api/v1/analytics/summary
   ```

2. **Update .env:**
   ```
   VITE_API_URL=http://your-backend-url/api/v1
   ```

3. **Replace mock calls:**
   - Update `src/services/poiService.ts` ← remove mock, add real axios calls
   - Update `src/stores/authStore.ts` ← replace mock login with real endpoint
   - Add similar service for tours and analytics

---

## Testing Checklist

### E2E Smoke Test (5 min)

- [ ] **Startup**
  - Run `npm run dev`
  - No build errors
  - Page loads at http://localhost:5173

- [ ] **Login Flow**
  - Navigate to /login ✓
  - Enter credentials: `admin@vinh-khanh.local` / `password`
  - Submit → should redirect to /cms/dashboard
  - Token stored in localStorage

- [ ] **Protected Routes**
  - Clear localStorage
  - Try to access /cms/pois directly
  - Should redirect to /login

- [ ] **Dashboard**
  - View analytics (4 KPI cards + Top 10 table)
  - Change time filter → data updates
  - No console errors

- [ ] **POI Management**
  - Click "+ Thêm POI"
  - Fill form (name, lat, long, desc_vi required)
  - Submit → appearance in table
  - Click Edit → form pre-fills data
  - Click Delete → confirm dialog

- [ ] **Tour Builder**
  - Click "+ Tạo Tour mới"
  - Enter tour name
  - Search + add POIs
  - Re-order with ↑↓ buttons
  - Submit → tour appears in list

- [ ] **Error Handling**
  - Login with wrong password 5x → lockout message
  - Try to submit form with empty required fields → validation errors
  - No crashes

### Browser Console
- No TypeScript errors
- No 404 errors (except Google Maps API key)

---

## Tech Stack Decisions

| Layer | Technology | Why |
|-|-|-|
| **Frontend** | React 18 + Vite | Fast dev, TS support, modern |
| **State Mgmt** | Zustand | Lightweight, no context provider boilerplate |
| **Maps** | Google Maps SDK | (Placeholder ready, swap when API key provided) |
| **Styling** | Tailwind CSS | Utility-first, no config overhead |
| **Routing** | React Router v6 | Standard, nested routes support |
| **HTTP** | Axios | Interceptor support for JWT |
| **Forms** | HTML5 + Zod-ready | Validation-ready architecture |

---

## Known Limitations & TODOs

### Not Implemented (Out of MVP Scope)
- ❌ Real Google Maps rendering (need API key)
- ❌ Drag-drop POI reordering (use react-beautiful-dnd when needed)
- ❌ Heatmap rendering (need chart library integration)
- ❌ AI content enhancement (backend feature)
- ❌ TTS audio generation (backend feature)
- ❌ QR code generation (backend feature)
- ❌ Real-time analytics (WebSocket)

### Next Steps for Production
1. Integrate real backend FastAPI server
2. Implement Google Maps with API key
3. Add Heatmap library (Leaflet.heat or similar)
4. Add form validation library (Zod / React Hook Form)
5. Implement JWT token refresh logic
6. Add error boundary & logging
7. Set up Sentry/LogRocket for monitoring
8. Add E2E tests (Cypress/Playwright)

---

## Troubleshooting

**Issue:** Port 5173 already in use
```bash
# Use different port
npm run dev -- --port 3000
```

**Issue:** Module not found `@/...`
- Ensure `vite.config.ts` has path alias configured
- Restart dev server

**Issue:** Google Maps not rendering
- Add valid `VITE_MAP_API_KEY` to `.env.local`
- Restart dev server
- Check browser console for API errors

**Issue:** Form won't submit
- Check browser console for TypeScript errors
- Ensure required fields are filled
- Open DevTools Network tab to see API calls

---

## Build & Deploy

```bash
# Build for production
npm run build

# Preview build locally
npm run preview

# Type checking
npm run ts-check
```

Output: `dist/` folder → ready to deploy to static host (Vercel, Netlify, etc.)

---

## File Sizes & Performance

| Metric | Target | Current |
|-|-|-|
| **Bundle** | < 300KB | ~150KB (dev unoptimized) |
| **First Paint** | < 3s | ~1.5s (localhost) |
| **TTI** | < 5s | ~2s (localhost) |

---

## Support & Questions

- Check PRD: `PRD_VinhKhanh_v1.0.md`
- Backend API spec: See PRD section 19 (API Specification)
- Open Issues: (none yet in POC)

---

**Last Updated:** 2026-03-25
**POC Status:** ✅ Ready for backend integration
**Next Phase:** Connect real FastAPI backend + Google Maps integration
