import { Check, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useLocationFilter, AVAILABLE_LOCATIONS } from '@/hooks/useLocationFilter';

export function LocationSelector() {
  const { selectedLocation, setLocation, getLocation } = useLocationFilter();
  const currentLocation = getLocation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <span className="text-lg">{currentLocation.flag}</span>
          <span className="hidden sm:inline">{currentLocation.name}</span>
          <MapPin className="h-4 w-4 sm:hidden" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Shop in your region
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {AVAILABLE_LOCATIONS.map((location) => (
          <DropdownMenuItem
            key={location.code}
            onClick={() => setLocation(location.code)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{location.flag}</span>
              <span>{location.name}</span>
            </div>
            {selectedLocation === location.code && (
              <Check className="h-4 w-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <div className="px-2 py-1.5 text-xs text-muted-foreground">
          Stored locally in your browser only
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
