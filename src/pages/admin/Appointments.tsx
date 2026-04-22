import React, { useState, useEffect } from 'react';
import { Trash2, X, Loader2 } from 'lucide-react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { handleFirestoreError, OperationType } from '../../utils/firebaseErrors';
import { siteId } from '../../constants/siteConfig';

interface Appointment {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  status: string;
  message?: string;
}

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const q = query(collection(db, 'sites', siteId, 'appointments'), orderBy('date', sortOrder));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const appointmentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];
      setAppointments(appointmentsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `sites/${siteId}/appointments`);
    });

    return () => unsubscribe();
  }, [sortOrder]);

  const totalPages = Math.ceil(appointments.length / itemsPerPage);
  const paginatedAppointments = appointments.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [newAppointment, setNewAppointment] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    date: '',
    time: '',
    status: 'Pending',
    message: ''
  });

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (deleteConfirmId !== null) {
      try {
        await deleteDoc(doc(db, 'sites', siteId, 'appointments', deleteConfirmId));
        setDeleteConfirmId(null);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `sites/${siteId}/appointments/${deleteConfirmId}`);
      }
    }
  };

  const handleManage = (apt: Appointment) => {
    setEditingId(apt.id);
    setNewAppointment({
      name: apt.name,
      email: apt.email || '',
      phone: apt.phone || '',
      service: apt.service,
      date: apt.date,
      time: apt.time || '',
      status: apt.status,
      message: apt.message || ''
    });
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Ensure date is formatted correctly if it's from the HTML date input (yyyy-mm-dd)
    let formattedDate = newAppointment.date;
    if (formattedDate.includes('-') && formattedDate.split('-')[0].length === 4) {
      const [year, month, day] = formattedDate.split('-');
      formattedDate = `${day}/${month}/${year}`;
    }

    const aptData = {
      name: newAppointment.name,
      email: newAppointment.email,
      phone: newAppointment.phone,
      service: newAppointment.service,
      date: formattedDate,
      time: newAppointment.time,
      status: newAppointment.status,
      message: newAppointment.message
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'sites', siteId, 'appointments', editingId), aptData);
      } else {
        await addDoc(collection(db, 'sites', siteId, 'appointments'), aptData);
      }
      setIsAddModalOpen(false);
      setEditingId(null);
      setNewAppointment({ name: '', service: '', date: '', status: 'Pending' });
    } catch (error) {
      handleFirestoreError(error, editingId ? OperationType.UPDATE : OperationType.CREATE, editingId ? `sites/${siteId}/appointments/${editingId}` : `sites/${siteId}/appointments`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
      <div className="p-6 border-b border-stone-100 flex justify-between items-center">
        <h2 className="text-lg font-bold text-stone-800">Consultation Requests</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-stone-500">Sort by Date:</span>
            <select 
              value={sortOrder} 
              onChange={(e) => setSortOrder(e.target.value as 'desc' | 'asc')}
              className="border border-stone-200 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-lime-500"
            >
              <option value="desc">Newest First</option>
              <option value="asc">Oldest First</option>
            </select>
          </div>
          <button 
            onClick={() => {
              setEditingId(null);
              setNewAppointment({ name: '', service: '', date: '', status: 'Pending' });
              setIsAddModalOpen(true);
            }}
            className="bg-lime-500 hover:bg-lime-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Add New
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-50 text-stone-500 text-sm">
              <th className="p-4 font-medium">Patient Info</th>
              <th className="p-4 font-medium">Service</th>
              <th className="p-4 font-medium">Schedule</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {paginatedAppointments.map((apt) => (
              <tr key={apt.id} className="text-stone-700 hover:bg-stone-50/50 transition-colors">
                <td className="p-4">
                  <div className="font-bold text-stone-900">{apt.name}</div>
                  <div className="text-xs text-stone-500">{apt.email}</div>
                  <div className="text-xs text-stone-500">{apt.phone}</div>
                </td>
                <td className="p-4">{apt.service}</td>
                <td className="p-4">
                  <div className="font-medium">{apt.date}</div>
                  <div className="text-xs text-lime-600 font-bold">{apt.time}</div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${apt.status === 'Confirmed' ? 'bg-green-100 text-green-700' : apt.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-stone-100 text-stone-700'}`}>
                    {apt.status}
                  </span>
                </td>
                <td className="p-4 flex items-center gap-4">
                  <button onClick={() => handleManage(apt)} className="text-lime-600 hover:text-lime-800 font-medium text-sm">Manage</button>
                  <button onClick={() => handleDelete(apt.id)} className="text-red-600 hover:text-red-800 transition-colors"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-stone-200 flex justify-center items-center gap-4">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            className="px-3 py-1 border border-stone-200 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-stone-600">Page {currentPage} of {totalPages}</span>
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            className="px-3 py-1 border border-stone-200 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      {/* Add/Edit Appointment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-stone-100">
              <h3 className="text-xl font-bold text-stone-800">{editingId ? 'Edit Appointment' : 'Add New Appointment'}</h3>
              <button onClick={() => { setIsAddModalOpen(false); setEditingId(null); }} className="text-stone-400 hover:text-stone-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Patient Name</label>
                <input required type="text" value={newAppointment.name} onChange={e => setNewAppointment({...newAppointment, name: e.target.value})} className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none placeholder:text-stone-300" placeholder="Full name" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Email</label>
                  <input required type="email" value={newAppointment.email} onChange={e => setNewAppointment({...newAppointment, email: e.target.value})} className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none placeholder:text-stone-300" placeholder="email@example.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Phone</label>
                  <input required type="text" value={newAppointment.phone} onChange={e => setNewAppointment({...newAppointment, phone: e.target.value})} className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none placeholder:text-stone-300" placeholder="080..." />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Service</label>
                <input required type="text" value={newAppointment.service} onChange={e => setNewAppointment({...newAppointment, service: e.target.value})} className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none placeholder:text-stone-300" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Date</label>
                  <input required type="text" value={newAppointment.date} onChange={e => setNewAppointment({...newAppointment, date: e.target.value})} className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none placeholder:text-stone-300" placeholder="dd/mm/yyyy" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Time</label>
                  <input required type="text" value={newAppointment.time} onChange={e => setNewAppointment({...newAppointment, time: e.target.value})} className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none placeholder:text-stone-300" placeholder="e.g. 09:00 AM" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Status</label>
                <select value={newAppointment.status} onChange={e => setNewAppointment({...newAppointment, status: e.target.value})} className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none bg-white">
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Message</label>
                <textarea rows={3} value={newAppointment.message} onChange={e => setNewAppointment({...newAppointment, message: e.target.value})} className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none resize-none placeholder:text-stone-300" placeholder="Additional notes..."></textarea>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => { setIsAddModalOpen(false); setEditingId(null); }} className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors">Cancel</button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="px-4 py-2 bg-lime-600 hover:bg-lime-700 text-white rounded-lg transition-colors disabled:bg-stone-400 flex items-center gap-2"
                >
                  {isSaving && <Loader2 className="animate-spin" size={18} />}
                  {isSaving ? 'Saving...' : 'Save Appointment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} className="text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-stone-800 mb-2">Delete Appointment</h3>
            <p className="text-stone-600 mb-6">Are you sure you want to delete this appointment? This action cannot be undone.</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors font-medium">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
