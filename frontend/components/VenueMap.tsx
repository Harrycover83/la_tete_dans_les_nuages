import React, { useEffect, useRef } from 'react';
import { View, Text } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import type { Venue, VenueMapProps } from './VenueMap.types';

export type { Venue, VenueMapProps };

const DARK_MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#0D0520' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: 'rgba(255,255,255,0.4)' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0D0520' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: 'rgba(255,255,255,0.06)' }] },
  { featureType: 'administrative.country', elementType: 'labels.text.fill', stylers: [{ color: 'rgba(255,255,255,0.5)' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: 'rgba(255,255,255,0.55)' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1B1040' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#0B022E' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: 'rgba(255,255,255,0.25)' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#251660' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#120D30' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#07010F' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: 'rgba(0,211,255,0.2)' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#0B0B2E' }] },
];

const FRANCE_REGION = {
  latitude: 46.6,
  longitude: 2.5,
  latitudeDelta: 8,
  longitudeDelta: 8,
};

export default function VenueMap({ venues, selectedVenueId, onSelectVenue, onDeselect }: VenueMapProps) {
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (!selectedVenueId) return;
    const venue = venues.find((v) => v.id === selectedVenueId);
    if (!venue) return;
    mapRef.current?.animateToRegion(
      {
        latitude: venue.latitude - 0.01,
        longitude: venue.longitude,
        latitudeDelta: 0.08,
        longitudeDelta: 0.08,
      },
      500,
    );
  }, [selectedVenueId, venues]);

  return (
    <MapView
      ref={mapRef}
      style={{ flex: 1 }}
      provider={PROVIDER_DEFAULT}
      initialRegion={FRANCE_REGION}
      customMapStyle={DARK_MAP_STYLE}
      onPress={onDeselect}
    >
      {venues.map((venue) => (
        <Marker
          key={venue.id}
          coordinate={{ latitude: venue.latitude, longitude: venue.longitude }}
          onPress={() => onSelectVenue(venue)}
        >
          <View style={{ alignItems: 'center' }}>
            <View
              style={{
                backgroundColor: venue.id === selectedVenueId ? '#00D3FF' : '#0D0520',
                borderWidth: 2,
                borderColor: venue.id === selectedVenueId ? '#00D3FF' : 'rgba(0,211,255,0.5)',
                borderRadius: 20,
                paddingHorizontal: 8,
                paddingVertical: 4,
                shadowColor: '#00D3FF',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: venue.id === selectedVenueId ? 0.8 : 0.3,
                shadowRadius: 6,
                elevation: 5,
              }}
            >
              <Text
                style={{
                  color: venue.id === selectedVenueId ? '#07010F' : '#00D3FF',
                  fontSize: 10,
                  fontWeight: '800',
                  letterSpacing: 0.3,
                }}
              >
                TDLN
              </Text>
            </View>
            <View
              style={{
                width: 0,
                height: 0,
                borderLeftWidth: 5,
                borderRightWidth: 5,
                borderTopWidth: 6,
                borderLeftColor: 'transparent',
                borderRightColor: 'transparent',
                borderTopColor: venue.id === selectedVenueId ? '#00D3FF' : 'rgba(0,211,255,0.5)',
              }}
            />
          </View>
        </Marker>
      ))}
    </MapView>
  );
}
