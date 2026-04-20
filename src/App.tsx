/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth } from './firebase';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import Products from './pages/Products';
import Editorial from './pages/Blog';
import BlogPost from './pages/BlogPost';
import Contact from './pages/Contact';
import Testimonials from './pages/Testimonials';
import Research from './pages/Research';
import Sitemap from './pages/Sitemap';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Appointments from './pages/admin/Appointments';
import Orders from './pages/admin/Orders';
import AdminLogin from './pages/admin/AdminLogin';
import AdminProducts from './pages/admin/AdminProducts';
import AdminTestimonials from './pages/admin/AdminTestimonials';
import AdminBooks from './pages/admin/AdminBooks';
import AdminEditorial from './pages/admin/AdminBlog';
import AdminServices from './pages/admin/AdminServices';
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
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

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
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Global Idle Reset: Track activity across the whole site if admin is logged in
  useEffect(() => {
    if (!user || authLoading) return;

    const TIMEOUT_MS = 1800000; // 30 minutes

    const resetTimer = () => {
      localStorage.setItem('admin_last_activity', Date.now().toString());
    };

    const checkTimeout = async () => {
      const lastActivity = localStorage.getItem('admin_last_activity');
      if (lastActivity) {
        const elapsed = Date.now() - parseInt(lastActivity);
        if (elapsed >= TIMEOUT_MS) {
          try {
            await signOut(auth);
            localStorage.removeItem('admin_last_activity');
          } catch (e) {
            console.error('Auto logout error:', e);
          }
        }
      }
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click', 'keydown'];
    const isAdmin = user.email?.toLowerCase() === 'osenialayo@gmail.com' || user.email?.toLowerCase() === 'kennywemson1@gmail.com';
    
    if (isAdmin) {
      // Use capture: true to ensure we catch events before they are stopped by other components
      events.forEach(event => {
        window.addEventListener(event, resetTimer, { capture: true, passive: true });
      });
      
      const interval = setInterval(checkTimeout, 5000);
      
      // Also reset on visibility change (when they switch back to the tab)
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          resetTimer();
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      if (!localStorage.getItem('admin_last_activity')) resetTimer();

      return () => {
        events.forEach(event => {
          window.removeEventListener(event, resetTimer, { capture: true });
        });
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        clearInterval(interval);
      };
    }
  }, [user, authLoading]);

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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lime-600"></div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout user={user} />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="services" element={<Services />} />
            <Route path="products" element={<Products />} />
            <Route path="blog" element={<Editorial />} />
            <Route path="blog/:slug" element={<BlogPost />} />
            <Route path="editorial" element={<Editorial />} />
            <Route path="editorial/:slug" element={<BlogPost />} />
            <Route path="testimonials" element={<Testimonials />} />
            <Route path="research" element={<Research />} />
            <Route path="contact" element={<Contact />} />
            <Route path="sitemap" element={<Sitemap />} />
          </Route>
          
          <Route path="/admin/login" element={<AdminLogin />} />
          
          <Route path="/admin" element={user ? <AdminLayout /> : <Navigate to="/admin/login" replace />}>
            <Route index element={<Dashboard />} />
            <Route path="appointments" element={<Appointments />} />
            <Route path="orders" element={<Orders />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="testimonials" element={<AdminTestimonials />} />
            <Route path="books" element={<AdminBooks />} />
            <Route path="blog" element={<AdminEditorial />} />
            <Route path="services" element={<AdminServices />} />
            <Route path="comments" element={<CommentModeration />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
