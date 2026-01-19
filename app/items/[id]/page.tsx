'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';
import ItemCard from '../../../components/items/ItemCard';
import { MapPin, Calendar, Tag, ArrowLeft, MessageSquare, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { user } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [item, setItem] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Unwrap params using React.use()
  const { id } = use(params);

  useEffect(() => {
    const fetchItemAndMatches = async () => {
      try {
        const { data: itemData } = await api.get(`/items/${id}`);
        setItem(itemData);

        // Fetch matches
        const { data: matchesData } = await api.get(`/items/${id}/matches`);
        setMatches(matchesData);
      } catch (error) {
        console.error('Error fetching item:', error);
        toast.error('Could not load item details');
      } finally {
        setLoading(false);
      }
    };

    fetchItemAndMatches();
  }, [id]);

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="aspect-video w-full bg-gray-100 rounded-xl overflow-hidden relative">
            {item.images.length > 0 ? (
               // eslint-disable-next-line @next/next/no-img-element
              <img src={item.images[0]} alt={item.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-400">No Image</div>
            )}
             <span className={`absolute top-4 left-4 px-3 py-1 text-sm font-bold uppercase tracking-wider rounded text-white ${item.type === 'lost' ? 'bg-red-500' : 'bg-green-500'}`}>
                {item.type}
            </span>
          </div>

          <div>
            <h1 className="text-3xl font-bold">{item.title}</h1>
            <div className="flex flex-wrap gap-4 mt-2 text-gray-500">
               <div className="flex items-center gap-1">
                 <MapPin className="w-5 h-5" />
                 <span>{item.location?.address}</span>
               </div>
               <div className="flex items-center gap-1">
                 <Calendar className="w-5 h-5" />
                 <span>{new Date(item.date).toLocaleDateString()}</span>
               </div>
               <div className="flex items-center gap-1">
                 <Tag className="w-5 h-5" />
                 <span>{item.category}</span>
               </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">{item.description || "No description provided."}</p>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar / Actions */}
        <div className="space-y-6">
           <Card>
             <CardHeader>
               <CardTitle>Actions</CardTitle>
             </CardHeader>
              <CardContent className="space-y-3">
               {(() => {
                   if (!user) {
                       return (
                           <Link href="/auth/login">
                               <Button className="w-full">Login to Interact</Button>
                           </Link>
                       );
                   }

                   // Safe ID extraction with optional chaining
                   const itemUserId = typeof item.user === 'object' ? item.user?._id : item.user;
                   
                   // DEBUG: Check why this fails
                   console.log('User ID:', user._id);
                   console.log('Item User ID:', itemUserId);
                   console.log('Item User Raw:', item.user);
                   console.log('Is Owner?', itemUserId && user._id && itemUserId.toString() === user._id.toString());
                   
                   // Safe string comparison
                   const isOwner = itemUserId && user._id && itemUserId.toString() === user._id.toString();

                   if (isOwner) {
                       return <div className="text-center text-sm text-gray-500">This is your item</div>;
                   }

                   return (
                     <>
                       <Button className="w-full" onClick={() => router.push(`/chat?itemId=${item._id}`)}>
                          <MessageSquare className="mr-2 h-4 w-4" /> Message Owner
                       </Button>
                       <Button variant="outline" className="w-full" onClick={handleClaim}>
                          <CheckCircle className="mr-2 h-4 w-4" /> Claim Item
                       </Button>
                     </>
                   );
               })()}
             </CardContent>
           </Card>

           {/* Matches */}
           {matches.length > 0 && (
             <div className="space-y-4">
               <h3 className="text-xl font-bold">Potential Matches</h3>
               <div className="space-y-4">
                 {matches.map(match => (
                   <ItemCard key={match._id} item={match} />
                 ))}
               </div>
             </div>
           )}
        </div>
      </div>
    </div>
  );
}
