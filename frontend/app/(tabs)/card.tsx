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
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#6366f1" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900">Ma Carte 💳</Text>
      </View>

      <View className="mx-4 mt-4 bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl p-6 shadow-lg">
        <View className="bg-primary-600 rounded-3xl p-6 items-center">
          <Text className="text-white text-sm font-medium mb-1 opacity-80">Solde disponible</Text>
          <Text className="text-white text-5xl font-bold mb-1">{card?.balance ?? 0}</Text>
          <Text className="text-white text-base opacity-80">unités</Text>
        </View>
      </View>

      <View className="mx-4 mt-6 bg-white rounded-3xl p-6 items-center shadow-sm border border-gray-100">
        <Text className="text-gray-700 font-semibold text-base mb-4">QR Code de votre carte</Text>
        {card?.cardId ? (
          <QRCode value={card.cardId} size={200} color="#1f2937" backgroundColor="white" />
        ) : (
          <View className="w-[200px] h-[200px] bg-gray-100 rounded-xl items-center justify-center">
            <Text className="text-gray-400">QR indisponible</Text>
          </View>
        )}
        <Text className="text-gray-400 text-xs mt-4 font-mono">{card?.cardId}</Text>
      </View>

      <TouchableOpacity
        className="mx-4 mt-4 bg-primary-50 border border-primary-200 rounded-2xl py-3 items-center"
        onPress={() => refetch()}
      >
        <Text className="text-primary-600 font-medium">🔄 Actualiser le solde</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
