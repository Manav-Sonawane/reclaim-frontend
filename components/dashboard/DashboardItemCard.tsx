"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { Trash, MessageCircle, MapPin } from 'lucide-react';
import { LocationBadge } from "../ui/LocationBadge";
import { CategoryBadge } from "../ui/CategoryBadge";
import Link from "next/link";

interface DashboardItemCardProps {
    item: any;
    onDelete: (id: string) => void;
}

export default function DashboardItemCard({ item, onDelete }: DashboardItemCardProps) {
    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
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
                    <div className="flex items-center gap-2">
                        <LocationBadge location={item.location?.address} />
                    </div>
                    <p className="line-clamp-2 min-h-[40px]">{item.description}</p>

                    <div className="pt-4 flex items-center justify-between gap-2 mt-auto">
                        <CategoryBadge category={item.category} />
                        <div className="flex gap-2">
                            <Link href={`/chat?itemId=${item._id}`}>
                                <Button variant="outline" size="sm">
                                    <MessageCircle className="w-4 h-4 mr-2" />
                                    Chats
                                </Button>
                            </Link>
                            <Button
                                variant="danger"
                                size="sm"
                                onClick={() => onDelete(item._id)}
                            >
                                <Trash className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
