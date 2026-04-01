import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
  Dimensions,
  Image,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { StarBackground } from '../../components/StarBackground';
import { rechargeService } from '../../services';

// Images décoratives — placer sonic.png et pacman.png dans assets/images/ pour les activer
const SONIC_IMG = (() => { try { return require('../../assets/images/sonic.png'); } catch { return null; } })();
const PACMAN_IMG = (() => { try { return require('../../assets/images/pacman.png'); } catch { return null; } })();

const STRIPE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';
const { width } = Dimensions.get('window');
const CARD_GAP = 8;
const CARD_WIDTH = (width - 32 - CARD_GAP * 2) / 3;

interface Pack {
  id: string;
  name: string;
  priceEur: number;
  units: number;
  bonusUnits: number;
}

function PackCard({
  pack,
  selected,
  isBestOffer,
  flex,
  onSelect,
}: {
  pack: Pack;
  selected: boolean;
  isBestOffer: boolean;
  flex?: boolean;
  onSelect: () => void;
}) {
  const totalUnits = pack.units + pack.bonusUnits;
  const borderColor = selected
    ? '#FFFFFF'
    : isBestOffer
    ? '#C8960A'
    : 'rgba(255,255,255,0.18)';

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onSelect}
      style={{
        ...(flex ? { flex: 1 } : { width: CARD_WIDTH }),
        borderRadius: 10,
        borderWidth: selected ? 2.5 : 1.5,
        borderColor,
        overflow: 'hidden',
      }}
    >
      <LinearGradient
        colors={
          selected
            ? ['#2A3D9A', '#1B2C7A']
            : isBestOffer
            ? ['#3A2A00', '#251C00']
            : ['#162272', '#0D1655']
        }
        style={{ padding: 10, alignItems: 'center', minHeight: 90 }}
      >
        {/* Total units */}
        <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '800', textAlign: 'center', lineHeight: 18 }}>
          {totalUnits} unités
        </Text>

        {/* Base + bonus breakdown */}
        <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 9.5, marginTop: 3, textAlign: 'center' }}>
          {pack.units} + {pack.bonusUnits} bonus
        </Text>

        {/* Price */}
        <Text style={{
          color: isBestOffer ? '#FFC700' : '#FFFFFF',
          fontSize: 22,
          fontWeight: '900',
          marginTop: 6,
          textAlign: 'center',
        }}>
          {pack.priceEur} €
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

function RechargeContent() {
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null);
  const [loading, setLoading] = useState(false);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const { data: packs, isLoading } = useQuery({
    queryKey: ['packs'],
    queryFn: rechargeService.getPacks,
  });

  async function handleRecharge() {
    if (!selectedPack) return;
    setLoading(true);
    try {
      const { clientSecret } = await rechargeService.createPaymentIntent(selectedPack.id);
      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Tête dans les Nuages',
      });
      if (initError) { Alert.alert('Erreur', initError.message); return; }
      const { error: presentError } = await presentPaymentSheet();
      if (presentError) {
        if (presentError.code !== 'Canceled') Alert.alert('Paiement échoué', presentError.message);
      } else {
        const total = selectedPack.units + selectedPack.bonusUnits;
        Alert.alert('Paiement réussi !', `${total} unités créditées sous peu.`);
        setSelectedPack(null);
      }
    } catch {
      Alert.alert('Erreur', 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#00D3FF" />
      </View>
    );
  }

  const row1 = packs?.slice(0, 3) ?? [];
  const row2 = packs?.slice(3, 6) ?? [];

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Subtitle bande */}
      <View style={{
        backgroundColor: 'rgba(255,255,255,0.07)',
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginBottom: 18,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
      }}>
        <Text style={{
          color: 'rgba(255,255,255,0.6)',
          fontSize: 11,
          textAlign: 'center',
          fontWeight: '600',
          letterSpacing: 0.5,
        }}>
          UNITÉS VALABLES 18 MOIS À PARTIR DE LA DATE D'ACHAT
        </Text>
      </View>

      {/* Row 1 */}
      <View style={{ flexDirection: 'row', gap: CARD_GAP, marginBottom: CARD_GAP }}>
        {row1.map((pack: Pack) => (
          <PackCard
            key={pack.id}
            pack={pack}
            selected={selectedPack?.id === pack.id}
            isBestOffer={false}
            onSelect={() => setSelectedPack(pack)}
          />
        ))}
      </View>

      {/* Row 2 — first card standalone, last 2 dans l'encadrement doré */}
      <View style={{ flexDirection: 'row', gap: CARD_GAP, alignItems: 'flex-start' }}>
        {/* 50€ — card normale */}
        {row2[0] && (
          <PackCard
            key={row2[0].id}
            pack={row2[0]}
            selected={selectedPack?.id === row2[0].id}
            isBestOffer={false}
            onSelect={() => setSelectedPack(row2[0])}
          />
        )}

        {/* 75€ + 100€ — encadrement MEILLEURES OFFRES */}
        {row2.length >= 3 && (
          <View style={{
            flex: 1,
            borderWidth: 2,
            borderColor: '#C8960A',
            borderRadius: 12,
            padding: 4,
          }}>
            <View style={{ flexDirection: 'row', gap: CARD_GAP, marginBottom: 5 }}>
              {[row2[1], row2[2]].map((pack: Pack) => (
                <PackCard
                  key={pack.id}
                  pack={pack}
                  selected={selectedPack?.id === pack.id}
                  isBestOffer
                  flex
                  onSelect={() => setSelectedPack(pack)}
                />
              ))}
            </View>
            <View style={{
              backgroundColor: '#C8960A',
              borderRadius: 6,
              paddingVertical: 5,
              alignItems: 'center',
            }}>
              <Text style={{ color: '#000000', fontWeight: '800', fontSize: 10, letterSpacing: 1 }}>
                MEILLEURES OFFRES
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Disclaimer durée */}
      <Text style={{
        color: 'rgba(255,255,255,0.25)',
        fontSize: 10,
        textAlign: 'center',
        marginTop: 20,
        marginBottom: 4,
      }}>
        Les unités sont valables 18 mois à partir de la date d'achat.
      </Text>

      {/* Bouton payer */}
      <TouchableOpacity
        onPress={handleRecharge}
        disabled={!selectedPack || loading}
        style={{ marginTop: 20 }}
      >
        <LinearGradient
          colors={selectedPack ? ['#00D3FF', '#0099CC'] : ['#1A2040', '#111830']}
          style={{
            borderRadius: 14,
            paddingVertical: 17,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: selectedPack ? 'transparent' : 'rgba(255,255,255,0.08)',
          }}
        >
          {loading ? (
            <ActivityIndicator color={selectedPack ? '#07010F' : 'rgba(255,255,255,0.2)'} />
          ) : (
            <Text style={{
              fontWeight: '800',
              fontSize: 16,
              color: selectedPack ? '#07010F' : 'rgba(255,255,255,0.2)',
              letterSpacing: 0.3,
            }}>
              {selectedPack
                ? `Payer ${selectedPack.priceEur} € — ${selectedPack.units + selectedPack.bonusUnits} unités`
                : 'Sélectionnez un pack'}
            </Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
}

export default function RechargeScreen() {
  return (
    <StripeProvider publishableKey={STRIPE_KEY}>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0B022E' }}>
        <StarBackground />

        {/* Décoration Sonic (haut droite) */}
        {SONIC_IMG && (
          <Image
            source={SONIC_IMG}
            style={{ position: 'absolute', top: 10, right: 0, width: 110, height: 140, zIndex: 10, resizeMode: 'contain' }}
            pointerEvents="none"
          />
        )}

        {/* Décoration Pac-Man (bas droite) */}
        {PACMAN_IMG && (
          <Image
            source={PACMAN_IMG}
            style={{ position: 'absolute', bottom: 90, right: 8, width: 70, height: 70, zIndex: 10, resizeMode: 'contain' }}
            pointerEvents="none"
          />
        )}

        {/* Symbole handicap (bas gauche) */}
        <View style={{
          position: 'absolute', bottom: 96, left: 12, zIndex: 10,
          width: 34, height: 34, borderRadius: 17,
          backgroundColor: 'rgba(0,100,200,0.9)',
          alignItems: 'center', justifyContent: 'center',
        }} pointerEvents="none">
          <Text style={{ fontSize: 18 }}>♿</Text>
        </View>

        {/* Header */}
        <LinearGradient
          colors={['rgba(27,28,114,0.95)', 'rgba(11,2,46,0)']}
          style={{ paddingHorizontal: 20, paddingTop: 28, paddingBottom: 24 }}
        >
          <Text style={{
            color: '#FFFFFF',
            fontSize: 22,
            fontWeight: '900',
            textAlign: 'center',
            letterSpacing: 2,
            textTransform: 'uppercase',
          }}>
            Choisir votre produit
          </Text>
        </LinearGradient>

        <RechargeContent />
      </SafeAreaView>
    </StripeProvider>
  );
}

