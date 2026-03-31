import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import QRCode from 'react-native-qrcode-svg';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cardService } from '../../services';
import { useCardStore } from '../../stores/card.store';

const POLL_INTERVAL = parseInt(process.env.EXPO_PUBLIC_BALANCE_POLL_INTERVAL_MS ?? '30000');

export default function CardScreen() {
  const { setCard } = useCardStore();

  const { data: card, isLoading, refetch } = useQuery({
    queryKey: ['card'],
    queryFn: cardService.getMyCard,
    refetchInterval: POLL_INTERVAL,
  });

  useEffect(() => {
    if (card) {
      setCard(card.cardId, card.balance);
    }
  }, [card, setCard]);

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-bg-primary">
        <ActivityIndicator size="large" color="#00D3FF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-neon-cyan">Ma Carte 💳</Text>
      </View>

      <View className="mx-4 mt-4 bg-gradient-to-br from-neon-cyan/10 to-neon-pink/10 rounded-3xl p-6 shadow-lg border-2 border-neon-cyan/30">
        <View className="bg-bg-secondary rounded-3xl p-6 items-center border border-neon-pink/20">
          <Text className="text-text-secondary text-sm font-medium mb-1 opacity-80">Solde disponible</Text>
          <Text className="text-neon-yellow text-5xl font-bold mb-1">{card?.balance ?? 0}</Text>
          <Text className="text-text-secondary text-base opacity-80">unités</Text>
        </View>
      </View>

      <View className="mx-4 mt-6 bg-bg-secondary rounded-3xl p-6 items-center shadow-sm border-2 border-neon-cyan/20">
        <Text className="text-text-primary font-semibold text-base mb-4">QR Code de votre carte</Text>
        {card?.cardId ? (
          <QRCode value={card.cardId} size={200} color="#00D3FF" backgroundColor="#1B1C72" />
        ) : (
          <View className="w-[200px] h-[200px] bg-bg-primary rounded-xl items-center justify-center">
            <Text className="text-text-secondary">QR indisponible</Text>
          </View>
        )}
        <Text className="text-text-secondary text-xs mt-4 font-mono">{card?.cardId}</Text>
      </View>

      <TouchableOpacity
        className="mx-4 mt-4 bg-neon-cyan/10 border-2 border-neon-cyan rounded-2xl py-3 items-center"
        onPress={() => refetch()}
      >
        <Text className="text-neon-cyan font-medium">🔄 Actualiser le solde</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
