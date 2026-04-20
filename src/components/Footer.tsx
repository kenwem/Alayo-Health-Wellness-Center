import { Link } from 'react-router-dom';
import { Leaf, MapPin, Phone, Mail, Facebook, ArrowRight, LayoutDashboard } from 'lucide-react';
import { useSiteSettings } from '../hooks/useSiteSettings';
import { User } from 'firebase/auth';

interface FooterProps {
  user: User | null;
}

export default function Footer({ user }: FooterProps) {
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
                  & Wellness Center
                </span>
              </div>
            </Link>
            <p className="text-sm text-stone-400 mt-4 leading-relaxed">
              We work with Nature to nurture your health. Over 30 years of evidence-informed, holistic care rooted in Natural Medicine.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href={`https://wa.me/?text=${encodeURIComponent('Check out Alayo Health & Wellness Center: ' + window.location.origin)}`} target="_blank" rel="noopener noreferrer" className="text-stone-400 hover:text-lime-400 transition-colors" title="Share on WhatsApp">
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.483 8.413-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.308 1.654zm6.233-3.762c1.508.893 3.078 1.364 4.673 1.365 5.462 0 9.906-4.444 9.908-9.906.002-2.646-1.027-5.133-2.9-7.008-1.871-1.873-4.359-2.903-7.005-2.905-5.464 0-9.908 4.445-9.91 9.907-.001 1.558.399 3.081 1.158 4.417l-1.023 3.735 3.825-1.003h.174zm11.387-7.464c-.312-.156-1.848-.912-2.134-1.017-.286-.105-.494-.156-.703.156-.208.312-.807 1.017-.988 1.222-.182.205-.364.231-.676.075-.312-.156-1.316-.484-2.507-1.548-.926-.826-1.551-1.846-1.733-2.158-.182-.312-.019-.481.137-.635.141-.138.312-.364.468-.546.156-.182.208-.312.312-.52.104-.208.052-.39-.026-.546-.078-.156-.703-1.693-.963-2.319-.253-.611-.512-.528-.703-.537-.182-.009-.39-.011-.598-.011-.208 0-.546.078-.832.39-.286.312-1.093 1.068-1.093 2.603 0 1.535 1.118 3.02 1.274 3.229.156.208 2.199 3.358 5.328 4.71.744.322 1.325.514 1.777.658.748.237 1.429.204 1.967.123.6-.09 1.847-.755 2.108-1.485.26-.73.26-1.354.182-1.485-.077-.131-.286-.208-.597-.364z"/></svg>
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
            &copy; {new Date().getFullYear()} Alayo Health and Wellness <Link to="/admin" className="hover:text-stone-400 transition-colors">Center</Link>. All rights reserved.
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
