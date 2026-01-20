'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, Search, X, AlertCircle } from 'lucide-react';
import api from '@/lib/api';
import ItemCard from './ItemCard';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';

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
  upvotes: string[];
  downvotes: string[];
}

interface SearchAutocompleteProps {
  onItemSelect?: (item: Item) => void;
  placeholder?: string;
  maxResults?: number;
}

export default function SearchAutocomplete({
  onItemSelect,
  placeholder = 'Search for items...',
  maxResults = 6,
}: SearchAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounced search function
  useEffect(() => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // If query is empty, clear results
    if (!query.trim()) {
      setResults([]);
      setError(null);
      setShowResults(false);
      return;
    }

    // Set up debounce timer
    debounceTimerRef.current = setTimeout(async () => {
      setLoading(true);
      setError(null);

      try {
        // Create new AbortController for this request
        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        const encodedQuery = encodeURIComponent(query.trim());
        const { data } = await api.get(`/items?search=${encodedQuery}`, {
          signal: abortController.signal,
        });

        // Only update if this request wasn't aborted
        if (!abortController.signal.aborted) {
          setResults(Array.isArray(data) ? data.slice(0, maxResults) : []);
          setShowResults(true);
        }
      } catch (err) {
        // Ignore abort errors
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }

        console.error('Search failed:', err);
        setError('Failed to fetch search results. Please try again.');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300); // 300ms debounce

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, maxResults]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setError(null);
    setShowResults(false);
  };

  const handleItemClick = (item: Item) => {
    if (onItemSelect) {
      onItemSelect(item);
    }
    handleClear();
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Search Input */}
      <div className="relative">
        <Input
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query && setShowResults(true)}
          className="pl-10 pr-10 h-10 w-full"
        />
        <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />

        {/* Clear button */}
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            aria-label="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {showResults && query && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-8 px-4">
              <Loader2 className="h-5 w-5 animate-spin text-blue-500 mr-2" />
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Searching...
              </span>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="p-4 flex items-start gap-3 text-sm bg-red-50 dark:bg-red-900/20 border-t border-red-200 dark:border-red-800">
              <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-red-900 dark:text-red-200">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Results Grid */}
          {!loading && !error && results.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
              {results.map((item) => (
                <button
                  key={item._id}
                  onClick={() => handleItemClick(item)}
                  className="text-left hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors p-2 border border-gray-100 dark:border-gray-700"
                >
                  <div className="flex gap-3">
                    {/* Thumbnail */}
                    <div className="shrink-0 w-16 h-16 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-700">
                      {item.images.length > 0 ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          No Image
                        </div>
                      )}
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
                        {item.title}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1 mt-1">
                        {item.location?.address}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            item.type === 'lost'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                              : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                          }`}
                        >
                          {item.type}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {item.category}
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {!loading && !error && results.length === 0 && query && (
            <div className="p-8 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No items found for "{query}"
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Try adjusting your search terms
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
