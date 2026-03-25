import { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface LayoutProps {
  title: string;
  children: ReactNode;
}

export default function Layout({ title, children }: LayoutProps) {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 shadow">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-xs text-gray-500 mt-1">Vinh Khanh Guide</p>
        </div>

        <nav className="p-4 space-y-2">
          <NavLink
            label="📊 Dashboard"
            href="/cms/dashboard"
            onClick={() => navigate('/cms/dashboard')}
          />
          <NavLink
            label="📍 Quản lý POI"
            href="/cms/pois"
            onClick={() => navigate('/cms/pois')}
          />
          <NavLink
            label="🎯 Quản lý Tour"
            href="/cms/tours"
            onClick={() => navigate('/cms/tours')}
          />
        </nav>

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 w-64 p-4 border-t border-gray-200 bg-gray-50">
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-900">{user?.email}</p>
            <p className="text-xs text-gray-500">{user?.role}</p>
          </div>
          <button
            className="btn btn-outline w-full text-sm"
            onClick={handleLogout}
          >
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
          <p className="text-sm text-gray-600 mt-1">
            {location.pathname === '/cms/dashboard' && 'Xem thống kê và phân tích'}
            {location.pathname === '/cms/pois' && 'Quản lý các điểm tham quan (POIs)'}
            {location.pathname === '/cms/tours' && 'Tạo và quản lý các tour du lịch'}
          </p>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

interface NavLinkProps {
  label: string;
  href: string;
  onClick: () => void;
}

function NavLink({ label, onClick }: NavLinkProps) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left px-4 py-2 rounded-lg text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
    >
      {label}
    </button>
  );
}
