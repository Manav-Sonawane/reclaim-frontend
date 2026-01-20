"use client";

import { useEffect, useState, use } from "react";
import api from "../../../lib/api";
import { useAuth } from "../../../context/AuthContext";
import DashboardItemCard from "../../../components/dashboard/DashboardItemCard";
import { User, Calendar, MapPin, Mail } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { useRouter } from "next/navigation";

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [profileUser, setProfileUser] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [userItems, setUserItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        // 1. Fetch User Details
        const { data: userData } = await api.get(`/users/${id}`);
        setProfileUser(userData);

        // 2. Fetch User's Items
        const { data: itemsData } = await api.get(`/items/user/${id}`);
        setUserItems(itemsData);
      } catch (error) {
        console.error("Failed to load profile", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProfile();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center">Loading Profile...</div>;
  }

  if (!profileUser) {
    return <div className="p-8 text-center">User not found</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white dark:bg-black rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-6 mb-8 flex flex-col md:flex-row items-center md:items-start gap-6">
        <div className="h-24 w-24 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 overflow-hidden ring-4 ring-gray-50 dark:ring-gray-900 shrink-0">
            {profileUser.profilePicture ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profileUser.profilePicture} alt={profileUser.name} className="h-full w-full object-cover" />
            ) : (
                <User className="w-10 h-10" />
            )}
        </div>
        
        <div className="flex-1 text-center md:text-left space-y-2">
            <h1 className="text-3xl font-bold">{profileUser.name}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    Joined {new Date(profileUser.createdAt).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    {profileUser.email}
                </span>
            </div>
             <p className="text-gray-600 dark:text-gray-400 mt-2">
                 Active Reports: <span className="font-bold text-gray-900 dark:text-white">{userItems.length}</span>
             </p>
        </div>

        <div>
             <Button onClick={() => router.push('/chat')}>Message</Button>
        </div>
      </div>

      {/* Active Reports Grid */}
      <h2 className="text-xl font-semibold border-b border-gray-200 dark:border-gray-800 pb-2 mb-6"> Active Reports</h2>
      
      {userItems.length === 0 ? (
          <p className="text-gray-500 italic">This user has no active reports.</p>
      ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userItems.map((item) => (
                <DashboardItemCard 
                    key={item._id} 
                    item={item} 
                    // No onDelete or onManageClaims provided -> Read Only view
                />
            ))}
          </div>
      )}
    </div>
  );
}
