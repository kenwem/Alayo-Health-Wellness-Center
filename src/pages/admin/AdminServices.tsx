import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Search, X, Save, ArrowLeft, Loader2, ShieldCheck, GraduationCap, Award, Leaf, Heart, BookOpen } from 'lucide-react';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, query, orderBy, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '../../firebase';
import Pagination from '../../components/Pagination';
import { handleFirestoreError, OperationType } from '../../utils/firebaseErrors';
import ImageUpload from '../../components/admin/ImageUpload';
import { siteId } from '../../constants/siteConfig';

interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  image: string;
  features?: string[];
  position: number;
}

const ICON_OPTIONS = [
  { value: 'ShieldCheck', label: 'Shield' },
  { value: 'GraduationCap', label: 'Cap' },
  { value: 'Award', label: 'Award' },
  { value: 'Leaf', label: 'Leaf' },
  { value: 'Heart', label: 'Heart' },
  { value: 'BookOpen', label: 'Book' }
];

const DEFAULT_SERVICES_SEED = [
  {
    title: 'Naturopathic Consultation',
    description: 'Personalized treatment plans for diverse health challenges. We offer expert consultations for conditions like immune boosting, detoxification, pain relief, fertility support, diabetes management, hypertension, and stress reduction.',
    icon: 'ShieldCheck',
    image: 'https://images.unsplash.com/photo-1576091160550-217359f4ecf8?q=80&w=2070&auto=format&fit=crop',
    features: ['Immune Boosting & Detoxification', 'Pain Relief & Fertility Support', 'Diabetes & Hypertension Management'],
    position: 0
  },
  {
    title: 'Herbal Remedies',
    description: 'Formulating and production of proprietary organic remedies for our numerous patients and colleagues in the healing profession. We draw on African Traditional Medicine, Ayurvedic Medicine, and Traditional Chinese Medicine.',
    icon: 'Leaf',
    image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=2070&auto=format&fit=crop',
    features: ['Root Herbs & Leaf Extracts', 'Organic Remedies & Nutraceuticals', 'Global Traditional Medicine Integration'],
    position: 1
  },
  {
    title: 'Psychic & Energy Healing',
    description: 'Specialized modalities of Energy Medicine including all forms of crystal therapy, chakras balancing, and aural scanning and cleansing.',
    icon: 'Heart',
    image: 'https://i.imgur.com/A6D6O78.jpg',
    features: ['Crystal Therapies', 'Chakras Balancing', 'Aural Scanning & Cleansing'],
    position: 2
  },
  {
    title: 'Health Education',
    description: 'Lectures and masterclasses in Energy Medicine, Herbal Medicine, and Herbal Therapeutics led by Prof. Kayode Oseni.',
    icon: 'GraduationCap',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop',
    features: ['Masterclasses in Energy Medicine', 'Herbal Therapeutics Training', 'Professional Certification Programs'],
    position: 3
  }
];

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [newService, setNewService] = useState({
    title: '',
    description: '',
    icon: 'ShieldCheck',
    image: '',
    features: [] as string[],
    position: 0
  });

  const handleSeedDefaults = async () => {
    // We already have a loading state, we don't need window.confirm or alert
    setIsSeeding(true);
    try {
      console.log('Starting batch seed into:', `sites/${siteId}/services`);
      const colRef = collection(db, 'sites', siteId, 'services');
      const batch = writeBatch(db);
      
      DEFAULT_SERVICES_SEED.forEach((service, index) => {
        const docRef = doc(colRef, `service-seed-${index + 1}`);
        batch.set(docRef, {
          ...service,
          updatedAt: serverTimestamp(),
          createdAt: serverTimestamp()
        });
      });

      await batch.commit();
      console.log('Batch commit successful.');
    } catch (error: any) {
      console.error('Seeding error full details:', error);
      handleFirestoreError(error, OperationType.WRITE, `sites/${siteId}/services/seed`);
    } finally {
      setIsSeeding(false);
    }
  };

  const forceRefresh = () => {
    setLoading(true);
    window.location.reload();
  };

  useEffect(() => {
    console.log('Loading services for siteId:', siteId);
    const q = query(collection(db, 'sites', siteId, 'services'), orderBy('position', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      console.log('Snapshot received, docs count:', snapshot.docs.length);
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Service[];
      setServices(data);
      setLoading(false);
    }, (error) => {
      console.error('Snapshot error:', error);
      handleFirestoreError(error, OperationType.LIST, `sites/${siteId}/services`);
    });

    return () => unsubscribe();
  }, []);

  const totalPages = Math.ceil(services.length / itemsPerPage);
  const paginatedServices = services.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleEdit = (s: Service) => {
    setEditingId(s.id);
    setNewService({
      title: s.title,
      description: s.description,
      icon: s.icon || 'ShieldCheck',
      image: s.image || '',
      features: s.features || [],
      position: s.position || 0
    });
    setIsAddModalOpen(true);
  };

  const handleDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (deleteConfirmId !== null) {
      try {
        await deleteDoc(doc(db, 'sites', siteId, 'services', deleteConfirmId));
        setDeleteConfirmId(null);
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, `sites/${siteId}/services/${deleteConfirmId}`);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      if (editingId) {
        await updateDoc(doc(db, 'sites', siteId, 'services', editingId), {
          ...newService,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'sites', siteId, 'services'), {
          ...newService,
          createdAt: serverTimestamp()
        });
      }
      setIsAddModalOpen(false);
      setEditingId(null);
      setNewService({ title: '', description: '', icon: 'ShieldCheck', image: '', features: [], position: 0 });
    } catch (error) {
      handleFirestoreError(error, editingId ? OperationType.UPDATE : OperationType.CREATE, editingId ? `sites/${siteId}/services/${editingId}` : `sites/${siteId}/services`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-stone-800">Manage Services</h2>
          {services.length > 0 && (
            <button 
              onClick={forceRefresh}
              className="p-2 text-stone-400 hover:text-stone-600 transition-colors"
              title="Refresh Data"
            >
              <Loader2 className={`${loading ? 'animate-spin' : ''}`} size={20} />
            </button>
          )}
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleSeedDefaults}
            disabled={isSeeding}
            className="bg-stone-100 hover:bg-stone-200 text-stone-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors border border-stone-200 disabled:opacity-50"
            title="Restores the 4 original Alayo Health services"
          >
            {isSeeding ? <Loader2 className="animate-spin" size={20} /> : <Leaf size={20} />}
            Restore Originals
          </button>
          <button 
            onClick={() => {
              setEditingId(null);
              setNewService({ title: '', description: '', icon: 'ShieldCheck', image: '', features: [], position: services.length });
              setIsAddModalOpen(true);
            }}
            className="bg-lime-600 hover:bg-lime-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Add Service
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="px-6 py-4 text-sm font-semibold text-stone-600">Pos</th>
                <th className="px-6 py-4 text-sm font-semibold text-stone-600">Icon</th>
                <th className="px-6 py-4 text-sm font-semibold text-stone-600">Title</th>
                <th className="px-6 py-4 text-sm font-semibold text-stone-600">Features</th>
                <th className="px-6 py-4 text-sm font-semibold text-stone-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {paginatedServices.map((s) => (
                <tr key={s.id} className="hover:bg-stone-50">
                  <td className="px-6 py-4 text-stone-400 text-xs font-mono">{s.position}</td>
                  <td className="px-6 py-4">
                    <div className="bg-lime-100 p-2 rounded text-lime-600 w-fit">
                      {s.icon === 'ShieldCheck' && <ShieldCheck size={20} />}
                      {s.icon === 'GraduationCap' && <GraduationCap size={20} />}
                      {s.icon === 'Award' && <Award size={20} />}
                      {s.icon === 'Leaf' && <Leaf size={20} />}
                      {s.icon === 'Heart' && <Heart size={20} />}
                      {s.icon === 'BookOpen' && <BookOpen size={20} />}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-bold text-stone-800">{s.title}</div>
                    <div className="text-xs text-stone-500 line-clamp-1">{s.description}</div>
                  </td>
                  <td className="px-6 py-4 uppercase text-[10px] font-bold tracking-wider text-lime-600">
                    {s.features?.length || 0} features
                  </td>
                  <td className="px-6 py-4 text-right space-x-4">
                    <button onClick={() => handleEdit(s)} className="text-blue-600 hover:text-blue-800"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:text-red-800"><Trash2 size={18} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="p-4 border-t border-stone-200">
          <Pagination 
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-stone-100">
              <h3 className="text-xl font-bold text-stone-800">{editingId ? 'Edit Service' : 'Add New Service'}</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-stone-400 hover:text-stone-600">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Service Title</label>
                  <input required type="text" value={newService.title} onChange={e => setNewService({...newService, title: e.target.value})} className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Icon</label>
                  <select value={newService.icon} onChange={e => setNewService({...newService, icon: e.target.value})} className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none bg-white">
                    {ICON_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Display Position</label>
                <input type="number" value={newService.position} onChange={e => setNewService({...newService, position: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none" />
              </div>
              <ImageUpload
                label="Header Image (16:9 recommended)"
                value={newService.image}
                onChange={(url) => setNewService({...newService, image: url})}
                folder="services"
                aspect={16/9}
              />
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Service Description</label>
                <textarea required rows={3} value={newService.description} onChange={e => setNewService({...newService, description: e.target.value})} className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none" placeholder="Provide a detailed description..." />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-2">Service Features (Bullets)</label>
                <div className="space-y-2">
                  {newService.features.map((feature, idx) => (
                    <div key={idx} className="flex gap-2">
                      <input 
                        type="text" 
                        value={feature} 
                        onChange={(e) => {
                          const updated = [...newService.features];
                          updated[idx] = e.target.value;
                          setNewService({...newService, features: updated});
                        }}
                        className="flex-1 px-3 py-1 border border-stone-300 rounded-lg text-sm"
                        placeholder="e.g. 100% Organic remedies"
                      />
                      <button type="button" onClick={() => setNewService({...newService, features: newService.features.filter((_, i) => i !== idx)})} className="p-1 text-red-600 hover:bg-stone-50 rounded"><Trash2 size={16} /></button>
                    </div>
                  ))}
                  <button type="button" onClick={() => setNewService({...newService, features: [...newService.features, '']})} className="text-sm font-bold text-lime-600 hover:text-lime-700">+ Add Feature</button>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 bg-stone-50 -mx-6 -mb-6 p-6">
                <button type="button" onClick={() => setIsAddModalOpen(false)} className="px-4 py-2 text-stone-600 hover:bg-stone-200 rounded-lg transition-colors font-medium">Cancel</button>
                <button 
                  type="submit" 
                  disabled={isSaving}
                  className="px-6 py-2 bg-lime-600 hover:bg-lime-700 text-white rounded-lg transition-colors disabled:bg-stone-400 flex items-center gap-2 font-bold"
                >
                  {isSaving && <Loader2 className="animate-spin" size={18} />}
                  {editingId ? 'Save Changes' : 'Create Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId !== null && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden p-6 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={32} className="text-red-600" />
            </div>
            <h3 className="text-xl font-bold text-stone-800 mb-2">Delete Service</h3>
            <p className="text-stone-600 mb-6">Are you sure you want to delete this service? This action cannot be undone.</p>
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
