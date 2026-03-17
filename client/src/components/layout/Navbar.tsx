import { useAuthStore } from '../../store/authStore';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
      <h1 className="text-lg font-semibold text-gray-800">ระบบบริหารจัดการยานพาหนะ</h1>
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-600">
          <span className="font-medium">{user?.name}</span>
          <span className="ml-2 badge-info">{user?.role}</span>
        </div>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-red-600 transition-colors"
        >
          ออกจากระบบ
        </button>
      </div>
    </header>
  );
}
