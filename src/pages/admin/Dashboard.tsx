import { Users, Calendar, ShoppingBag, FileText, Package, BookOpen, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { siteId } from '../../constants/siteConfig';

export default function Dashboard() {
  const [counts, setCounts] = useState({
    appointments: 0,
    orders: 0,
    messages: 0,
    products: 0,
    books: 0,
    editorial: 0
  });

  useEffect(() => {
    const unsubscribers = [
      onSnapshot(query(collection(db, 'sites', siteId, 'appointments'), where('status', '==', 'Pending')), (s) => setCounts(prev => ({ ...prev, appointments: s.size }))),
      onSnapshot(query(collection(db, 'sites', siteId, 'orders'), where('status', '==', 'Processing')), (s) => setCounts(prev => ({ ...prev, orders: s.size }))),
      onSnapshot(query(collection(db, 'sites', siteId, 'messages'), where('status', '==', 'Unread')), (s) => setCounts(prev => ({ ...prev, messages: s.size }))),
      onSnapshot(collection(db, 'sites', siteId, 'products'), (s) => setCounts(prev => ({ ...prev, products: s.size }))),
      onSnapshot(collection(db, 'sites', siteId, 'books'), (s) => setCounts(prev => ({ ...prev, books: s.size }))),
      onSnapshot(collection(db, 'sites', siteId, 'editorial'), (s) => setCounts(prev => ({ ...prev, editorial: s.size }))),
    ];
    return () => unsubscribers.forEach(unsub => unsub());
  }, []);

  const stats = [
    { label: 'Pending Appointments', value: counts.appointments.toString(), icon: <Calendar size={24} />, color: 'bg-blue-500' },
    { label: 'New Orders', value: counts.orders.toString(), icon: <ShoppingBag size={24} />, color: 'bg-lime-500' },
    { label: 'Unread Messages', value: counts.messages.toString(), icon: <MessageSquare size={24} />, color: 'bg-rose-500' },
    { label: 'Active Products', value: counts.products.toString(), icon: <Package size={24} />, color: 'bg-indigo-500' },
    { label: 'Published Books', value: counts.books.toString(), icon: <BookOpen size={24} />, color: 'bg-emerald-500' },
    { label: 'Editorial Articles', value: counts.editorial.toString(), icon: <FileText size={24} />, color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map(stat => (
          <div key={stat.label} className="bg-white p-6 rounded-xl shadow-sm border border-stone-100 flex items-center gap-4">
            <div className={`${stat.color} text-white p-4 rounded-lg`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-sm text-stone-500 font-medium">{stat.label}</p>
              <p className="text-2xl font-bold text-stone-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
      {/* Recent Activity Mock */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-6">
        <h2 className="text-lg font-bold text-stone-800 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {[
            { text: 'New appointment request from Folake A. for Naturopathic Consultation', time: '2 hours ago' },
            { text: 'Order #1042 placed for Immune Boost Herbal Tea', time: '4 hours ago' },
            { text: 'New editorial submitted: "Benefits of Amethyst" by Dr. Folake', time: '5 hours ago' },
            { text: 'New contact message from Chukwudi Okafor', time: '6 hours ago' },
            { text: 'Product stock updated: Detoxifying Crystal Set', time: '1 day ago' },
          ].map((act, i) => (
            <div key={i} className="flex justify-between items-center py-3 border-b border-stone-50 last:border-0">
              <p className="text-stone-700">{act.text}</p>
              <span className="text-sm text-stone-400">{act.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
