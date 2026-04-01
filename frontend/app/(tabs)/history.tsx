import React from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
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

type TransactionType = Transaction['type'];

const TYPE_CONFIG: Record<TransactionType, { color: string; label: string }> = {
  RECHARGE: { color: '#00D3FF', label: 'Recharge' },
  DEBIT:    { color: '#FE53BB', label: 'Jeu' },
  BONUS:    { color: '#FFC700', label: 'Bonus' },
  REFUND:   { color: '#FF6B35', label: 'Remboursement' },
};

function formatDate(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = d.toDateString() === yesterday.toDateString();

  if (isToday) return `Aujourd'hui · ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
  if (isYesterday) return `Hier · ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }) + ` · ${d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`;
}

function TransactionItem({ item }: { item: Transaction }) {
  const isCredit = item.amount > 0;
  const config = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.RECHARGE;

  return (
    <View style={{
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.04)',
    }}>
      {/* Dot indicateur */}
      <View style={{
        width: 8, height: 8, borderRadius: 4,
        backgroundColor: config.color,
        marginRight: 14,
        opacity: 0.8,
      }} />

      {/* Infos */}
      <View style={{ flex: 1, marginRight: 12 }}>
        <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '500' }} numberOfLines={1}>
          {item.description ?? config.label}
        </Text>
        {item.game && (
          <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 1 }}>
            {item.game.name}
          </Text>
        )}
        <Text style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12, marginTop: 2 }}>
          {formatDate(item.createdAt)}
        </Text>
      </View>

      {/* Montant */}
      <View style={{ alignItems: 'flex-end' }}>
        <Text style={{
          fontSize: 16,
          fontWeight: '700',
          color: isCredit ? '#FFC700' : '#FE53BB',
        }}>
          {isCredit ? '+' : ''}{item.amount}
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.2)', fontSize: 11, marginTop: 2 }}>
          → {item.balanceAfter} u
        </Text>
      </View>
    </View>
  );
}

function SkeletonRow() {
  return (
    <View style={{
      flexDirection: 'row', alignItems: 'center',
      paddingVertical: 14, paddingHorizontal: 20,
      borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)',
    }}>
      <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.06)', marginRight: 14 }} />
      <View style={{ flex: 1, gap: 6 }}>
        <View style={{ height: 12, width: '60%', borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.06)' }} />
        <View style={{ height: 10, width: '35%', borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.04)' }} />
      </View>
      <View style={{ alignItems: 'flex-end', gap: 6 }}>
        <View style={{ height: 14, width: 40, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.06)' }} />
        <View style={{ height: 10, width: 30, borderRadius: 6, backgroundColor: 'rgba(255,255,255,0.04)' }} />
      </View>
    </View>
  );
}

export default function HistoryScreen() {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => cardService.getTransactions(),
  });

  const transactions: Transaction[] = data?.transactions ?? [];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#07010F' }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 24, paddingTop: 32, paddingBottom: 20, flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
        <View>
          <Text style={{ color: '#FFFFFF', fontSize: 24, fontWeight: '800', letterSpacing: -0.5 }}>
            Historique
          </Text>
          <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 14, marginTop: 4 }}>
            Vos transactions récentes
          </Text>
        </View>
        {!isLoading && transactions.length > 0 && (
          <Text style={{ color: 'rgba(0,211,255,0.5)', fontSize: 13, fontWeight: '600', marginBottom: 4 }}>
            {transactions.length}
          </Text>
        )}
      </View>

      {/* Liste dans une card */}
      <View style={{
        marginHorizontal: 24,
        flex: 1,
        borderRadius: 20,
        backgroundColor: '#0D0520',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        overflow: 'hidden',
      }}>
        {isLoading ? (
          <View>
            {[0, 1, 2, 3, 4, 5].map(i => <SkeletonRow key={i} />)}
          </View>
        ) : (
          <FlatList
            data={transactions}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <TransactionItem item={item} />}
            contentContainerStyle={{ paddingBottom: 16 }}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isRefetching}
                onRefresh={refetch}
                tintColor="#00D3FF"
                colors={['#00D3FF']}
              />
            }
            ListEmptyComponent={
              <View style={{ alignItems: 'center', paddingVertical: 60, paddingHorizontal: 24 }}>
                <Text style={{ fontSize: 36, marginBottom: 16 }}>📭</Text>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 16, fontWeight: '600', marginBottom: 8 }}>
                  Aucune transaction
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.25)', fontSize: 13, textAlign: 'center', lineHeight: 20 }}>
                  Vos recharges et parties apparaîtront ici
                </Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}
