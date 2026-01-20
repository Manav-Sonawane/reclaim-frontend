"use client";

import { Button } from "../ui/Button";
import { MessageSquare, CheckCircle, Share2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ClaimList from "../claims/ClaimList";
import toast from 'react-hot-toast';

interface ItemActionsProps {
  item: any;
  user: any;
  myClaim: any;
  onClaimClick: () => void;
}

export default function ItemActions({ item, user, myClaim, onClaimClick }: ItemActionsProps) {
  const router = useRouter();

  if (!user) {
    return (
      <Link href="/auth/login" className="w-full">
        <Button className="w-full">Login to Interact</Button>
      </Link>
    );
  }

  // Safe ID extraction
  const itemUserId = typeof item.user === "object" ? item.user?._id : item.user;
  const isOwner =
    itemUserId && user?._id && itemUserId.toString() === user._id.toString();

  if (isOwner) {
    return (
      <div className="space-y-4">
        <div className="text-center text-sm text-gray-500 mb-2">
          {item.type === "found" ? "You found this item" : "You posted this lost item"}
        </div>
        
        {/* If Found item, show claims management */}
        {item.type === "found" && (
            <ClaimList itemId={item._id} />
        )}
        
        {/* If Lost item, maybe show potential matches or just edit/delete (handled in dashboard) */}
        {(
             <Button variant="outline" className="w-full" onClick={() => router.push('/dashboard')}>
                 Manage in Dashboard
             </Button>
        )}
      </div>
    );
  }

  // If I've already claimed this (only relevant for Found items)
  if (myClaim) {
    return (
      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700">
        <h4 className="font-semibold mb-2">{item.type === 'found' ? 'Claim Status' : 'Retrieval Status'}</h4>
        <div className="flex items-center gap-2 mb-2">
          <span
            className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${
              myClaim.status === "approved"
                ? "bg-green-100 text-green-800"
                : myClaim.status === "rejected"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {myClaim.status}
          </span>
          <span className="text-xs text-gray-500">
            {new Date(myClaim.createdAt).toLocaleDateString()}
          </span>
        </div>
        {myClaim.status === "approved" && (
          <Button
            className="w-full mt-2"
            onClick={() => router.push(`/chat?itemId=${item._id}`)}
          >
            <MessageSquare className="mr-2 h-4 w-4" /> Chat with {item.type === 'found' ? 'Finder' : 'Owner'}
          </Button>
        )}
        {myClaim.status === "rejected" && (
          <p className="text-xs text-red-500 mt-2">
            Your {item.type === 'found' ? 'claim' : 'request'} was not approved.
          </p>
        )}
        {myClaim.status === "pending" && (
          <p className="text-xs text-gray-500 mt-2">
            Waiting for {item.type === 'found' ? 'finder' : 'owner'} to review.
          </p>
        )}
      </div>
    );
  }

  // Action Buttons based on Item Type
  return (
    <div className="space-y-4">
      {item.type === "found" ? (
        <>
             <div className="flex gap-3">
                 <Button className="flex-1" onClick={() => router.push(`/chat?itemId=${item._id}`)}>
                    <MessageSquare className="mr-2 h-4 w-4" /> Message Finder
                </Button>
                <Button variant="secondary" className="flex-1" onClick={() => {
                     const shareUrl = window.location.href;
                     if (navigator.share) {
                         navigator.share({
                             title: `Reclaim: ${item.title}`,
                             text: `Check out this found item: ${item.title}`,
                             url: shareUrl
                         }).catch(console.error);
                     } else {
                         navigator.clipboard.writeText(shareUrl);
                         toast.success('Link copied to clipboard!');
                     }
                 }}>
                     <Share2 className="mr-2 h-4 w-4" /> Share
                </Button>
             </div>
             
             <Button variant="outline" className="w-full" onClick={onClaimClick}>
                <CheckCircle className="mr-2 h-4 w-4" /> Claim Item
             </Button>
        </>
      ) : (
        <>
             <div className="flex gap-3">
                 <Button className="flex-1" onClick={() => router.push(`/chat?itemId=${item._id}`)}>
                    <MessageSquare className="mr-2 h-4 w-4" /> Message
                </Button>
                <Button variant="secondary" className="flex-1" onClick={() => {
                     const shareUrl = window.location.href;
                     if (navigator.share) {
                         navigator.share({
                             title: `Reclaim: ${item.title}`,
                             text: `Help return this lost item: ${item.title}`,
                             url: shareUrl
                         }).catch(console.error);
                     } else {
                         navigator.clipboard.writeText(shareUrl);
                         toast.success('Link copied to clipboard!');
                     }
                 }}>
                     <Share2 className="mr-2 h-4 w-4" /> Share
                </Button>
             </div>

             <Button variant="outline" className="w-full" onClick={onClaimClick}>
                <CheckCircle className="mr-2 h-4 w-4" /> Retrieve Item
             </Button>
        </>
      )}
    </div>
  );
}
