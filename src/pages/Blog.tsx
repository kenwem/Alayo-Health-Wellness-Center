import { Calendar, User, ArrowRight, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firebaseErrors';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { siteId } from '../constants/siteConfig';

interface EditorialPost {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  author: string;
  date: string;
  image: string;
  status: string;
  slug?: string;
  position?: number;
}

export default function Editorial() {
  const { settings } = useSiteSettings();
  const [posts, setPosts] = useState<EditorialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const q = query(
      collection(db, 'sites', siteId, 'editorial'), 
      where('status', '==', 'Published')
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as EditorialPost[];
      
      // Sort client-side so documents without 'position' are still included
      const sortedData = postsData.sort((a, b) => (a.position || 0) - (b.position || 0));
      
      setPosts(sortedData);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'editorial');
    });

    return () => unsubscribe();
  }, []);

  const filteredPosts = activeCategory === 'All' 
    ? posts 
    : posts.filter(post => post.category === activeCategory);

  return (
    <div className="flex flex-col min-h-screen bg-stone-50">
      {/* Page Header */}
      <section className="bg-stone-900 text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={settings.blogBgUrl || "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=2070&auto=format&fit=crop"}
            alt="Nature's Ways Editorial"
            className="w-full h-full object-cover opacity-20"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Nature's Ways Editorial</h1>
          <p className="text-xl text-stone-300 max-w-2xl mx-auto">
            Our hub for naturopathic research, herbal remedy insights, and positive lifestyle advocacy.
          </p>
        </div>
      </section>

      {/* Editorial Content */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4">
            <h2 className="text-3xl font-bold text-stone-900">Latest Articles</h2>
            <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
              {['All', 'Naturopathy & Herbal Medicine', 'Chakras & Crystal Therapy', 'Natural Lifestyle'].map((cat) => (
                <button 
                  key={cat} 
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${activeCategory === cat ? 'bg-lime-500 text-white' : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post) => (
              <article key={post.id} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all border border-stone-100 flex flex-col group">
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={post.image}
                    alt={post.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 bg-lime-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-sm flex items-center gap-1">
                    <Tag size={12} /> {post.category}
                  </div>
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-xl font-bold text-stone-900 mb-3 leading-tight group-hover:text-lime-600 transition-colors">
                    <Link to={`/blog/${post.slug || post.id}`}>{post.title}</Link>
                  </h3>
                  <p className="text-stone-600 text-sm mb-6 flex-grow">{post.excerpt}</p>
                  
                  <div className="mt-auto pt-4 border-t border-stone-100">
                    <Link 
                      to={`/blog/${post.slug || post.id}`}
                      className="text-lime-600 font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all"
                    >
                      Read Article <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12 text-stone-500">
              No articles found in this category.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
