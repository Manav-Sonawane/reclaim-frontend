'use client';

import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Search } from 'lucide-react';

interface FilterSidebarProps {
  filters: {
    category: string; // Comma separated
    location: string;
    search: string;
    type: string; // Comma separated or 'all'
    // Bounding Box for strict subset filtering
    bounds?: {
        south: number;
        north: number;
        west: number;
        east: number;
    } | null;
  };
  onFilterChange: (newFilters: any) => void;
}

const CATEGORIES = [
  'Electronics',
  'Accessories',
  'Documents',
  'Clothing',
  'Keys',
  'Other'
];

const TYPES = [
  { id: 'lost', label: 'Lost Item' },
  { id: 'found', label: 'Found Item' }
];

export default function FilterSidebar({ filters, onFilterChange }: FilterSidebarProps) {
  // Parse comma separated strings back to arrays for local state
  const parseList = (str: string) => str && str !== 'all' && str !== 'All' ? str.split(',') : [];
  
  const [selectedTypes, setSelectedTypes] = useState<string[]>(parseList(filters.type));
  const [selectedCategories, setSelectedCategories] = useState<string[]>(parseList(filters.category));
  const [localLocation, setLocalLocation] = useState(filters.location);

  // Sync when parent updates
  useEffect(() => {
    setSelectedTypes(parseList(filters.type));
    setSelectedCategories(parseList(filters.category));
    setLocalLocation(filters.location);
  }, [filters]);

  const handleTypeChange = (type: string) => {
    let newTypes;
    if (selectedTypes.includes(type)) {
      newTypes = selectedTypes.filter(t => t !== type);
    } else {
      newTypes = [...selectedTypes, type];
    }
    setSelectedTypes(newTypes);
    onFilterChange({ ...filters, type: newTypes.length > 0 ? newTypes.join(',') : 'all' });
  };

  const handleCategoryChange = (cat: string) => {
    let newCats;
    if (selectedCategories.includes(cat)) {
        newCats = selectedCategories.filter(c => c !== cat);
    } else {
        newCats = [...selectedCategories, cat];
    }
    setSelectedCategories(newCats);
    onFilterChange({ ...filters, category: newCats.length > 0 ? newCats.join(',') : 'All' });
  };

  const [isGeocoding, setIsGeocoding] = useState(false);

  const handleLocationSubmit = async () => {
      if (!localLocation.trim()) {
          onFilterChange({ ...filters, location: '', lat: null, lng: null });
          return;
      }

      setIsGeocoding(true);
      try {
          // Free OpenStreetMap Geocoding
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(localLocation)}`);
          const data = await response.json();

          if (data && data.length > 0) {
              const result = data[0];
              // Nominatim returns boundingbox as [minLat, maxLat, minLon, maxLon] strings
              const [minLat, maxLat, minLon, maxLon] = result.boundingbox;
              
              onFilterChange({ 
                  ...filters, 
                  location: localLocation, 
                  bounds: {
                      south: parseFloat(minLat),
                      north: parseFloat(maxLat),
                      west: parseFloat(minLon),
                      east: parseFloat(maxLon)
                  }
              });
          } else {
              // Fallback to text if not found
              onFilterChange({ ...filters, location: localLocation, bounds: null });
          }
      } catch (error) {
          console.error("Geocoding failed", error);
          // Fallback to text
          onFilterChange({ ...filters, location: localLocation, bounds: null });
      } finally {
          setIsGeocoding(false);
      }
  };

  const clearFilters = () => {
    onFilterChange({
      category: 'All',
      location: '',
      search: '',
      type: 'all',
      bounds: null
    });
  };

  return (
    <div className="sticky top-20 space-y-8 max-h-[calc(100vh-6rem)] overflow-y-auto pb-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">Filters</h3>
        <button onClick={clearFilters} className="text-sm text-blue-600 hover:underline">
          Clear all
        </button>
      </div>

      {/* Type Facet */}
      <div className="space-y-3">
        <h4 className="font-bold text-sm">Status</h4>
        <div className="space-y-2">
            {TYPES.map((t) => (
                <label key={t.id} className="flex items-center space-x-2 cursor-pointer group">
                    <input 
                        type="checkbox" 
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={selectedTypes.includes(t.id)}
                        onChange={() => handleTypeChange(t.id)}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-600">
                        {t.label}
                    </span>
                </label>
            ))}
        </div>
      </div>

      {/* Category Facet */}
      <div className="space-y-3">
        <h4 className="font-bold text-sm">Category</h4>
        <div className="space-y-2">
            {CATEGORIES.map((cat) => (
                <label key={cat} className="flex items-center space-x-2 cursor-pointer group">
                    <input 
                        type="checkbox" 
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        checked={selectedCategories.includes(cat)}
                        onChange={() => handleCategoryChange(cat)}
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-blue-600">
                        {cat}
                    </span>
                </label>
            ))}
        </div>
      </div>

      {/* Location Input */}
      <div className="space-y-3">
        <h4 className="font-bold text-sm">Location</h4>
        <div className="flex gap-2">
            <Input 
                placeholder="e.g. Paris, Library" 
                value={localLocation}
                onChange={(e) => setLocalLocation(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLocationSubmit()}
                className="h-9 text-sm"
            />
            <Button size="sm" variant="outline" onClick={handleLocationSubmit} disabled={isGeocoding}>
                {isGeocoding ? '...' : 'Go'}
            </Button>
        </div>
      </div>
    </div>
  );
}
