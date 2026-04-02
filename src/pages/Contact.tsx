import React, { useState } from 'react';
import { MapPin, Phone, Mail, Clock, MessageCircle, Send, CheckCircle2 } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { handleFirestoreError, OperationType } from '../utils/firebaseErrors';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, 'messages'), {
        ...formData,
        status: 'Unread',
        date: new Date().toLocaleString(),
        createdAt: serverTimestamp()
      });
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'messages');
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
            src="https://images.unsplash.com/photo-1514995669114-6081e934b693?q=80&w=2070&auto=format&fit=crop"
            alt="Contact Us"
            className="w-full h-full object-cover opacity-20"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-stone-300 max-w-2xl mx-auto">
            We are here to answer your questions and guide you on your journey to holistic wellness.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
            
            {/* Left Column - Contact Info & Form */}
            <div className="lg:col-span-7 space-y-12">
              <div>
                <h2 className="text-3xl font-bold text-stone-900 mb-6">Send us a Message</h2>
                
                {isSubmitted ? (
                  <div className="bg-lime-50 border border-lime-200 rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 bg-lime-100 text-lime-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle2 size={32} />
                    </div>
                    <h3 className="text-2xl font-bold text-stone-900 mb-2">Message Sent!</h3>
                    <p className="text-stone-600 mb-6">Thank you for reaching out. We will get back to you as soon as possible.</p>
                    <button 
                      onClick={() => setIsSubmitted(false)}
                      className="text-lime-600 font-bold hover:underline"
                    >
                      Send another message
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6 bg-white p-8 rounded-2xl shadow-sm border border-stone-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">Full Name</label>
                        <input
                          required
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500 transition-all"
                          placeholder="Your name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-stone-700 mb-2">Email Address</label>
                        <input
                          required
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                          className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500 transition-all"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">Subject</label>
                      <input
                        required
                        type="text"
                        value={formData.subject}
                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500 transition-all"
                        placeholder="How can we help?"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-2">Message</label>
                      <textarea
                        required
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({...formData, message: e.target.value})}
                        className="w-full px-4 py-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500 transition-all resize-none"
                        placeholder="Your message here..."
                      ></textarea>
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-lime-500 hover:bg-lime-600 disabled:bg-stone-300 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-lime-500/20 flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? 'Sending...' : (
                        <>
                          Send Message <Send size={18} />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
              
              <div className="pt-8">
                <h3 className="text-2xl font-bold text-stone-900 mb-6">Contact Information</h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <li className="flex items-start gap-4">
                    <div className="bg-lime-100 p-3 rounded-xl text-lime-600 shrink-0">
                      <Phone size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-900 mb-1">Phone</h3>
                      <p className="text-stone-600">08034170747</p>
                      <p className="text-stone-600">09125267562</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="bg-lime-100 p-3 rounded-xl text-lime-600 shrink-0">
                      <MessageCircle size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-900 mb-1">WhatsApp</h3>
                      <p className="text-stone-600 mb-1">08034170747</p>
                      <a
                        href="https://wa.me/2348034170747"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-lime-600 font-semibold hover:text-lime-700 transition-colors"
                      >
                        Chat now
                      </a>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="bg-lime-100 p-3 rounded-xl text-lime-600 shrink-0">
                      <Mail size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-900 mb-1">Email</h3>
                      <p className="text-stone-600">osenialayo@gmail.com</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-4">
                    <div className="bg-lime-100 p-3 rounded-xl text-lime-600 shrink-0">
                      <Clock size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-stone-900 mb-1">Hours</h3>
                      <p className="text-stone-600">Mon-Fri: 9am - 5pm</p>
                      <p className="text-stone-600">Sat: 10am - 2pm</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Right Column - Locations */}
            <div className="lg:col-span-5">
              <h2 className="text-3xl font-bold text-stone-900 mb-8">Clinic Locations</h2>
              
              <div className="space-y-8">
                {/* Location 1 */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 flex flex-col gap-6 items-start">
                  <div className="bg-lime-100 p-4 rounded-2xl text-lime-600 shrink-0">
                    <MapPin size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-stone-900 mb-2">Head Office (Alayo Villa)</h3>
                    <p className="text-lg text-stone-600 leading-relaxed mb-4">
                      Idiori, off Ilesheawo, Kipe.<br />
                      Abeokuta, Ogun State
                    </p>
                  </div>
                </div>

                {/* Location 2 */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-stone-100 flex flex-col gap-6 items-start">
                  <div className="bg-lime-100 p-4 rounded-2xl text-lime-600 shrink-0">
                    <MapPin size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-stone-900 mb-2">Branch Office (Adatan)</h3>
                    <p className="text-lg text-stone-600 leading-relaxed mb-4">
                      #1. Tanimowo Shopping Complex<br />
                      100, Abeokuta-Ibadan road, Adatan-Carwash<br />
                      Abeokuta, Ogun State
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
