import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView, Alert, Platform } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { StarBackground } from '../../components/StarBackground';
import { TEXT_SHADOW } from '../../constants/typography';
import { cardService } from '../../services';
import { useCardStore } from '../../stores/card.store';
import { storage } from '../../utils/storage';
import { STORAGE_KEYS } from '../../constants/storage-keys';

const POLL_INTERVAL = parseInt(process.env.EXPO_PUBLIC_BALANCE_POLL_INTERVAL_MS ?? '30000');

export default function CardScreen() {
  const { setCard } = useCardStore();
  const [isDownloadingPass, setIsDownloadingPass] = useState(false);

  const { data: card, isLoading, refetch } = useQuery({
    queryKey: ['card'],
    queryFn: cardService.getMyCard,
    refetchInterval: POLL_INTERVAL,
  });

  useEffect(() => {
    if (card) setCard(card.cardId, card.balance);
  }, [card, setCard]);

  async function handleAddToWallet() {
    if (Platform.OS !== 'ios') {
      Alert.alert('Apple Wallet', 'Cette fonctionnalité est disponible uniquement sur iOS.');
      return;
    }
    try {
      setIsDownloadingPass(true);
      const token = await storage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      const url = cardService.getWalletPassUrl();
      const destPath = `${FileSystem.cacheDirectory}tdln.pkpass`;

      const { status } = await FileSystem.downloadAsync(url, destPath, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (status !== 200) {
        Alert.alert('Erreur', 'Impossible de générer le pass. Réessayez plus tard.');
        return;
      }

      const canShare = await Sharing.isAvailableAsync();
      if (!canShare) {
        Alert.alert('Non disponible', 'Le partage de fichiers n\'est pas disponible sur cet appareil.');
        return;
      }

      await Sharing.shareAsync(destPath, {
        mimeType: 'application/vnd.apple.pkpass',
        UTI: 'com.apple.pkpass',
      });
    } catch {
      Alert.alert('Erreur', 'Une erreur est survenue. Réessayez.');
    } finally {
      setIsDownloadingPass(false);
    }
  }

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-bg-secondary">
        <StarBackground />
        <ActivityIndicator size="large" color="#00D3FF" />
      </SafeAreaView>
    );
  }

  const shortId = card?.cardId ? `${card.cardId.slice(0, 8)}···${card.cardId.slice(-6)}` : '—';

  return (
    <SafeAreaView className="flex-1 bg-bg-secondary">
      <StarBackground />
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-6 pt-8 pb-2 flex-row items-center justify-between">
          <Text className="text-white text-2xl font-bold tracking-tight" style={TEXT_SHADOW.cloudGlow}>Ma Carte</Text>
          <TouchableOpacity
            onPress={() => refetch()}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: 'rgba(0,211,255,0.08)',
              alignItems: 'center',
              justifyContent: 'center',
              borderWidth: 1,
              borderColor: 'rgba(0,211,255,0.15)',
            }}
          >
            <Ionicons name="refresh" size={16} color="rgba(0,211,255,0.8)" />
          </TouchableOpacity>
        </View>

        {/* Carte Infinite hero */}
        <View style={{ marginHorizontal: 24, marginTop: 20 }}>
          <LinearGradient
            colors={['#1A1A1A', '#0A0A12', '#000000']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              height: 210,
              borderRadius: 20,
              overflow: 'hidden',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.12)',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 16 },
              shadowOpacity: 0.6,
              shadowRadius: 24,
              elevation: 20,
            }}
          >
            {/* Bande holographique diagonale */}
            <LinearGradient
              colors={[
                'rgba(255,255,255,0)',
                'rgba(180,140,255,0.08)',
                'rgba(0,211,255,0.12)',
                'rgba(255,200,80,0.08)',
                'rgba(255,80,180,0.06)',
                'rgba(255,255,255,0)',
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
              }}
            />

            {/* Reflet haut */}
            <LinearGradient
              colors={['rgba(255,255,255,0.07)', 'rgba(255,255,255,0)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0,
                height: 80,
              }}
            />

            {/* Micro-texture grille */}
            <View style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              opacity: 0.03,
              backgroundColor: 'transparent',
              borderWidth: 0,
            }} />

            <View style={{ flex: 1, padding: 22, justifyContent: 'space-between' }}>
              {/* Top row — Marque + nuage */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <View>
                  <Text style={{
                    color: 'rgba(255,255,255,0.9)',
                    fontSize: 10,
                    fontWeight: '800',
                    letterSpacing: 3.5,
                    textTransform: 'uppercase',
                  }}>
                    Tête dans les Nuages
                  </Text>
                  <Text style={{
                    color: 'rgba(255,200,80,0.7)',
                    fontSize: 8,
                    fontWeight: '600',
                    letterSpacing: 4,
                    marginTop: 2,
                  }}>
                    INFINITE
                  </Text>
                </View>
                <Text style={{ fontSize: 20, opacity: 0.9 }}>☁️</Text>
              </View>

              {/* Puce EMV */}
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <LinearGradient
                  colors={['#D4AF37', '#F5D875', '#B8962E', '#E8C84A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={{
                    width: 40,
                    height: 30,
                    borderRadius: 5,
                    borderWidth: 0.5,
                    borderColor: 'rgba(212,175,55,0.5)',
                    overflow: 'hidden',
                  }}
                >
                  {/* Lignes de la puce */}
                  <View style={{ flex: 1, justifyContent: 'space-between', padding: 3 }}>
                    <View style={{ height: 1, backgroundColor: 'rgba(0,0,0,0.25)' }} />
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <View style={{ width: 14, height: 10, borderRadius: 1, backgroundColor: 'rgba(0,0,0,0.2)' }} />
                      <View style={{ width: 14, height: 10, borderRadius: 1, backgroundColor: 'rgba(0,0,0,0.2)' }} />
                    </View>
                    <View style={{ height: 1, backgroundColor: 'rgba(0,0,0,0.25)' }} />
                  </View>
                </LinearGradient>

                {/* Solde */}
                <View>
                  <Text style={{
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: 9,
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                    marginBottom: 2,
                  }}>
                    Solde disponible
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 5 }}>
                    <Text style={{
                      color: '#FFFFFF',
                      fontSize: 44,
                      fontWeight: '800',
                      lineHeight: 46,
                      textShadowColor: 'rgba(255,255,255,0.15)',
                      textShadowOffset: { width: 0, height: 1 },
                      textShadowRadius: 8,
                    }}>
                      {card?.balance ?? 0}
                    </Text>
                    <Text style={{ color: 'rgba(255,200,80,0.85)', fontSize: 13, fontWeight: '600', marginBottom: 4 }}>
                      unités
                    </Text>
                  </View>
                </View>
              </View>

              {/* Bottom row — ID + ondes contact */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <Text style={{
                  color: 'rgba(255,255,255,0.22)',
                  fontSize: 10,
                  fontFamily: 'monospace',
                  letterSpacing: 1.5,
                }}>
                  {shortId}
                </Text>
                {/* Symbole NFC / sans contact */}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 2, marginBottom: 2 }}>
                  {[8, 12, 16].map((size, i) => (
                    <View key={i} style={{
                      width: size,
                      height: size,
                      borderRadius: size / 2,
                      borderWidth: 1.2,
                      borderColor: `rgba(255,255,255,${0.15 + i * 0.1})`,
                      borderLeftColor: 'transparent',
                      borderBottomColor: 'transparent',
                      transform: [{ rotate: '45deg' }],
                    }} />
                  ))}
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Section NFC */}
        <View
          style={{
            marginHorizontal: 24,
            marginTop: 16,
            borderRadius: 24,
            backgroundColor: '#071333',
            borderWidth: 1,
            borderColor: 'rgba(0,211,255,0.1)',
            padding: 28,
            alignItems: 'center',
          }}
        >
          <Text style={{
            color: 'rgba(255,255,255,0.3)',
            fontSize: 10,
            letterSpacing: 3,
            textTransform: 'uppercase',
            marginBottom: 20,
            fontWeight: '600',
          }}>
            Paiement sans contact
          </Text>

          {/* Icône NFC */}
          <View style={{
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: 'rgba(0,211,255,0.06)',
            borderWidth: 1,
            borderColor: 'rgba(0,211,255,0.15)',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 16,
          }}>
            {/* Ondes NFC concentriques */}
            {[40, 56, 72, 88].map((size, i) => (
              <View key={i} style={{
                position: 'absolute',
                width: size,
                height: size,
                borderRadius: size / 2,
                borderWidth: 1.5,
                borderColor: `rgba(0,211,255,${0.5 - i * 0.1})`,
                borderLeftColor: 'transparent',
                borderBottomColor: 'transparent',
                transform: [{ rotate: '45deg' }],
              }} />
            ))}
            <Ionicons name="wifi" size={28} color="rgba(0,211,255,0.8)" style={{ transform: [{ rotate: '90deg' }] }} />
          </View>

          <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '700', marginBottom: 6 }}>
            Carte NFC active
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, textAlign: 'center', lineHeight: 20 }}>
            Approchez votre téléphone{'\n'}des bornes en salle pour payer
          </Text>

          {/* ID de la carte */}
          <View style={{
            marginTop: 20,
            paddingVertical: 10,
            paddingHorizontal: 16,
            borderRadius: 10,
            backgroundColor: 'rgba(0,211,255,0.05)',
            borderWidth: 1,
            borderColor: 'rgba(0,211,255,0.1)',
          }}>
            <Text style={{
              color: 'rgba(0,211,255,0.5)',
              fontSize: 11,
              fontFamily: 'monospace',
              letterSpacing: 1.5,
            }}>
              {shortId}
            </Text>
          </View>
        </View>

        {/* Bouton Apple Wallet */}
        {Platform.OS === 'ios' && (
          <TouchableOpacity
            onPress={handleAddToWallet}
            disabled={isDownloadingPass || !card}
            style={{
              marginHorizontal: 24,
              marginTop: 16,
              borderRadius: 16,
              overflow: 'hidden',
              opacity: isDownloadingPass || !card ? 0.5 : 1,
            }}
          >
            <LinearGradient
              colors={['#1C2040', '#0E1530']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                paddingVertical: 16,
                borderRadius: 16,
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.1)',
              }}
            >
              {isDownloadingPass ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Text style={{ fontSize: 20 }}>🍎</Text>
                  <Text style={{ color: '#FFFFFF', fontWeight: '700', fontSize: 15, letterSpacing: 0.2 }}>
                    Ajouter au Wallet Apple
                  </Text>
                </>
              )}
            </LinearGradient>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
