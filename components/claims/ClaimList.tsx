"use client";

import { useEffect, useState } from "react";
import api from "../../lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { User, CheckCircle, XCircle, MessageSquare, Check } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface Claim {
  _id: string;
  claimant: {
    _id: string;
    name: string;
    email: string;
    profilePicture?: string;
  };
  message: string;
  proof?: string;
  status: "pending" | "approved" | "rejected" | "completed";
  createdAt: string;
}

interface ClaimListProps {
  itemId: string;
}

export default function ClaimList({ itemId }: ClaimListProps) {
  const router = useRouter();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  const [itemType, setItemType] = useState<"lost" | "found">("found");

  const fetchClaims = async () => {
    try {
      const { data } = await api.get(`/claims/item/${itemId}`);
      setClaims(data);
      // Also fetch item to know type if not passed
      const { data: itemData } = await api.get(`/items/${itemId}`);
      setItemType(itemData.type);
    } catch (error) {
      console.error("Error fetching claims:", error);
      // toast.error("Failed to load claims");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [itemId]);

  const handleStatusUpdate = async (claimId: string, status: "approved" | "rejected") => {
    try {
      await api.put(`/claims/${claimId}`, { status });
      toast.success(`Claim ${status}`);
      fetchClaims(); // Refresh list
    } catch (error) {
      console.error("Error updating claim:", error);
      toast.error("Failed to update claim");
    }
  };

  const handleResolve = async (claimId: string) => {
    if (!confirm("Confirm that this item has been returned safely?")) return;
    try {
      await api.put(`/claims/${claimId}/resolve`);
      toast.success("Item marked as returned");
      fetchClaims();
    } catch (error) {
      console.error("Error resolving claim:", error);
      toast.error("Failed to resolve claim");
    }
  };

  const handleChat = (claimantId: string) => {
      // Create chat with this user
      // Ideally backend creates it on approve, so we just navigate to /chat?itemId=...
      router.push(`/chat?itemId=${itemId}`);
  };

  if (loading) return <div>Loading claims...</div>;
  if (claims.length === 0) return null;

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Claims ({claims.length})</h3>
      {claims.map((claim) => (
        <Card key={claim._id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex flex-col gap-4">
              {/* Header: User & Status */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center overflow-hidden">
                     {claim.claimant?.profilePicture ? (
                         // eslint-disable-next-line @next/next/no-img-element
                        <img src={claim.claimant.profilePicture} alt={claim.claimant.name} className="h-full w-full object-cover" />
                     ) : (
                         <span className="font-bold text-blue-600 dark:text-blue-400">{claim.claimant?.name?.charAt(0).toUpperCase()}</span>
                     )}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-gray-100">
                      {claim.claimant?.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(claim.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
                      claim.status === "approved"
                        ? "bg-green-100 text-green-800"
                        : claim.status === "rejected"
                        ? "bg-red-100 text-red-800"
                        : claim.status === "completed"
                        ? "bg-gray-100 text-gray-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {claim.status}
                  </span>
                </div>
              </div>

              {/* Message */}
              <div className="bg-gray-50 dark:bg-gray-900/50 p-3 rounded-md text-sm">
                <span className="font-semibold block mb-1">Reason:</span>
                {claim.message}
              </div>

              {/* Proof Image */}
              {claim.proof && (
                <div>
                  <span className="font-semibold text-sm block mb-1">Proof:</span>
                  <div className="h-32 w-32 rounded-md overflow-hidden bg-gray-100 border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={claim.proof}
                      alt="Proof"
                      className="h-full w-full object-cover cursor-pointer"
                      onClick={() => window.open(claim.proof, "_blank")}
                    />
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 mt-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                {claim.status === "pending" && (
                  <>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => handleStatusUpdate(claim._id, "approved")}
                    >
                      <CheckCircle className="w-4 h-4 mr-2" /> Verify & Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-500 border-red-200 hover:bg-red-50"
                      onClick={() => handleStatusUpdate(claim._id, "rejected")}
                    >
                      <XCircle className="w-4 h-4 mr-2" /> Reject
                    </Button>
                  </>
                )}

                {claim.status === "approved" && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleChat(claim.claimant._id)}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" /> Chat
                    </Button>
                    <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => handleResolve(claim._id)}
                    >
                        <Check className="w-4 h-4 mr-2" /> {itemType === 'found' ? 'Mark as Returned' : 'Mark as Retrieved'}
                    </Button>
                  </>
                )}
                 {claim.status === "completed" && (
                     <div className="text-sm text-green-600 font-medium flex items-center">
                         <CheckCircle className="w-4 h-4 mr-2"/> Item Returned
                     </div>
                 )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
