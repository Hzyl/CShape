# 🚀 FULL STACK SETUP GUIDE — React Frontend + C# Backend

**Status:** ✅ Complete | Ready to run both frontend & backend

## 📦 What's Included

- **Frontend:** React 18 + TypeScript + Zustand (in `src/` folder)
- **Backend:** C# ASP.NET Core 8 + MongoDB + JWT Auth (in `CShapeBackend/` folder)
- **Database:** MongoDB (document database)
- **API:** 20+ RESTful endpoints
- **Auth:** JWT tokens + Rate limiting + Password hashing (BCrypt)

---

## 🎯 Prerequisites

### Frontend
- Node.js 18+ ([Download](https://nodejs.org/))
- npm 9+ (`npm --version`)

### Backend
- .NET 8 SDK ([Download](https://dotnet.microsoft.com/download))
- MongoDB 6+ ([Local](https://docs.mongodb.com/manual/installation/) or [Atlas Cloud](https://www.mongodb.com/cloud/atlas))

---

## ⚙️ Setup

### Step 1: Clone & Navigate

```bash
# You already have the code
cd c:\Users\ASUS\CShape
```

### Step 2: Setup MongoDB

**Option A: Local MongoDB** (Recommended for DEV)
```bash
# Install MongoDB Community (Windows)
# 1. Download: https://www.mongodb.com/try/download/community
# 2. Run installer
# 3. Verify: mongod --version
# 4. Start service:
mongod
```

**Option B: MongoDB Atlas** (Cloud, Free)
1. Go to https://www.mongodb.com/cloud/atlas
2. Create account & cluster
3. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/`
4. Update `CShapeBackend/appsettings.json`:
   ```json
   "MongoDb": {
     "ConnectionString": "mongodb+srv://...your-connection-string...",
     "DatabaseName": "vinhkhanh_guide"
   }
   ```

### Step 3: Start Backend (Terminal 1)

```bash
# Navigate to backend folder
cd CShapeBackend

# Restore NuGet packages
dotnet restore

# Run the server
dotnet run
```

**Expected Output:**
```
info: Microsoft.Hosting.Lifetime[14]
      Now listening on: https://localhost:5001
      Now listening on: http://localhost:5000
```

✅ Backend is ready at: `http://localhost:5000`
✅ Swagger UI at: `http://localhost:5000/swagger`

### Step 4: Start Frontend (Terminal 2)

```bash
# Navigate back to root folder
cd ..  # or cd c:\Users\ASUS\CShape if in different folder

# Install dependencies (first time only)
npm install

# Create .env file with backend URL
copy .env.example .env.local

# Edit .env.local (optional, backend is at localhost:5000 by default)
# VITE_API_URL=http://localhost:5000/api/v1
# VITE_MAP_API_KEY=<your-google-maps-api-key-if-available>

# Start dev server
npm run dev
```

**Expected Output:**
```
  VITE v5.0.0  ready in 234 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

✅ Frontend is ready at: `http://localhost:5173`

---

## 🧪 Test End-to-End

### 1. Open Browser

**Frontend:** http://localhost:5173
**Backend API:** http://localhost:5000 (or Swagger at http://localhost:5000/swagger)

### 2. Login

- Email: `admin@vinh-khanh.local`
- Password: `password`

✅ Should redirect to Dashboard

### 3. Test CRUD Operations

**Dashboard:**
- View 4 KPI cards (connected to real backend now)
- Change time period filter

**POI Management:**
- Click "+ Thêm POI"
- Fill form (name, lat, long, description)
- Submit → appears in table
- Click Edit → pre-fills form
- Click Delete → confirmation

**Tour Builder:**
- Click "+ Tạo Tour mới"
- Enter tour name (required)
- Select POIs from left panel
- Re-order with ↑↓ buttons
- Submit → tour saved

### 4. Check Backend

**Via Swagger UI:**
1. Open http://localhost:5000/swagger
2. Click "Authorize" button
3. Paste JWT token from login response
4. Try "GET /api/v1/poi/load-all"

**Via cURL:**
```bash
# Login
curl -X POST http://localhost:5000/api/v1/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@vinh-khanh.local","password":"password"}'

# Copy the accessToken from response

# Create POI (use token)
curl -X POST http://localhost:5000/api/v1/poi \
  -H "Authorization: Bearer {accessToken}" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test POI",
    "type": "major",
    "latitude": 10.7769,
    "longitude": 106.6956,
    "triggerRadius": 30,
    "priority": 1,
    "descriptionVi": "Test description"
  }'
```

---

## 📁 Project Structure

```
c:\Users\ASUS\CShape\
├── src/                           # React Frontend
│   ├── pages/                     # Page components
│   ├── components/                # Reusable components
│   ├── stores/                    # Zustand state (auth)
│   ├── services/                  # API calls
│   ├── hooks/                     # Custom hooks
│   ├── App.tsx                    # Router
│   ├── main.tsx                   # Entry point
│   └── index.css                  # Global styles
│
├── CShapeBackend/                 # C# ASP.NET Core Backend
│   ├── Controllers/               # API endpoints
│   ├── Models/                    # Data models + DTOs
│   ├── Services/                  # Business logic
│   ├── Data/                      # MongoDB context
│   ├── Program.cs                 # Startup
│   ├── appsettings.json           # Configuration
│   ├── CShapeBackend.csproj       # Dependencies
│   └── README.md                  # Backend guide
│
├── package.json                   # Frontend dependencies
├── vite.config.ts                 # Frontend bundler
├── tsconfig.json                  # TypeScript config
├── .env.example                   # Environment template
├── QUICK_START.md                 # Frontend quick start
└── IMPLEMENTATION_GUIDE.md        # Detailed guide
```

---

## 🔐 Authentication Flow

1. **Login Request** (Frontend)
   ```
   POST /api/v1/admin/auth/login
   Body: { email, password }
   ```

2. **Backend Validation** (C# Backend)
   - Check email exists
   - Verify password (BCrypt)
   - Rate limiting (5 fails → 5 min lock)
   - Generate JWT token

3. **Token Storage** (Frontend)
   - Store JWT in localStorage
   - Add to all API headers: `Authorization: Bearer {token}`

4. **Protected Routes**
   - Automatically redirect to /login if unauthorized
   - Auto-logout on 401 response

---

## 🛠️ Configuration Files

### Frontend (.env.local)
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_MAP_API_KEY=<google-maps-api-key>
VITE_APP_ENV=development
```

### Backend (appsettings.json)
```json
{
  "MongoDb": {
    "ConnectionString": "mongodb://localhost:27017",
    "DatabaseName": "vinhkhanh_guide"
  },
  "Jwt": {
    "SecretKey": "your-secret-key-at-least-32-characters",
    "ExpirationMinutes": 60,
    "Issuer": "vinhkhanh-admin",
    "Audience": "vinhkhanh-app"
  },
  "AdminDefaults": {
    "Email": "admin@vinh-khanh.local",
    "Password": "password"
  }
}
```

**⚠️ IMPORTANT FOR PRODUCTION:**
- Change `SecretKey` to strong random value
- Change default admin credentials
- Update `MongoDB.ConnectionString` to production Atlas
- Set `VITE_API_URL` to production backend URL
- Disable Swagger in production

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| **"Connection refused" from frontend** | Backend not running. Run `dotnet run` in CShapeBackend/ |
| **"MongoDB connection failed"** | Start MongoDB (`mongod`) or update connection string |
| **"Port 5173 in use"** | `npm run dev -- --port 3000` |
| **"Port 5000 in use"** | `dotnet run --urls http://localhost:5001` |
| **"JWT error"** | Ensure `appsettings.json` has valid SecretKey (32+ chars) |
| **"CORS error"** | Backend already has CORS enabled for all origins |
| **Login fails** | Check backend logs for 401 error details |
| **POI list empty** | Create a POI via API or Swagger UI |

---

## 📱 API Endpoints

### Authentication
```
POST   /api/v1/admin/auth/login        Login with email/password
POST   /api/v1/admin/auth/logout       Logout (clears token)
GET    /api/v1/admin/profile           Get current user info
```

### POIs
```
GET    /api/v1/poi/load-all            List POIs (paginated, searchable)
GET    /api/v1/poi/{id}                Get POI details
POST   /api/v1/poi                     Create POI
PUT    /api/v1/poi/{id}                Update POI
DELETE /api/v1/poi/{id}                Delete POI
GET    /api/v1/poi/nearby              Get POIs near location
```

### Tours
```
GET    /api/v1/tours                   List all tours
GET    /api/v1/tours/{id}              Get tour details
POST   /api/v1/tours                   Create tour
PUT    /api/v1/tours/{id}              Update tour
DELETE /api/v1/tours/{id}              Delete tour
```

### Analytics
```
POST   /api/v1/analytics/log-event     Log user activity
GET    /api/v1/analytics/summary       Get summary stats (7d/30d/custom)
GET    /api/v1/analytics/top-pois      Get top POIs by plays
```

---

## 🚀 Next Steps

### For Development
1. ✅ Both servers running
2. ✅ Login works
3. ✅ CRUD operations work

### For Deployment
1. **Build Frontend**
   ```bash
   npm run build
   # Creates `dist/` folder → deploy to Vercel/Netlify
   ```

2. **Deploy Backend**
   ```bash
   dotnet publish -c Release
   # Publish to Azure AppService / AWS EC2 / your-server
   ```

3. **Update Domain/URLs**
   - Update `VITE_API_URL` to production backend
   - Update backend CORS origins
   - Update Firebase/JWT secrets

### Additional Features (TODO)
- [ ] Google Maps integration (add API key)
- [ ] Drag-drop file upload for POI images
- [ ] Real-time notifications (SignalR)
- [ ] Mobile app (React Native)
- [ ] Admin user management
- [ ] Role-based access control (RBAC)
- [ ] Audit logging
- [ ] Email notifications

---

## 📚 Documentation

- **Frontend:** See `QUICK_START.md` + `IMPLEMENTATION_GUIDE.md`
- **Backend:** See `CShapeBackend/README.md`
- **PRD:** See `PRD_VinhKhanh_v1.0.docx`
- **API Postman:** [Download Template](#) (create from Swagger)

---

## ✅ Checklist for Demo/Presentation

- [ ] Both servers running (terminal 1 & 2)
- [ ] Login with demo credentials
- [ ] Dashboard shows KPI cards
- [ ] Create POI
- [ ] Edit POI
- [ ] Delete POI
- [ ] Create Tour with 2+ POIs
- [ ] Save Tour
- [ ] Check MongoDB collections (mongoDB Compass: localhost:27017)

---

## 💡 Pro Tips

1. **Keep Terminals Open**
   - Terminal 1: Backend logs
   - Terminal 2: Frontend dev server
   - Use VS Code split terminals for convenience

2. **Debug with Browser DevTools**
   - F12 → Network tab → watch API calls
   - Console tab → watch errors

3. **Check Backend Swagger**
   - http://localhost:5000/swagger
   - Great for testing endpoints without frontend

4. **MongoDB Compass** (GUI)
   - Download: https://www.mongodb.com/products/compass
   - View collections, documents in real-time

5. **VS Code Extensions**
   - "REST Client" → test APIs directly in editor
   - "C# Dev Kit" → better C# development experience

---

## 🎓 Learning Resources

- [React Docs](https://react.dev)
- [C# Async/Await](https://docs.microsoft.com/en-us/dotnet/csharp/programming-guide/concepts/async/)
- [MongoDB](https://docs.mongodb.com/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8949)
- [REST API Design](https://restfulapi.net/)

---

**Status:** ✅ Production-Ready POC Delivered 🎉

