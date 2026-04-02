import React, { useState } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage, auth } from '../../firebase';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
}

export default function ImageUpload({ value, onChange, folder = 'general', label = 'Image' }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const userId = auth.currentUser?.uid;
    if (!userId) {
      alert('You must be logged in to upload images.');
      return;
    }

    // Using the path structure: uploads/{userId}/images/{folder}/{filename}
    // to match the user's specific security rules requirement
    const uploadPath = `uploads/${userId}/images/${folder}/${Date.now()}_${file.name}`;
    console.log(`Starting upload for ${file.name} to ${uploadPath}...`);
    
    setUploading(true);
    setProgress(0);

    try {
      const storageRef = ref(storage, uploadPath);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed', 
        (snapshot) => {
          const p = snapshot.totalBytes > 0 
            ? (snapshot.bytesTransferred / snapshot.totalBytes) * 100 
            : 0;
          setProgress(p);
          console.log(`Upload progress for ${file.name}: ${Math.round(p)}%`);
        }, 
        (error) => {
          console.error('Upload error details:', error);
          setUploading(false);
          
          let userMessage = `Upload failed: ${error.message}`;
          if (error.code === 'storage/unauthorized') {
            userMessage = 'Upload failed: Permission denied. Please ensure Firebase Storage is enabled in your console and rules allow uploads to "uploads/{userId}/...".';
          } else if (error.code === 'storage/canceled') {
            userMessage = 'Upload was canceled.';
          } else if (error.code === 'storage/unknown') {
            userMessage = 'An unknown error occurred during upload. Check your internet connection.';
          }
          
          alert(userMessage);
        }, 
        async () => {
          try {
            console.log('Upload task finished, getting download URL...');
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            console.log('Upload complete. File available at:', url);
            onChange(url);
            setUploading(false);
          } catch (urlErr: any) {
            console.error('Error getting download URL:', urlErr);
            alert(`Upload succeeded but failed to get URL: ${urlErr.message}`);
            setUploading(false);
          }
        }
      );
    } catch (error: any) {
      console.error('Outer upload error:', error);
      alert(`Failed to initiate upload: ${error.message}`);
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <div className="space-y-2">
      {label && <label className="block text-sm font-medium text-stone-700">{label}</label>}
      
      <div className="relative group">
        {value ? (
          <div className="relative aspect-video rounded-lg overflow-hidden border border-stone-200 bg-stone-100">
            <img 
              src={value} 
              alt="Preview" 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer"
            />
            <button
              type="button"
              onClick={handleRemove}
              className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-colors opacity-0 group-hover:opacity-100"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="aspect-video rounded-lg border-2 border-dashed border-stone-200 bg-stone-50 flex flex-col items-center justify-center text-stone-400">
            <ImageIcon size={32} className="mb-2 opacity-20" />
            <span className="text-xs">No image selected</span>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center rounded-lg z-10">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="animate-spin text-lime-600" size={24} />
              <span className="text-xs font-medium text-stone-600">Uploading... {Math.round(progress)}%</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <label className="flex-1 cursor-pointer">
          <div className="flex items-center justify-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors">
            <Upload size={16} />
            {value ? 'Change Image' : 'Upload Image'}
          </div>
          <input 
            type="file" 
            className="hidden" 
            accept="image/*" 
            onChange={handleUpload} 
            disabled={uploading}
          />
        </label>
        
        {value && (
          <button
            type="button"
            onClick={handleRemove}
            className="px-4 py-2 bg-stone-100 text-stone-700 rounded-lg text-sm font-medium hover:bg-stone-200 transition-colors flex items-center gap-2"
          >
            <X size={16} />
            Remove
          </button>
        )}
      </div>
    </div>
  );
}
