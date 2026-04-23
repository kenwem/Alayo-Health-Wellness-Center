import { Calendar, FileText, Package, BookOpen, Star, MessageSquare } from 'lucide-react';
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase';
import { siteId } from '../../constants/siteConfig';

interface ActivityItem {
  id: string;
  text: string;
  time: string;
  timestamp: number;
}

export default function Dashboard() {
  const [counts, setCounts] = useState({
    appointments: 0,
    products: 0,
    books: 0,
    editorial: 0,
    testimonials: 0
  });

  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [clearedAt, setClearedAt] = useState<number>(0);

  useEffect(() => {
    // Load clearedAt from localStorage to persist across refreshes
    const savedClearedAt = localStorage.getItem('dashboard_cleared_at');
    if (savedClearedAt) setClearedAt(parseInt(savedClearedAt));
    // 1. Stats Counters
    const unsubStats = [
      onSnapshot(collection(db, 'sites', siteId, 'appointments'), (s) => setCounts(prev => ({ ...prev, appointments: s.docs.filter(d => d.data().status === 'Pending').length }))),
      onSnapshot(collection(db, 'sites', siteId, 'products'), (s) => setCounts(prev => ({ ...prev, products: s.size }))),
      onSnapshot(collection(db, 'sites', siteId, 'books'), (s) => setCounts(prev => ({ ...prev, books: s.size }))),
      onSnapshot(collection(db, 'sites', siteId, 'editorial'), (s) => setCounts(prev => ({ ...prev, editorial: s.size }))),
      onSnapshot(collection(db, 'sites', siteId, 'testimonials'), (s) => setCounts(prev => ({ ...prev, testimonials: s.size }))),
    ];

    // 2. Multi-collection Activity Feed
    const collections = [
      { name: 'appointments', label: 'Appointment requested by', field: 'name', timeField: 'createdAt' },
      { name: 'messages', label: 'New message from', field: 'name', timeField: 'createdAt' },
      { name: 'editorial', label: 'New article published:', field: 'title', timeField: 'createdAt' }
    ];

    const activityStreams: any = {};
    
    const formatTime = (ts: any) => {
      if (!ts) return 'Just now';
      const date = ts.seconds ? new Date(ts.seconds * 1000) : new Date(ts);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return `${diffDays}d ago`;
    };

    const updateActivity = () => {
      const allActivity: ActivityItem[] = [];
      Object.keys(activityStreams).forEach(col => {
        activityStreams[col].forEach((doc: any) => {
          const data = doc.data();
          const colInfo = collections.find(c => c.name === col);
          if (colInfo) {
            allActivity.push({
              id: doc.id,
              text: `${colInfo.label} ${data[colInfo.field] || 'Unknown'}`,
              time: formatTime(data[colInfo.timeField] || data.date || ''),
              timestamp: data[colInfo.timeField]?.seconds 
                ? data[colInfo.timeField].seconds * 1000 
                : (data.date ? new Date(data.date).getTime() : Date.now())
            });
          }
        });
      });

      setRecentActivity(allActivity
        .filter(a => a.timestamp > clearedAt)
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 8));
    };

    const unsubActivity = collections.map(col => {
      return onSnapshot(
        query(collection(db, 'sites', siteId, col.name), orderBy(col.timeField || 'createdAt', 'desc'), limit(5)),
        (snap) => {
          activityStreams[col.name] = snap.docs;
          updateActivity();
        },
        (err) => {
          // Fallback if index isn't created yet or field missing
          onSnapshot(query(collection(db, 'sites', siteId, col.name), limit(5)), (snap) => {
            activityStreams[col.name] = snap.docs;
            updateActivity();
          });
        }
      );
    });

    return () => {
      unsubStats.forEach(unsub => unsub());
      unsubActivity.forEach(unsub => unsub());
    };
  }, []);

  const stats = [
    { label: 'Pending Appointments', value: counts.appointments.toString(), icon: <Calendar size={24} />, color: 'bg-blue-500' },
    { label: 'Active Products', value: counts.products.toString(), icon: <Package size={24} />, color: 'bg-indigo-500' },
    { label: 'Published Books', value: counts.books.toString(), icon: <BookOpen size={24} />, color: 'bg-emerald-500' },
    { label: 'Editorial Articles', value: counts.editorial.toString(), icon: <FileText size={24} />, color: 'bg-purple-500' },
    { label: 'Testimonials', value: counts.testimonials.toString(), icon: <Star size={24} />, color: 'bg-amber-500' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

      <div className="bg-white rounded-xl shadow-sm border border-stone-100 p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-stone-800 inline-flex items-center gap-2">
            <Package className="text-lime-600" size={20} />
            Recent Activity
          </h2>
          <button 
            onClick={() => {
              const now = Date.now();
              setClearedAt(now);
              localStorage.setItem('dashboard_cleared_at', now.toString());
            }}
            className="text-xs text-stone-400 hover:text-stone-600 transition-colors px-2 py-1 hover:bg-stone-50 rounded"
          >
            Clear All
          </button>
        </div>
        <div className="space-y-4">
          {recentActivity.length > 0 ? (
            recentActivity.map((act) => (
              <div key={act.id} className="flex justify-between items-center py-3 border-b border-stone-50 last:border-0 hover:bg-stone-50/50 px-2 rounded-lg transition-colors">
                <p className="text-stone-700 font-medium">{act.text}</p>
                <span className="text-sm text-stone-400">{act.time}</span>
              </div>
            ))
          ) : (
            <p className="text-stone-400 text-center py-8">No recent activity found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
