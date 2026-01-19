'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import toast from 'react-hot-toast';

export default function AdminPage() {
  const { user } = useAuth();
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
      return;
    }

    const fetchClaims = async () => {
      try {
        const { data } = await api.get('/claims');
        setClaims(data);
      } catch (error) {
        toast.error('Failed to fetch claims');
      } finally {
        setLoading(false);
      }
    };

    if (user?.role === 'admin') fetchClaims();
  }, [user, router]);

  const handleStatusUpdate = async (id: string, status: 'approved' | 'rejected') => {
    try {
      await api.put(`/claims/${id}`, { status });
      setClaims(prev => prev.map(c => c._id === id ? { ...c, status } : c));
      toast.success(`Claim ${status}`);
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  if (!user || user.role !== 'admin') return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard - Claims</h1>
      
      {loading ? (
          <div>Loading...</div>
      ) : (
          <div className="space-y-4">
            {claims.map(claim => (
                <Card key={claim._id}>
                    <CardHeader>
                        <CardTitle className="flex justify-between items-center">
                            <span>Item: {claim.item?.title || 'Unknown Item'}</span>
                            <span className={`text-sm px-2 py-1 rounded capitalize ${
                                claim.status === 'approved' ? 'bg-green-100 text-green-800' :
                                claim.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                            }`}>{claim.status}</span>
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Claimant</p>
                                <p>{claim.claimant?.name} ({claim.claimant?.email})</p>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-500">Date</p>
                                <p>{new Date(claim.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                        {claim.status === 'pending' && (
                            <div className="mt-4 flex gap-4">
                                <Button className="bg-green-600 hover:bg-green-700" onClick={() => handleStatusUpdate(claim._id, 'approved')}>
                                    Approve Claim
                                </Button>
                                <Button variant="danger" onClick={() => handleStatusUpdate(claim._id, 'rejected')}>
                                    Reject Claim
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
            {claims.length === 0 && <p className="text-center text-gray-500">No recent claims.</p>}
          </div>
      )}
    </div>
  );
}
