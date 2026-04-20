import React, { useState, useCallback } from 'react';
import { Upload, X, Loader2, Image as ImageIcon, Check, Scissors, Trash2 } from 'lucide-react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage, auth } from '../../firebase';
import Cropper from 'react-easy-crop';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  folder?: string;
  label?: string;
  aspect?: number;
}

export default function ImageUpload({ value, onChange, folder = 'general', label = 'Image', aspect = 1 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const transformUrl = (url: string) => {
    if (!url) return url;
    // Imgur Page to Direct Image transformation
    const imgurMatch = url.match(/https?:\/\/(?:www\.)?imgur\.com\/([a-zA-Z0-9]+)$/);
    if (imgurMatch) {
      return `https://i.imgur.com/${imgurMatch[1]}.jpg`;
    }
    return url;
  };

  const [urlInput, setUrlInput] = useState(value && value.startsWith('http') ? value : '');

  // Sync local input with value prop if it changes outside (e.g. on save or reset)
  React.useEffect(() => {
    const transformed = transformUrl(value);
    // Only update if the user isn't actively typing in the field to prevent cursor jumping
    if (document.activeElement?.tagName !== 'INPUT' || (document.activeElement as HTMLInputElement).type !== 'url') {
      if (transformed && transformed.startsWith('http')) {
        setUrlInput(transformed);
      } else if (!value) {
        setUrlInput('');
      }
    }
  }, [value]);

  const [currentAspect, setCurrentAspect] = useState<number | undefined>(aspect);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onCropComplete = useCallback((_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const createImage = (url: string): Promise<HTMLImageElement> =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener('load', () => {
        // If aspect is not set, we can detect it here if we wanted
        resolve(image);
      });
      image.addEventListener('error', (error) => reject(error));
      image.setAttribute('crossOrigin', 'anonymous');
      image.src = url;
    });

  const getCroppedImg = async (imageSrc: string, pixelCrop: any): Promise<Blob | null> => {
    const image = await createImage(imageSrc);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) return null;

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob((blob) => {
        resolve(blob);
      }, 'image/jpeg');
    });
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.addEventListener('load', () => {
      const imgUrl = reader.result as string;
      setImageToCrop(imgUrl);
      setSelectedFile(file);
      // Reset aspect to the passed prop by default
      setCurrentAspect(aspect);
    });
    reader.readAsDataURL(file);
  };

  const handleUpload = async (useOriginal: boolean = false) => {
    if (!imageToCrop || (!croppedAreaPixels && !useOriginal)) return;

    const userId = auth.currentUser?.uid;
    if (!userId) {
      alert('You must be logged in to upload images.');
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      let uploadBlob: Blob | File | null = null;
      
      if (useOriginal && selectedFile) {
        uploadBlob = selectedFile;
      } else if (croppedAreaPixels) {
        uploadBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
      }

      if (!uploadBlob) throw new Error('Failed to prepare image for upload');

      const fileName = `${useOriginal ? 'original' : 'cropped'}_${Date.now()}.jpg`;
      const uploadPath = `uploads/${userId}/images/${folder}/${fileName}`;
      
      const storageRef = ref(storage, uploadPath);
      const uploadTask = uploadBytesResumable(storageRef, uploadBlob);

      uploadTask.on('state_changed', 
        (snapshot) => {
          const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setProgress(p);
        }, 
        (error) => {
          alert(`Upload failed: ${error.message}`);
          setUploading(false);
        }, 
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          onChange(url);
          setUploading(false);
          setImageToCrop(null);
        }
      );
    } catch (error: any) {
      alert(`Failed to upload: ${error.message}`);
      setUploading(false);
    }
  };

  const handleRemove = () => {
    onChange('');
  };

  return (
    <div className="space-y-3">
      {label && <label className="block text-sm font-bold text-stone-700">{label}</label>}
      
      <div className="relative group">
        {value ? (
          <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-stone-200 bg-stone-100 shadow-inner">
            <img 
              src={value} 
              alt="Preview" 
              className="w-full h-full object-contain" 
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleRemove}
                className="p-2 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 transition-transform hover:scale-110"
                title="Remove Image"
              >
                <X size={20} />
              </button>
            </div>
          </div>
        ) : (
          <div className="aspect-video rounded-xl border-2 border-dashed border-stone-300 bg-stone-50 flex flex-col items-center justify-center text-stone-400 group-hover:border-lime-500 group-hover:bg-lime-50 transition-all">
            <ImageIcon size={40} className="mb-3 opacity-20 group-hover:text-lime-600 group-hover:opacity-100 transition-all" />
            <span className="text-sm font-medium">No image selected</span>
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center rounded-xl z-10 font-bold text-lime-700">
            <div className="flex flex-col items-center gap-3 bg-white p-4 rounded-2xl shadow-xl">
              <Loader2 className="animate-spin text-lime-600" size={32} />
              <span className="text-sm">Uploading {Math.round(progress)}%</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-3">
        <label className="w-full sm:w-auto cursor-pointer">
          <div className="flex items-center justify-center gap-2 px-4 py-2 bg-stone-900 text-white rounded-lg text-sm font-bold hover:bg-stone-800 transition-all active:scale-95 shadow-sm whitespace-nowrap">
            <Upload size={18} />
            {value ? 'Change File' : 'Upload & Crop'}
          </div>
          <input 
            type="file" 
            className="hidden" 
            accept="image/*" 
            onChange={handleFileSelect} 
            disabled={uploading}
          />
        </label>

        <div className="flex items-center gap-2 flex-1 w-full">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">OR URL</span>
          <div className="flex-1 relative">
            <input
              type="url"
              value={urlInput}
              onChange={(e) => {
                const transformed = transformUrl(e.target.value);
                setUrlInput(e.target.value); // Keep original text in input while typing
                onChange(transformed); // Send transformed URL to parent
              }}
              placeholder="Paste image link..."
              className="w-full px-3 py-2 pr-8 border border-stone-300 rounded-lg text-sm focus:ring-2 focus:ring-lime-500 focus:border-stone-400 outline-none transition-all"
            />
            {value && value.startsWith('http') && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 text-lime-600">
                <Check size={14} />
              </div>
            )}
          </div>
        </div>
        
        {value && (
          <button
            type="button"
            onClick={handleRemove}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
            title="Delete Current Image"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {imageToCrop && (
        <div className="fixed inset-0 bg-stone-900/95 z-[100] flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-3xl h-[65vh] bg-black rounded-t-2xl overflow-hidden shadow-2xl">
            <Cropper
              image={imageToCrop}
              crop={crop}
              zoom={zoom}
              aspect={currentAspect}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          </div>
          <div className="w-full max-w-3xl bg-white p-6 rounded-b-2xl flex flex-col gap-5 border-t border-stone-100">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-stone-800">Zoom Level</span>
                <span className="text-xs font-mono text-stone-500">{zoom.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full h-2 bg-stone-200 rounded-lg appearance-none cursor-pointer accent-lime-600"
              />
            </div>
            
            <div className="flex items-center justify-between border-t border-stone-100 pt-5">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setCurrentAspect(aspect)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${currentAspect === aspect ? 'bg-lime-600 text-white shadow-md' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                >
                  Standard Ratio
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentAspect(undefined)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${currentAspect === undefined ? 'bg-lime-600 text-white shadow-md' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'}`}
                >
                  Free Crop
                </button>
              </div>
              
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    handleUpload(true);
                  }}
                  disabled={uploading}
                  className="px-4 py-2.5 bg-stone-100 text-stone-700 rounded-xl font-bold hover:bg-stone-200 transition-all border border-stone-200"
                >
                  Skip & Use Original
                </button>
                <button 
                  onClick={() => setImageToCrop(null)}
                  className="px-4 py-2.5 text-stone-600 hover:bg-stone-100 rounded-xl font-bold transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => handleUpload(false)}
                  disabled={uploading}
                  className="px-8 py-2.5 bg-lime-600 text-white rounded-xl font-bold hover:bg-lime-700 transition-all shadow-lg hover:shadow-lime-200 flex items-center gap-2"
                >
                  {uploading ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                  {uploading ? 'Finalizing...' : 'Save & Close'}
                </button>
              </div>
            </div>
          </div>
          <p className="text-stone-400 text-xs mt-4 italic">Tip: Use "Free Crop" for landscape products or non-standard dimensions.</p>
        </div>
      )}
    </div>
  );
}

