'use client';

import { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { X } from 'lucide-react';

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
    country?: string;
    state?: string;
    city?: string;
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
  /* eslint-disable @typescript-eslint/no-var-requires */
  const { Country, State, City } = require('country-state-city');

  // Parse comma separated strings back to arrays for local state
  const parseList = (str: string) => str && str !== 'all' && str !== 'All' ? str.split(',') : [];
  
  const [selectedTypes, setSelectedTypes] = useState<string[]>(parseList(filters.type));
  const [selectedCategories, setSelectedCategories] = useState<string[]>(parseList(filters.category));
  const [localLocation, setLocalLocation] = useState(filters.location);

  const [countries, setCountries] = useState<any[]>([]);
  const [states, setStates] = useState<any[]>([]);
  const [cities, setCities] = useState<any[]>([]);

  const [selectedCountry, setSelectedCountry] = useState(filters.country || '');
  const [selectedState, setSelectedState] = useState(filters.state || '');
  const [selectedCity, setSelectedCity] = useState(filters.city || '');

  const [isGeocoding, setIsGeocoding] = useState(false);

  // Sync when parent updates
  useEffect(() => {
    setSelectedTypes(parseList(filters.type));
    setSelectedCategories(parseList(filters.category));
    setLocalLocation(filters.location);
    setSelectedCountry(filters.country || '');
    setSelectedState(filters.state || '');
    setSelectedCity(filters.city || '');
  }, [filters]);

  // Init Countries
  useEffect(() => {
    setCountries(Country.getAllCountries());
    if (filters.country) {
        const c = Country.getAllCountries().find((c: any) => c.name === filters.country);
        if (c) {
          setStates(State.getStatesOfCountry(c.isoCode));
          if (filters.state) {
            const s = State.getStatesOfCountry(c.isoCode).find((s: any) => s.name === filters.state);
            if (s) {
               setCities(City.getCitiesOfState(c.isoCode, s.isoCode));
            }
          }
        }
    }
  }, []);

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

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const countryCode = e.target.value;
      const country = countries.find(c => c.isoCode === countryCode);
      const countryName = country ? country.name : '';
      
      setSelectedCountry(countryName);
      setSelectedState('');
      setSelectedCity('');
      setStates(country ? State.getStatesOfCountry(countryCode) : []);
      setCities([]);
      
      onFilterChange({ ...filters, country: countryName, state: '', city: '' });
  };

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const stateCode = e.target.value;
      const country = countries.find(c => c.name === selectedCountry);
      const state = states.find(s => s.isoCode === stateCode);
      const stateName = state ? state.name : '';

      setSelectedState(stateName);
      setSelectedCity('');
      setCities(country && state ? City.getCitiesOfState(country.isoCode, stateCode) : []);

      onFilterChange({ ...filters, state: stateName, city: '' });
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const cityName = e.target.value;
      setSelectedCity(cityName);
      onFilterChange({ ...filters, city: cityName });
  };

  const clearLocationField = (field: 'country' | 'state' | 'city') => {
      if (field === 'country') {
          setSelectedCountry('');
          setSelectedState('');
          setSelectedCity('');
          setStates([]);
          setCities([]);
          onFilterChange({ ...filters, country: '', state: '', city: '' });
      } else if (field === 'state') {
          setSelectedState('');
          setSelectedCity('');
          setCities([]);
          onFilterChange({ ...filters, state: '', city: '' });
      } else if (field === 'city') {
          setSelectedCity('');
          onFilterChange({ ...filters, city: '' });
      }
  };

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
      bounds: null,
      country: '',
      state: '',
      city: ''
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

      {/* Structured Location Filters */}
      <div className="space-y-3">
        <h4 className="font-bold text-sm">Location</h4>
        
        {/* Country */}
        <div className="flex gap-2">
            <select 
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm p-2"
                value={countries.find(c => c.name === selectedCountry)?.isoCode || ''}
                onChange={handleCountryChange}
            >
                <option value="">Select Country</option>
                {countries.map((c) => (
                    <option key={c.isoCode} value={c.isoCode}>{c.name}</option>
                ))}
            </select>
            {selectedCountry && (
                <Button variant="ghost" size="sm" className="px-2" onClick={() => clearLocationField('country')}>
                    <X className="w-4 h-4" />
                </Button>
            )}
        </div>

        {/* State */}
        <div className="flex gap-2">
            <select 
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm p-2"
                value={states.find(s => s.name === selectedState)?.isoCode || ''}
                onChange={handleStateChange}
                disabled={!selectedCountry}
            >
                <option value="">Select State</option>
                {states.map((s) => (
                    <option key={s.isoCode} value={s.isoCode}>{s.name}</option>
                ))}
            </select>
            {selectedState && (
                <Button variant="ghost" size="sm" className="px-2" onClick={() => clearLocationField('state')}>
                    <X className="w-4 h-4" />
                </Button>
            )}
        </div>

         {/* City */}
         <div className="flex gap-2">
            <select 
                className="w-full rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm p-2"
                value={selectedCity}
                onChange={handleCityChange}
                disabled={!selectedState}
            >
                <option value="">Select City</option>
                {cities.map((c) => (
                    <option key={c.name} value={c.name}>{c.name}</option>
                ))}
            </select>
            {selectedCity && (
                <Button variant="ghost" size="sm" className="px-2" onClick={() => clearLocationField('city')}>
                    <X className="w-4 h-4" />
                </Button>
            )}
         </div>
      </div>

      {/* Text Location Input (Fallback) */}
      <div className="space-y-3 border-t pt-3 dark:border-gray-700">
        <h4 className="font-bold text-xs text-gray-500 uppercase">Specific Address</h4>
        <div className="flex gap-2">
            <Input 
                placeholder="e.g. Eiffel Tower" 
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
