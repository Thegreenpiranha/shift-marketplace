import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface LocationOption {
  code: string;
  name: string;
  flag: string;
  keywords: string[]; // Keywords to match in listing location
}

export const AVAILABLE_LOCATIONS: LocationOption[] = [
  {
    code: 'ALL',
    name: 'All Locations',
    flag: '🌍',
    keywords: [],
  },
  {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    keywords: ['uk', 'united kingdom', 'england', 'scotland', 'wales', 'northern ireland', 'britain', 'great britain'],
  },
  {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    keywords: ['us', 'usa', 'united states', 'america'],
  },
  {
    code: 'EU',
    name: 'European Union',
    flag: '🇪🇺',
    keywords: ['eu', 'europe', 'germany', 'france', 'spain', 'italy', 'netherlands', 'belgium', 'austria', 'portugal', 'greece', 'ireland', 'denmark', 'sweden', 'finland'],
  },
  {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    keywords: ['canada', 'canadian'],
  },
  {
    code: 'AU',
    name: 'Australia',
    flag: '🇦🇺',
    keywords: ['australia', 'australian', 'sydney', 'melbourne', 'brisbane'],
  },
];

interface LocationFilterStore {
  selectedLocation: string; // Location code
  setLocation: (code: string) => void;
  getLocation: () => LocationOption;
}

export const useLocationFilter = create<LocationFilterStore>()(
  persist(
    (set, get) => ({
      selectedLocation: 'GB', // Default to UK
      setLocation: (code: string) => set({ selectedLocation: code }),
      getLocation: () => {
        const code = get().selectedLocation;
        return AVAILABLE_LOCATIONS.find(loc => loc.code === code) || AVAILABLE_LOCATIONS[1]; // Default to UK if not found
      },
    }),
    {
      name: 'shift-location-filter', // localStorage key
    }
  )
);

// Helper function to check if a listing matches the selected location
export function isListingInLocation(listingLocation: string, listingCurrency: string, selectedLocationCode: string): boolean {
  // If "All Locations" is selected, show everything
  if (selectedLocationCode === 'ALL') {
    return true;
  }

  const location = AVAILABLE_LOCATIONS.find(loc => loc.code === selectedLocationCode);
  if (!location) {
    return true; // If location not found, show everything
  }

  const normalizedLocation = listingLocation.toLowerCase();
  
  // Check if listing location matches any of the keywords
  const matchesKeywords = location.keywords.some(keyword => 
    normalizedLocation.includes(keyword.toLowerCase())
  );

  // For UK, also check if currency is GBP
  if (selectedLocationCode === 'GB') {
    return matchesKeywords || listingCurrency === 'GBP';
  }

  return matchesKeywords;
}
