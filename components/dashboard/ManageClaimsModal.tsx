"use client";

import { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import api from "../../lib/api";
import { Button } from "../ui/Button";
import toast from "react-hot-toast";
import { Loader2, CheckCircle, XCircle, ExternalLink } from "lucide-react";
import UserDropdown from "../user/UserDropdown";

interface ManageClaimsModalProps {
    isOpen: boolean;
    onClose: () => void;
    itemId: string | null;
    itemTitle: string;
    itemType?: 'lost' | 'found';
}

export default function ManageClaimsModal({ isOpen, onClose, itemId, itemTitle, itemType = 'found' }: ManageClaimsModalProps) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [claims, setClaims] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && itemId) {
            fetchClaims();
        } else {
            setClaims([]);
        }
    }, [isOpen, itemId]);

    const fetchClaims = async () => {
        if (!itemId) return;
        setLoading(true);
        try {
            const { data } = await api.get(`/claims/item/${itemId}`);
            setClaims(data);
        } catch (error) {
            console.error("Failed to fetch claims", error);
            toast.error("Could not load claims");
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (claimId: string, status: 'approved' | 'rejected') => {
        setProcessingId(claimId);
        try {
            await api.put(`/claims/${claimId}`, { status });
            toast.success(status === 'approved' ? "Request Approved!" : "Request Rejected");
            
            // Refresh list to show updated status
            fetchClaims();
        } catch (error) {
            console.error(error);
            toast.error(`Failed to ${status} request`);
        } finally {
            setProcessingId(null);
        }
    };

    const handleResolve = async (claimId: string) => {
        setProcessingId(claimId);
        try {
            await api.put(`/claims/${claimId}/resolve`);
            toast.success(`Item marked as ${itemType === 'found' ? 'retrieved' : 'claimed'}!`);
            fetchClaims();
            // Optional: Close modal after success since item status changes
            setTimeout(onClose, 1000); 
        } catch (error) {
            console.error(error);
            toast.error(`Failed to mark as ${itemType === 'found' ? 'retrieved' : 'claimed'}`);
        } finally {
            setProcessingId(null);
        }
    };



    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`${itemType === 'found' ? 'Claims' : 'Retrievals'} for: ${itemTitle}`}>
            <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
                    </div>
                ) : claims.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        {itemType === 'found' ? 'No claims received for this item yet.' : 'No retrieval requests received yet.'}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {claims.map((claim) => (
                            <div 
                                key={claim._id} 
                                className={`p-4 rounded-lg border ${
                                    claim.status === 'approved' 
                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/10' 
                                    : claim.status === 'rejected'
                                    ? 'border-red-200 bg-red-50 dark:bg-red-900/10 opacity-75'
                                    : 'border-gray-200 dark:border-gray-700'
                                }`}
                            >
                                {/* Claimant Info */}
                                <div className="flex items-center gap-3 mb-3">
                                    <UserDropdown user={claim.claimant} />
                                    
                                    <div className="ml-auto">
                                        <div className="text-xs text-gray-500 text-right mb-1">
                                            {new Date(claim.createdAt).toLocaleDateString()} at {new Date(claim.createdAt).toLocaleTimeString()}
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full font-medium uppercase ${
                                            claim.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            claim.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {claim.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Answers / Description */}
                                <div className="mb-3">
                                    <p className="text-xs font-bold text-gray-500 uppercase mb-1">
                                        {itemType === 'found' ? "Claimant's Description" : "Finder's Description"}
                                    </p>
                                    <p className="text-sm bg-gray-50 dark:bg-gray-800 p-2 rounded whitespace-pre-wrap">
                                        {claim.message || "No description provided."}
                                    </p>
                                </div>

                                {/* Proof Image */}
                                {claim.proof && (
                                    <div className="mb-4">
                                         <p className="text-xs font-bold text-gray-500 uppercase mb-1">Proof Image</p>
                                         <a href={claim.proof} target="_blank" rel="noopener noreferrer" className="block relative aspect-square w-full rounded-md overflow-hidden hover:opacity-90 transition-opacity border dark:border-gray-700">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={claim.proof} alt="Proof" className="h-full w-full object-cover" />
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity text-white text-xs font-bold">
                                                <ExternalLink className="w-4 h-4 mr-1" /> View Full
                                            </div>
                                         </a>
                                    </div>
                                )}

                                {/* Actions */}
                                {claim.status === 'pending' && (
                                    <div className="flex gap-2 justify-end mt-2 pt-2 border-t dark:border-gray-700">
                                        <Button 
                                            variant="danger" 
                                            size="sm" 
                                            onClick={() => handleAction(claim._id, 'rejected')}
                                            disabled={!!processingId}
                                        >
                                            <XCircle className="w-4 h-4 mr-1" /> Reject
                                        </Button>
                                        <Button 
                                            size="sm"
                                            className="bg-green-600 hover:bg-green-700 text-white"
                                            onClick={() => handleAction(claim._id, 'approved')}
                                            disabled={!!processingId}
                                        >
                                            <CheckCircle className="w-4 h-4 mr-1" /> {itemType === 'found' ? 'Verify & Approve' : 'Accept Retrieval'}
                                        </Button>
                                    </div>
                                )}

                                {/* Approved State Actions */}
                                {claim.status === 'approved' && (
                                     <div className="flex gap-2 justify-end mt-2 pt-2 border-t dark:border-gray-700">
                                        <Button
                                            size="sm"
                                            className="bg-indigo-600 hover:bg-indigo-700 text-white"
                                            onClick={() => handleResolve(claim._id)}
                                            disabled={!!processingId}
                                        >
                                            <CheckCircle className="w-4 h-4 mr-1" /> {itemType === 'found' ? 'Mark as Retrieved' : 'Mark as Claimed'}
                                        </Button>
                                     </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
             <div className="mt-6 flex justify-end">
                <Button variant="outline" onClick={onClose}>Close</Button>
            </div>
        </Modal>
    );
}
