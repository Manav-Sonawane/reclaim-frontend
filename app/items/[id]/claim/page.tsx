'use client';

import { useState, use } from 'react';
import { useRouter } from 'next/navigation';
import api from '../../../../lib/api';
import { Button } from '../../../../components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/Card';
import { ArrowLeft, Send } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ClaimItemPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [proof, setProof] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proof.trim()) return toast.error('Please provide proof details');

    setLoading(true);
    try {
      await api.post('/claims', {
        itemId: id,
        answers: [proof] // Sending as a single answer for now since specific questions aren't implemented
      });
      toast.success('Claim submitted successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to submit claim');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Item
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Claim Item</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-6 dark:text-gray-300">
            To prevent fraud, please describe the item in detail. 
            Mention partial unique features, contents, or where exactly it was lost/found. 
            This information will be reviewed by the finder/admin.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Proof of Ownership / Detailed Description
              </label>
              <textarea
                className="w-full h-40 p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700"
                placeholder="E.g. The phone has a crack on the top left corner, and the wallpaper is..."
                value={proof}
                onChange={(e) => setProof(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              <Send className="w-4 h-4 mr-2" />
              {loading ? 'Submitting...' : 'Submit Claim'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
