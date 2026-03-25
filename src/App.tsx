import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Toast } from './components/Toast';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import POIManagementPage from './pages/POIManagementPage';
import TourManagementPage from './pages/TourManagementPage';

export default function App() {
  return (
    <>
      <Toast />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/cms/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cms/pois"
            element={
              <ProtectedRoute>
                <POIManagementPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cms/tours"
            element={
              <ProtectedRoute>
                <TourManagementPage />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/cms/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}
