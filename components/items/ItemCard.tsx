import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/Card';
import { MapPin, Calendar, Tag, User } from 'lucide-react';

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
  user: {
    _id: string;
    name: string;
  };
}

export default function ItemCard({ item }: { item: Item }) {
  return (
    <Link href={`/items/${item._id}`}>
      <Card className="h-full overflow-hidden transition-all hover:shadow-md hover:border-blue-500/50 cursor-pointer group flex flex-col">
        {/* Social Header */}
        <div className="p-3 flex items-center gap-3 border-b border-gray-100 dark:border-gray-800">
            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <User className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {item.user?.name || 'Unknown User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                    {new Date(item.date).toLocaleDateString()}
                </p>
            </div>
        </div>

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
          <span className={`absolute top-2 right-2 px-2 py-1 text-xs font-bold uppercase tracking-wider rounded text-white ${item.type === 'lost' ? 'bg-red-500' : 'bg-green-500'}`}>
            {item.type}
          </span>
        </div>
        
        <CardContent className="p-4 space-y-2 flex-1">
           <h3 className="text-lg font-semibold line-clamp-1">{item.title}</h3>
           
           <div className="flex items-center gap-1 text-sm text-gray-500">
             <MapPin className="w-4 h-4 shrink-0" />
             <span className="line-clamp-1">{item.location?.address || 'Unknown Location'}</span>
           </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
           <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full dark:bg-gray-800">
             <Tag className="w-3 h-3" />
             {item.category}
           </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
