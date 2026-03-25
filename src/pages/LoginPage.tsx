import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { showToast } from '@/components/Toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, lockTimeRemaining } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (lockTimeRemaining > 0) {
      showToast(
        `Account đã bị khóa. Vui lòng thử lại sau ${lockTimeRemaining} giây.`,
        'error'
      );
      return;
    }

    try {
      await login(email, password);
      showToast('Đăng nhập thành công!', 'success');
      navigate('/cms/dashboard');
    } catch (error) {
      showToast((error as any).message || 'Đăng nhập thất bại', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-600">
              Ứng dụng Thuyết minh Phố Ẩm thực Vĩnh Khánh
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="admin@vinh-khanh.local"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading || lockTimeRemaining > 0}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="form-label">
                Mật khẩu
              </label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading || lockTimeRemaining > 0}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={isLoading || lockTimeRemaining > 0}
            >
              {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-blue-50 rounded border border-blue-200">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Demo Credentials (POC):
            </p>
            <p className="text-sm text-gray-600">
              Email: <code className="bg-white px-2 py-1 rounded">admin@vinh-khanh.local</code>
            </p>
            <p className="text-sm text-gray-600">
              Password: <code className="bg-white px-2 py-1 rounded">password</code>
            </p>
          </div>

          {/* Lock message */}
          {lockTimeRemaining > 0 && (
            <div className="mt-4 p-4 bg-red-50 rounded border border-red-200">
              <p className="text-sm text-red-700">
                ⚠️ Account bị khóa tạm thời. Thử lại sau {lockTimeRemaining}s
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
