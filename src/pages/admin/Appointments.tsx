import React, { useState, useEffect } from 'react';
import { Trash2, X } from 'lucide-react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { handleFirestoreError, OperationType } from '../../utils/firebaseErrors';

interface Appointment {
  id: string;
  name: string;
  service: string;
  date: string;
  status: string;
}

export default function Appointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'appointments'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const appointmentsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Appointment[];
      setAppointments(appointmentsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'appointments');
    });

    return () => unsubscribe();
  }, []);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [newAppointment, setNewAppointment] = useState({
    name: '',
    service: '',
    date: '',
    status: 'Pending'
  });

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (deleteConfirmId !== null) {
      try {
        await deleteDoc(doc(db, 'appointments', deleteConfirmId));
        setDeleteConfirmId(null);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `appointments/${deleteConfirmId}`);
      }
    }
  };

  const handleManage = (apt: Appointment) => {
    setEditingId(apt.id);
    setNewAppointment({
      name: apt.name,
      service: apt.service,
      date: apt.date,
      status: apt.status
    });
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const aptData = {
      name: newAppointment.name,
      service: newAppointment.service,
      date: newAppointment.date,
      status: newAppointment.status
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'appointments', editingId), aptData);
      } else {
        await addDoc(collection(db, 'appointments'), aptData);
      }
      setIsAddModalOpen(false);
      setEditingId(null);
      setNewAppointment({ name: '', service: '', date: '', status: 'Pending' });
    } catch (error) {
      handleFirestoreError(error, editingId ? OperationType.UPDATE : OperationType.CREATE, editingId ? `appointments/${editingId}` : 'appointments');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
      <div className="p-6 border-b border-stone-100 flex justify-between items-center">
        <h2 className="text-lg font-bold text-stone-800">Consultation Requests</h2>
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
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-50 text-stone-500 text-sm">
              <th className="p-4 font-medium">Patient Name</th>
              <th className="p-4 font-medium">Service</th>
              <th className="p-4 font-medium">Date Requested</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {appointments.map((apt) => (
              <tr key={apt.id} className="text-stone-700">
                <td className="p-4">{apt.name}</td>
                <td className="p-4">{apt.service}</td>
                <td className="p-4">{apt.date}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${apt.status === 'Confirmed' ? 'bg-green-100 text-green-700' : apt.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-stone-100 text-stone-700'}`}>
                    {apt.status}
                  </span>
                </td>
                <td className="p-4 flex items-center gap-4">
                  <button onClick={() => handleManage(apt)} className="text-lime-600 hover:text-lime-800 font-medium text-sm">Manage</button>
                  <button onClick={() => handleDelete(apt.id)} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Patient Name</label>
                <input required type="text" value={newAppointment.name} onChange={e => setNewAppointment({...newAppointment, name: e.target.value})} className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Service</label>
                <input required type="text" value={newAppointment.service} onChange={e => setNewAppointment({...newAppointment, service: e.target.value})} className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Date</label>
                <input required type="text" value={newAppointment.date} onChange={e => setNewAppointment({...newAppointment, date: e.target.value})} className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none" placeholder="e.g. Oct 24, 2026" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Status</label>
                <select value={newAppointment.status} onChange={e => setNewAppointment({...newAppointment, status: e.target.value})} className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none bg-white">
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => { setIsAddModalOpen(false); setEditingId(null); }} className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-lime-600 hover:bg-lime-700 text-white rounded-lg transition-colors">Save Appointment</button>
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
