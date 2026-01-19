'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
// import { useAuth } from '../../context/AuthContext'; // Unused
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import LocationPicker from '../../components/items/LocationPicker';
import { Upload, X } from 'lucide-react';

export default function PostItemPage() {
  const router = useRouter();
  // const { user } = useAuth(); // Unused
  const [loading, setLoading] = useState(false);
  // const [step, setStep] = useState(1); // Unused

  const [formData, setFormData] = useState({
    type: 'lost',
    title: '',
    category: 'Electronics',
    description: '',
    date: new Date().toISOString().split('T')[0],
    lat: 19.0760,
    lng: 72.8777,
    address: '',
    contact_info: '',
    images: [] as string[]
  });

  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    // Redirect if not logged in
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
       router.push('/auth/login');
    } else {
       setIsCheckingAuth(false);
    }
  }, [router]);

  // ... (handlers)

  if (isCheckingAuth) {
    return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>;
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    setUploading(true);
    const file = e.target.files[0];
    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      const { data } = await api.post('/upload', uploadData);
      setFormData(prev => ({ ...prev, images: [...prev.images, data.url] }));
      toast.success('Image uploaded');
    } catch (error) { // eslint-disable-line @typescript-eslint/no-unused-vars
      toast.error('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/items', {
        ...formData,
        location: {
           lat: formData.lat,
           lng: formData.lng,
           address: formData.address || 'Selected Location'
        }
      });
      toast.success('Item posted successfully!');
      router.push('/');
    } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
      toast.error(error.response?.data?.message || 'Failed to post item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Report a {formData.type === 'lost' ? 'Lost' : 'Found'} Item</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Type Switcher */}
            <div className="flex gap-4">
              <Button 
                type="button" 
                variant={formData.type === 'lost' ? 'danger' : 'outline'}
                className="w-full"
                onClick={() => setFormData({...formData, type: 'lost'})}
              >
                I Lost Something
              </Button>
              <Button 
                type="button"
                variant={formData.type === 'found' ? 'primary' : 'outline'}
                className="w-full"
                onClick={() => setFormData({...formData, type: 'found'})}
              >
                I Found Something
              </Button>
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input 
                label="What is it?" 
                placeholder="e.g. Blue Wallet" 
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                required
              />
              <div className="space-y-1">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700"
                  value={formData.category}
                  onChange={e => setFormData({...formData, category: e.target.value})}
                >
                  <option>Electronics</option>
                  <option>Accessories</option>
                  <option>Documents</option>
                  <option>Clothing</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
               <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
               <textarea 
                  className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the item (color, brand, distinguishing marks)..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
               />
            </div>

            <Input 
                label="Date" 
                type="date"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                required
            />

            {/* Location */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
              <LocationPicker 
                onLocationSelect={(lat, lng) => setFormData({...formData, lat, lng})} 
              />
              <Input 
                placeholder="Location description (e.g. Near Cafeteria)"
                value={formData.address}
                onChange={e => setFormData({...formData, address: e.target.value})}
              />
            </div>


             {/* Image Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Images</label>
              <div className="flex items-center gap-4">
                 <div className="relative">
                   <input 
                      type="file" 
                      ref={fileInputRef}
                      className="hidden" 
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploading}
                   />
                   <Button 
                     type="button" 
                     variant="outline" 
                     className="cursor-pointer"
                     onClick={() => fileInputRef.current?.click()}
                     disabled={uploading}
                   >
                     <span><Upload className="mr-2 h-4 w-4" /> Upload Image</span>
                   </Button>
                 </div>
                 {uploading && <span className="text-sm text-gray-500">Uploading...</span>}
              </div>
              
              {formData.images.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="relative h-20 w-20 rounded overflow-hidden border border-gray-200">
                      <img src={img} alt="Preview" className="h-full w-full object-cover" />
                      <button 
                        type="button"
                        className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl"
                        onClick={() => setFormData(prev => ({...prev, images: prev.images.filter((_, i) => i !== idx)}))}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Submitting...' : 'Post Report'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
