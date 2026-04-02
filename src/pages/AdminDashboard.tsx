import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Calendar, 
  ShoppingBag, 
  GraduationCap, 
  LogOut,
  CheckCircle2,
  Clock,
  XCircle
} from 'lucide-react';

// Mock Data
const mockConsultations = [
  { id: 1, patient: 'Amina Bello', type: 'Naturopathic', date: '2026-03-15', time: '10:00 AM', status: 'Pending' },
  { id: 2, patient: 'Chinedu Okeke', type: 'Energy Healing', date: '2026-03-15', time: '02:00 PM', status: 'Confirmed' },
  { id: 3, patient: 'Grace Adebayo', type: 'Follow-up', date: '2026-03-16', time: '11:30 AM', status: 'Pending' },
];

const mockOrders = [
  { id: 101, customer: 'Ibrahim Musa', product: 'Immune Booster Tea', date: '2026-03-12', status: 'Processing' },
  { id: 102, customer: 'Amaka Eze', product: 'Detox Formula', date: '2026-03-13', status: 'Shipped' },
];

const mockRegistrations = [
  { id: 201, student: 'Dr. Oluwaseun Adeyemi', course: 'Masterclass in Energy Medicine', status: 'Paid' },
  { id: 202, student: 'Ngozi Eze', course: 'Herbal Therapeutics', status: 'Pending Payment' },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    // Check mock authentication
    const isLoggedIn = localStorage.getItem('isAdminLoggedIn');
    if (!isLoggedIn) {
      navigate('/admin/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn');
    navigate('/admin/login');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-stone-900">Dashboard Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-lime-100 p-3 rounded-lg text-lime-600">
                    <Calendar size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-stone-500 font-medium">Upcoming Consultations</p>
                    <p className="text-2xl font-bold text-stone-900">12</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-lime-100 p-3 rounded-lg text-lime-600">
                    <ShoppingBag size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-stone-500 font-medium">Pending Orders</p>
                    <p className="text-2xl font-bold text-stone-900">5</p>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm border border-stone-100">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-lime-100 p-3 rounded-lg text-lime-600">
                    <GraduationCap size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-stone-500 font-medium">New Registrations</p>
                    <p className="text-2xl font-bold text-stone-900">8</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
              <div className="px-6 py-4 border-b border-stone-100 bg-stone-50">
                <h3 className="font-bold text-stone-900">Recent Consultations Requests</h3>
              </div>
              <div className="divide-y divide-stone-100">
                {mockConsultations.map((consultation) => (
                  <div key={consultation.id} className="px-6 py-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-stone-900">{consultation.patient}</p>
                      <p className="text-sm text-stone-500">{consultation.type} • {consultation.date} at {consultation.time}</p>
                    </div>
                    <div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        consultation.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {consultation.status === 'Confirmed' ? <CheckCircle2 size={14} /> : <Clock size={14} />}
                        {consultation.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'consultations':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-stone-900">Manage Consultations</h2>
              <button className="bg-lime-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-lime-700">
                Add New Appointment
              </button>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
              <table className="min-w-full divide-y divide-stone-200">
                <thead className="bg-stone-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-stone-200">
                  {mockConsultations.map((consultation) => (
                    <tr key={consultation.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-stone-900">{consultation.patient}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">{consultation.type}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">{consultation.date} {consultation.time}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          consultation.status === 'Confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {consultation.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-lime-600 hover:text-lime-900 mr-3">Approve</button>
                        <button className="text-red-600 hover:text-red-900">Cancel</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'orders':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-stone-900">Product Orders</h2>
            <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
              <table className="min-w-full divide-y divide-stone-200">
                <thead className="bg-stone-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-stone-200">
                  {mockOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-stone-900">#{order.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">{order.customer}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">{order.product}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          order.status === 'Shipped' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-lime-600 hover:text-lime-900">Update Status</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'classes':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-stone-900">Masterclass Registrations</h2>
            <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
              <table className="min-w-full divide-y divide-stone-200">
                <thead className="bg-stone-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Student</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Course</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-stone-500 uppercase tracking-wider">Payment Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-stone-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-stone-200">
                  {mockRegistrations.map((reg) => (
                    <tr key={reg.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-stone-900">{reg.student}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-stone-500">{reg.course}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          reg.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {reg.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-lime-600 hover:text-lime-900">View Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-stone-900 text-stone-300 flex flex-col">
        <div className="p-6">
          <h1 className="text-white text-xl font-bold tracking-tight">Alayo Admin</h1>
          <p className="text-xs text-stone-500 mt-1">Management Portal</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'dashboard' ? 'bg-lime-600 text-white' : 'hover:bg-stone-800 hover:text-white'
            }`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('consultations')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'consultations' ? 'bg-lime-600 text-white' : 'hover:bg-stone-800 hover:text-white'
            }`}
          >
            <Calendar size={20} />
            Consultations
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'orders' ? 'bg-lime-600 text-white' : 'hover:bg-stone-800 hover:text-white'
            }`}
          >
            <ShoppingBag size={20} />
            Orders
          </button>
          <button
            onClick={() => setActiveTab('classes')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'classes' ? 'bg-lime-600 text-white' : 'hover:bg-stone-800 hover:text-white'
            }`}
          >
            <GraduationCap size={20} />
            Masterclasses
          </button>
        </nav>

        <div className="p-4 border-t border-stone-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white border-b border-stone-200 px-8 py-4 flex justify-between items-center">
          <h2 className="text-lg font-medium text-stone-800">
            {activeTab === 'dashboard' && 'Overview'}
            {activeTab === 'consultations' && 'Consultations Management'}
            {activeTab === 'orders' && 'Order Management'}
            {activeTab === 'classes' && 'Masterclass Management'}
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-lime-100 rounded-full flex items-center justify-center text-lime-700 font-bold">
              A
            </div>
          </div>
        </header>
        
        <main className="p-8">
          {/* Demo Warning */}
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <div className="text-blue-600 mt-0.5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-blue-900">Prototype Mode</h4>
              <p className="text-sm text-blue-800 mt-1">
                Since database setup was declined, this admin panel is a functional prototype using mock data. In a production environment, this would connect to a real database to manage actual patient bookings, orders, and registrations.
              </p>
            </div>
          </div>

          {renderContent()}
        </main>
      </div>
    </div>
  );
}
