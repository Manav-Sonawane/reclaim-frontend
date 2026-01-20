"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { Trash, MessageCircle } from 'lucide-react';
import { LocationBadge } from "../ui/LocationBadge";
import { CategoryBadge } from "../ui/CategoryBadge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

interface DashboardItemCardProps {
    item: any;
    onDelete?: (id: string) => void;
    onManageClaims?: (item: any) => void;
}

export default function DashboardItemCard({ item, onDelete, onManageClaims }: DashboardItemCardProps) {
    const router = useRouter();
    const [cityName, setCityName] = useState<string | null>(null);

    // Reverse Geocoding for City Name
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
               fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`)
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
                  .catch(err => console.error("Failed to reverse geocode in dashboard card:", err));
        }
    }, [coordinates, cityName, item.location?.city]);

    return (
        <Link href={`/items/${item._id}`}>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                {item.images && item.images.length > 0 && (
                    <div className="aspect-square w-full bg-gray-100 relative overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={item.images[0]}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform hover:scale-105"
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
                        <div className="flex items-center gap-2 flex-wrap">
                            <LocationBadge location={cityName || (coordinates && coordinates.length === 2 ? "Locating..." : item.location?.address)} />
                            <CategoryBadge category={item.category} />
                        </div>
                        <p className="line-clamp-2 min-h-[40px]">{item.description}</p>

                        <div className="pt-4 flex items-center mt-auto">
                            {onManageClaims && (
                                <Button
                                    size="sm"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white relative"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onManageClaims(item);
                                    }}
                                >
                                    {item.type === 'found' ? 'Review Claims' : 'Review Retrievals'}
                                    {item.claimCount > 0 && (
                                        <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">
                                            {item.claimCount}
                                        </span>
                                    )}
                                </Button>
                            )}
                            {onDelete && (
                                <Button
                                    variant="danger"
                                    size="sm"
                                    className="ml-auto"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        onDelete(item._id);
                                    }}
                                >
                                    <Trash className="w-4 h-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
