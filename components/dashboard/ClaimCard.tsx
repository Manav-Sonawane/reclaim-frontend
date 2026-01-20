"use client";

import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Button } from "../ui/Button";
import { Trash } from 'lucide-react';
import Link from "next/link";

interface ClaimCardProps {
    claim: any;
    onEdit: (claim: any) => void;
    onDelete: (id: string) => void;
}

export default function ClaimCard({ claim, onEdit, onDelete }: ClaimCardProps) {
    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Claim for</p>
                        <CardTitle className="text-lg font-bold truncate">{claim.item?.title || 'Unknown Item'}</CardTitle>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium uppercase border ${
                        claim.status === 'approved'
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : claim.status === 'rejected'
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                    }`}>
                        {claim.status}
                    </span>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {claim.item?.images?.[0] && (
                        <div className="aspect-square w-full bg-gray-100 rounded-md overflow-hidden">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={claim.item.images[0]} alt="Item" className="w-full h-full object-cover opacity-80 transition-transform hover:scale-105" />
                        </div>
                    )}

                    <div className="text-sm bg-gray-50 dark:bg-gray-900/50 p-3 rounded text-gray-600 dark:text-gray-300 italic">
                        "{claim.message}"
                    </div>


                    <div className="flex gap-2">
                        <Link href={`/items/${claim.item?._id}`} className="flex-1">
                            <Button variant="outline" size="sm" className="w-full">
                                View Item
                            </Button>
                        </Link>
                        {claim.status === 'pending' && (
                            <>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => onEdit(claim)}
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => onDelete(claim._id)}
                                >
                                    <Trash className="w-4 h-4" />
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
