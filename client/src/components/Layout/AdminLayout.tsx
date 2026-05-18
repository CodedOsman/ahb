import React from 'react';
import { Link, useLocation } from 'wouter';
import { LayoutDashboard, Scissors, ShoppingBag, Settings, LogOut, Menu, X, Camera } from 'lucide-react';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [location, setLocation] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  // Guard: redirect to login if not authenticated
  React.useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      setLocation('/admin');
    }
  }, [setLocation]);

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/admin/dashboard' },
    { name: 'Orders', icon: ShoppingBag, path: '/admin/orders' },
    { name: 'Services', icon: Scissors, path: '/admin/services' },
    { name: 'Products', icon: ShoppingBag, path: '/admin/products' },
    { name: 'Delivery Zones', icon: Settings, path: '/admin/delivery' },
    { name: 'Client Photos', icon: Camera, path: '/admin/photos' },
    { name: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setLocation('/admin');
  };

  return (
    <div className="min-h-screen bg-alabaster flex">
      {/* Sidebar */}
      <aside 
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-silk-gray border-r border-silk-gray/10 transition-all duration-300 flex flex-col z-50`}
      >
        <div className="p-6 flex items-center justify-between">
          {isSidebarOpen && (
            <h1 className="text-xl font-black text-soft-slate italic" style={{ fontFamily: "'Playfair Display', serif" }}>
              ASANTEY
            </h1>
          )}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="text-soft-slate hover:text-white transition-colors"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 py-8 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.path;
            return (
              <Link key={item.path} href={item.path}>
                <div className={`
                  flex items-center gap-4 px-4 py-3 rounded-lg cursor-pointer transition-all
                  ${isActive ? 'bg-onyx text-alabaster' : 'text-warm-silver hover:bg-white/5 hover:text-soft-slate'}
                `}>
                  <Icon size={20} />
                  {isSidebarOpen && <span className="text-sm font-bold uppercase tracking-widest">{item.name}</span>}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-silk-gray/10">
          <button 
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-lg w-full transition-all"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="text-sm font-bold uppercase tracking-widest">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
