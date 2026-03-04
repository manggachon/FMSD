import { NavLink } from 'react-router-dom';

const navItems = [
  { path: '/dashboard', label: 'แดชบอร์ด', icon: '📊' },
  { path: '/vehicles', label: 'ยานพาหนะ', icon: '🚗' },
  { path: '/drivers', label: 'ผู้ขับขี่', icon: '👤' },
  { path: '/trips', label: 'การเดินทาง', icon: '🗺️' },
  { path: '/maintenance', label: 'ซ่อมบำรุง', icon: '🔧' },
  { path: '/tracking', label: 'ติดตาม GPS', icon: '📍' },
  { path: '/reports', label: 'รายงาน', icon: '📈' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center text-sm font-bold">
            A
          </div>
          <div>
            <p className="font-bold text-lg leading-tight">ASIOS</p>
            <p className="text-xs text-gray-400">Fleet Management</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition-colors duration-150 ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <span className="text-base">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700 text-xs text-gray-500 text-center">
        ASIOS v1.0.0
      </div>
    </aside>
  );
}
