export interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  phone?: string;
  latitude: number;
  longitude: number;
}

export interface VenueMapProps {
  venues: Venue[];
  selectedVenueId: string | null;
  onSelectVenue: (venue: Venue) => void;
  onDeselect: () => void;
}
