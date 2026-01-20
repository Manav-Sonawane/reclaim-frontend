'use client';

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '../../../lib/api';
import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/Card';

import { MapPin, Calendar, ArrowLeft, MessageSquare, CheckCircle, User, ArrowBigUp, ArrowBigDown } from 'lucide-react';
import { CategoryBadge } from '../../../components/ui/CategoryBadge';
import { LocationBadge } from '../../../components/ui/LocationBadge';
import CommentSection from '../../../components/comments/CommentSection';
import toast from 'react-hot-toast';

export default function ItemDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { user } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [item, setItem] = useState<any>(null);

  const [loading, setLoading] = useState(true);

  // Unwrap params using React.use()
  const { id } = use(params);

  useEffect(() => {
    const fetchItemAndMatches = async () => {
      try {
        const { data: itemData } = await api.get(`/items/${id}`);
        setItem(itemData);


      } catch (error) {
        console.error('Error fetching item:', error);
        toast.error('Could not load item details');
      } finally {
        setLoading(false);
      }
    };

    fetchItemAndMatches();
  }, [id]);

  // Voting Logic
  const [upvotes, setUpvotes] = useState<string[]>([]);
  const [downvotes, setDownvotes] = useState<string[]>([]);
  const [isVoteLoading, setIsVoteLoading] = useState(false);

  useEffect(() => {
    if (item) {
      setUpvotes(item.upvotes || []);
      setDownvotes(item.downvotes || []);
    }
  }, [item]);

  const isUpvoted = user && upvotes.includes(user._id);
  const isDownvoted = user && downvotes.includes(user._id);
  const score = upvotes.length - downvotes.length;

  const handleVote = async (type: 'up' | 'down') => {
    if (!user) return toast.error('Please login to vote');
    if (isVoteLoading) return;

    // Optimistic Update
    const oldUpvotes = [...upvotes];
    const oldDownvotes = [...downvotes];
    const userId = user._id;

    if (type === 'up') {
      if (isUpvoted) {
        setUpvotes(prev => prev.filter(id => id !== userId));
      } else {
        setUpvotes(prev => [...prev, userId]);
        if (isDownvoted) setDownvotes(prev => prev.filter(id => id !== userId));
      }
    } else {
      if (isDownvoted) {
        setDownvotes(prev => prev.filter(id => id !== userId));
      } else {
        setDownvotes(prev => [...prev, userId]);
        if (isUpvoted) setUpvotes(prev => prev.filter(id => id !== userId));
      }
    }

    setIsVoteLoading(true);
    try {
      const { data } = await api.post(`/items/${id}/vote`, { voteType: type });
      // Sync with server
      setUpvotes(data.upvotes);
      setDownvotes(data.downvotes);
    } catch (error) {
      console.error('Vote failed:', error);
      toast.error('Vote failed');
      // Revert
      setUpvotes(oldUpvotes);
      setDownvotes(oldDownvotes);
    } finally {
      setIsVoteLoading(false);
    }
  };

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
        <div className="lg:col-span-2 space-y-4">
          {/* Instagram-style Header */}
          <div className="mb-4">
            <h1 className="text-3xl font-bold">{item.title}</h1>
            <div className="flex flex-wrap gap-4 mt-2 text-gray-500">
              <LocationBadge location={item.location?.address} className="text-sm px-3 py-1.5 max-w-none" />
              <CategoryBadge category={item.category} className="text-sm px-3 py-1.5" />
            </div>
          </div>

          <div className="aspect-video w-full bg-gray-100 rounded-xl overflow-hidden relative border border-gray-100 dark:border-gray-800">
            {item.images.length > 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.images[0]} alt={item.title} className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-gray-400">No Image</div>
            )}
            <span className={`absolute top-4 right-4 px-3 py-1 text-sm font-bold uppercase tracking-wider rounded text-white ${item.type === 'lost' ? 'bg-red-500' : 'bg-green-500'}`}>
              {item.type}
            </span>
          </div>


        </div>

        {/* Sidebar / Actions */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 py-2 mb-4">
            <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {typeof item.user === 'object' ? item.user?.name : 'Unknown User'}
              </p>
              <p className="text-xs text-gray-500">
                Posted on {new Date(item.date).toLocaleDateString()}
              </p>
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

          {/* Voting Controls */}
          <Card>
            <CardContent className="p-4 flex justify-between items-center">
                <span className="font-semibold text-gray-700 dark:text-gray-300">Is this helpful?</span>
                <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full px-3 py-1">
                  <button
                    onClick={() => handleVote('up')}
                    className={`p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${isUpvoted ? 'text-orange-600 dark:text-orange-500' : 'text-gray-500 dark:text-gray-400'
                      }`}
                  >
                    <ArrowBigUp className={`w-8 h-8 ${isUpvoted ? 'fill-current' : ''}`} />
                  </button>

                  <span className={`text-lg font-bold min-w-[3ch] text-center ${score > 0 ? 'text-orange-600 dark:text-orange-500' : score < 0 ? 'text-blue-600 dark:text-blue-500' : 'text-gray-500'
                    }`}>
                    {score}
                  </span>

                  <button
                    onClick={() => handleVote('down')}
                    className={`p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${isDownvoted ? 'text-blue-600 dark:text-blue-500' : 'text-gray-500 dark:text-gray-400'
                      }`}
                  >
                    <ArrowBigDown className={`w-8 h-8 ${isDownvoted ? 'fill-current' : ''}`} />
                  </button>
                </div>
            </CardContent>
          </Card>


        </div>
      </div>

      <CommentSection itemId={id} />
    </div>
  );
}
