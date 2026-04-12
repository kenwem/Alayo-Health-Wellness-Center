import React, { useState, useEffect } from 'react';
import { Eye, Trash2, Search, X } from 'lucide-react';
import { collection, onSnapshot, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { handleFirestoreError, OperationType } from '../../utils/firebaseErrors';
import { siteId } from '../../constants/siteConfig';

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  date: string;
  status: string;
  content: string;
}

export default function AdminMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const q = query(collection(db, 'sites', siteId, 'messages'), orderBy('date', sortOrder));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];
      setMessages(messagesData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `sites/${siteId}/messages`);
    });

    return () => unsubscribe();
  }, [sortOrder]);

  const totalPages = Math.ceil(messages.length / itemsPerPage);
  const paginatedMessages = messages.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const [viewingMessage, setViewingMessage] = useState<Message | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (deleteConfirmId !== null) {
      try {
        await deleteDoc(doc(db, 'sites', siteId, 'messages', deleteConfirmId));
        setDeleteConfirmId(null);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `sites/${siteId}/messages/${deleteConfirmId}`);
      }
    }
  };

  const handleView = async (msg: Message) => {
    setViewingMessage(msg);
    if (msg.status === 'Unread') {
      try {
        await updateDoc(doc(db, 'sites', siteId, 'messages', msg.id), { status: 'Read' });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `sites/${siteId}/messages/${msg.id}`);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-stone-800">Messages & Inquiries</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="p-4 border-b border-stone-200 flex justify-between items-center">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search messages..."
              className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
            />
            <Search className="absolute left-3 top-2.5 text-stone-400" size={20} />
          </div>
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
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-stone-600">Name</th>
                <th className="px-6 py-4 text-sm font-semibold text-stone-600">Subject</th>
                <th className="px-6 py-4 text-sm font-semibold text-stone-600">Date</th>
                <th className="px-6 py-4 text-sm font-semibold text-stone-600">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-stone-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {paginatedMessages.map((msg) => (
                <tr key={msg.id} className={`hover:bg-stone-50 ${msg.status === 'Unread' ? 'bg-stone-50/50' : ''}`}>
                  <td className="px-6 py-4">
                    <div className="font-medium text-stone-800">{msg.name}</div>
                    <div className="text-sm text-stone-500">{msg.email}</div>
                  </td>
                  <td className="px-6 py-4 text-stone-600 font-medium">{msg.subject}</td>
                  <td className="px-6 py-4 text-stone-600">{msg.date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${msg.status === 'Unread' ? 'bg-blue-100 text-blue-700' : 'bg-stone-100 text-stone-700'}`}>
                      {msg.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-4">
                    <button onClick={() => handleView(msg)} className="text-blue-600 hover:text-blue-800"><Eye size={18} /></button>
                    <button onClick={() => handleDelete(msg.id)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
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
      </div>

      {/* View Message Modal */}
      {viewingMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-stone-100">
              <h3 className="text-xl font-bold text-stone-800">Message Details</h3>
              <button onClick={() => setViewingMessage(null)} className="text-stone-400 hover:text-stone-600">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-stone-500">From</p>
                <p className="font-medium text-stone-800">{viewingMessage.name} &lt;{viewingMessage.email}&gt;</p>
              </div>
              <div>
                <p className="text-sm text-stone-500">Date</p>
                <p className="font-medium text-stone-800">{viewingMessage.date}</p>
              </div>
              <div>
                <p className="text-sm text-stone-500">Subject</p>
                <p className="font-medium text-stone-800">{viewingMessage.subject}</p>
              </div>
              <div className="pt-4 border-t border-stone-100">
                <p className="text-sm text-stone-500 mb-2">Message</p>
                <p className="text-stone-700 whitespace-pre-wrap">{viewingMessage.content}</p>
              </div>
            </div>
            <div className="p-6 border-t border-stone-100 flex justify-end bg-stone-50">
              <button onClick={() => setViewingMessage(null)} className="px-4 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 rounded-lg transition-colors">Close</button>
            </div>
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
            <h3 className="text-xl font-bold text-stone-800 mb-2">Delete Message</h3>
            <p className="text-stone-600 mb-6">Are you sure you want to delete this message? This action cannot be undone.</p>
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
