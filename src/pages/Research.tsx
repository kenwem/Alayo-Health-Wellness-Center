import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { siteId } from '../constants/siteConfig';
import { Book as BookIcon, Download, ExternalLink, Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import Pagination from '../components/Pagination';

const ITEMS_PER_PAGE = 6;

interface Book {
  id: string;
  title: string;
  author: string;
  price: string;
  status: string;
  coverImage: string;
  preface: string;
  position: number;
}

export default function Research() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const q = query(
      collection(db, 'sites', siteId, 'books'), 
      orderBy('position', 'asc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Book))
        .filter(book => book.status === 'Published');
      setBooks(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const totalPages = Math.ceil(books.length / ITEMS_PER_PAGE);
  const paginatedBooks = books.slice(
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
            src="https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=2070&auto=format&fit=crop"
            alt="Research Background"
            className="w-full h-full object-cover opacity-20"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Research & Publications</h1>
          <p className="text-xl text-stone-300 max-w-2xl mx-auto">
            Explore scholarly works and research extracts in Natural Medicine by Prof. Kayode Oseni.
          </p>
        </div>
      </section>

      {/* Books Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-600"></div>
            </div>
          ) : paginatedBooks.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {paginatedBooks.map((book, idx) => (
                  <motion.div 
                    key={book.id}
                  initial={{ y: 30, opacity: 0 }}
                  whileInView={{ y: 0, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white rounded-3xl overflow-hidden shadow-sm border border-stone-200 flex flex-col sm:flex-row hover:shadow-xl transition-all group"
                >
                  <div className="sm:w-2/5 relative">
                    {book.coverImage ? (
                      <img 
                        src={book.coverImage} 
                        alt={book.title} 
                        className="w-full h-full object-cover aspect-[3/4] group-hover:scale-105 transition-transform duration-700" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full bg-stone-100 flex flex-col items-center justify-center p-8 text-stone-400 aspect-[3/4]">
                        <BookIcon size={48} className="mb-2 opacity-20" />
                        <span className="text-sm font-medium">No cover image</span>
                      </div>
                    )}
                    <div className="absolute top-4 left-4 bg-lime-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                      {book.price}
                    </div>
                  </div>
                  <div className="p-8 sm:w-3/5 flex flex-col">
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-stone-900 mb-2 leading-tight">{book.title}</h3>
                      <p className="text-lime-600 font-bold text-sm uppercase tracking-wider mb-6">By {book.author}</p>
                      <div className="relative">
                        <Bookmark size={20} className="absolute -left-7 top-1 text-stone-200" />
                        <p className="text-stone-600 text-sm leading-relaxed italic mb-8">
                          {book.preface || "No preface available."}
                        </p>
                      </div>
                    </div>
                    <div className="pt-6 border-t border-stone-100 flex gap-4">
                      <a
                        href={`https://wa.me/2348034170747?text=Hello, I am interested in purchasing the book: ${book.title}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-stone-900 text-white px-6 py-3 rounded-xl font-bold text-center hover:bg-stone-800 transition-colors flex items-center justify-center gap-2"
                      >
                        Order via WhatsApp
                      </a>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </>
        ) : (
            <div className="text-center py-24 bg-white rounded-[3rem] shadow-sm border border-stone-100">
              <BookIcon size={64} className="mx-auto text-stone-200 mb-6" />
              <h3 className="text-2xl font-bold text-stone-800 mb-2">No Research Found</h3>
              <p className="text-stone-500 italic max-w-md mx-auto">
                We are currently cataloguing our research archive. Please check back later.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Academic Mention */}
      <section className="py-20 bg-lime-50 border-y border-lime-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Contribute to the Archive</h2>
          <p className="text-lg text-stone-600 mb-8 leading-relaxed">
            Prof. Oseni's work spans decades of clinical practice and academic leadership. His publications serve as fundamental guides for practitioners in Energy Medicine and Naturopathy.
          </p>
          <div className="inline-flex items-center gap-4 p-4 bg-white rounded-2xl border border-lime-200 shadow-sm">
            <Download size={24} className="text-lime-600" />
            <span className="font-bold text-stone-800">Want to request a private research extract?</span>
            <Link to="/contact" className="text-lime-600 font-bold hover:underline">Contact us</Link>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
