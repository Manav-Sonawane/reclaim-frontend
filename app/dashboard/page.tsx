'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Trash, MessageCircle, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { Modal } from '../../components/ui/Modal';

export default function DashboardPage() {
  const { user } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [myItems, setMyItems] = useState<any[]>([]);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; itemId: string | null }>({
    isOpen: false,
    itemId: null
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyItems = async () => {
      try {
        const { data } = await api.get('/items/user/me');
        setMyItems(data);
      } catch (error) {
        console.error('Failed to fetch items', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchMyItems();
  }, [user]);

  const handleDeleteClick = (id: string) => {
    setDeleteModal({ isOpen: true, itemId: id });
  };

  const confirmDelete = async () => {
    if (!deleteModal.itemId) return;
    
    try {
      await api.delete(`/items/${deleteModal.itemId}`);
      setMyItems(prev => prev.filter(item => item._id !== deleteModal.itemId));
      toast.success('Item deleted');
    } catch (error) {
        console.error(error);
      toast.error('Failed to delete item');
    } finally {
        setDeleteModal({ isOpen: false, itemId: null });
    }
  };

  if (!user) {
      return <div className="p-8 text-center">Please login to view your dashboard.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Dashboard</h1>
        <Link href="/post">
            <Button>
                <span className="mr-2">+</span> Post New Item
            </Button>
        </Link>
      </div>

      <div className="grid gap-6">
        <h2 className="text-xl font-semibold border-b border-gray-200 dark:border-gray-800 pb-2">My Reports</h2>
        
        {loading ? (
             <div>Loading...</div>
        ) : myItems.length === 0 ? (
            <p className="text-gray-500">You haven&apos;t reported any items yet.</p>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myItems.map((item) => (
                <Card key={item._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {item.images && item.images.length > 0 && (
                    <div className="h-48 overflow-hidden bg-gray-100">
                    <img 
                        src={item.images[0]} 
                        alt={item.title} 
                        className="w-full h-full object-cover"
                    />
                    </div>
                )}
                <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-bold truncate">{item.title}</CardTitle>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase ${
                        item.type === 'lost' 
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' 
                        : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                    }`}>
                        {item.type}
                    </span>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{item.location?.address || 'Location not specified'}</span>
                    </div>
                    <p className="line-clamp-2 min-h-[40px]">{item.description}</p>
                    
                    <div className="pt-4 flex gap-2">
                         <Link href={`/chat?itemId=${item._id}`} className="flex-1">
                            <Button variant="outline" className="w-full">
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Chats
                            </Button>
                        </Link>
                        <Button 
                            variant="danger" 
                            size="sm" 
                            onClick={() => handleDeleteClick(item._id)}
                        >
                            <Trash className="w-4 h-4" />
                        </Button>
                    </div>
                    </div>
                </CardContent>
                </Card>
            ))}
            </div>
        )}
      </div>

      <Modal 
        isOpen={deleteModal.isOpen} 
        onClose={() => setDeleteModal({ isOpen: false, itemId: null })} 
        title="Confirm Deletion"
      >
        <div className="space-y-4">
            <p>Are you sure you want to delete this item? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setDeleteModal({ isOpen: false, itemId: null })}>
                    Cancel
                </Button>
                <Button variant="danger" onClick={confirmDelete}>
                    Delete
                </Button>
            </div>
        </div>
      </Modal>
    </div>
  );
}
