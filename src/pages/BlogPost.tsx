import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { siteId } from '../constants/siteConfig';
import { Calendar, User, ArrowLeft, Tag, Share2, MessageSquare, ArrowRight } from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';
import CommentSection from '../components/CommentSection';
import MarkdownRenderer from '../components/MarkdownRenderer';
import { motion } from 'motion/react';
import { Helmet } from 'react-helmet-async';

interface EditorialPost {
  id: string;
  title: string;
  excerpt: string;
  content?: string;
  category: string;
  author: string;
  date: string;
  image: string;
  status: string;
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { settings } = useSiteSettings();
  const [post, setPost] = useState<EditorialPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        // 1. Try fetching by slug first
        const q = query(
          collection(db, 'sites', siteId, 'editorial'),
          where('slug', '==', slug),
          limit(1)
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0];
          setPost({ id: docData.id, ...docData.data() } as EditorialPost);
        } else {
          // 2. Fallback: Try fetching by ID (for legacy links)
          const docRef = doc(db, 'sites', siteId, 'editorial', slug);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            const data = docSnap.data() as EditorialPost;
            // If it has a slug, redirect to the slug URL for SEO
            if (data.slug) {
              const newPath = location.pathname.replace(slug, data.slug);
              navigate(newPath, { replace: true });
              return;
            }
            setPost({ id: docSnap.id, ...data } as EditorialPost);
          } else {
            navigate('/editorial');
          }
        }
      } catch (error) {
        console.error('Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug, navigate, location.pathname]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-500"></div>
      </div>
    );
  }

  if (!post) return null;

  const pageTitle = post.metaTitle || `${post.title} | ${settings?.siteName || 'Alayo Health'}`;
  const pageDescription = post.metaDescription || post.excerpt;

  return (
    <div className="min-h-screen bg-stone-50">
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content={post.image} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>

      {/* Hero Header */}
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
        <img 
          src={post.image} 
          alt={post.title} 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/40 to-transparent"></div>
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 w-full">
            <motion.div
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="space-y-6"
            >
              <Link 
                to="/editorial" 
                className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-4 group"
              >
                <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to Editorial
              </Link>
              <div className="inline-block bg-lime-500 text-white px-4 py-1 rounded-full text-sm font-bold tracking-wide uppercase">
                {post.category}
              </div>
              <h1 className="text-4xl md:text-7xl font-bold text-white leading-tight tracking-tight">
                {post.title}
              </h1>
              <div className="flex flex-wrap items-center gap-6 text-white/90 text-sm font-medium">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-lime-500 flex items-center justify-center text-white font-bold border-2 border-white/20">
                    KO
                  </div>
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={18} className="text-lime-400" />
                  <span>{post.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare size={18} className="text-lime-400" />
                  <span>Join the conversation</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 -mt-10 relative z-10">
        <div className="bg-white rounded-[2.5rem] p-8 md:p-16 shadow-2xl shadow-stone-200/50 border border-stone-100 mb-12">
          <div className="mb-12">
            <p className="text-2xl text-stone-500 font-light italic leading-relaxed border-l-4 border-lime-500 pl-8 py-2">
              {post.excerpt}
            </p>
          </div>

          <div className="markdown-content">
            {post.content ? (
              <MarkdownRenderer content={post.content} />
            ) : (
              <div className="prose prose-stone lg:prose-xl max-w-none text-stone-700 leading-relaxed">
                <p>
                  Natural medicine, also known as naturopathy, is a distinct primary health care profession that emphasizes prevention, treatment, and optimal health through the use of therapeutic methods and substances that encourage individuals’ inherent self-healing process.
                </p>
                <p>
                  The practice of naturopathic medicine includes modern and traditional, scientific, and empirical methods. Naturopathic medicine is defined by principles rather than by methods or modalities. Above all, it honors the body's innate wisdom to heal.
                </p>
              </div>
            )}
          </div>

          <div className="mt-12 pt-12 border-t border-stone-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-center gap-2">
                <Tag size={18} className="text-lime-500" />
                <span className="text-sm font-bold text-stone-400 uppercase tracking-widest">{post.category}</span>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Share:</span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => window.open(`https://wa.me/?text=${encodeURIComponent(post.title + ' ' + window.location.href)}`, '_blank')}
                    className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-lime-500 hover:text-white transition-all"
                    title="Share on WhatsApp"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.483 8.413-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.308 1.654zm6.233-3.762c1.508.893 3.078 1.364 4.673 1.365 5.462 0 9.906-4.444 9.908-9.906.002-2.646-1.027-5.133-2.9-7.008-1.871-1.873-4.359-2.903-7.005-2.905-5.464 0-9.908 4.445-9.91 9.907-.001 1.558.399 3.081 1.158 4.417l-1.023 3.735 3.825-1.003h.174zm11.387-7.464c-.312-.156-1.848-.912-2.134-1.017-.286-.105-.494-.156-.703.156-.208.312-.807 1.017-.988 1.222-.182.205-.364.231-.676.075-.312-.156-1.316-.484-2.507-1.548-.926-.826-1.551-1.846-1.733-2.158-.182-.312-.019-.481.137-.635.141-.138.312-.364.468-.546.156-.182.208-.312.312-.52.104-.208.052-.39-.026-.546-.078-.156-.703-1.693-.963-2.319-.253-.611-.512-.528-.703-.537-.182-.009-.39-.011-.598-.011-.208 0-.546.078-.832.39-.286.312-1.093 1.068-1.093 2.603 0 1.535 1.118 3.02 1.274 3.229.156.208 2.199 3.358 5.328 4.71.744.322 1.325.514 1.777.658.748.237 1.429.204 1.967.123.6-.09 1.847-.755 2.108-1.485.26-.73.26-1.354.182-1.485-.077-.131-.286-.208-.597-.364z"/></svg>
                  </button>
                  <button 
                    onClick={() => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`, '_blank')}
                    className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-lime-500 hover:text-white transition-all"
                    title="Share on Twitter"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                  </button>
                  <button 
                    onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank')}
                    className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-lime-500 hover:text-white transition-all"
                    title="Share on Facebook"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </button>
                  <button 
                    onClick={() => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`, '_blank')}
                    className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-lime-500 hover:text-white transition-all"
                    title="Share on LinkedIn"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.454C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </button>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      alert('Link copied to clipboard!');
                    }}
                    className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-600 hover:bg-lime-500 hover:text-white transition-all"
                    title="Copy Link"
                  >
                    <Share2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Comment Section */}
        <div className="bg-white rounded-[2.5rem] p-8 md:p-16 shadow-xl border border-stone-100 mb-12">
          <h2 className="text-3xl font-bold text-stone-900 mb-10 flex items-center gap-4">
            <MessageSquare className="text-lime-500" size={32} />
            Comments & Discussion
          </h2>
          <CommentSection collectionName="editorial" docId={post.id} />
        </div>

        {/* Call to Action - Moved after comments */}
        <div className="p-10 bg-stone-900 rounded-[2.5rem] text-white relative overflow-hidden group shadow-2xl shadow-stone-900/20">
          <div className="absolute top-0 right-0 w-64 h-64 bg-lime-500/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-lime-500/20 transition-colors"></div>
          <div className="relative z-10">
            <h3 className="text-3xl font-bold mb-4">Start Your Healing Journey</h3>
            <p className="text-stone-400 mb-8 max-w-xl">
              Ready to experience the power of natural medicine? Book a consultation with Prof. Kayode Oseni today and discover a holistic approach to your well-being.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                to="/services" 
                className="bg-lime-500 hover:bg-lime-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 transition-all hover:scale-105"
              >
                Book Consultation <ArrowRight size={20} />
              </Link>
              <Link 
                to="/contact" 
                className="bg-white/10 hover:bg-white/20 text-white px-8 py-4 rounded-2xl font-bold transition-all"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
