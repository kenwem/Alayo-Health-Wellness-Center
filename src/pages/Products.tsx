import { ShoppingBag, ArrowRight, Search, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firebaseErrors';

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

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

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

  const filteredProducts = products.filter(product => {
    const matchesCategory = activeCategory === 'All' || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         product.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ['All', 'Herbal Remedies', 'Energy Medicine', 'Nutraceuticals', 'Organic Skincare'];

  return (
    <div className="flex flex-col min-h-screen bg-stone-50">
      {/* Page Header */}
      <section className="bg-stone-900 text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1611078816766-3b2d1264024c?q=80&w=2070&auto=format&fit=crop"
            alt="Herbal Products"
            className="w-full h-full object-cover opacity-20"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Herbal Products</h1>
          <p className="text-xl text-stone-300 max-w-2xl mx-auto">
            Proprietary organic remedies, root herbs, and healing crystals formulated by Prof. Kayode Oseni.
          </p>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
            <div className="w-full md:w-auto">
              <h2 className="text-3xl font-bold text-stone-900 mb-2">Our Remedies Gallery</h2>
              <p className="text-stone-600">Browse our collection of natural healing products.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white border border-stone-200 rounded-full focus:outline-none focus:ring-2 focus:ring-lime-500 w-full"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
                {categories.map((cat) => (
                  <button 
                    key={cat} 
                    onClick={() => setActiveCategory(cat)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-lime-500 text-white shadow-md shadow-lime-200' : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500"></div>
            </div>
          ) : filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-stone-100 group flex flex-col">
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-stone-800 shadow-sm">
                      {product.category}
                    </div>
                  </div>
                  <div className="p-6 flex flex-col flex-grow">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-stone-900 leading-tight">{product.name}</h3>
                    </div>
                    <p className="text-stone-600 text-sm mb-6 flex-grow line-clamp-3">{product.shortDescription}</p>
                    
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-stone-100">
                      <div className="flex flex-col">
                        {product.salePrice && (
                          <span className="text-xs text-stone-400 line-through">{product.price}</span>
                        )}
                        <span className="text-xl font-bold text-lime-600">{product.salePrice || product.price}</span>
                      </div>
                      <a
                        href={`https://wa.me/2348034170747?text=I'm interested in purchasing the ${product.name}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-lime-100 text-lime-600 hover:bg-lime-500 hover:text-white transition-colors"
                        title="Order via WhatsApp"
                      >
                        <ShoppingBag size={18} />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-stone-100">
              <p className="text-stone-500 text-lg">No products found matching your criteria.</p>
              <button 
                onClick={() => {setActiveCategory('All'); setSearchQuery('');}}
                className="mt-4 text-lime-600 font-semibold hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}

          {/* E-commerce Notice */}
          <div className="mt-20 bg-lime-50 rounded-3xl p-8 md:p-12 text-center border border-lime-100">
            <h3 className="text-2xl font-bold text-stone-900 mb-4">Online Store Coming Soon</h3>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto mb-8">
              We are currently developing our full e-commerce platform. For now, all proprietary herbal products and crystals can be ordered directly via WhatsApp or purchased at our Abeokuta and Lagos clinics.
            </p>
            <a
              href="https://wa.me/2348034170747"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex justify-center items-center gap-2 bg-lime-500 hover:bg-lime-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all shadow-md"
            >
              Order via WhatsApp <ArrowRight size={20} />
            </a>
          </div>

        </div>
      </section>
    </div>
  );
}
