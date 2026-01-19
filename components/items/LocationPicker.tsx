import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Search } from 'lucide-react';
import toast from 'react-hot-toast';

const LeafletMap = dynamic(
  () => import('./LeafletMap'),
  { ssr: false, loading: () => <div className="h-full w-full bg-gray-100 animate-pulse flex items-center justify-center">Loading Map...</div> }
);

interface LocationPickerProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
}

export default function LocationPicker({ onLocationSelect, initialLat = 19.0760, initialLng = 72.8777 }: LocationPickerProps) {
  const [query, setQuery] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number] | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(async () => {
        if (query.length > 2 && showSuggestions) {
            try {
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&addressdetails=1&limit=5`);
                const data = await res.json();
                setSuggestions(data);
            } catch (error) {
                console.error("Autosuggest error", error);
            }
        } else if (query.length <= 2) {
            setSuggestions([]);
        }
    }, 500); // 500ms debounce

    return () => clearTimeout(timer);
  }, [query, showSuggestions]);

  const handleManualSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setShowSuggestions(false);

    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
      const data = await res.json();

      if (data && data.length > 0) {
        selectLocation(data[0]);
      } else {
        toast.error('Location not found');
      }
    } catch (error) {
        console.error(error);
      toast.error('Search failed');
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const selectLocation = (location: any) => {
      const lat = parseFloat(location.lat);
      const lon = parseFloat(location.lon);
      
      setMapCenter([lat, lon]);
      onLocationSelect(lat, lon);
      setQuery(location.display_name.split(',')[0]); // Shorten name for input
      setShowSuggestions(false);
      toast.success(`Selected: ${location.display_name.split(',')[0]}`);
  };
  
  return (
    <div className="space-y-2" ref={wrapperRef}>
      <div className="flex gap-2 relative">
        <div className="relative flex-1">
            <input
                type="text"
                placeholder="Search city or area..."
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm dark:bg-gray-900 dark:border-gray-700"
                value={query}
                onChange={(e) => {
                    setQuery(e.target.value);
                    setShowSuggestions(true);
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleManualSearch(e)}
                onFocus={() => setShowSuggestions(true)}
            />
            {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-50 w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md mt-1 shadow-lg max-h-60 overflow-auto">
                    {suggestions.map((suggestion, index) => (
                        <li 
                            key={index}
                            className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm"
                            onClick={() => selectLocation(suggestion)}
                        >
                            {suggestion.display_name}
                        </li>
                    ))}
                </ul>
            )}
        </div>
        <button 
            type="button"
            onClick={handleManualSearch}
            className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 h-10"
        >
            <Search className="h-4 w-4" />
        </button>
      </div>

      <div className="h-[300px] w-full rounded-md overflow-hidden border border-gray-300 dark:border-gray-700 relative z-0">
        <LeafletMap 
            initialLat={initialLat} 
            initialLng={initialLng} 
            onLocationSelect={onLocationSelect} 
            searchResultCenter={mapCenter}
        />
        <div className="absolute bottom-2 left-2 bg-white/80 dark:bg-black/80 p-2 rounded text-xs pointer-events-none z-[1000]">
            Click on map to select location
        </div>
      </div>
    </div>
  );
}
