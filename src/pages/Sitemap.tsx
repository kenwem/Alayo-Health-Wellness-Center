import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Home, Info, HeartPulse, ShoppingBag, BookOpen, Phone, 
  Lock, LayoutDashboard, Calendar, Package, FileText, 
  MessageSquare, PenTool, ArrowRight, ShieldCheck, Globe
} from 'lucide-react';

export default function Sitemap() {
  const publicRoutes = [
    { name: 'Home', path: '/', icon: <Home size={18} />, desc: 'Landing page & overview' },
    { name: 'About Us', path: '/about', icon: <Info size={18} />, desc: 'Our history & mission' },
    { name: 'Services', path: '/services', icon: <HeartPulse size={18} />, desc: 'Healing modalities' },
    { name: 'Products', path: '/products', icon: <ShoppingBag size={18} />, desc: 'Herbs & crystals shop' },
    { name: 'Editorial', path: '/blog', icon: <BookOpen size={18} />, desc: 'Health education' },
    { name: 'Contact', path: '/contact', icon: <Phone size={18} />, desc: 'Get in touch' },
  ];

  const adminRoutes = [
    { name: 'Admin Login', path: '/admin/login', icon: <Lock size={18} />, desc: 'Secure portal access' },
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={18} />, desc: 'Overview & stats' },
    { name: 'Appointments', path: '/admin/appointments', icon: <Calendar size={18} />, desc: 'Manage bookings' },
    { name: 'Orders', path: '/admin/orders', icon: <ShoppingBag size={18} />, desc: 'Process purchases' },
    { name: 'Products', path: '/admin/products', icon: <Package size={18} />, desc: 'Inventory management' },
    { name: 'Books', path: '/admin/books', icon: <BookOpen size={18} />, desc: 'Manage publications' },
    { name: 'Editorial', path: '/admin/blog', icon: <PenTool size={18} />, desc: 'Content management' },
    { name: 'Messages', path: '/admin/messages', icon: <MessageSquare size={18} />, desc: 'User inquiries' },
  ];

  return (
    <div className="min-h-screen bg-stone-50 py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-stone-900 mb-4">Website Architecture</h1>
          <p className="text-lg text-stone-600">A holistic view of the Alayo Health & Wellness platform structure.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Public Website Branch */}
          <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Globe size={120} />
            </div>
            <div className="flex items-center gap-3 mb-8 border-b border-stone-100 pb-4">
              <div className="bg-lime-100 text-lime-600 p-3 rounded-xl">
                <Globe size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-stone-800">Public Website</h2>
                <p className="text-sm text-stone-500">Accessible to all visitors</p>
              </div>
            </div>

            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-stone-200 before:to-transparent">
              {publicRoutes.map((route, index) => (
                <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-lime-100 text-lime-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    {route.icon}
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-stone-50 p-4 rounded-xl border border-stone-100 hover:border-lime-300 hover:shadow-md transition-all">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-stone-800">{route.name}</h3>
                      <Link to={route.path} className="text-lime-600 hover:text-lime-700">
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                    <p className="text-sm text-stone-500">{route.desc}</p>
                    <code className="text-xs text-stone-400 mt-2 block">{route.path}</code>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Admin Portal Branch */}
          <div className="bg-stone-900 rounded-2xl shadow-sm border border-stone-800 p-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <ShieldCheck size={120} className="text-white" />
            </div>
            <div className="flex items-center gap-3 mb-8 border-b border-stone-800 pb-4">
              <div className="bg-stone-800 text-lime-400 p-3 rounded-xl">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Admin Portal</h2>
                <p className="text-sm text-stone-400">Secure management area</p>
              </div>
            </div>

            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-stone-700 before:to-transparent">
              {adminRoutes.map((route, index) => (
                <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-stone-900 bg-stone-800 text-lime-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    {route.icon}
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-stone-800/50 p-4 rounded-xl border border-stone-700 hover:border-lime-500/50 hover:bg-stone-800 transition-all">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-bold text-stone-200">{route.name}</h3>
                      <Link to={route.path} className="text-lime-400 hover:text-lime-300">
                        <ArrowRight size={16} />
                      </Link>
                    </div>
                    <p className="text-sm text-stone-400">{route.desc}</p>
                    <code className="text-xs text-stone-500 mt-2 block">{route.path}</code>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
