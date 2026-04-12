/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from './firebase';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Products from './pages/Products';
import Editorial from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Contact from './pages/Contact';
import Sitemap from './pages/Sitemap';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Appointments from './pages/admin/Appointments';
import Orders from './pages/admin/Orders';
import AdminLogin from './pages/admin/AdminLogin';
import AdminProducts from './pages/admin/AdminProducts';
import AdminBooks from './pages/admin/AdminBooks';
import AdminEditorial from './pages/admin/AdminBlog';
import CommentModeration from './pages/admin/CommentModeration';
import AdminMessages from './pages/admin/AdminMessages';
import AdminSettings from './pages/admin/AdminSettings';
import ErrorBoundary from './components/ErrorBoundary';
import { getDocFromServer, doc } from 'firebase/firestore';
import { db } from './firebase';

// Authentication guard
const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        localStorage.setItem('admin_last_activity', Date.now().toString());
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const resetTimer = () => {
      localStorage.setItem('admin_last_activity', Date.now().toString());
    };

    const checkInactivity = () => {
      const lastActivity = localStorage.getItem('admin_last_activity');
      if (lastActivity) {
        const elapsed = Date.now() - parseInt(lastActivity);
        const thirtyMinutes = 30 * 60 * 1000;
        if (elapsed > thirtyMinutes) {
          console.log('Session expired due to inactivity');
          auth.signOut();
          localStorage.removeItem('admin_last_activity');
        }
      }
    };

    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));

    const interval = setInterval(checkInactivity, 30000); // Check every 30 seconds

    return () => {
      events.forEach(event => window.removeEventListener(event, resetTimer));
      clearInterval(interval);
    };
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lime-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  return children;
};

export default function App() {
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'sites', 'siteB', 'settings', 'site'));
        console.log('Firestore connection verified');
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. The client is offline.");
        }
      }
    }
    testConnection();
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="services" element={<Services />} />
            <Route path="products" element={<Products />} />
            <Route path="blog" element={<Editorial />} />
            <Route path="blog/:slug" element={<BlogPost />} />
            <Route path="editorial" element={<Editorial />} />
            <Route path="editorial/:slug" element={<BlogPost />} />
            <Route path="contact" element={<Contact />} />
            <Route path="sitemap" element={<Sitemap />} />
          </Route>
          
          <Route path="/admin/login" element={<AdminLogin />} />
          
          <Route path="/admin" element={<RequireAuth><AdminLayout /></RequireAuth>}>
            <Route index element={<Dashboard />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="orders" element={<Orders />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="books" element={<AdminBooks />} />
            <Route path="blog" element={<AdminEditorial />} />
            <Route path="comments" element={<CommentModeration />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
