import React, { useState, useEffect } from 'react';
import { Trash2, X, Plus, Edit } from 'lucide-react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import { handleFirestoreError, OperationType } from '../../utils/firebaseErrors';

interface Order {
  id: string;
  name: string;
  product: string;
  total: string;
  status: string;
  orderId: string;
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('orderId', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ordersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[];
      setOrders(ordersData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'orders');
    });

    return () => unsubscribe();
  }, []);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [newOrder, setNewOrder] = useState({
    orderId: '',
    name: '',
    product: '',
    total: '',
    status: 'Processing'
  });

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (deleteConfirmId !== null) {
      try {
        await deleteDoc(doc(db, 'orders', deleteConfirmId));
        setDeleteConfirmId(null);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `orders/${deleteConfirmId}`);
      }
    }
  };

  const handleEdit = (order: Order) => {
    setEditingId(order.id);
    setNewOrder({
      orderId: order.orderId.replace('#', ''),
      name: order.name,
      product: order.product,
      total: order.total.replace('₦', '').replace(',', ''),
      status: order.status
    });
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formattedOrderId = newOrder.orderId.startsWith('#') ? newOrder.orderId : `#${newOrder.orderId}`;
    const formattedTotal = newOrder.total.startsWith('₦') ? newOrder.total : `₦${newOrder.total}`;
    
    const orderData = {
      orderId: formattedOrderId,
      name: newOrder.name,
      product: newOrder.product,
      total: formattedTotal,
      status: newOrder.status,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' })
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'orders', editingId), orderData);
      } else {
        await addDoc(collection(db, 'orders'), orderData);
      }
      setIsAddModalOpen(false);
      setEditingId(null);
      setNewOrder({ orderId: '', name: '', product: '', total: '', status: 'Processing' });
    } catch (error) {
      handleFirestoreError(error, editingId ? OperationType.UPDATE : OperationType.CREATE, editingId ? `orders/${editingId}` : 'orders');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-100 overflow-hidden">
      <div className="p-6 border-b border-stone-100 flex justify-between items-center">
        <h2 className="text-lg font-bold text-stone-800">Product Orders</h2>
        <button 
          onClick={() => {
            setEditingId(null);
            setNewOrder({ orderId: '', name: '', product: '', total: '', status: 'Processing' });
            setIsAddModalOpen(true);
          }}
          className="bg-lime-500 hover:bg-lime-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <Plus size={16} /> Add New
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-stone-50 text-stone-500 text-sm">
              <th className="p-4 font-medium">Order ID</th>
              <th className="p-4 font-medium">Customer</th>
              <th className="p-4 font-medium">Product</th>
              <th className="p-4 font-medium">Total</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {orders.map((order) => (
              <tr key={order.id} className="text-stone-700">
                <td className="p-4 font-medium">{order.orderId}</td>
                <td className="p-4">{order.name}</td>
                <td className="p-4">{order.product}</td>
                <td className="p-4">{order.total}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === 'Shipped' ? 'bg-blue-100 text-blue-700' : order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-4 flex items-center gap-4">
                  <button onClick={() => handleEdit(order)} className="text-blue-600 hover:text-blue-800"><Edit size={16} /></button>
                  <button onClick={() => handleDelete(order.id)} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Order Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-stone-100">
              <h3 className="text-xl font-bold text-stone-800">{editingId ? 'Edit Order' : 'Add New Order'}</h3>
              <button onClick={() => { setIsAddModalOpen(false); setEditingId(null); }} className="text-stone-400 hover:text-stone-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Order ID</label>
                <input required type="text" value={newOrder.orderId} onChange={e => setNewOrder({...newOrder, orderId: e.target.value})} className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none" placeholder="e.g. 1043" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Customer Name</label>
                <input required type="text" value={newOrder.name} onChange={e => setNewOrder({...newOrder, name: e.target.value})} className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Product</label>
                <input required type="text" value={newOrder.product} onChange={e => setNewOrder({...newOrder, product: e.target.value})} className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Total (₦)</label>
                  <input required type="text" value={newOrder.total} onChange={e => setNewOrder({...newOrder, total: e.target.value})} className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none" placeholder="e.g. 5000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Status</label>
                  <select value={newOrder.status} onChange={e => setNewOrder({...newOrder, status: e.target.value})} className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none bg-white">
                    <option value="Processing">Processing</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => { setIsAddModalOpen(false); setEditingId(null); }} className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-lime-600 hover:bg-lime-700 text-white rounded-lg transition-colors">Save Order</button>
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
            <h3 className="text-xl font-bold text-stone-800 mb-2">Delete Order</h3>
            <p className="text-stone-600 mb-6">Are you sure you want to delete this order? This action cannot be undone.</p>
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
