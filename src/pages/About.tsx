import { ShieldCheck, GraduationCap, BookOpen, Award, Leaf, Heart, Star, Quote } from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { siteId } from '../constants/siteConfig';

interface Testimonial {
  id: string;
  text: string;
  author: string;
  location: string;
}

export default function About() {
  const { settings } = useSiteSettings();
  const navigate = useNavigate();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    const q = query(collection(db, 'sites', siteId, 'testimonials'), orderBy('position', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setTestimonials(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Testimonial)));
    });
    return () => unsubscribe();
  }, []);

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
            src={settings.aboutBgUrl || "https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=2070&auto=format&fit=crop"}
            alt="About Alayo Health"
            className="w-full h-full object-cover opacity-20"
            referrerPolicy="no-referrer"
          />
        </div>
        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Us</h1>
          <p className="text-xl text-stone-300 max-w-2xl mx-auto">
             A premier naturopathic practice specializing in holistic health solutions rooted in Natural Medicine.
          </p>
        </motion.div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Left Column - Image & Quick Facts */}
            <motion.div 
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-5 space-y-8"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl group">
                <img
                  src={settings.ceoPhotoUrl || "https://i.imgur.com/91WDLQr.jpg"}
                  alt="Prof Kayode Oseni"
                  className="w-full h-auto object-cover aspect-[3/4] transform group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-stone-900 via-stone-900/80 to-transparent p-8">
                  <h3 className="text-2xl font-bold text-white mb-1">Prof. Kayode Oseni</h3>
                  <p className="text-lime-400 font-medium">CEO & Chief Consultant</p>
                </div>
              </div>

              <div className="bg-white p-8 rounded-3xl shadow-sm border border-stone-100">
                <h4 className="text-lg font-bold text-stone-900 mb-6 border-b border-stone-100 pb-4">Quick Facts</h4>
                <ul className="space-y-6">
                  {settings.aboutFacts.map((fact, idx) => (
                    <li key={idx} className="flex items-start gap-4">
                      <div className="bg-lime-100 p-2 rounded-lg text-lime-600 shrink-0">
                        {fact.icon === 'ShieldCheck' && <ShieldCheck size={20} />}
                        {fact.icon === 'GraduationCap' && <GraduationCap size={20} />}
                        {fact.icon === 'Award' && <Award size={20} />}
                        {fact.icon === 'Leaf' && <Leaf size={20} />}
                        {fact.icon === 'Heart' && <Heart size={20} />}
                        {fact.icon === 'BookOpen' && <BookOpen size={20} />}
                      </div>
                      <div>
                        <p className="font-semibold text-stone-900">{fact.title}</p>
                        <p className="text-sm text-stone-600">{fact.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Right Column - Biography & Mission */}
            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="lg:col-span-7"
            >
              <div className="prose prose-lg prose-stone max-w-none">
                <h2 className="text-4xl font-bold text-stone-900 mb-8">Your Trusted Guide to Natural Healing</h2>
                
                <p className="text-stone-600 leading-relaxed mb-6">
                  With over 30 years as a practitioner of Alternative and Complementary Medicine, Prof. Kayode Oseni delivers evidence-informed, holistic care at Alayo Health and Wellness Center. His academic foundation includes Drugs and Chemical Technology from Lagos State College of Science and Technology (now Lagos State Polytechnic).
                </p>
                
                <p className="text-stone-600 leading-relaxed mb-6">
                  Admitted to the University of Lagos College of Medicine for Physiotherapy, he pivoted to his true calling, pursuing advanced studies in Asian Medicine, Naturopathy, and Energy Medicine.
                </p>

                <h3 className="text-2xl font-bold text-stone-900 mt-12 mb-4">Leadership & Legacy</h3>
                <p className="text-stone-600 leading-relaxed mb-6">
                  A respected leader in the field, Prof. Oseni served as a pioneer member of the Elders Forum of the Ogun State Alternative Medicine Board and later as a member of its Advisory Committee. He also held key roles as Head of the School of Natural Medicine at African American University and Dean of the School of Natural Medicine at Cyrillic College of Homeopathy and Holistic Health Sciences.
                </p>
                
                <p className="text-stone-600 leading-relaxed mb-6">
                  Prof Kayode Oseni was the national vice president of the Nigeria Council of Physicians of Natural Medicine. He is currently the national president of the Academy of Complementary and Alternative Medical Practitioners.
                </p>

                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="bg-lime-50 border-l-4 border-lime-500 p-8 my-10 rounded-r-2xl shadow-sm"
                >
                  <p className="text-xl font-medium text-stone-800 italic m-0">
                    "We work with Nature to nurture your health. Our services emphasize preventive care, disease management, spiritual cleansing, and long-term wellness through safe, affordable, and evidence-informed natural therapies."
                  </p>
                </motion.div>

                <h3 className="text-2xl font-bold text-stone-900 mt-12 mb-4">Publications</h3>
                <p className="text-stone-600 leading-relaxed mb-6">
                  A prolific author, Prof. Oseni merges science, tradition, and spiritual insight in his published works:
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                  <motion.div 
                    whileHover={{ y: -5 }} 
                    onClick={() => navigate('/research')}
                    className="flex items-start gap-4 bg-white p-6 rounded-2xl border border-stone-100 shadow-sm cursor-pointer hover:border-lime-200 transition-colors"
                  >
                    <div className="bg-lime-100 p-3 rounded-lg text-lime-600 shrink-0">
                      <BookOpen size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900 mb-1">Healers Manual</h4>
                      <p className="text-sm text-stone-500 font-medium">Published 2018</p>
                    </div>
                  </motion.div>
                  <motion.div 
                    whileHover={{ y: -5 }} 
                    onClick={() => navigate('/research')}
                    className="flex items-start gap-4 bg-white p-6 rounded-2xl border border-stone-100 shadow-sm cursor-pointer hover:border-lime-200 transition-colors"
                  >
                    <div className="bg-lime-100 p-3 rounded-lg text-lime-600 shrink-0">
                      <BookOpen size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-stone-900 mb-1">The Spirituality of Healing</h4>
                      <p className="text-sm text-stone-500 font-medium">Published 2025</p>
                    </div>
                  </motion.div>
                </div>

                <p className="text-stone-600 leading-relaxed font-medium text-lg mt-8">
                  Prof. Oseni welcomes you to experience personalized, transformative care at our Abeokuta and Lagos branches.
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      {testimonials.length > 0 && (
        <section className="py-24 bg-stone-900 text-white overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-lime-500/10 text-lime-400 border border-lime-500/20 mb-4"
              >
                <Star size={16} className="fill-lime-400" />
                <span className="text-sm font-bold uppercase tracking-wider">Patient Testimonials</span>
              </motion.div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Healing Journeys</h2>
              <p className="text-stone-400 max-w-2xl mx-auto">
                Real stories of transformation and wellness from those who have experienced our holistic care.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {testimonials.map((t, idx) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-stone-800/50 p-8 rounded-3xl border border-stone-700/50 relative group hover:border-lime-500/30 transition-colors"
                >
                  <Quote className="absolute top-6 right-8 text-stone-700 group-hover:text-lime-500/20 transition-colors" size={48} />
                  <p className="text-stone-300 leading-relaxed mb-8 relative z-10 italic">
                    "{t.text}"
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-stone-700 flex items-center justify-center text-lime-500 font-bold text-xl">
                      {t.author.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white">{t.author}</h4>
                      <p className="text-sm text-stone-500">{t.location}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}
    </motion.div>
  );
}
