import React, { useState, useEffect } from 'react';
import { ShieldCheck, Leaf, Heart, BookOpen, ArrowRight, X, Calendar as CalendarIcon, Clock, User, Phone, Mail, CheckCircle2, GraduationCap, Award } from 'lucide-react';
import { Link } from 'react-router-dom';
import { collection, addDoc, serverTimestamp, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firebaseErrors';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { siteId } from '../constants/siteConfig';

interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
  image: string;
  features?: string[];
  position: number;
}

const DEFAULT_SERVICES: Service[] = [
  {
    id: 'default-naturopathic',
    title: 'Naturopathic Consultation',
    description: 'Personalized treatment plans for diverse health challenges. We offer expert consultations for conditions like immune boosting, detoxification, pain relief, fertility support, diabetes management, hypertension, and stress reduction.',
    icon: 'ShieldCheck',
    image: 'https://images.unsplash.com/photo-1576091160550-217359f4ecf8?q=80&w=2070&auto=format&fit=crop',
    features: ['Immune Boosting & Detoxification', 'Pain Relief & Fertility Support', 'Diabetes & Hypertension Management'],
    position: 0
  },
  {
    id: 'default-herbal',
    title: 'Herbal Remedies',
    description: 'Formulating and production of proprietary organic remedies for our numerous patients and colleagues in the healing profession. We draw on African Traditional Medicine, Ayurvedic Medicine, and Traditional Chinese Medicine.',
    icon: 'Leaf',
    image: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=2070&auto=format&fit=crop',
    features: ['Root Herbs & Leaf Extracts', 'Organic Remedies & Nutraceuticals', 'Global Traditional Medicine Integration'],
    position: 1
  },
  {
    id: 'default-energy',
    title: 'Psychic & Energy Healing',
    description: 'Specialized modalities of Energy Medicine including all forms of crystal therapy, chakras balancing, and aural scanning and cleansing.',
    icon: 'Heart',
    image: 'https://i.imgur.com/A6D6O78.jpg',
    features: ['Crystal Therapies', 'Chakras Balancing', 'Aural Scanning & Cleansing'],
    position: 2
  },
  {
    id: 'default-education',
    title: 'Health Education',
    description: 'Lectures and masterclasses in Energy Medicine, Herbal Medicine, and Herbal Therapeutics led by Prof. Kayode Oseni.',
    icon: 'GraduationCap',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop',
    features: ['Masterclasses in Energy Medicine', 'Herbal Therapeutics Training', 'Professional Certification Programs'],
    position: 3
  }
];

export default function Services() {
  const { settings } = useSiteSettings();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingService, setBookingService] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    message: ''
  });

  useEffect(() => {
    const q = query(collection(db, 'sites', siteId, 'services'), orderBy('position', 'asc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Service[];
      // Use fallback if empty
      setServices(data.length > 0 ? data : DEFAULT_SERVICES);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'ShieldCheck': return <ShieldCheck size={32} />;
      case 'GraduationCap': return <GraduationCap size={32} />;
      case 'Award': return <Award size={32} />;
      case 'Leaf': return <Leaf size={32} />;
      case 'Heart': return <Heart size={32} />;
      case 'BookOpen': return <BookOpen size={32} />;
      default: return <Leaf size={32} />;
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Format date to dd/mm/yyyy
      let formattedDate = formData.date;
      if (formData.date && formData.date.includes('-')) {
        const [year, month, day] = formData.date.split('-');
        formattedDate = `${day}/${month}/${year}`;
      }

      await addDoc(collection(db, 'sites', siteId, 'appointments'), {
        ...formData,
        date: formattedDate,
        service: bookingService,
        status: 'Pending',
        createdAt: serverTimestamp()
      });
      setIsSubmitted(true);
      setFormData({ name: '', email: '', phone: '', date: '', time: '', message: '' });
    } catch (error) {
      console.error("Booking error:", error);
      handleFirestoreError(error, OperationType.CREATE, `sites/${siteId}/appointments`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-stone-50">
      {/* Page Header */}
      <section className="bg-stone-900 text-white py-24 relative overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={settings.servicesBgUrl || "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=2070&auto=format&fit=crop"}
            alt="Our Services"
            className="w-full h-full object-cover opacity-20"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Services</h1>
          <p className="text-xl text-stone-300 max-w-2xl mx-auto">
            Comprehensive holistic care emphasizing preventive care, disease management, and spiritual cleansing.
          </p>
        </div>
      </section>

      {/* Services List */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lime-600"></div>
            </div>
          ) : services.length > 0 ? (
            <div className="space-y-24">
              {services.map((service, index) => (
                <div key={service.id} className={`flex flex-col lg:flex-row gap-12 items-center ${index % 2 !== 0 ? 'lg:flex-row-reverse' : ''}`}>
                  <div className="w-full lg:w-1/2">
                    <div className="relative rounded-2xl overflow-hidden shadow-xl group">
                      <img
                        src={service.image}
                        alt={service.title}
                        className="w-full h-auto object-cover aspect-[4/3] transform group-hover:scale-105 transition-transform duration-700"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    </div>
                  </div>
                  
                  <div className="w-full lg:w-1/2 space-y-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-lime-100 text-lime-600 mb-2">
                      {renderIcon(service.icon)}
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold text-stone-900">{service.title}</h2>
                    <p className="text-lg text-stone-600 leading-relaxed">
                      {service.description}
                    </p>
                    {service.features && service.features.length > 0 && (
                      <ul className="space-y-3 pt-4 border-t border-stone-200">
                        {service.features.map((feature, fIdx) => (
                          <li key={fIdx} className="flex items-center gap-3 text-stone-700">
                            <ArrowRight size={16} className="text-lime-500" /> {feature}
                          </li>
                        ))}
                      </ul>
                    )}
                    <div className="pt-6">
                      <button
                        onClick={() => setBookingService(service.title)}
                        className="inline-flex justify-center items-center gap-2 bg-lime-500 hover:bg-lime-600 text-white px-6 py-3 rounded-full font-semibold transition-colors shadow-sm font-bold"
                      >
                        Book This Service
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-stone-100">
              <Leaf size={48} className="mx-auto text-stone-300 mb-4" />
              <p className="text-stone-500 text-lg italic">No services listed yet. Admin is currently updating this section.</p>
            </div>
          )}
        </div>
      </section>

      {/* Booking Modal */}
      {bookingService && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center p-6 border-b border-stone-100">
              <div>
                <h3 className="text-2xl font-bold text-stone-900">Book Appointment</h3>
                <p className="text-lime-600 font-medium">{bookingService}</p>
              </div>
              <button onClick={() => {setBookingService(null); setIsSubmitted(false);}} className="text-stone-400 hover:text-stone-600 p-2 hover:bg-stone-100 rounded-full transition-all">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto">
              {isSubmitted ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-lime-100 text-lime-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={40} />
                  </div>
                  <h3 className="text-3xl font-bold text-stone-900 mb-4">Booking Received!</h3>
                  <p className="text-lg text-stone-600 mb-8">
                    Thank you for choosing Alayo Health. We have received your request and will contact you shortly to confirm your appointment.
                  </p>
                  <button 
                    onClick={() => {setBookingService(null); setIsSubmitted(false);}}
                    className="bg-stone-900 text-white px-8 py-3 rounded-full font-bold hover:bg-stone-800 transition-all"
                  >
                    Close
                  </button>
                </div>
              ) : (
                <form onSubmit={handleBooking} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-stone-700">
                      <User size={16} className="text-lime-500" /> Full Name
                    </label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500 transition-all"
                      placeholder="Your full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-stone-700">
                      <Mail size={16} className="text-lime-500" /> Email Address
                    </label>
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500 transition-all"
                      placeholder="your@email.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-stone-700">
                      <Phone size={16} className="text-lime-500" /> Phone Number
                    </label>
                    <input
                      required
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500 transition-all"
                      placeholder="080 0000 0000"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-stone-700">
                      <CalendarIcon size={16} className="text-lime-500" /> Preferred Date
                    </label>
                    <input
                      required
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({...formData, date: e.target.value})}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-stone-700">
                      <Clock size={16} className="text-lime-500" /> Preferred Time
                    </label>
                    <select
                      required
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500 transition-all"
                    >
                      <option value="">Select a time</option>
                      <option value="09:00 AM">09:00 AM</option>
                      <option value="10:00 AM">10:00 AM</option>
                      <option value="11:00 AM">11:00 AM</option>
                      <option value="12:00 PM">12:00 PM</option>
                      <option value="01:00 PM">01:00 PM</option>
                      <option value="02:00 PM">02:00 PM</option>
                      <option value="03:00 PM">03:00 PM</option>
                      <option value="04:00 PM">04:00 PM</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-stone-700">
                      Message (Optional)
                    </label>
                    <textarea
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500 transition-all resize-none"
                      placeholder="Tell us about your health concerns..."
                    ></textarea>
                  </div>
                  <div className="md:col-span-2 pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-lime-500 hover:bg-lime-600 disabled:bg-stone-300 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-lime-500/20 flex items-center justify-center gap-2 text-lg"
                    >
                      {isSubmitting ? 'Processing...' : 'Confirm Booking Request'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CTA Section */}
      <section className="bg-lime-50 py-20 border-t border-lime-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">Ready to start your healing journey?</h2>
          <p className="text-lg text-stone-600 mb-10">
            Contact us today to schedule a consultation with Prof. Kayode Oseni and discover the power of natural medicine.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a
              href="https://wa.me/2348034170747"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex justify-center items-center gap-2 bg-lime-500 hover:bg-lime-600 text-white px-8 py-4 rounded-full text-lg font-semibold transition-all shadow-md"
            >
              WhatsApp Consultation
            </a>
            <Link
              to="/contact"
              className="inline-flex justify-center items-center gap-2 bg-white hover:bg-stone-50 border border-stone-200 text-stone-800 px-8 py-4 rounded-full text-lg font-semibold transition-all shadow-sm"
            >
              View Clinic Locations
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
