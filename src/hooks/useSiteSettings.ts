import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

export interface SiteSettings {
  logoUrl: string;
  heroBgUrl: string;
  aboutBgUrl: string;
  servicesBgUrl: string;
  blogBgUrl: string;
  ceoPhotoUrl: string;
}

const defaultSettings: SiteSettings = {
  logoUrl: 'https://i.imgur.com/J8eXjYF.jpg',
  heroBgUrl: 'https://i.imgur.com/bx3aTpx.jpg',
  aboutBgUrl: 'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?q=80&w=2070&auto=format&fit=crop',
  servicesBgUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?q=80&w=2070&auto=format&fit=crop',
  blogBgUrl: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?q=80&w=2070&auto=format&fit=crop',
  ceoPhotoUrl: 'https://i.imgur.com/91WDLQr.jpg'
};

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings>(() => {
    const cached = localStorage.getItem('site_settings_cache');
    return cached ? JSON.parse(cached) : defaultSettings;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'settings', 'site'), (doc) => {
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
          logoUrl: ensureDirectImgur(isDefaultOrEmpty(firestoreData.logoUrl) ? defaultSettings.logoUrl : firestoreData.logoUrl) as string,
          heroBgUrl: ensureDirectImgur(isDefaultOrEmpty(firestoreData.heroBgUrl) ? defaultSettings.heroBgUrl : firestoreData.heroBgUrl) as string,
          aboutBgUrl: ensureDirectImgur(isDefaultOrEmpty(firestoreData.aboutBgUrl) ? defaultSettings.aboutBgUrl : firestoreData.aboutBgUrl) as string,
          servicesBgUrl: ensureDirectImgur(isDefaultOrEmpty(firestoreData.servicesBgUrl) ? defaultSettings.servicesBgUrl : firestoreData.servicesBgUrl) as string,
          blogBgUrl: ensureDirectImgur(isDefaultOrEmpty(firestoreData.blogBgUrl) ? defaultSettings.blogBgUrl : firestoreData.blogBgUrl) as string,
          ceoPhotoUrl: ensureDirectImgur(isDefaultOrEmpty(firestoreData.ceoPhotoUrl) ? defaultSettings.ceoPhotoUrl : firestoreData.ceoPhotoUrl) as string,
        };
        setSettings(data);
        localStorage.setItem('site_settings_cache', JSON.stringify(data));
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
