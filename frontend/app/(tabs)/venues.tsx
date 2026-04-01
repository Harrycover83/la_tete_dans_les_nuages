import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  Dimensions,
  ActivityIndicator,
  Linking,
} from 'react-native';
import VenueMap from '../../components/VenueMap';
import { StarBackground } from '../../components/StarBackground';
import { TEXT_SHADOW } from '../../constants/typography';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { venueService } from '../../services';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  phone?: string;
  latitude: number;
  longitude: number;
}

export default function VenuesScreen() {
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const { data: venues = [], isLoading } = useQuery<Venue[]>({
    queryKey: ['venues'],
    queryFn: venueService.getVenues,
  });

  const activeVenues = venues.filter((v) => v.latitude && v.longitude);

  function selectVenue(venue: Venue) {
    setSelectedVenue(venue);
    Animated.spring(slideAnim, { toValue: 1, useNativeDriver: false, tension: 80, friction: 10 }).start();
  }

  function closePanel() {
    Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start(() =>
      setSelectedVenue(null),
    );
  }

  function openMaps(venue: Venue) {
    const address = encodeURIComponent(`${venue.address}, ${venue.city}`);
    Linking.openURL(`https://maps.google.com/?q=${address}`);
  }

  const panelTranslate = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [300, 0],
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#040D21' }} edges={['top']}>
      <StarBackground />
      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingTop: 16, paddingBottom: 12 }}>
        <Text style={{ color: '#FFFFFF', fontSize: 24, fontWeight: '800', letterSpacing: -0.5, ...TEXT_SHADOW.cloudGlow }}>
          Nos Salles
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 13, marginTop: 3 }}>
          {activeVenues.length} centres en France
        </Text>
      </View>

      {/* Map */}
      <View style={{ flex: 1, position: 'relative' }}>
        {isLoading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color="#00D3FF" />
          </View>
        ) : (
          <VenueMap
            venues={activeVenues}
            selectedVenueId={selectedVenue?.id ?? null}
            onSelectVenue={selectVenue}
            onDeselect={closePanel}
          />
        )}

        {/* Bottom sheet venue sélectionnée */}
        {selectedVenue && (
          <Animated.View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              transform: [{ translateY: panelTranslate }],
            }}
          >
            <View style={{
              backgroundColor: '#071333',
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              borderWidth: 1,
              borderColor: 'rgba(0,211,255,0.12)',
              padding: 24,
              paddingBottom: 32,
            }}>
              {/* Barre indicateur */}
              <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.15)', alignSelf: 'center', marginBottom: 20 }} />

              {/* Bouton fermer */}
              <TouchableOpacity
                onPress={closePanel}
                style={{ position: 'absolute', top: 20, right: 20 }}
              >
                <Ionicons name="close" size={20} color="rgba(255,255,255,0.3)" />
              </TouchableOpacity>

              {/* Badge TDLN */}
              <View style={{
                alignSelf: 'flex-start',
                paddingHorizontal: 8, paddingVertical: 3,
                backgroundColor: 'rgba(0,211,255,0.1)',
                borderRadius: 8,
                borderWidth: 1, borderColor: 'rgba(0,211,255,0.2)',
                marginBottom: 8,
              }}>
                <Text style={{ color: '#00D3FF', fontSize: 10, fontWeight: '700', letterSpacing: 1 }}>LA TÊTE DANS LES NUAGES</Text>
              </View>

              <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '800', letterSpacing: -0.3, marginBottom: 4 }}>
                {selectedVenue.name}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 14, marginBottom: 20 }}>
                {selectedVenue.address} — {selectedVenue.city}
              </Text>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                {selectedVenue.phone && (
                  <TouchableOpacity
                    onPress={() => Linking.openURL(`tel:${selectedVenue.phone}`)}
                    style={{
                      flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
                      paddingVertical: 13,
                      backgroundColor: '#071333',
                      borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
                      borderRadius: 14,
                    }}
                  >
                    <Ionicons name="call-outline" size={16} color="rgba(255,255,255,0.5)" />
                    <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, fontWeight: '600' }}>Appeler</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => openMaps(selectedVenue)}
                  style={{
                    flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
                    paddingVertical: 13,
                    backgroundColor: '#00D3FF',
                    borderRadius: 14,
                  }}
                >
                  <Ionicons name="navigate" size={16} color="#07010F" />
                  <Text style={{ color: '#040D21', fontSize: 13, fontWeight: '700' }}>Itinéraire</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        )}
      </View>

      {/* Liste des salles scrollable sous la carte */}
      {!selectedVenue && (
        <View style={{ maxHeight: SCREEN_HEIGHT * 0.22, backgroundColor: '#040D21', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' }}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 14, gap: 10 }}
          >
            {activeVenues.map((venue) => (
              <TouchableOpacity
                key={venue.id}
                onPress={() => selectVenue(venue)}
                style={{
                  paddingHorizontal: 14, paddingVertical: 10,
                  backgroundColor: '#071333',
                  borderRadius: 14,
                  borderWidth: 1, borderColor: 'rgba(0,211,255,0.1)',
                  minWidth: 140,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: '#00D3FF' }} />
                  <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10, fontWeight: '600', letterSpacing: 0.8 }}>
                    {venue.city.toUpperCase()}
                  </Text>
                </View>
                <Text style={{ color: '#FFFFFF', fontSize: 13, fontWeight: '700' }} numberOfLines={1}>
                  {venue.name.replace('TDLN ', '')}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}
