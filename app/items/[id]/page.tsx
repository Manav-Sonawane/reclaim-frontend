'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';

import { MapPin, Calendar, ArrowLeft, MessageSquare, CheckCircle, User } from 'lucide-react';
import { CategoryBadge } from '../../../components/ui/CategoryBadge';
import { LocationBadge } from '../../../components/ui/LocationBadge';
import CommentSection from '../../../components/comments/CommentSection';
import toast from 'react-hot-toast';
import ItemActions from '../../../components/items/ItemActions';

export default function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { user } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [item, setItem] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [myClaim, setMyClaim] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [cityName, setCityName] = useState<string | null>(null);

  // Unwrap params using React.use()
  const { id } = use(params);

  useEffect(() => {
    const fetchItemAndMatches = async () => {
      try {
        const { data: itemData } = await api.get(`/items/${id}`);
        setItem(itemData);

        if (user) {
            const { data: myClaims } = await api.get('/claims/user/me');
            const foundClaim = myClaims.find((c: any) => c.item?._id === id || c.item === id);
            setMyClaim(foundClaim);
        }

      } catch (error) {
        console.error('Error fetching item:', error);
        toast.error('Could not load item details');
      } finally {
        setLoading(false);
      }
    };

    fetchItemAndMatches();
  }, [id, user]);


  // Location Reverse Geocoding
  useEffect(() => {
    if (item) {
      // Attempt to reverse geocode if coordinates exist
      if (item.location?.coordinates && item.location.coordinates.length === 2) {
          const [lng, lat] = item.location.coordinates;
          // Simple client-side fetch to Nominatim (OpenStreetMap)
          // Note: In production, this should be proxied or cached
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
            .then(res => res.json())
            .then(data => {
                const city = data.address?.city || data.address?.town || data.address?.village || data.address?.municipality;
                if (city) setCityName(city);
            })
            .catch(err => console.error("Failed to reverse geocode:", err));
      }
    }
  }, [item]);

  const handleClaim = () => {
    router.push(`/items/${id}/claim`);
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!item) return <div className="p-8 text-center">Item not found</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>

      {/* Header Section: Title, User, Badges */}
      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN (Span 2) - Header Info & Image */}
        <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Header Info Block */}
            <div className="bg-white dark:bg-black p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col gap-4">
                 
                 {/* Row 1: Location & Category */}
                 <div className="flex flex-wrap items-center gap-2">
                    {/* Title */}
                    <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mr-2">{item.title}</h1>
                    
                    {cityName ? (
                        <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-md text-xs font-medium">
                             <MapPin className="w-3 h-3" />
                             {cityName}
                        </span>
                    ) : (
                         <span className="bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-md text-xs font-medium">{item.location?.address}</span>
                    )}

                    <CategoryBadge category={item.category} className="text-xs px-2 py-1" />
                 </div>

                 {/* Row 2: Avatar, User, and Lost/Found (Right Aligned) */}
                 <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        {/* Avatar */}
                         <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden ring-1 ring-gray-100 dark:ring-gray-800">
                            {item.user?.profilePicture ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={item.user.profilePicture} alt={item.user.name} className="h-full w-full object-cover" />
                            ) : (
                                 <div className="h-full w-full flex items-center justify-center bg-indigo-500 text-white font-bold text-xs">
                                    {item.user?.name?.[0]?.toUpperCase() || "U"}
                                 </div>
                            )}
                        </div>
                        {/* Username */}
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                             {typeof item.user === 'object' ? item.user?.name : 'unknown'}
                        </span>
                     </div>

                     {/* Lost/Found Badge */}
                     <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider text-white ${item.type === 'lost' ? 'bg-red-500' : 'bg-green-500'}`}>
                        {item.type}
                    </span>
                 </div>
            </div>

            {/* Image Block */}
            <div className="bg-black/5 dark:bg-white/5 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 flex items-center justify-center min-h-[400px]">
                 {item.images.length > 0 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.images[0]} alt={item.title} className="w-full h-full object-contain max-h-[600px]" />
                ) : (
                    <div className="text-gray-400 italic">No image provided</div>
                )}
            </div>

        </div>

        {/* RIGHT COLUMN (Span 1) - Actions & Description */}
        <div className="lg:col-span-1 flex flex-col gap-6">
            
            {/* Actions Block */}
            <div className="bg-white dark:bg-black p-4 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm">
                <ItemActions 
                    item={item} 
                    user={user} 
                    myClaim={myClaim} 
                    onClaimClick={handleClaim} 
                />
            </div>

            {/* Description Block */}
             <Card className="h-full border border-gray-100 dark:border-gray-800 shadow-sm bg-white dark:bg-black">
                <CardHeader>
                    <CardTitle>Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Item Title</h3>
                        <p className="font-semibold text-lg">{item.title}</p>
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Description</h3>
                        <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            {item.description || "No description provided."}
                        </p>
                    </div>
                    {/* Location Description */}
                    <div>
                         <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Location Details</h3>
                         <p className="text-sm text-gray-700 dark:text-gray-300">
                            {item.location?.address}
                         </p>
                    </div>

                     {/* Date */}
                     <div>
                         <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Reported On</h3>
                         <p className="text-sm text-gray-700 dark:text-gray-300">
                            {new Date(item.date).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                         </p>
                    </div>
                </CardContent>
             </Card>

        </div>

        {/* BOTTOM ROW (Span 3) - Comments */}
        <div className="lg:col-span-3 bg-white dark:bg-black rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Comments
            </h2>
            <CommentSection itemId={id} />
        </div>

      </div>
    </div>
  );
}
