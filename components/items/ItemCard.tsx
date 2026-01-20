import Link from "next/link";
import { Card, CardContent, CardFooter } from "../ui/Card";
import { User } from "lucide-react";
import { CategoryBadge } from "../ui/CategoryBadge";
import { LocationBadge } from "../ui/LocationBadge";
import { useAuth } from "../../context/AuthContext";
import { useState, useEffect } from "react";

interface Item {
  _id: string;
  title: string;
  type: "lost" | "found";
  category: string;
  description: string;
  images: string[];
  location: {
    address: string;
    city?: string;
  };
  date: string;
  createdAt: string;
  user: {
    _id: string;
    name: string;
    profilePicture?: string;
  };
  upvotes: string[];
  downvotes: string[];
}

export default function ItemCard({ item }: { item: Item }) {
  // const [upvotes, setUpvotes] = useState<string[]>(item.upvotes || []);
  // const [downvotes, setDownvotes] = useState<string[]>(item.downvotes || []);

  // const isUpvoted = user && upvotes.includes(user._id);
  // const isDownvoted = user && downvotes.includes(user._id);

  // const score = upvotes.length - downvotes.length;

  // const handleVote = async (e: React.MouseEvent, type: "up" | "down") => {
  //   e.preventDefault(); // Prevent link navigation
  //   e.stopPropagation();

  //   if (!user) {
  //     // Optional: Redirect to login or show toast. For now just ignore.
  //     return;
  //   }

  //   if (isLoading) return;

  //   // Optimistic Update
  //   const oldUpvotes = [...upvotes];
  //   const oldDownvotes = [...downvotes];
  //   const userId = user._id;

  //   if (type === "up") {
  //     if (isUpvoted) {
  //       setUpvotes((prev) => prev.filter((id) => id !== userId));
  //     } else {
  //       setUpvotes((prev) => [...prev, userId]);
  //       if (isDownvoted)
  //         setDownvotes((prev) => prev.filter((id) => id !== userId));
  //     }
  //   } else {
  //     if (isDownvoted) {
  //       setDownvotes((prev) => prev.filter((id) => id !== userId));
  //     } else {
  //       setDownvotes((prev) => [...prev, userId]);
  //       if (isUpvoted) setUpvotes((prev) => prev.filter((id) => id !== userId));
  //     }
  //   }

  //   setIsLoading(true);
  //   try {
  //     const { data } = await api.post(`/items/${item._id}/vote`, {
  //       voteType: type,
  //     });
  //     // Sync with server response to be sure
  //     setUpvotes(data.upvotes);
  //     setDownvotes(data.downvotes);
  //   } catch (error) {
  //     console.error("Vote failed:", error);
  //     // Revert
  //     setUpvotes(oldUpvotes);
  //     setDownvotes(oldDownvotes);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const [cityName, setCityName] = useState<string | null>(null);

  // Reverse Geocoding for City Name
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const itemLocation = item.location as any;
  const coordinates = itemLocation?.coordinates;

  useEffect(() => {
    // If we already have the persisted city name, use it!
    if (item.location?.city) {
        setCityName(item.location.city);
        return;
    }

    if (coordinates && coordinates.length === 2 && !cityName) {
         const [lng, lat] = coordinates;
         fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
            .then(res => res.json())
            .then(data => {
                const city = data.address?.city || 
                             data.address?.town || 
                             data.address?.village || 
                             data.address?.municipality ||
                             data.address?.city_district ||
                             data.address?.suburb ||
                             data.address?.neighbourhood ||
                             data.address?.county;
                if (city) setCityName(city);
            })
            .catch(err => console.error("Failed to reverse geocode in card:", err));
    }
  }, [coordinates, cityName, item.location?.city]);

  return (
    <Link href={`/items/${item._id}`}>
      <Card className="h-full overflow-hidden transition-all hover:shadow-md hover:border-blue-500/50 cursor-pointer group flex flex-col">
        {/* Social Header */}
        <div className="p-3 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800">
          <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 overflow-hidden font-bold text-xs ring-2 ring-gray-50 dark:ring-gray-900">
            {item.user?.profilePicture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={item.user.profilePicture}
                alt={item.user.name}
                className="h-full w-full object-cover"
              />
            ) : (
              item.user?.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .substring(0, 2)
                .toUpperCase() || <User className="w-4 h-4" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {item.user?.name || "Unknown User"}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {new Date(item.date).toLocaleDateString()}
            </p>
          </div>
          <span
            className={`ml-auto px-2 py-1 rounded-full text-xs font-medium uppercase ${
              item.type === "lost"
                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
                : "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
            }`}
          >
            {item.type}
          </span>
        </div>

        <div className="aspect-square w-full bg-gray-100 relative overflow-hidden">
          {item.images.length > 0 ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.images[0]}
              alt={item.title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-400">
              No Image
            </div>
          )}
        </div>

        <CardContent className="p-4 space-y-2 flex-1">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-lg font-semibold line-clamp-1">{item.title}</h3>
          </div>

          <div className="flex items-center gap-1 mb-2">
            <LocationBadge location={cityName || (coordinates && coordinates.length === 2 ? "Locating..." : item.location?.address)} />
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0 flex justify-between items-center">
          <CategoryBadge category={item.category} />

          {/* Voting Controls */}
          {/* <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-full px-2 py-1">
            <button
              onClick={(e) => handleVote(e, "up")}
              className={`p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
                isUpvoted
                  ? "text-orange-600 dark:text-orange-500"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              <ArrowBigUp
                className={`w-6 h-6 ${isUpvoted ? "fill-current" : ""}`}
              />
            </button>

            <span
              className={`text-xs font-bold w-4 text-center ${
                score > 0
                  ? "text-orange-600 dark:text-orange-500"
                  : score < 0
                    ? "text-blue-600 dark:text-blue-500"
                    : "text-gray-500"
              }`}
            >
              {score}
            </span>

            <button
              onClick={(e) => handleVote(e, "down")}
              className={`p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ${
                isDownvoted
                  ? "text-blue-600 dark:text-blue-500"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              <ArrowBigDown
                className={`w-6 h-6 ${isDownvoted ? "fill-current" : ""}`}
              />
            </button>
          </div> */}
        </CardFooter>
      </Card>
    </Link>
  );
}
