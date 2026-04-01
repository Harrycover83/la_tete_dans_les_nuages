import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ScrollView,
  Alert,

  ActivityIndicator,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StarBackground } from '../../components/StarBackground';
import { TEXT_SHADOW } from '../../constants/typography';
import GAZETTE_IMAGES from '../../constants/gazette-images';
import { gazetteService, eventService } from '../../services';

interface Article {
  id: string;
  title: string;
  coverImage?: string;
  category: string;
  publishedAt: string;
  isPinned: boolean;
}

interface Event {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  venueId: string;
  maxCapacity: number;
  priceUnits: number;
  venue: { id: string; name: string; city: string };
  _count: { bookings: number };
}

const CATEGORY_CONFIG: Record<string, { color: string; bg: string }> = {
  NEWS:  { color: '#00D3FF', bg: 'rgba(0,211,255,0.1)' },
  EVENT: { color: '#FE53BB', bg: 'rgba(254,83,187,0.1)' },
  PROMO: { color: '#FFC700', bg: 'rgba(255,199,0,0.1)' },
};
const DEFAULT_CATEGORY = { color: 'rgba(255,255,255,0.5)', bg: 'rgba(255,255,255,0.06)' };

function getCategoryConfig(category: string) {
  return CATEGORY_CONFIG[category.toUpperCase()] ?? DEFAULT_CATEGORY;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatEventDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
}

function ArticlePlaceholder({ featured = false }: { featured?: boolean }) {
  return (
    <View style={{
      width: '100%',
      height: featured ? 200 : 160,
      backgroundColor: '#071333',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    }}>
      <View style={{ position: 'absolute', top: -50, left: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(0,211,255,0.03)' }} />
      <View style={{ position: 'absolute', bottom: -30, right: -30, width: 150, height: 150, borderRadius: 75, backgroundColor: 'rgba(254,83,187,0.03)' }} />
      <Text style={{ fontSize: 32, opacity: 0.25 }}>☁️</Text>
    </View>
  );
}

function SkeletonCard({ featured = false }: { featured?: boolean }) {
  return (
    <View style={{
      borderRadius: 16, marginBottom: 12, overflow: 'hidden',
      backgroundColor: '#071333',
      borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
    }}>
      <View style={{ width: '100%', height: featured ? 200 : 160, backgroundColor: 'rgba(255,255,255,0.03)' }} />
      <View style={{ padding: 16, gap: 8 }}>
        <View style={{ height: 10, width: '25%', borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.06)' }} />
        <View style={{ height: 14, width: '75%', borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.05)' }} />
        <View style={{ height: 10, width: '40%', borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.03)' }} />
      </View>
    </View>
  );
}

function ArticleCard({ item, featured = false }: { item: Article; featured?: boolean }) {
  const cat = getCategoryConfig(item.category);
  const [imgError, setImgError] = React.useState(false);
  const localImage = item.coverImage ? GAZETTE_IMAGES[item.coverImage] : null;
  const imgHeight = featured ? 200 : 160;
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      style={{
        borderRadius: 16,
        marginBottom: 12,
        overflow: 'hidden',
        backgroundColor: '#071333',
        borderWidth: 1,
        borderColor: featured ? 'rgba(0,211,255,0.25)' : 'rgba(255,255,255,0.1)',
      }}
      onPress={() => router.push(`/article/${item.id}`)}
    >
      {/* Image */}
      {localImage ? (
        <Image
          source={localImage}
          style={{ width: '100%', height: imgHeight }}
          resizeMode="cover"
        />
      ) : item.coverImage && !imgError ? (
        <Image
          source={{ uri: item.coverImage }}
          style={{ width: '100%', height: imgHeight }}
          resizeMode="cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <ArticlePlaceholder featured={featured} />
      )}

      {/* Badges */}
      <View style={{ position: 'absolute', top: 12, left: 12, right: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: cat.bg }}>
          <Text style={{ color: cat.color, fontSize: 11, fontWeight: '700', letterSpacing: 0.5 }}>
            {item.category}
          </Text>
        </View>
        {item.isPinned && (
          <View style={{ paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, backgroundColor: 'rgba(255,107,53,0.2)' }}>
            <Text style={{ color: '#FF6B35', fontSize: 11, fontWeight: '700' }}>Épinglé</Text>
          </View>
        )}
      </View>

      {/* Contenu */}
      <View style={{ padding: 16 }}>
        <Text
          style={{ color: '#FFFFFF', fontWeight: '700', fontSize: featured ? 17 : 15, lineHeight: featured ? 24 : 22, marginBottom: 6 }}
          numberOfLines={2}
        >
          {item.title}
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>
          {formatDate(item.publishedAt)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const queryClient = useQueryClient();
  const [bookingEventId, setBookingEventId] = useState<string | null>(null);

  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['articles'],
    queryFn: () => gazetteService.getArticles(),
  });

  const { data: events = [], isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ['events-upcoming'],
    queryFn: () => eventService.getUpcomingEvents(),
  });

  const { data: myBookings = [] } = useQuery<{ eventId: string; status: string }[]>({
    queryKey: ['my-bookings'],
    queryFn: () => eventService.getMyBookings(),
  });

  const bookedEventIds = new Set(
    myBookings.filter((b) => b.status === 'CONFIRMED').map((b) => b.eventId)
  );

  const bookMutation = useMutation({
    mutationFn: (eventId: string) => eventService.bookEvent(eventId),
    onMutate: (eventId) => setBookingEventId(eventId),
    onSuccess: (_, eventId) => {
      setBookingEventId(null);
      queryClient.invalidateQueries({ queryKey: ['events-upcoming'] });
      queryClient.invalidateQueries({ queryKey: ['my-bookings'] });
      const event = events.find((e) => e.id === eventId);
      Alert.alert('Réservation confirmée !', `Votre place pour "${event?.title}" est réservée.`);
    },
    onError: (error: unknown) => {
      setBookingEventId(null);
      const msg = (error as { response?: { data?: { message?: string } } })?.response?.data?.message;
      if (msg === 'EVENT_FULL') Alert.alert('Complet', 'Cet événement est complet.');
      else Alert.alert('Erreur', 'Impossible de réserver. Réessayez.');
    },
  });

  const pinnedArticles: Article[] = data?.articles?.filter((a: Article) => a.isPinned) ?? [];
  const regularArticles: Article[] = data?.articles?.filter((a: Article) => !a.isPinned) ?? [];

  function EventCard({ event }: { event: Event }) {
    const spotsLeft = event.maxCapacity - event._count.bookings;
    const isFull = spotsLeft <= 0;
    const isBooked = bookedEventIds.has(event.id);
    const isBooking = bookingEventId === event.id;

    return (
      <View style={{
        borderRadius: 16,
        backgroundColor: '#071333',
        borderWidth: 1,
        borderColor: isBooked ? 'rgba(0,211,255,0.25)' : 'rgba(254,83,187,0.2)',
        padding: 16,
        marginRight: 12,
        width: 240,
      }}>
        {/* Date + lieu */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Ionicons name="calendar-outline" size={12} color="#FE53BB" />
            <Text style={{ color: '#FE53BB', fontSize: 11, fontWeight: '700' }}>
              {formatEventDate(event.startDate)}
            </Text>
          </View>
          <Text style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11 }}>
            {event.venue.city}
          </Text>
        </View>

        <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '700', lineHeight: 20, marginBottom: 6 }} numberOfLines={2}>
          {event.title}
        </Text>

        {event.description && (
          <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, lineHeight: 17, marginBottom: 12 }} numberOfLines={2}>
            {event.description}
          </Text>
        )}

        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Text style={{ color: isFull ? '#FF6B35' : 'rgba(255,255,255,0.25)', fontSize: 11 }}>
            {isFull ? 'Complet' : `${spotsLeft} place${spotsLeft > 1 ? 's' : ''}`}
          </Text>
          <TouchableOpacity
            onPress={() => !isBooked && !isFull && bookMutation.mutate(event.id)}
            disabled={isFull || isBooking || isBooked}
            style={{
              paddingHorizontal: 14, paddingVertical: 7,
              borderRadius: 10,
              backgroundColor: isBooked
                ? 'rgba(0,211,255,0.12)'
                : isFull
                ? 'rgba(255,255,255,0.04)'
                : 'rgba(254,83,187,0.15)',
              borderWidth: 1,
              borderColor: isBooked
                ? 'rgba(0,211,255,0.3)'
                : isFull
                ? 'rgba(255,255,255,0.06)'
                : 'rgba(254,83,187,0.3)',
              flexDirection: 'row',
              alignItems: 'center',
              gap: 5,
            }}
          >
            {isBooking ? (
              <ActivityIndicator size="small" color="#FE53BB" />
            ) : isBooked ? (
              <>
                <Ionicons name="checkmark-circle" size={13} color="#00D3FF" />
                <Text style={{ color: '#00D3FF', fontSize: 12, fontWeight: '700' }}>Inscrit</Text>
              </>
            ) : (
              <Text style={{ color: isFull ? 'rgba(255,255,255,0.2)' : '#FE53BB', fontSize: 12, fontWeight: '700' }}>
                {isFull ? 'Complet' : 'Réserver'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#040D21' }}>
      <StarBackground />
      <FlatList
        data={isLoading ? [] : regularArticles}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ArticleCard item={item} />}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={refetch}
            tintColor="#00D3FF"
            colors={['#00D3FF']}
          />
        }
        ListHeaderComponent={
          <View>
            {/* Header */}
            <View style={{ paddingTop: 32, paddingBottom: 24 }}>
              <Text style={{ color: 'rgba(0,211,255,0.5)', fontSize: 10, fontWeight: '700', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 8 }}>
                La Tête Dans Les Nuages
              </Text>
              <Text style={{ color: '#FFFFFF', fontSize: 28, fontWeight: '800', letterSpacing: -0.5, ...TEXT_SHADOW.cloudGlow }}>
                La Gazette
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.25)', fontSize: 14, marginTop: 4 }}>
                Actualités · Promos · Événements
              </Text>
            </View>

            {/* Section Événements */}
            {(eventsLoading || events.length > 0) && (
              <View style={{ marginBottom: 28 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <Text style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, letterSpacing: 2.5, fontWeight: '700', textTransform: 'uppercase' }}>
                    Événements à venir
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push('/booking')}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 6,
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 20,
                      borderWidth: 1,
                      borderColor: 'rgba(254,83,187,0.3)',
                      backgroundColor: 'rgba(254,83,187,0.08)',
                    }}
                  >
                    <Ionicons name="calendar" size={13} color="#FE53BB" />
                    <Text style={{ color: '#FE53BB', fontSize: 11, fontWeight: '700' }}>Réserver</Text>
                  </TouchableOpacity>
                </View>
                {eventsLoading ? (
                  <View style={{ flexDirection: 'row', gap: 12 }}>
                    {[0, 1].map((i) => (
                      <View key={i} style={{ width: 240, height: 140, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.03)' }} />
                    ))}
                  </View>
                ) : (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20 }} contentContainerStyle={{ paddingHorizontal: 20 }}>
                    {events.map((event) => (
                      <EventCard key={event.id} event={event} />
                    ))}
                  </ScrollView>
                )}
              </View>
            )}

            {isLoading && (
              <View>
                <SkeletonCard featured />
                <SkeletonCard />
                <SkeletonCard />
              </View>
            )}

            {!isLoading && pinnedArticles.length > 0 && (
              <View style={{ marginBottom: 8 }}>
                <Text style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, letterSpacing: 2.5, fontWeight: '700', textTransform: 'uppercase', marginBottom: 12 }}>
                  À la une
                </Text>
                {pinnedArticles.map((article) => (
                  <ArticleCard key={article.id} item={article} featured />
                ))}
              </View>
            )}

            {!isLoading && regularArticles.length > 0 && (
              <Text style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, letterSpacing: 2.5, fontWeight: '700', textTransform: 'uppercase', marginBottom: 12 }}>
                Toutes les actualités
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={
          !isLoading ? (
            <View style={{ alignItems: 'center', paddingVertical: 60 }}>
              <Text style={{ fontSize: 36, marginBottom: 16 }}>📭</Text>
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 16, fontWeight: '600' }}>
                Aucun article
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13, marginTop: 6 }}>
                Revenez bientôt !
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}
