import { Link } from 'react-router-dom';
import { Leaf, MapPin, Phone, Mail, Facebook, ArrowRight } from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';

export default function Footer() {
  const { settings } = useSiteSettings();

  return (
    <footer className="bg-stone-900 text-stone-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <img 
                src={settings.logoUrl || "https://i.imgur.com/J8eXjYF.jpg"} 
                alt="Alayo Health Logo" 
                className="h-10 w-10 rounded-full object-cover" 
                referrerPolicy="no-referrer" 
              />
              <div className="flex flex-col">
                <span className="font-bold text-xl text-white leading-tight">Alayo Health</span>
                <span className="text-xs text-lime-400 font-medium uppercase tracking-wider">
                  & Wellness <Link to="/admin/login" className="hover:text-lime-300 transition-colors">Center</Link>
                </span>
              </div>
            </Link>
            <p className="text-sm text-stone-400 mt-4 leading-relaxed">
              We work with Nature to nurture your health. Over 30 years of evidence-informed, holistic care rooted in Natural Medicine.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="https://facebook.com/kayode.oseni" target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-lime-400 transition-colors">
                <Facebook size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Quick Links</h3>
            <ul className="space-y-3">
              {['Home', 'About Us', 'Services', 'Herbal Products', 'Editorial', 'Contact'].map((item) => (
                <li key={item}>
                  <Link to={item === 'Home' ? '/' : `/${item.toLowerCase().replace(' ', '-')}`} className="text-sm hover:text-lime-400 transition-colors flex items-center gap-2">
                    <ArrowRight size={14} className="text-lime-500" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Our Services</h3>
            <ul className="space-y-3">
              <li className="text-sm text-stone-400">Naturopathic Consultation</li>
              <li className="text-sm text-stone-400">Herbal Remedies</li>
              <li className="text-sm text-stone-400">Psychic & Energy Healing</li>
              <li className="text-sm text-stone-400">Crystal Therapy</li>
              <li className="text-sm text-stone-400">Chakras Balancing</li>
              <li className="text-sm text-stone-400">Health Education</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-lg">Contact Us</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin size={20} className="text-lime-500 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-white font-medium mb-1">Head Office:</p>
                  <p className="text-stone-400">Alayo Villa, Idiori, off Ilesheawo, Kipe. Abeokuta</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={20} className="text-lime-500 shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-stone-400">08034170747</p>
                  <p className="text-stone-400">09125267562</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Mail size={20} className="text-lime-500 shrink-0 mt-0.5" />
                <div className="text-sm text-stone-400">
                  osenialayo@gmail.com
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-stone-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-stone-500">
            &copy; {new Date().getFullYear()} Alayo Health and Wellness <Link to="/admin/login" className="hover:text-stone-400 transition-colors">Center</Link>. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-stone-500">
            <span>Est. 1993 | Natural Medicine Modalities</span>
            <Link to="/sitemap" className="hover:text-lime-500 transition-colors">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
