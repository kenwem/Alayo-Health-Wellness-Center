import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X, ArrowLeft, Save } from 'lucide-react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../firebase';
import ImageUpload from '../../components/admin/ImageUpload';
import { handleFirestoreError, OperationType } from '../../utils/firebaseErrors';

interface EditorialPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  image: string;
  status: string;
  content?: string;
  slug?: string;
}

export default function AdminEditorial() {
  const [posts, setPosts] = useState<EditorialPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'editorial'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EditorialPost[];
      setPosts(postsData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'editorial');
    });

    return () => unsubscribe();
  }, []);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [newPost, setNewPost] = useState({
    title: '',
    slug: '',
    coverImage: '',
    content: '',
    status: 'Draft',
    publishDate: '',
    featured: false,
    category: 'Naturopathy & Herbal Medicine',
    tags: ''
  });

  const [activeTab, setActiveTab] = useState('Content');

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (deleteConfirmId !== null) {
      try {
        await deleteDoc(doc(db, 'editorial', deleteConfirmId));
        setDeleteConfirmId(null);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `editorial/${deleteConfirmId}`);
      }
    }
  };

  const handleEdit = (post: EditorialPost) => {
    setEditingId(post.id);
    setNewPost({
      title: post.title,
      slug: post.slug || post.title.toLowerCase().replace(/\s+/g, '-'),
      coverImage: post.image || '',
      content: post.content || '',
      status: post.status,
      publishDate: post.date,
      featured: false,
      category: post.category || 'Naturopathy & Herbal Medicine',
      tags: ''
    });
    setIsAddModalOpen(true);
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    
    const postData = {
      title: newPost.title,
      slug: newPost.slug || newPost.title.toLowerCase().replace(/\s+/g, '-'),
      author: 'Prof. Kayode Oseni',
      date: newPost.publishDate || today,
      status: newPost.status,
      image: newPost.coverImage || 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop',
      excerpt: newPost.content ? newPost.content.substring(0, 150) + '...' : 'New editorial article...',
      content: newPost.content,
      category: newPost.category
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'editorial', editingId), postData);
      } else {
        await addDoc(collection(db, 'editorial'), postData);
      }
      setIsAddModalOpen(false);
      setEditingId(null);
      setNewPost({ title: '', slug: '', coverImage: '', content: '', status: 'Draft', publishDate: '', featured: false, category: 'Naturopathy & Herbal Medicine', tags: '' });
    } catch (error) {
      handleFirestoreError(error, editingId ? OperationType.UPDATE : OperationType.CREATE, editingId ? `editorial/${editingId}` : 'editorial');
    }
  };

  if (isAddModalOpen) {
    return (
      <div className="fixed inset-0 bg-stone-50 z-50 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <button onClick={() => { setIsAddModalOpen(false); setEditingId(null); }} className="text-stone-500 hover:text-stone-800 flex items-center gap-2 font-medium">
                <ArrowLeft size={20} /> Back
              </button>
              <h2 className="text-2xl font-bold text-stone-900">{editingId ? 'Edit Post' : 'New Post'}</h2>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-stone-500 font-medium">{newPost.status}</span>
              <button onClick={handleAddSubmit} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm">
                <Save size={18} /> Save
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-8 border-b border-stone-200 mb-8">
            <button 
              onClick={() => setActiveTab('Content')}
              className={`pb-3 font-medium transition-colors ${activeTab === 'Content' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-stone-500 hover:text-stone-800'}`}
            >
              Content
            </button>
            <button 
              onClick={() => setActiveTab('Seo')}
              className={`pb-3 font-medium transition-colors ${activeTab === 'Seo' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-stone-500 hover:text-stone-800'}`}
            >
              SEO
            </button>
            <button 
              onClick={() => setActiveTab('Preview')}
              className={`pb-3 font-medium transition-colors ${activeTab === 'Preview' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-stone-500 hover:text-stone-800'}`}
            >
              Preview
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-6 bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
              {activeTab === 'Content' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Title</label>
                    <input 
                      type="text" 
                      value={newPost.title} 
                      onChange={e => setNewPost({...newPost, title: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})} 
                      className="w-full px-4 py-3 border-2 border-blue-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg" 
                      placeholder="Post title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Slug (URL)</label>
                    <input 
                      type="text" 
                      value={newPost.slug} 
                      onChange={e => setNewPost({...newPost, slug: e.target.value})} 
                      className="w-full px-4 py-2 border border-stone-200 rounded-lg bg-stone-50 text-stone-500 focus:outline-none" 
                      placeholder="auto-generated-slug"
                    />
                  </div>

                  <ImageUpload
                    label="Cover Image"
                    value={newPost.coverImage}
                    onChange={(url) => setNewPost({...newPost, coverImage: url})}
                    folder="blog"
                  />

                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Content (HTML/Markdown)</label>
                    <textarea 
                      value={newPost.content} 
                      onChange={e => setNewPost({...newPost, content: e.target.value})} 
                      className="w-full h-96 px-4 py-3 border border-stone-200 rounded-lg bg-stone-800 text-stone-300 focus:outline-none font-mono text-sm" 
                      placeholder="Write your story here..."
                    />
                  </div>
                </>
              )}

              {activeTab === 'Seo' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Meta Title</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      placeholder="SEO Title (defaults to post title)"
                    />
                    <p className="text-xs text-stone-500 mt-1">Recommended length: 50-60 characters.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Meta Description</label>
                    <textarea 
                      rows={4}
                      className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      placeholder="Brief description for search engines..."
                    />
                    <p className="text-xs text-stone-500 mt-1">Recommended length: 150-160 characters.</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Focus Keywords</label>
                    <input 
                      type="text" 
                      className="w-full px-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" 
                      placeholder="e.g., herbal medicine, natural healing"
                    />
                  </div>
                </div>
              )}

              {activeTab === 'Preview' && (
                <div className="prose max-w-none">
                  {newPost.coverImage && (
                    <img src={newPost.coverImage} alt="Cover" className="w-full h-64 object-cover rounded-xl mb-8" referrerPolicy="no-referrer" />
                  )}
                  <h1 className="text-4xl font-bold text-stone-900 mb-4">{newPost.title || 'Post Title'}</h1>
                  <div className="flex items-center gap-4 text-stone-500 text-sm mb-8">
                    <span>Prof. Kayode Oseni</span>
                    <span>•</span>
                    <span>{newPost.publishDate || new Date().toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{newPost.category}</span>
                  </div>
                  <div className="text-stone-700 whitespace-pre-wrap">
                    {newPost.content || 'Your post content will appear here...'}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Publishing Card */}
              <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
                <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-4">Publishing</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Status</label>
                    <select 
                      value={newPost.status} 
                      onChange={e => setNewPost({...newPost, status: e.target.value})} 
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Published">Published</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Publish Date</label>
                    <input 
                      type="text" 
                      value={newPost.publishDate} 
                      onChange={e => setNewPost({...newPost, publishDate: e.target.value})} 
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-blue-500" 
                      placeholder="29/11/2025, 07:26 AM"
                    />
                  </div>

                  <div className="flex items-center gap-2 pt-2">
                    <input 
                      type="checkbox" 
                      id="featured"
                      checked={newPost.featured}
                      onChange={e => setNewPost({...newPost, featured: e.target.checked})}
                      className="w-4 h-4 text-blue-600 rounded border-stone-300 focus:ring-blue-500"
                    />
                    <label htmlFor="featured" className="text-sm font-medium text-stone-700">Mark as Featured</label>
                  </div>
                </div>
              </div>

              {/* Taxonomy Card */}
              <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
                <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-4">Taxonomy</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Category</label>
                    <select 
                      value={newPost.category} 
                      onChange={e => setNewPost({...newPost, category: e.target.value})} 
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-blue-500 bg-white"
                    >
                      <option value="Naturopathy & Herbal Medicine">Naturopathy & Herbal Medicine</option>
                      <option value="Chakras & Crystal Therapy">Chakras & Crystal Therapy</option>
                      <option value="Natural Lifestyle">Natural Lifestyle</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-semibold text-stone-700 mb-2">Tags (comma separated)</label>
                    <input 
                      type="text" 
                      value={newPost.tags} 
                      onChange={e => setNewPost({...newPost, tags: e.target.value})} 
                      className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:border-blue-500" 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-stone-800">Manage Editorial</h2>
        <button 
          onClick={() => {
            setEditingId(null);
            setNewPost({ title: '', slug: '', coverImage: '', content: '', status: 'Draft', publishDate: '', featured: false, category: 'Naturopathy & Herbal Medicine', tags: '' });
            setIsAddModalOpen(true);
          }}
          className="bg-lime-600 hover:bg-lime-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Create New Editorial
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="p-4 border-b border-stone-200 flex justify-between items-center">
          <div className="relative w-64">
            <input
              type="text"
              placeholder="Search posts..."
              className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-500"
            />
            <Search className="absolute left-3 top-2.5 text-stone-400" size={20} />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-stone-600">Title</th>
                <th className="px-6 py-4 text-sm font-semibold text-stone-600">Author</th>
                <th className="px-6 py-4 text-sm font-semibold text-stone-600">Date</th>
                <th className="px-6 py-4 text-sm font-semibold text-stone-600">Status</th>
                <th className="px-6 py-4 text-sm font-semibold text-stone-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-stone-50">
                  <td className="px-6 py-4 text-stone-800 font-medium">{post.title}</td>
                  <td className="px-6 py-4 text-stone-600">{post.author}</td>
                  <td className="px-6 py-4 text-stone-600">{post.date}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${post.status === 'Published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {post.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-4">
                    <button onClick={() => handleEdit(post)} className="text-blue-600 hover:text-blue-800"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(post.id)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Delete Confirmation Modal */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} className="text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-stone-800 mb-2">Delete Post</h3>
            <p className="text-stone-600 mb-6">Are you sure you want to delete this post? This action cannot be undone.</p>
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
