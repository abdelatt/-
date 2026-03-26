import { ReactNode, useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { Building2, LayoutDashboard, FileText, Users, Calculator, Bell, Menu, ShieldCheck, LogOut, Settings, Wrench, X, PieChart } from 'lucide-react';
import { cn } from '../lib/utils';
import { useApp } from '../AppContext';
import { UserRole } from '../types';

const navItems = [
  { icon: LayoutDashboard, label: 'الرئيسية', path: '/', roles: ['owner', 'manager', 'accountant'] },
  { icon: Building2, label: 'الأملاك', path: '/buildings', roles: ['owner', 'manager'] },
  { icon: Users, label: 'السكان', path: '/tenants', roles: ['owner', 'manager'] },
  { icon: FileText, label: 'العقود', path: '/contracts', roles: ['owner', 'manager'] },
  { icon: Calculator, label: 'المالية', path: '/accounting', roles: ['owner', 'accountant'] },
  { icon: PieChart, label: 'التقارير', path: '/reports', roles: ['owner', 'accountant'] },
  { icon: Wrench, label: 'الصيانة', path: '/maintenance', roles: ['owner', 'manager'] },
  { icon: Bell, label: 'التنبيهات', path: '/notifications', roles: ['owner', 'manager', 'accountant'] },
  { icon: Settings, label: 'الإعدادات', path: '/settings', roles: ['owner'] },
];

export default function Layout() {
  const { notifications, currentUser } = useApp();
  const [role, setRole] = useState<UserRole>(currentUser.role);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredNavItems = navItems.filter(item => item.roles.includes(role));

  const getRoleLabel = (r: UserRole) => {
    switch (r) {
      case 'owner': return 'مالك';
      case 'manager': return 'مدير عقارات';
      case 'accountant': return 'محاسب';
      default: return '';
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar - Desktop */}
      <aside className="w-64 bg-white border-l border-slate-200 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <Building2 className="w-8 h-8 text-blue-600 ml-3" />
          <h1 className="text-xl font-bold text-slate-800">إدارة الأملاك</h1>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <div className="px-6 mb-4">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">الدور الحالي</p>
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="w-full bg-transparent text-sm font-bold text-blue-700 focus:outline-none cursor-pointer"
              >
                <option value="owner">مالك (Owner)</option>
                <option value="manager">مدير (Manager)</option>
                <option value="accountant">محاسب (Accountant)</option>
              </select>
            </div>
          </div>
          <ul className="space-y-1 px-3">
            {filteredNavItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive 
                        ? "bg-blue-50 text-blue-700" 
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )
                  }
                >
                  <item.icon className="w-5 h-5 ml-3" />
                  {item.label}
                  {item.path === '/notifications' && unreadCount > 0 && (
                    <span className="mr-auto bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-slate-200">
          <div className="flex items-center p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xs ml-3 shrink-0">
              {currentUser.name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0 overflow-hidden">
              <p className="text-sm font-bold text-slate-800 truncate">{currentUser.name}</p>
              <p className="text-[10px] text-slate-500 truncate">{getRoleLabel(role)}</p>
            </div>
            <LogOut className="w-4 h-4 text-slate-400 mr-2" />
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 right-0 w-64 bg-white z-50 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col",
        isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="h-16 flex items-center px-6 border-b border-slate-200 justify-between">
          <div className="flex items-center">
            <Building2 className="w-8 h-8 text-blue-600 ml-3" />
            <h1 className="text-xl font-bold text-slate-800">إدارة الأملاك</h1>
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-slate-100 rounded-full">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {filteredNavItems.map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive 
                        ? "bg-blue-50 text-blue-700" 
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    )
                  }
                >
                  <item.icon className="w-5 h-5 ml-3" />
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6">
          <div className="flex items-center md:hidden">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="text-slate-500 hover:text-slate-700 p-2 rounded-lg hover:bg-slate-50"
            >
              <Menu className="w-6 h-6" />
            </button>
            <span className="mr-4 text-lg font-bold text-slate-800">إدارة الأملاك</span>
          </div>
          <div className="hidden md:flex items-center text-sm text-slate-500">
            <ShieldCheck className="w-4 h-4 ml-2 text-emerald-500" />
            نظام آمن • {getRoleLabel(role)}
          </div>
          
          <div className="flex items-center space-x-4 space-x-reverse">
            <Link to="/notifications" className="relative p-2 text-slate-400 hover:text-slate-500 transition-colors">
              <Bell className="w-6 h-6" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              )}
            </Link>
            <Link to="/settings" className="p-2 text-slate-400 hover:text-slate-500 transition-colors">
              <Settings className="w-6 h-6" />
            </Link>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
