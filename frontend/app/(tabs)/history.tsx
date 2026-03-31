import React from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cardService } from '../../services';

interface Transaction {
  id: string;
  type: 'RECHARGE' | 'DEBIT' | 'BONUS' | 'REFUND';
  amount: number;
  balanceAfter: number;
  description?: string;
  createdAt: string;
  game?: { name: string };
}

function TransactionItem({ item }: { item: Transaction }) {
  const isCredit = item.amount > 0;
  const icons: Record<string, string> = {
    RECHARGE: '💳',
    DEBIT: '🎮',
    BONUS: '🎁',
    REFUND: '↩️',
  };

  return (
    <View className="bg-white rounded-2xl px-4 py-3 mb-2 flex-row items-center border border-gray-100">
      <View className="w-10 h-10 rounded-full bg-gray-100 items-center justify-center mr-3">
        <Text className="text-xl">{icons[item.type] ?? '💰'}</Text>
      </View>
      <View className="flex-1">
        <Text className="text-gray-900 font-medium text-sm">
          {item.description ?? item.type}
        </Text>
        {item.game && <Text className="text-gray-400 text-xs">{item.game.name}</Text>}
        <Text className="text-gray-400 text-xs">
          {new Date(item.createdAt).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
      </View>
      <View className="items-end">
        <Text
          className={`font-bold text-base ${isCredit ? 'text-green-600' : 'text-red-500'}`}
        >
          {isCredit ? '+' : ''}{item.amount} u
        </Text>
        <Text className="text-gray-400 text-xs">Solde: {item.balanceAfter}</Text>
      </View>
    </View>
  );
}

export default function HistoryScreen() {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => cardService.getTransactions(),
  });

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900">Historique ⏱</Text>
        <Text className="text-gray-500 text-sm mt-1">Vos dernières transactions</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : (
        <FlatList
          data={data?.transactions ?? []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <TransactionItem item={item} />}
          contentContainerClassName="px-4 pb-6"
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Text className="text-4xl mb-4">📊</Text>
              <Text className="text-gray-500 text-base">Aucune transaction pour le moment</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
