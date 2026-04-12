import React, { useState, useEffect, useRef } from 'react';
import { Save, Loader2, AlertCircle } from 'lucide-react';
import { doc, setDoc, getDocFromServer } from 'firebase/firestore';
import { db } from '../../firebase';
import ImageUpload from '../../components/admin/ImageUpload';
import { useSiteSettings, SiteSettings } from '../../hooks/useSiteSettings';
import { siteId } from '../../constants/siteConfig';

export default function AdminSettings() {
  const { settings: initialSettings, loading: initialLoading } = useSiteSettings();
  const [settings, setSettings] = useState<SiteSettings>(initialSettings);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Track if the user has made any local changes
  const isDirtyRef = useRef(false);

  // Sync with initialSettings only when loading finishes for the first time
  // or if the user hasn't made any local changes yet.
  useEffect(() => {
    if (!initialLoading && !isDirtyRef.current) {
      console.log('Syncing settings from Firestore:', initialSettings);
      setSettings(initialSettings);
    }
  }, [initialLoading, initialSettings]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    console.log('Starting save operation...');
    
    // Create a controller to abort if needed (though setDoc doesn't support it directly)
    // We'll use the timeout to reject the promise and update UI
    let isTimedOut = false;
    const timeoutId = setTimeout(() => {
      isTimedOut = true;
      console.error('Save operation timed out after 15s');
    }, 15000);

    try {
      console.log('Current settings state to be saved:', settings);
      
      // Test connection first with a shorter timeout
      try {
        await getDocFromServer(doc(db, 'sites', siteId, 'settings', 'site'));
        console.log('Connection test successful');
      } catch (connErr: any) {
        console.warn('Connection test failed or slow:', connErr);
        if (connErr.message?.includes('offline')) {
          throw new Error('You appear to be offline. Please check your internet connection.');
        }
      }

      if (isTimedOut) throw new Error('Save operation timed out. Please check your connection.');

      await setDoc(doc(db, 'sites', siteId, 'settings', 'site'), settings);
      console.log('Firestore setDoc successful');

      clearTimeout(timeoutId);

      // Update cache immediately for responsiveness
      localStorage.setItem(`site_settings_cache_${siteId}`, JSON.stringify(settings));
      isDirtyRef.current = false;
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Error saving settings:', err);
      setError(err.message || 'Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
      clearTimeout(timeoutId);
    }
  };

  const updateSettings = (updates: Partial<SiteSettings>) => {
    console.log('Updating settings with:', updates);
    isDirtyRef.current = true;
    setSettings(prev => {
      const next = { ...prev, ...updates };
      console.log('Next settings state:', next);
      return next;
    });
  };

  return (
    <div className="max-w-4xl space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-stone-800">Site Settings</h2>
          <p className="text-stone-500">Manage your website's visual identity and assets.</p>
        </div>
        <div className="flex items-center gap-4">
          {error && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 px-4 py-2 rounded-lg text-sm font-medium">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-lime-600 hover:bg-lime-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 font-medium transition-colors shadow-sm disabled:bg-stone-400"
          >
            {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {success ? 'Saved!' : (saving ? 'Saving...' : 'Save Changes')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-4 md:col-span-2">
          <label className="block text-sm font-bold text-stone-700">Website Name</label>
          <input 
            type="text" 
            value={settings.siteName} 
            onChange={e => updateSettings({ siteName: e.target.value })} 
            className="w-full px-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-lime-500 focus:outline-none text-lg font-medium" 
            placeholder="Enter Website Name (e.g. Alayo Health & Wellness)"
          />
        </div>

        <div className="space-y-4">
          <ImageUpload
            label="Website Logo"
            value={settings.logoUrl}
            onChange={(url) => updateSettings({ logoUrl: url })}
            folder="site"
          />
          <input 
            type="text" 
            value={settings.logoUrl} 
            onChange={e => updateSettings({ logoUrl: e.target.value })} 
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none text-sm" 
            placeholder="Or enter Logo URL..."
          />
        </div>

        <div className="space-y-4">
          <ImageUpload
            label="Hero Background"
            value={settings.heroBgUrl}
            onChange={(url) => updateSettings({ heroBgUrl: url })}
            folder="site"
          />
          <input 
            type="text" 
            value={settings.heroBgUrl} 
            onChange={e => updateSettings({ heroBgUrl: e.target.value })} 
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none text-sm" 
            placeholder="Or enter Hero BG URL..."
          />
        </div>

        <div className="space-y-4">
          <ImageUpload
            label="About Page Background"
            value={settings.aboutBgUrl}
            onChange={(url) => updateSettings({ aboutBgUrl: url })}
            folder="site"
          />
          <input 
            type="text" 
            value={settings.aboutBgUrl} 
            onChange={e => updateSettings({ aboutBgUrl: e.target.value })} 
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none text-sm" 
            placeholder="Or enter About BG URL..."
          />
        </div>

        <div className="space-y-4">
          <ImageUpload
            label="Services Page Background"
            value={settings.servicesBgUrl}
            onChange={(url) => updateSettings({ servicesBgUrl: url })}
            folder="site"
          />
          <input 
            type="text" 
            value={settings.servicesBgUrl} 
            onChange={e => updateSettings({ servicesBgUrl: e.target.value })} 
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none text-sm" 
            placeholder="Or enter Services BG URL..."
          />
        </div>

        <div className="space-y-4">
          <ImageUpload
            label="Editorial Page Background"
            value={settings.blogBgUrl}
            onChange={(url) => updateSettings({ blogBgUrl: url })}
            folder="site"
          />
          <input 
            type="text" 
            value={settings.blogBgUrl} 
            onChange={e => updateSettings({ blogBgUrl: e.target.value })} 
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none text-sm" 
            placeholder="Or enter Editorial BG URL..."
          />
        </div>

        <div className="space-y-4">
          <ImageUpload
            label="CEO & Chief Consultant Photo"
            value={settings.ceoPhotoUrl}
            onChange={(url) => updateSettings({ ceoPhotoUrl: url })}
            folder="profiles"
          />
          <input 
            type="text" 
            value={settings.ceoPhotoUrl} 
            onChange={e => updateSettings({ ceoPhotoUrl: e.target.value })} 
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-lime-500 focus:outline-none text-sm" 
            placeholder="Or enter CEO Photo URL..."
          />
        </div>
      </div>
    </div>
  );
}
