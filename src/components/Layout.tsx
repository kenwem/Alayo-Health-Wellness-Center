import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { User } from 'firebase/auth';

interface LayoutProps {
  user: User | null;
}

export default function Layout({ user }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col font-sans text-stone-800 bg-stone-50 relative">
      <Navbar user={user} />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer user={user} />
      
      {/* Floating WhatsApp Button */}
      <a 
        href="https://wa.me/2348034170747" 
        target="_blank" 
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-50 bg-lime-500 text-white p-4 rounded-full shadow-2xl hover:bg-lime-600 transition-all hover:scale-110 flex items-center justify-center border-4 border-white group"
        title="Chat with us on WhatsApp"
      >
        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.246 2.248 3.484 5.232 3.483 8.413-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.308 1.654zm6.233-3.762c1.508.893 3.078 1.364 4.673 1.365 5.462 0 9.906-4.444 9.908-9.906.002-2.646-1.027-5.133-2.9-7.008-1.871-1.873-4.359-2.903-7.005-2.905-5.464 0-9.908 4.445-9.91 9.907-.001 1.558.399 3.081 1.158 4.417l-1.023 3.735 3.825-1.003h.174zm11.387-7.464c-.312-.156-1.848-.912-2.134-1.017-.286-.105-.494-.156-.703.156-.208.312-.807 1.017-.988 1.222-.182.205-.364.231-.676.075-.312-.156-1.316-.484-2.507-1.548-.926-.826-1.551-1.846-1.733-2.158-.182-.312-.019-.481.137-.635.141-.138.312-.364.468-.546.156-.182.208-.312.312-.52.104-.208.052-.39-.026-.546-.078-.156-.703-1.693-.963-2.319-.253-.611-.512-.528-.703-.537-.182-.009-.39-.011-.598-.011-.208 0-.546.078-.832.39-.286.312-1.093 1.068-1.093 2.603 0 1.535 1.118 3.02 1.274 3.229.156.208 2.199 3.358 5.328 4.71.744.322 1.325.514 1.777.658.748.237 1.429.204 1.967.123.6-.09 1.847-.755 2.108-1.485.26-.73.26-1.354.182-1.485-.077-.131-.286-.208-.597-.364z" />
        </svg>
        <span className="max-w-0 overflow-hidden group-hover:max-w-xs group-hover:ml-3 transition-all duration-500 white-space-nowrap font-bold text-sm">
          WhatsApp Us
        </span>
      </a>
    </div>
  );
}
