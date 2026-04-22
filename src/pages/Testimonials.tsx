import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { siteId } from '../constants/siteConfig';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { Leaf, Quote } from 'lucide-react';
import Pagination from '../components/Pagination';

const ITEMS_PER_PAGE = 6;

interface Testimonial {
  id: string;
  text: string;
  author: string;
  location: string;
  position: number;
}

export default function Testimonials() {
  const { settings } = useSiteSettings();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'sites', siteId, 'testimonials'), orderBy('position', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Testimonial[];
      setTestimonials(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const totalPages = Math.ceil(testimonials.length / ITEMS_PER_PAGE);
  const paginatedTestimonials = testimonials.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col min-h-screen bg-stone-50"
    >
      {/* Page Header */}
      <section className="bg-stone-900 text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=2070&auto=format&fit=crop"
            alt="Testimonials Background"
            className="w-full h-full object-cover opacity-20"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Client Testimonials</h1>
          <p className="text-xl text-stone-300 max-w-2xl mx-auto">
            Voices of healing and transformation from our patients and students across Africa.
          </p>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-600"></div>
            </div>
          ) : paginatedTestimonials.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {paginatedTestimonials.map((testimonial, idx) => {
                  const isExpanded = expandedId === testimonial.id;
                  const needsToggle = testimonial.text.length > 280;
                  const displayText = isExpanded || !needsToggle 
                    ? testimonial.text 
                    : testimonial.text.substring(0, 280) + '...';

                  return (
                    <motion.div 
                      key={testimonial.id}
                      initial={{ y: 30, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: idx % 3 * 0.1 }}
                      className="bg-white p-10 rounded-3xl shadow-sm border border-stone-100 relative hover:shadow-xl transition-shadow group flex flex-col h-full"
                    >
                      <div className="text-lime-500 mb-6 opacity-30 group-hover:opacity-50 transition-opacity">
                        <Quote size={48} fill="currentColor" />
                      </div>
                      <div className="flex-grow">
                        <p className={`text-stone-700 italic mb-4 leading-relaxed relative z-10 text-lg ${isExpanded ? 'whitespace-pre-wrap' : ''}`}>
                          "{displayText}"
                        </p>
                        {needsToggle && (
                          <button 
                            onClick={() => setExpandedId(isExpanded ? null : testimonial.id)}
                            className="text-lime-600 font-bold text-sm hover:text-lime-700 transition-colors mb-6 flex items-center gap-1"
                          >
                            {isExpanded ? 'Read Less' : 'Read More'}
                          </button>
                        )}
                      </div>
                      <div className="mt-auto border-t border-stone-100 pt-6">
                        <p className="font-bold text-stone-900 text-lg leading-tight">{testimonial.author}</p>
                        <p className="text-sm text-lime-600 font-bold uppercase tracking-wider mt-1">{testimonial.location}</p>
                      </div>
                    </motion.div>
                  );
                })}
            </div>
            
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        ) : (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-stone-100">
              <Leaf size={48} className="mx-auto text-stone-300 mb-4" />
              <p className="text-stone-500 text-lg italic">No testimonials available at the moment.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-lime-600 py-20 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Experience Natural Healing</h2>
          <p className="text-lime-100 text-lg mb-10">
            Join thousands of satisfied clients who have found wellness through our naturopathic consultations.
          </p>
          <a
            href="https://wa.me/2348034170747"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex justify-center items-center gap-2 bg-white text-lime-600 px-8 py-4 rounded-full text-lg font-bold hover:bg-stone-50 transition-all shadow-xl"
          >
            Start Your Journey
          </a>
        </div>
      </section>
    </motion.div>
  );
}
