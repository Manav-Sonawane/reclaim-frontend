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
import { LocationBadge } from '../../components/ui/LocationBadge';
import { CategoryBadge } from '../../components/ui/CategoryBadge';
import ItemCard from '../../components/items/ItemCard';

export default function DashboardPage() {
  const { user } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [myItems, setMyItems] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [myClaims, setMyClaims] = useState<any[]>([]);
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; itemId: string | null }>({
    isOpen: false,
    itemId: null
  });
  const [editClaimModal, setEditClaimModal] = useState<{ isOpen: boolean; claimId: string | null; message: string }>({
    isOpen: false,
    claimId: null,
    message: ''
  });
  const [deleteClaimModal, setDeleteClaimModal] = useState<{ isOpen: boolean; claimId: string | null }>({
    isOpen: false,
    claimId: null
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyItems = async () => {
      try {
        const { data } = await api.get('/items/user/me');
        setMyItems(data);

        // Fetch My Claims
        const { data: claimsData } = await api.get('/claims/user/me');
        setMyClaims(claimsData);
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

  const handleEditClaimClick = (claim: any) => {
    setEditClaimModal({
        isOpen: true,
        claimId: claim._id,
        message: claim.message
    });
  };

  const handleUpdateClaim = async () => {
    if (!editClaimModal.claimId || !editClaimModal.message.trim()) return;

    try {
        await api.put(`/claims/${editClaimModal.claimId}/message`, {
            message: editClaimModal.message
        });
        
        // Update local state
        setMyClaims(prev => prev.map(claim => 
            claim._id === editClaimModal.claimId 
            ? { ...claim, message: editClaimModal.message }
            : claim
        ));
        
        toast.success('Claim updated successfully');
        setEditClaimModal({ isOpen: false, claimId: null, message: '' });
    } catch (error) {
        console.error(error);
        toast.error('Failed to update claim');
    }
  };

  const handleDeleteClaimClick = (claimId: string) => {
    setDeleteClaimModal({ isOpen: true, claimId });
  };

  const confirmDeleteClaim = async () => {
    if (!deleteClaimModal.claimId) return;

    try {
        await api.delete(`/claims/${deleteClaimModal.claimId}`);
        setMyClaims(prev => prev.filter(claim => claim._id !== deleteClaimModal.claimId));
        toast.success('Claim deleted successfully');
    } catch (error) {
        console.error(error);
        toast.error('Failed to delete claim');
    } finally {
        setDeleteClaimModal({ isOpen: false, claimId: null });
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
                <ItemCard key={item._id} item={item} hideHeader>
                    <div 
                        className="flex gap-2 w-full pt-2"
                            onClick={(e) => {
                                e.preventDefault(); 
                                e.stopPropagation();
                            }}
                        >
                             <Link href={`/chat?itemId=${item._id}`} className="flex-1">
                                <Button variant="outline" className="w-full">
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    Chats
                                </Button>
                            </Link>
                            <Button 
                                variant="danger" 
                                onClick={() => handleDeleteClick(item._id)}
                            >
                                <Trash className="w-4 h-4" />
                            </Button>
                    </div>
                </ItemCard>
            ))}
            </div>
        )}
      </div>

       {/* My Claims Section */}
      <div className="grid gap-6 mt-12">
        <h2 className="text-xl font-semibold border-b border-gray-200 dark:border-gray-800 pb-2">My Claims</h2>
         {loading ? (
             <div>Loading...</div>
        ) : myClaims.length === 0 ? (
            <p className="text-gray-500">You haven&apos;t claimed any items yet.</p>
        ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myClaims.map((claim) => (
                    <Card key={claim._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Claim for</p>
                                    <CardTitle className="text-lg font-bold truncate">{claim.item?.title || 'Unknown Item'}</CardTitle>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase border ${
                                    claim.status === 'approved' 
                                    ? 'bg-green-50 text-green-700 border-green-200' 
                                    : claim.status === 'rejected'
                                    ? 'bg-red-50 text-red-700 border-red-200'
                                    : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                }`}>
                                    {claim.status}
                                </span>
                            </div>
                        </CardHeader>
                        <CardContent>
                             <div className="space-y-4">
                                {claim.item?.images?.[0] && (
                                     <div className="h-32 w-full bg-gray-100 rounded-md overflow-hidden">
                                        <img src={claim.item.images[0]} alt="Item" className="w-full h-full object-cover opacity-80" />
                                     </div>
                                )}
                                
                                <div className="text-sm bg-gray-50 dark:bg-gray-900/50 p-3 rounded text-gray-600 dark:text-gray-300 italic">
                                    "{claim.message}"
                                </div>
                                
                                
                                <div className="flex gap-2">
                                    <Link href={`/items/${claim.item?._id}`} className="flex-1">
                                        <Button variant="outline" size="sm" className="w-full">
                                            View Item
                                        </Button>
                                    </Link>
                                    {claim.status === 'pending' && (
                                        <>
                                            <Button 
                                                variant="secondary" 
                                                size="sm"
                                                onClick={() => handleEditClaimClick(claim)}
                                            >
                                                Edit
                                            </Button>
                                            <Button 
                                                variant="danger" 
                                                size="sm" 
                                                onClick={() => handleDeleteClaimClick(claim._id)}
                                            >
                                                <Trash className="w-4 h-4" />
                                            </Button>
                                        </>
                                    )}
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

      <Modal
        isOpen={editClaimModal.isOpen}
        onClose={() => setEditClaimModal({ isOpen: false, claimId: null, message: '' })}
        title="Edit Claim Proof"
      >
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium mb-2">Proof / Description</label>
                <textarea 
                    className="w-full h-32 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                    value={editClaimModal.message}
                    onChange={(e) => setEditClaimModal(prev => ({ ...prev, message: e.target.value }))}
                />
            </div>
            <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setEditClaimModal({ isOpen: false, claimId: null, message: '' })}>
                    Cancel
                </Button>
                <Button onClick={handleUpdateClaim}>
                    Save Changes
                </Button>
            </div>
        </div>
      </Modal>

      <Modal 
        isOpen={deleteClaimModal.isOpen} 
        onClose={() => setDeleteClaimModal({ isOpen: false, claimId: null })} 
        title="Delete Claim"
      >
        <div className="space-y-4">
            <p>Are you sure you want to withdraw this claim? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setDeleteClaimModal({ isOpen: false, claimId: null })}>
                    Cancel
                </Button>
                <Button variant="danger" onClick={confirmDeleteClaim}>
                    Withdraw Claim
                </Button>
            </div>
        </div>
      </Modal>
    </div>
  );
}
