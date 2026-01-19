import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/Card';
import { MapPin, Calendar, Tag } from 'lucide-react';

interface Item {
  _id: string;
  title: string;
  type: 'lost' | 'found';
  category: string;
  description: string;
  images: string[];
  location: {
    address: string;
  };
  date: string;
  createdAt: string;
}

export default function ItemCard({ item }: { item: Item }) {
  return (
    <Link href={`/items/${item._id}`}>
      <Card className="h-full overflow-hidden transition-all hover:shadow-md hover:border-blue-500/50 cursor-pointer group">
        <div className="aspect-video w-full bg-gray-100 relative overflow-hidden">
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
          <span className={`absolute top-2 left-2 px-2 py-1 text-xs font-bold uppercase tracking-wider rounded text-white ${item.type === 'lost' ? 'bg-red-500' : 'bg-green-500'}`}>
            {item.type}
          </span>
        </div>
        <CardHeader className="p-4">
          <h3 className="text-lg font-semibold line-clamp-1">{item.title}</h3>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-2 text-sm text-gray-500">
           <div className="flex items-center gap-1">
             <MapPin className="w-4 h-4" />
             <span className="line-clamp-1">{item.location?.address || 'Unknown Location'}</span>
           </div>
           <div className="flex items-center gap-1">
             <Calendar className="w-4 h-4" />
             <span>{new Date(item.date).toLocaleDateString()}</span>
           </div>
        </CardContent>
        <CardFooter className="p-4 pt-0">
           <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full dark:bg-gray-800">
             <Tag className="w-3 h-3" />
             {item.category}
           </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
