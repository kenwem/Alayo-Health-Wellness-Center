import { ShoppingBag, ArrowRight, Search, Filter, Leaf } from 'lucide-react';
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firebaseErrors';
import { siteId, DEFAULT_PRODUCT_IMAGE } from '../constants/siteConfig';
import Pagination from '../components/Pagination';

const ITEMS_PER_PAGE = 6;

interface Product {
  id: string;
  name: string;
  price: string;
  salePrice: string;
  stock?: number;
  imageUrl: string;
  shortDescription: string;
  position?: number;
  variations?: { name: string; price: string; salePrice?: string }[];
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'position' | 'price-asc' | 'price-desc' | 'name'>('position');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const q = query(collection(db, 'sites', siteId, 'products'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const productsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      
      // Sort client-side so documents without 'position' are still included
      const sortedData = productsData.sort((a, b) => (a.position || 0) - (b.position || 0));
      
      setProducts(sortedData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, `sites/${siteId}/products`);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, sortBy]);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         product.shortDescription?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'position') return (a.position || 0) - (b.position || 0);
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    
    const getPrice = (p: Product) => {
      const priceStr = p.salePrice || p.price;
      return parseFloat(priceStr.replace('₦', '').replace(',', '')) || 0;
    };
    
    if (sortBy === 'price-asc') return getPrice(a) - getPrice(b);
    if (sortBy === 'price-desc') return getPrice(b) - getPrice(a);
    return 0;
  });

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

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
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2.5 bg-white border border-stone-200 rounded-full focus:outline-none focus:ring-2 focus:ring-lime-500 w-full shadow-sm text-sm"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="pl-10 pr-8 py-2.5 bg-white border border-stone-200 rounded-full focus:outline-none focus:ring-2 focus:ring-lime-500 w-full appearance-none text-sm font-medium text-stone-600 shadow-sm"
                >
                  <option value="position">Default Order</option>
                  <option value="name">Name (A-Z)</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500"></div>
            </div>
          ) : paginatedProducts.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedProducts.map((product) => (
                  <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-stone-100 group flex flex-col">
                  <div className="relative h-72 overflow-hidden">
                    <img
                      src={product.imageUrl || DEFAULT_PRODUCT_IMAGE}
                      alt={product.name}
                      className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-500 p-2"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-8 flex flex-col flex-grow">
                    <h3 className="text-2xl font-bold text-stone-900 leading-tight mb-3 group-hover:text-lime-600 transition-colors">{product.name}</h3>
                    <p className="text-stone-600 text-sm mb-6 flex-grow line-clamp-3 leading-relaxed">{product.shortDescription}</p>
                    
                    <div className="flex items-center justify-between mt-auto pt-6 border-t border-stone-100">
                      <div className="flex flex-col">
                        {product.variations && product.variations.length > 0 ? (
                          <div className="space-y-1 mb-2">
                             {product.variations.map((v, i) => (
                               <div key={i} className="text-xs text-stone-500 font-medium">
                                 {v.name}: {v.salePrice ? (
                                   <>
                                     <span className="text-red-600 font-bold">{v.salePrice}</span>
                                     <span className="text-stone-400 line-through ml-1">{v.price}</span>
                                   </>
                                 ) : (
                                   <span className="text-lime-600 font-bold">{v.price}</span>
                                 )}
                               </div>
                             ))}
                          </div>
                        ) : (
                          <>
                            {product.salePrice && (
                              <span className="text-xs text-stone-400 line-through font-medium">{product.price}</span>
                            )}
                            <span className="text-2xl font-extrabold text-lime-600">{product.salePrice || product.price}</span>
                          </>
                        )}
                      </div>
                      <a
                        href={`https://wa.me/2348034170747?text=Hello, I am interested in purchasing the product: ${product.name}${product.variations && product.variations.length > 0 ? '. Options: ' + product.variations.map(v => `${v.name} (${v.salePrice || v.price})`).join(', ') : ''}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-2 bg-stone-900 hover:bg-lime-600 text-white px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-lg hover:shadow-lime-200"
                      >
                        <ShoppingBag size={18} />
                        Order
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
              
              <Pagination 
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </>
          ) : (
            <div className="text-center py-24 bg-white rounded-3xl border border-stone-100 shadow-sm max-w-2xl mx-auto">
              <Leaf size={48} className="mx-auto text-stone-200 mb-6" />
              <h3 className="text-xl font-bold text-stone-800 mb-2">No Products Found</h3>
              <p className="text-stone-500 italic">Adjust your search or check back later for our new natural formulations.</p>
              <button 
                onClick={() => setSearchQuery('')}
                className="mt-6 text-lime-600 font-bold hover:underline bg-lime-50 px-6 py-2 rounded-full transition-colors"
              >
                Show All Products
              </button>
            </div>
          )}

        </div>
      </section>
    </div>
  );
}

