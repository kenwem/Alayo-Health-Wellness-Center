import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X, Save, ArrowLeft } from 'lucide-react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { handleFirestoreError, OperationType } from '../../utils/firebaseErrors';
import ImageUpload from '../../components/admin/ImageUpload';

interface Book {
  id: string;
  title: string;
  author: string;
  price: string;
  status: string;
  coverImage: string;
  preface: string;
}

export default function AdminBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'books'), orderBy('title', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const booksData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Book[];
      setBooks(booksData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'books');
    });

    return () => unsubscribe();
  }, []);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    price: '',
    status: 'Draft',
    coverImage: '',
    preface: ''
  });

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (deleteConfirmId !== null) {
      try {
        await deleteDoc(doc(db, 'books', deleteConfirmId));
        setDeleteConfirmId(null);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `books/${deleteConfirmId}`);
      }
    }
  };

  const handleEdit = (book: Book) => {
    setEditingId(book.id);
    setNewBook({
      title: book.title,
      author: book.author,
      price: book.price.replace('₦', '').replace(',', ''),
      status: book.status,
      coverImage: book.coverImage,
      preface: book.preface || ''
    });
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formattedPrice = newBook.price.startsWith('₦') ? newBook.price : `₦${newBook.price}`;
    
    try {
      if (editingId) {
        await updateDoc(doc(db, 'books', editingId), {
          ...newBook,
          price: formattedPrice,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'books'), {
          ...newBook,
          price: formattedPrice,
          createdAt: serverTimestamp()
        });
      }
      setIsAddModalOpen(false);
      setEditingId(null);
      setNewBook({ title: '', author: '', price: '', status: 'Draft', coverImage: '', preface: '' });
    } catch (error) {
      handleFirestoreError(error, editingId ? OperationType.UPDATE : OperationType.CREATE, editingId ? `books/${editingId}` : 'books');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-stone-800">Manage Books & Extracts</h2>
        <button 
          onClick={() => {
            setEditingId(null);
            setNewBook({ title: '', author: '', price: '', status: 'Draft', coverImage: '', preface: '' });
            setIsAddModalOpen(true);
          }}
          className="bg-lime-600 hover:bg-lime-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Add New Book
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="p-4 border-b border-stone-200 flex justify-between items-center">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search books..."
              className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
            />
            <Search className="absolute left-3 top-2.5 text-stone-400" size={20} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-stone-600">Cover</th>
                <th className="px-6 py-4 text-sm font-semibold text-stone-600">Title</th>
                <th className="px-6 py-4 text-sm font-semibold text-stone-600">Author</th>
                <th className="px-6 py-4 text-sm font-semibold text-stone-600">Price</th>
                <th className="px-6 py-4 text-sm font-semibold text-stone-600">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-stone-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {books.map((book) => (
                <tr key={book.id} className="hover:bg-stone-50">
                  <td className="px-6 py-4">
                    {book.coverImage ? (
                      <img src={book.coverImage} alt={book.title} className="w-10 h-14 object-cover rounded-sm shadow-sm" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-10 h-14 bg-stone-200 rounded-sm flex items-center justify-center text-stone-400 text-[10px] text-center leading-tight">No Cover</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-stone-800 font-medium">
                    <div>{book.title}</div>
                    {book.preface && <div className="text-xs text-stone-500 font-normal mt-1 truncate max-w-xs">{book.preface}</div>}
                  </td>
                  <td className="px-6 py-4 text-stone-600">{book.author}</td>
                  <td className="px-6 py-4 text-stone-600">{book.price}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${book.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {book.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-4">
                    <button onClick={() => handleEdit(book)} className="text-blue-600 hover:text-blue-800"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(book.id)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Book Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-stone-100">
              <h3 className="text-xl font-bold text-stone-800">{editingId ? 'Edit Book' : 'Add New Book'}</h3>
              <button onClick={() => { setIsAddModalOpen(false); setEditingId(null); }} className="text-stone-400 hover:text-stone-600">
                <X size={24} />
              </button>
            </div>
            <div className="overflow-y-auto p-6">
              <form id="bookForm" onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Book Title</label>
                  <input required type="text" value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})} className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Author</label>
                  <input required type="text" value={newBook.author} onChange={e => setNewBook({...newBook, author: e.target.value})} className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Price (₦)</label>
                    <input required type="text" value={newBook.price} onChange={e => setNewBook({...newBook, price: e.target.value})} className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none" placeholder="e.g. 35000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Status</label>
                    <select value={newBook.status} onChange={e => setNewBook({...newBook, status: e.target.value})} className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none bg-white">
                      <option value="Draft">Draft</option>
                      <option value="Published">Published</option>
                    </select>
                  </div>
                </div>

                <ImageUpload
                  label="Cover Image"
                  value={newBook.coverImage}
                  onChange={(url) => setNewBook({...newBook, coverImage: url})}
                  folder="books"
                />

                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Short Preface</label>
                  <textarea rows={3} value={newBook.preface} onChange={e => setNewBook({...newBook, preface: e.target.value})} className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none" placeholder="A brief summary or preface..." />
                </div>
              </form>
            </div>
            <div className="p-6 border-t border-stone-100 flex justify-end gap-3 bg-stone-50">
              <button type="button" onClick={() => { setIsAddModalOpen(false); setEditingId(null); }} className="px-4 py-2 text-stone-600 hover:bg-stone-200 rounded-lg transition-colors">Cancel</button>
              <button type="submit" form="bookForm" className="px-4 py-2 bg-lime-600 hover:bg-lime-700 text-white rounded-lg transition-colors">Save Book</button>
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
            <h3 className="text-xl font-bold text-stone-800 mb-2">Delete Book</h3>
            <p className="text-stone-600 mb-6">Are you sure you want to delete this book? This action cannot be undone.</p>
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
