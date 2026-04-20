import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Heart, ShieldCheck, Star } from 'lucide-react';
import { motion } from 'motion/react';
import { useSiteSettings } from '../hooks/useSiteSettings';

export default function Home() {
  const { settings } = useSiteSettings();

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col min-h-screen"
    >
      {/* Hero Section */}
      <section className="relative bg-stone-900 text-white overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={settings.heroBgUrl || "https://i.imgur.com/bx3aTpx.jpg"}
            alt="Alayo Health Hero Background"
            className="w-full h-full object-cover opacity-40"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-stone-900/60"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 lg:py-40 text-center">
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="max-w-4xl mx-auto flex flex-col items-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-lime-300 text-sm font-semibold tracking-wide mb-8 uppercase">
              <Leaf size={16} />
              <span>Est. 1993 | Over 30 Years of Excellence</span>
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight mb-8 leading-tight drop-shadow-lg">
              {(settings.heroTitle || "").split('<br/>').map((part, i) => (
                <React.Fragment key={i}>
                  {part}
                  {i < (settings.heroTitle || "").split('<br/>').length - 1 && <br className="hidden md:block" />}
                </React.Fragment>
              ))}
            </h1>
            <p className="text-xl md:text-2xl text-stone-200 mb-12 max-w-3xl leading-relaxed drop-shadow-md font-light">
              {settings.heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center w-full sm:w-auto">
              <a
                href="https://wa.me/2348034170747"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex justify-center items-center gap-3 bg-lime-500 hover:bg-lime-600 text-white px-10 py-5 rounded-full text-lg font-bold transition-all shadow-xl shadow-lime-500/20 hover:shadow-lime-500/40 hover:-translate-y-1"
              >
                Book Consultation <ArrowRight size={20} />
              </a>
              <Link
                to="/services"
                className="inline-flex justify-center items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/30 text-white px-10 py-5 rounded-full text-lg font-bold transition-all hover:-translate-y-1"
              >
                Explore Services
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="bg-lime-50 py-16 border-b border-lime-100 relative z-20 -mt-8 rounded-t-[3rem]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-lime-200">
            <motion.div 
              whileHover={{ y: -5 }}
              className="flex flex-col items-center p-4"
            >
              <div className="bg-lime-100 p-4 rounded-full text-lime-600 mb-4 shadow-sm">
                <ShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-2">30+ Years Experience</h3>
              <p className="text-stone-600">Decades of trusted, evidence-informed holistic care.</p>
            </motion.div>
            <motion.div 
              whileHover={{ y: -5 }}
              className="flex flex-col items-center p-4"
            >
              <div className="bg-lime-100 p-4 rounded-full text-lime-600 mb-4 shadow-sm">
                <Leaf size={32} />
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-2">100% Natural Remedies</h3>
              <p className="text-stone-600">Root herbs, leaf extracts, and organic formulations.</p>
            </motion.div>
            <motion.div 
              whileHover={{ y: -5 }}
              className="flex flex-col items-center p-4"
            >
              <div className="bg-lime-100 p-4 rounded-full text-lime-600 mb-4 shadow-sm">
                <Heart size={32} />
              </div>
              <h3 className="text-xl font-bold text-stone-800 mb-2">Holistic Approach</h3>
              <p className="text-stone-600">Treating the root cause through mind, body, and spirit.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Section Snippet */}
      <section className="py-24 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-lime-100 rounded-[2.5rem] transform -rotate-3 z-0"></div>
              <img
                src={settings.ceoPhotoUrl || "https://i.imgur.com/91WDLQr.jpg"}
                alt="Prof Kayode Oseni"
                className="relative z-10 rounded-3xl shadow-2xl w-full h-auto object-cover aspect-[4/5]"
                referrerPolicy="no-referrer"
              />
              <motion.div 
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="absolute -bottom-6 -right-6 bg-white p-6 rounded-2xl shadow-xl z-20 max-w-xs border border-stone-100"
              >
                <div className="flex items-center gap-4 mb-2">
                  <div className="flex text-yellow-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} size={16} fill="currentColor" />
                    ))}
                  </div>
                  <span className="font-bold text-stone-800">5.0 Rating</span>
                </div>
                <p className="text-sm text-stone-600 font-medium">Trusted by thousands of patients worldwide.</p>
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-lime-600 font-semibold tracking-wider uppercase text-sm mb-3 flex items-center gap-2">
                <span className="w-8 h-px bg-lime-600"></span> About The Founder
              </h2>
              <h3 className="text-4xl md:text-5xl font-bold text-stone-900 mb-6 leading-tight">
                Meet Prof. Kayode Oseni:<br/>Your Trusted Guide to Natural Healing
              </h3>
              <p className="text-lg text-stone-600 mb-6 leading-relaxed">
                With over 30 years as a practitioner of Alternative and Complementary Medicine, Prof. Kayode Oseni delivers evidence-informed, holistic care. He is the CEO and Chief Consultant of Alayo Health and Wellness Center.
              </p>
              <p className="text-stone-600 mb-8 leading-relaxed">
                A respected leader in the field, he is currently the national president of the Academy of Complementary and Alternative Medical Practitioners and a prolific author of works like <em>Healers Manual (2018)</em> and <em>The Spirituality of Healing (2025)</em>.
              </p>
              <Link
                to="/about"
                className="inline-flex items-center gap-2 text-lime-600 font-semibold hover:text-lime-700 transition-colors group text-lg"
              >
                Read Full Biography 
                <ArrowRight size={20} className="transform group-hover:translate-x-2 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Overview */}
      <section className="py-24 bg-stone-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-lime-600 font-semibold tracking-wider uppercase text-sm mb-3">Our Expertise</h2>
            <h3 className="text-3xl md:text-5xl font-bold text-stone-900 mb-6">Comprehensive Holistic Care</h3>
            <p className="text-lg text-stone-600">
              We draw on nature's remedies—herbs, crystals, and integrative modalities—to empower patients toward lasting wellness.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Naturopathic Consultation',
                desc: 'Personalized treatment plans for diverse health challenges including immune boosting, diabetes, and hypertension.',
                icon: <ShieldCheck size={24} />,
                img: 'https://i.imgur.com/r4gc3aa.jpg'
              },
              {
                title: 'Herbal Remedies',
                desc: 'Formulating and production of proprietary organic remedies for our patients and colleagues in the healing profession.',
                icon: <Leaf size={24} />,
                img: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=2070&auto=format&fit=crop'
              },
              {
                title: 'Psychic & Energy Healing',
                desc: 'Specialized modalities including all forms of crystal therapy, chakras balancing, and aural scanning.',
                icon: <Heart size={24} />,
                img: 'https://i.imgur.com/bx3aTpx.jpg'
              }
            ].map((service, idx) => (
              <motion.div 
                key={idx}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                whileHover={{ y: -10 }}
                className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 border border-stone-100 group"
              >
                <div className="h-56 overflow-hidden relative">
                  <img src={service.img} alt={service.title} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 to-transparent"></div>
                  <div className="absolute bottom-6 left-6 bg-lime-500 text-white p-3 rounded-xl shadow-lg transform group-hover:-translate-y-2 transition-transform duration-300">
                    {service.icon}
                  </div>
                </div>
                <div className="p-8">
                  <h4 className="text-2xl font-bold text-stone-900 mb-4">{service.title}</h4>
                  <p className="text-stone-600 mb-8 leading-relaxed">{service.desc}</p>
                  <Link to="/services" className="text-lime-600 font-bold hover:text-lime-700 flex items-center gap-2 group-hover:gap-3 transition-all">
                    Learn more <ArrowRight size={18} />
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-lime-600 font-semibold tracking-wider uppercase text-sm mb-3">Student & Patient Reviews</h2>
            <h3 className="text-3xl md:text-5xl font-bold text-stone-900 mb-6">Voices of Healing & Learning</h3>
            <p className="text-lg text-stone-600">
              Hear from participants of our Masterclasses in Natural Medicine and Energy Medicine from across Africa.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                text: "I sincerely wish to say a very big thank you to our able Prof Kayode Oseni. Indeed you are a teaching Professor, you've really impacted unto me... Am greatly honored to have acquired this amazing knowledge.",
                author: "Dr. Ellen",
                location: "Ghana"
              },
              {
                text: "Thank you very much Professor KAYODE OSENI for the very useful knowledge that the whole class have been endowed with through the closing MasterClass. I take it as an introduction to further personal upbringing.",
                author: "Prof. Hippolyte N. MUYINGI",
                location: "Kenya"
              },
              {
                text: "From the bottom of my Heart, I wish to sincerely thank you Professor Kayode Oseni for all the knowledge imparted to me, it has been two months of Love sharing with you and Members my Class 2, Master Course on Chakras and Crystal Healing.",
                author: "Dr. Samson Ndidi Ehijinwa",
                location: "Port Harcourt, Nigeria"
              }
            ].map((testimonial, idx) => (
              <motion.div 
                key={idx}
                initial={{ scale: 0.9, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2 }}
                className="bg-stone-50 p-10 rounded-3xl shadow-sm border border-stone-100 relative hover:shadow-xl transition-shadow"
              >
                <div className="text-lime-500 mb-6 opacity-50">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M14.017 21L16.41 14.596C16.635 13.983 16.75 13.336 16.75 12.673V3H23.5V12.673C23.5 15.658 22.314 18.52 20.203 20.632L19.835 21H14.017ZM3.517 21L5.91 14.596C6.135 13.983 6.25 13.336 6.25 12.673V3H13V12.673C13 15.658 11.814 18.52 9.703 20.632L9.335 21H3.517Z" />
                  </svg>
                </div>
                <p className="text-stone-700 italic mb-8 leading-relaxed relative z-10 text-lg">"{testimonial.text}"</p>
                <div className="mt-auto border-t border-stone-200 pt-6">
                  <p className="font-bold text-stone-900 text-lg">{testimonial.author}</p>
                  <p className="text-sm text-lime-600 font-bold uppercase tracking-wider mt-1">{testimonial.location}</p>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-16">
            <Link
              to="/testimonials"
              className="inline-flex items-center gap-2 text-lime-600 font-bold hover:text-lime-700 transition-colors text-lg group"
            >
              View All Testimonials <ArrowRight size={20} className="transform group-hover:translate-x-2 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter / CTA */}
      <section className="py-32 bg-lime-600 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="leaf-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M50 15c-15 0-25 10-25 25 0 15 15 25 25 25s25-10 25-25c0-15-10-25-25-25zm0 40c-10 0-15-8-15-15s8-15 15-15 15 8 15 15-8 15-15 15z" fill="currentColor"/>
              </pattern>
            </defs>
            <rect x="0" y="0" width="100%" height="100%" fill="url(#leaf-pattern)"/>
          </svg>
        </div>
        <motion.div 
          initial={{ y: 50, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          viewport={{ once: true }}
          className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        >
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">Join the Nature's Ways Foundation</h2>
          <p className="text-lime-100 text-xl mb-12 max-w-2xl mx-auto font-light">
            Subscribe to our daily serialized newsletters for naturopathic research, herbal remedy insights, and positive lifestyle advocacy.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-grow px-8 py-5 rounded-full text-stone-800 text-lg focus:outline-none focus:ring-4 focus:ring-lime-400/50 shadow-xl"
              required
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="bg-stone-900 hover:bg-stone-800 text-white px-10 py-5 rounded-full text-lg font-bold transition-colors whitespace-nowrap shadow-xl"
            >
              Subscribe Now
            </motion.button>
          </form>
        </motion.div>
      </section>
    </motion.div>
  );
}
