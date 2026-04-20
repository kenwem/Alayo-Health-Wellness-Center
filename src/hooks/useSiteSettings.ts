import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { siteId } from '../constants/siteConfig';

export interface SiteSettings {
  siteName: string;
  logoUrl: string;
  heroBgUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  aboutBgUrl: string;
  aboutFacts: { icon: string; title: string; desc: string }[];
  servicesBgUrl: string;
  blogBgUrl: string;
  ceoPhotoUrl: string;
  copyrightText: string;
}

const defaultSettings: SiteSettings = {
  siteName: 'Alayo Health & Wellness',
  logoUrl: 'https://i.imgur.com/J8eXjYF.jpg',
  heroBgUrl: 'https://i.imgur.com/bx3aTpx.jpg',
  heroTitle: 'We work with Nature to nurture your health.',
  heroSubtitle: 'Premier naturopathic practice specializing in holistic health solutions rooted in Natural Medicine, led by Prof. Kayode Oseni.',
  aboutBgUrl: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=2070&auto=format&fit=crop',
  aboutFacts: [
    { icon: 'ShieldCheck', title: 'Established 1993', desc: 'Over 30 years of clinical practice' },
    { icon: 'GraduationCap', title: 'Academic Leader', desc: 'Former Dean, School of Natural Medicine' },
    { icon: 'Award', title: 'National President', desc: 'Academy of Complementary and Alternative Medical Practitioners' }
  ],
  servicesBgUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=2070&auto=format&fit=crop',
  blogBgUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=2070&auto=format&fit=crop',
  ceoPhotoUrl: 'https://i.imgur.com/91WDLQr.jpg',
  copyrightText: '© 2025 Alayo Health and Wellness Center. All rights reserved.'
};

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(() => {
    const cached = localStorage.getItem(`site_settings_cache_${siteId}`);
    return cached ? JSON.parse(cached) : defaultSettings;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'sites', siteId, 'settings', 'site'), (doc) => {
      if (doc.exists()) {
        const firestoreData = doc.data();
        
        // Helper to check if a URL is an old default or empty
        const isDefaultOrEmpty = (url: string | undefined) => {
          if (!url || url === '' || url === 'undefined') return true;
          // Check for known old defaults
          const oldDefaults = [
            'unsplash.com/photo-1544367567-0f2fcb009e0b',
            'photos.fife.usercontent.google.com',
            'photos.google.com',
            'i.imgur.com/NNQW08P.jpg'
          ];
          return oldDefaults.some(def => url.includes(def));
        };

        // Helper to ensure Imgur links are direct image links
        const ensureDirectImgur = (url: string | undefined) => {
          if (!url) return url;
          if (url.includes('imgur.com/') && !url.includes('i.imgur.com') && !url.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
            const id = url.split('/').pop();
            return `https://i.imgur.com/${id}.jpg`;
          }
          return url;
        };

        const data: SiteSettings = {
          siteName: firestoreData.siteName || defaultSettings.siteName,
          logoUrl: ensureDirectImgur(isDefaultOrEmpty(firestoreData.logoUrl) ? defaultSettings.logoUrl : firestoreData.logoUrl) as string,
          heroBgUrl: ensureDirectImgur(isDefaultOrEmpty(firestoreData.heroBgUrl) ? defaultSettings.heroBgUrl : firestoreData.heroBgUrl) as string,
          heroTitle: firestoreData.heroTitle || defaultSettings.heroTitle,
          heroSubtitle: firestoreData.heroSubtitle || defaultSettings.heroSubtitle,
          aboutBgUrl: ensureDirectImgur(isDefaultOrEmpty(firestoreData.aboutBgUrl) ? defaultSettings.aboutBgUrl : firestoreData.aboutBgUrl) as string,
          aboutFacts: firestoreData.aboutFacts || defaultSettings.aboutFacts,
          servicesBgUrl: ensureDirectImgur(isDefaultOrEmpty(firestoreData.servicesBgUrl) ? defaultSettings.servicesBgUrl : firestoreData.servicesBgUrl) as string,
          blogBgUrl: ensureDirectImgur(isDefaultOrEmpty(firestoreData.blogBgUrl) ? defaultSettings.blogBgUrl : firestoreData.blogBgUrl) as string,
          ceoPhotoUrl: ensureDirectImgur(isDefaultOrEmpty(firestoreData.ceoPhotoUrl) ? defaultSettings.ceoPhotoUrl : firestoreData.ceoPhotoUrl) as string,
          copyrightText: firestoreData.copyrightText || defaultSettings.copyrightText,
        };
        setSettings(data);
        localStorage.setItem(`site_settings_cache_${siteId}`, JSON.stringify(data));
      }
      setLoading(false);
    }, (error) => {
      console.error('Error listening to settings:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { settings, loading };
}
