import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { User } from 'firebase/auth';

interface LayoutProps {
  user: User | null;
}

export default function Layout({ user }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col font-sans text-stone-800 bg-stone-50">
      <Navbar user={user} />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer user={user} />
    </div>
  );
}
