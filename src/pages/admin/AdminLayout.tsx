import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, ShoppingBag, LogOut, Package, BookOpen, PenTool, MessageSquare, Settings, ArrowLeft } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';
import { useIdleTimeout } from '../../hooks/useIdleTimeout';

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // 30 minutes idle timeout
  useIdleTimeout(1800000);

  const links = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Appointments', path: '/admin/appointments', icon: <Calendar size={20} /> },
    { name: 'Orders', path: '/admin/orders', icon: <ShoppingBag size={20} /> },
    { name: 'Products', path: '/admin/products', icon: <Package size={20} /> },
    { name: 'Books', path: '/admin/books', icon: <BookOpen size={20} /> },
    { name: 'Editorial', path: '/admin/blog', icon: <PenTool size={20} /> },
    { name: 'Comments', path: '/admin/comments', icon: <MessageSquare size={20} /> },
    { name: 'Messages', path: '/admin/messages', icon: <MessageSquare size={20} /> },
    { name: 'Site Settings', path: '/admin/settings', icon: <Settings size={20} /> },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/admin/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="h-screen bg-stone-100 flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-stone-900 text-stone-300 flex flex-col h-full shrink-0">
        <div className="p-6 border-b border-stone-800">
          <h2 className="text-xl font-bold text-white">Alayo Admin</h2>
          <p className="text-sm text-lime-500">Management Portal</p>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 space-y-1 scrollbar-thin scrollbar-thumb-stone-700">
          <Link
            to="/"
            className="flex items-center gap-3 px-6 py-3 text-stone-400 hover:text-white hover:bg-stone-800 transition-colors mb-4 border-b border-stone-800 pb-4"
          >
            <ArrowLeft size={20} />
            Back to Site
          </Link>
          
          {links.map(link => (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center gap-3 px-6 py-3 hover:bg-stone-800 hover:text-white transition-colors ${location.pathname === link.path ? 'bg-stone-800 text-lime-400 border-r-4 border-lime-500' : ''}`}
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
        </div>

        <div className="p-6 border-t border-stone-800">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 text-stone-400 hover:text-white transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        <header className="bg-white shadow-sm px-8 py-4 flex justify-between items-center sticky top-0 z-10">
          <h1 className="text-2xl font-bold text-stone-800">
            {links.find(l => l.path === location.pathname)?.name || 'Admin Panel'}
          </h1>
          <div className="flex items-center gap-4">
            {/* Profile icon removed as requested */}
          </div>
        </header>
        <div className="p-8 flex-1">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
