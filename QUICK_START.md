# 🚀 QUICK START — Admin Dashboard POC

## 1️⃣ Install & Run (2 minutes)

```bash
cd c:\Users\ASUS\CShape

# Install dependencies (first time only)
npm install

# Create .env local file
copy .env.example .env.local

# Start development server
npm run dev
```

**Output:** Server starts at `http://localhost:5173`

---

## 2️⃣ Login (Demo Credentials)

**URL:** http://localhost:5173/login

```
Email:    admin@vinh-khanh.local
Password: password
```

✅ This will redirect to `/cms/dashboard` after successful login

---

## 3️⃣ Test End-to-End Flow

### Dashboard (Analytics)
- ✅ 4 KPI cards with mock data
- ✅ Top 10 POI table
- ✅ Time period filter dropdown

### POI Management
- ✅ Click "+ Thêm POI" button
- ✅ Fill form: name, lat (10.7769), long (106.6956), description
- ✅ Click "Tạo POI" → appears in table
- ✅ Click "Sửa" to edit
- ✅ Click "Xóa" to delete (with confirmation)

### Tour Management
- ✅ Click "+ Tạo Tour mới"
- ✅ Enter tour name (required)
- ✅ Search and add POIs from left panel (+ button)
- ✅ Re-order POIs with ↑↓ buttons
- ✅ Submit → tour appears in list

---

## 4️⃣ File Structure

```
c:\Users\ASUS\CShape\
├── src/
│   ├── pages/              # Page components
│   │   ├── LoginPage.tsx
│   │   ├── DashboardPage.tsx
│   │   ├── POIManagementPage.tsx
│   │   └── TourManagementPage.tsx
│   ├── components/         # Reusable components
│   │   ├── Layout.tsx
│   │   ├── POITable.tsx
│   │   ├── POIForm.tsx
│   │   └── ...
│   ├── stores/            # Zustand state
│   │   └── authStore.ts
│   ├── services/          # API services (MOCK)
│   │   └── poiService.ts
│   ├── App.tsx           # Router
│   └── main.tsx          # Entry
├── package.json
├── vite.config.ts
├── tsconfig.json
├── .env.example
├── IMPLEMENTATION_GUIDE.md  # 📖 Full guide
└── index.html
```

---

## 5️⃣ Current Status

| Feature | Status | Notes |
|---------|--------|-------|
| **🔐 Authentication** | ✅ Complete | JWT + rate limiting (5 attempts = 5min lock) |
| **📍 POI CRUD** | ✅ Complete | Form validation, pagination, search, filter |
| **🎯 Tour Builder** | ✅ Complete | Drag-reorder, validation |
| **📊 Dashboard** | ✅ Demo | Mock data, ready for real analytics API |
| **🗺️ Maps** | 🔄 Placeholder | Needs Google Maps API key |
| **🔗 Backend API** | 🔄 Mock | Ready to swap when backend is available |

---

## 6️⃣ Next Steps

### To Connect Real Backend:
1. Update `VITE_API_URL` in `.env.local`
2. Replace mock API calls in `src/services/poiService.ts`
3. Similar updates for tours, analytics services

### To Add Google Maps:
1. Get Google Maps API key from Google Cloud Console
2. Add to `VITE_MAP_API_KEY` in `.env.local`
3. Uncomment in `src/components/POIMap.tsx`

### To Deploy:
```bash
npm run build
# Copy dist/ folder to hosting (Vercel, Netlify, etc.)
```

---

## 7️⃣ Troubleshooting

| Issue | Solution |
|-------|----------|
| **Port 5173 in use** | `npm run dev -- --port 3000` |
| **Module not found @/...** | Restart dev server |
| **Styles not loading** | Clear browser cache |
| **Form won't submit** | Check browser console for errors |

---

## 8️⃣ Key Files to Edit

- **Auth:** `src/stores/authStore.ts` + `src/pages/LoginPage.tsx`
- **POI API:** `src/services/poiService.ts`
- **UI:** `src/index.css` (Tailwind utilities)
- **Routes:** `src/App.tsx`

---

## ✅ Architecture Highlights

✔️ **Separation of Concerns:**
- Pages = UI layout
- Components = Reusable UI
- Services = API calls
- Stores = State management

✔️ **Type Safety:**
- Full TypeScript with strict mode
- Interface definitions in services
- Type-safe Zustand store

✔️ **Error Handling:**
- Toast notifications for feedback
- Form validation with inline errors
- Protected routes for auth

✔️ **Scalability:**
- Zustand (easy to add global state)
- Service layer (easy to swap APIs)
- Component-based (easy to extend)

---

**Documentation:** See `IMPLEMENTATION_GUIDE.md` for comprehensive details

**Ready to Go!** 🎉

