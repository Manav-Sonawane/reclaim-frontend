"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { User, MessageSquare, ExternalLink } from "lucide-react";

interface UserDropdownProps {
  user: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  className?: string;
}

export default function UserDropdown({ user, className = "" }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={`relative inline-block ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 focus:outline-none transition-transform active:scale-95"
      >
        <div className="h-8 w-8 rounded-full bg-gray-200 overflow-hidden ring-1 ring-gray-100 dark:ring-gray-800 hover:ring-2 hover:ring-blue-400 transition-all">
          {user.profilePicture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.profilePicture}
              alt={user.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full flex items-center justify-center bg-indigo-500 text-white font-bold text-[10px]">
              {user.name?.[0]?.toUpperCase() || "U"}
            </div>
          )}
        </div>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
          {user.name || "Unknown"}
        </span>
      </button>

      {isOpen && (
        <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-900 rounded-md shadow-lg border border-gray-100 dark:border-gray-800 z-50 animate-in fade-in zoom-in-95 duration-100 origin-top-left">
          <div className="py-1">
            <Link
              href={`/profile/${user._id}`}
              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800"
              onClick={() => setIsOpen(false)}
            >
              <User className="w-4 h-4" />
              View Profile
            </Link>
            <button
                type="button"
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 text-left"
                onClick={() => {
                    setIsOpen(false);
                     // Redirect to chat with this itemId is tricky here without item context, 
                     // but commonly profiles have a 'Message' button. 
                     // For now, let's just go to chat inbox or start a general chat if we support it.
                     // IMPORTANT: The existing chat system relies on an Item ID. 
                     // If we are just viewing a user, we might not have a specific item context.
                     // If we DO have context (like in ItemDetail), we will likely use that.
                     // Let's assume this button is for "General" messaging OR we disable it if no item context?
                     // Use case: "Profile -> Message". 
                     // If the app requires an Item to start a chat, this button might need to be smart or removed from generic profile.
                     // The requirement said: "dropdown with two things, profile or message".
                     // Let's just link to /chat for now, or if we can pass context.
                     router.push('/chat'); 
                }}
            >
              <MessageSquare className="w-4 h-4" />
              Message
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
