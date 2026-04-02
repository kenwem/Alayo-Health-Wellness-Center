import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X, Save } from 'lucide-react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import ImageUpload from '../../components/admin/ImageUpload';
import { handleFirestoreError, OperationType } from '../../utils/firebaseErrors';

interface Product {
  id: string;
  name: string;
  category: string;
  price: string;
  salePrice: string;
  stock: number;
  imageUrl: string;
  shortDescription: string;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'products'), orderBy('name', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(productsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'products');
    });

    return () => unsubscribe();
  }, []);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '',
    price: '',
    salePrice: '',
    stock: '',
    imageUrl: '',
    shortDescription: ''
  });

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (deleteConfirmId !== null) {
      try {
        await deleteDoc(doc(db, 'products', deleteConfirmId));
        setDeleteConfirmId(null);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `products/${deleteConfirmId}`);
      }
    }
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setNewProduct({
      name: product.name,
      category: product.category,
      price: product.price.replace('₦', '').replace(',', ''),
      salePrice: product.salePrice ? product.salePrice.replace('₦', '').replace(',', '') : '',
      stock: product.stock.toString(),
      imageUrl: product.imageUrl,
      shortDescription: product.shortDescription || ''
    });
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formattedPrice = newProduct.price.startsWith('₦') ? newProduct.price : `₦${newProduct.price}`;
    const formattedSalePrice = newProduct.salePrice ? (newProduct.salePrice.startsWith('₦') ? newProduct.salePrice : `₦${newProduct.salePrice}`) : '';
    
    const productData = {
      name: newProduct.name,
      category: newProduct.category,
      price: formattedPrice,
      salePrice: formattedSalePrice,
      stock: Number(newProduct.stock),
      imageUrl: newProduct.imageUrl,
      shortDescription: newProduct.shortDescription
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'products', editingId), productData);
      } else {
        await addDoc(collection(db, 'products'), productData);
      }
      setIsAddModalOpen(false);
      setEditingId(null);
      setNewProduct({ name: '', category: '', price: '', salePrice: '', stock: '', imageUrl: '', shortDescription: '' });
    } catch (error) {
      handleFirestoreError(error, editingId ? OperationType.UPDATE : OperationType.CREATE, editingId ? `products/${editingId}` : 'products');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-stone-800">Manage Products</h2>
        <button 
          onClick={() => {
            setEditingId(null);
            setNewProduct({ name: '', category: '', price: '', salePrice: '', stock: '', imageUrl: '', shortDescription: '' });
            setIsAddModalOpen(true);
          }}
          className="bg-lime-600 hover:bg-lime-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Add New Product
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="p-4 border-b border-stone-200 flex justify-between items-center">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
            />
            <Search className="absolute left-3 top-2.5 text-stone-400" size={20} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-stone-600">Image</th>
                <th className="px-6 py-4 text-sm font-semibold text-stone-600">Product Name</th>
                <th className="px-6 py-4 text-sm font-semibold text-stone-600">Category</th>
                <th className="px-6 py-4 text-sm font-semibold text-stone-600">Price</th>
                <th className="px-6 py-4 text-sm font-semibold text-stone-600">Stock</th>
                <th className="px-6 py-4 text-sm font-semibold text-stone-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-stone-50">
                  <td className="px-6 py-4">
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} className="w-12 h-12 object-cover rounded-md" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="w-12 h-12 bg-stone-200 rounded-md flex items-center justify-center text-stone-400 text-xs">No Img</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-stone-800 font-medium">
                    <div>{product.name}</div>
                    {product.shortDescription && <div className="text-xs text-stone-500 font-normal mt-1 truncate max-w-xs">{product.shortDescription}</div>}
                  </td>
                  <td className="px-6 py-4 text-stone-600">{product.category}</td>
                  <td className="px-6 py-4 text-stone-600">
                    {product.salePrice ? (
                      <div>
                        <span className="text-red-600 font-medium">{product.salePrice}</span>
                        <span className="text-stone-400 line-through text-xs ml-2">{product.price}</span>
                      </div>
                    ) : (
                      <span>{product.price}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-stone-600">{product.stock}</td>
                  <td className="px-6 py-4 text-right space-x-4">
                    <button onClick={() => handleEdit(product)} className="text-blue-600 hover:text-blue-800"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-6 border-b border-stone-100">
              <h3 className="text-xl font-bold text-stone-800">{editingId ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => { setIsAddModalOpen(false); setEditingId(null); }} className="text-stone-400 hover:text-stone-600">
                <X size={24} />
              </button>
            </div>
            <div className="overflow-y-auto p-6">
              <form id="productForm" onSubmit={handleAddSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Product Name</label>
                  <input required type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Short Description</label>
                  <textarea rows={2} value={newProduct.shortDescription} onChange={e => setNewProduct({...newProduct, shortDescription: e.target.value})} className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none" placeholder="Brief description of the product..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Category</label>
                  <input required type="text" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Price (₦)</label>
                    <input required type="text" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none" placeholder="e.g. 25000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-stone-700 mb-1">Sale Price (₦) <span className="text-stone-400 font-normal">(Optional)</span></label>
                    <input type="text" value={newProduct.salePrice} onChange={e => setNewProduct({...newProduct, salePrice: e.target.value})} className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none" placeholder="e.g. 20000" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Stock Quantity</label>
                  <input required type="number" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none" />
                </div>
                
                <ImageUpload
                  label="Product Image"
                  value={newProduct.imageUrl}
                  onChange={(url) => setNewProduct({...newProduct, imageUrl: url})}
                  folder="products"
                />
              </form>
            </div>
            <div className="p-6 border-t border-stone-100 flex justify-end gap-3 bg-stone-50">
              <button type="button" onClick={() => { setIsAddModalOpen(false); setEditingId(null); }} className="px-4 py-2 text-stone-600 hover:bg-stone-200 rounded-lg transition-colors">Cancel</button>
              <button type="submit" form="productForm" className="px-4 py-2 bg-lime-600 hover:bg-lime-700 text-white rounded-lg transition-colors">Save Product</button>
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
            <h3 className="text-xl font-bold text-stone-800 mb-2">Delete Product</h3>
            <p className="text-stone-600 mb-6">Are you sure you want to delete this product? This action cannot be undone.</p>
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
