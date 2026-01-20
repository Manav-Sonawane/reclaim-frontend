'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '../lib/api';
import ItemCard from '../components/items/ItemCard';
import SearchAutocomplete from '../components/items/SearchAutocomplete';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Loader2, Filter, Search } from 'lucide-react';

import FilterSidebar from '../components/items/FilterSidebar';
import { Modal } from '../components/ui/Modal';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

function HomeContent() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchParam = searchParams.get('search');
  const typeParam = searchParams.get('type');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [filters, setFilters] = useState({
    category: 'All',
    location: '',
    search: searchParam || '',
    type: typeParam || 'all',
    bounds: null as { south: number, north: number, west: number, east: number } | null,
    country: '',
    state: '',
    city: ''
  });

  // Sync URL params to state on load
  useEffect(() => {
    if (typeParam || searchParam) {
      setFilters(prev => ({
        ...prev,
        type: (typeParam as 'lost' | 'found') || prev.type,
        search: searchParam || prev.search
      }));
    }
  }, [typeParam, searchParam]);

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        let query = `/items?`;
        if (filters.type !== 'all') query += `type=${filters.type}&`;
        if (filters.category !== 'All' && filters.category) query += `category=${filters.category}&`;

        // Smart Location Logic (Subset Check):
        // If we have a bounding box (e.g. valid "France" result), we send it to the backend.
        // The backend will search strictly WITHIN this box.
        if (filters.bounds) {
          const { south, north, west, east } = filters.bounds;
          query += `box=${south},${west},${north},${east}&`;
        } else if (filters.location) {
          // Fallback for non-geocoded text
          query += `location=${encodeURIComponent(filters.location)}&`;
        }

        if (filters.search) query += `search=${encodeURIComponent(filters.search)}&`;
        if (filters.country) query += `country=${encodeURIComponent(filters.country)}&`;
        if (filters.state) query += `state=${encodeURIComponent(filters.state)}&`;
        if (filters.city) query += `city=${encodeURIComponent(filters.city)}&`;

        const { data } = await api.get(query);
        setItems(data);
      } catch (error) {
        console.error('Failed to fetch items:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(() => {
      fetchItems();
    }, 300); // 300ms debounce for search

    return () => clearTimeout(debounce);
  }, [filters]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero / CTA Section - Only for non-logged in users */}
      {!user && (
        <div className="mb-8 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center bg-blue-50 dark:bg-gray-900 p-6 rounded-xl border border-blue-100 dark:border-gray-800">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Lost & Found Community</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Find what you lost. Return what you found.</p>
          </div>
          <Link href="/post" className="mt-4 sm:mt-0">
            <Button size="lg" className="rounded-full shadow-lg hover:shadow-xl transition-all">
              + Report an Item
            </Button>
          </Link>
        </div>
      )}

      {/* Mobile Search Bar with Autocomplete */}
      <div className="md:hidden mb-6 relative">
        <SearchAutocomplete
          placeholder="Search for items..."
          maxResults={6}
          onItemSelect={(item) => {
            router.push(`/items/${item._id}`);
          }}
        />
      </div>

      <div className="flex justify-between items-center mb-6">
        {/* Mobile Filter Button */}
        <Button
          className="md:hidden"
          variant="outline"
          size="sm"
          onClick={() => setIsFilterOpen(true)}
        >
          <Filter className="w-4 h-4 mr-2" /> Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Desktop Sidebar */}
        <div className="hidden md:block md:col-span-1">
          <FilterSidebar
            filters={filters}
            onFilterChange={setFilters}
          />
        </div>

        {/* Mobile Filter Modal */}
        <Modal
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          title="Filters"
        >
          <FilterSidebar
            filters={filters}
            onFilterChange={setFilters}
          />
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button className="w-full" onClick={() => setIsFilterOpen(false)}>
              Show Results
            </Button>
          </div>
        </Modal>

        {/* Results */}
        <div className="md:col-span-3">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => (
                <ItemCard key={item._id} item={item} />
              ))}
              {items.length === 0 && (
                <div className="col-span-full text-center py-20 bg-gray-50 dark:bg-gray-900 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
                  <p className="text-gray-500 dark:text-gray-400">No items found matching your criteria.</p>
                  <Button
                    variant="ghost"
                    onClick={() => setFilters({ category: 'All', location: '', search: '', type: 'all', bounds: null, country: '', state: '', city: '' })}
                  >
                    Clear Filters
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
      <HomeContent />
    </Suspense>
  );
}
