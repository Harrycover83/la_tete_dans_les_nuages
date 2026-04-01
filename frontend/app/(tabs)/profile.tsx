import React from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, FlatList } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StarBackground } from '../../components/StarBackground';
import { TEXT_SHADOW } from '../../constants/typography';
import { useAuthStore } from '../../stores/auth.store';
import { userService, cardService, leaderboardService } from '../../services';
import { ROUTES } from '../../constants/routes';

interface UserBadge {
  id: string;
  badge: { name: string; icon: string };
}

interface UserStats {
  totalXp: number;
  gameSessions: { id: string }[];
  userBadges: UserBadge[];
}

interface Transaction {
  id: string;
  type: 'RECHARGE' | 'DEBIT' | 'BONUS' | 'REFUND';
  amount: number;
  description?: string;
  createdAt: string;
}

const TX_CONFIG = {
  RECHARGE: { color: '#00D3FF', icon: 'arrow-down-circle-outline' as const, sign: '+' },
  DEBIT:    { color: '#FE53BB', icon: 'arrow-up-circle-outline' as const, sign: '-' },
  BONUS:    { color: '#FFC700', icon: 'star-outline' as const, sign: '+' },
  REFUND:   { color: '#FF6B35', icon: 'refresh-outline' as const, sign: '+' },
};

const MENU_ITEMS = [
  { icon: 'pencil-outline' as const, label: 'Modifier le profil', route: ROUTES.EDIT_PROFILE },
  { icon: 'notifications-outline' as const, label: 'Notifications', route: ROUTES.NOTIFICATIONS },
  { icon: 'help-circle-outline' as const, label: 'Aide & Support', route: ROUTES.SUPPORT },
];

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const { data: stats } = useQuery<UserStats>({
    queryKey: ['user-stats', user?.id],
    queryFn: () => leaderboardService.getUserStats(user!.id),
    enabled: !!user?.id,
  });

  const { data: txData } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => cardService.getTransactions(1, 5),
  });

  const recentTransactions: Transaction[] = txData?.transactions ?? [];

  function handleLogout() {
    Alert.alert('Déconnexion', 'Êtes-vous sûr ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnecter', style: 'destructive', onPress: logout },
    ]);
  }

  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase() || '?';

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#040D21' }}>
      <StarBackground />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>

        {/* Hero */}
        <View style={{ paddingHorizontal: 24, paddingTop: 32, paddingBottom: 28 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
            {/* Avatar avec anneau neon */}
            <View style={{ position: 'relative' }}>
              <View style={{
                width: 68, height: 68, borderRadius: 34,
                backgroundColor: 'rgba(0,211,255,0.08)',
                borderWidth: 2,
                borderColor: 'rgba(0,211,255,0.5)',
                alignItems: 'center', justifyContent: 'center',
                shadowColor: '#00D3FF',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.4,
                shadowRadius: 12,
              }}>
                <Text style={{ color: '#00D3FF', fontSize: 24, fontWeight: '800' }}>{initials}</Text>
              </View>
            </View>

            {/* Nom & email */}
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#FFFFFF', fontSize: 20, fontWeight: '700', letterSpacing: -0.3, ...TEXT_SHADOW.cloudGlow }}>
                {user?.firstName} {user?.lastName}
              </Text>
              <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginTop: 2 }}>
                {user?.email}
              </Text>
              {!user?.emailVerified && (
                <View style={{
                  marginTop: 6, alignSelf: 'flex-start',
                  paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
                  backgroundColor: 'rgba(255,199,0,0.08)',
                  borderWidth: 1, borderColor: 'rgba(255,199,0,0.2)',
                }}>
                  <Text style={{ color: '#FFC700', fontSize: 10, fontWeight: '600', letterSpacing: 0.5 }}>
                    EMAIL NON VÉRIFIÉ
                  </Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
          <Text style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, letterSpacing: 2.5, fontWeight: '700', textTransform: 'uppercase', marginBottom: 12 }}>
            Statistiques
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {[
              { value: stats?.totalXp ?? 0, label: 'XP', color: '#00D3FF' },
              { value: stats?.gameSessions?.length ?? 0, label: 'Parties', color: '#FE53BB' },
              { value: stats?.userBadges?.length ?? 0, label: 'Badges', color: '#FFC700' },
            ].map((stat) => (
              <View key={stat.label} style={{
                flex: 1, padding: 16, borderRadius: 16,
                backgroundColor: '#071333',
                borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
                alignItems: 'center',
              }}>
                <Text style={{ color: stat.color, fontSize: 26, fontWeight: '800', lineHeight: 30 }}>
                  {stat.value}
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 }}>
                  {stat.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Badges */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, letterSpacing: 2.5, fontWeight: '700', textTransform: 'uppercase', marginBottom: 12, paddingHorizontal: 24 }}>
            Badges
          </Text>
          {stats?.userBadges && stats.userBadges.length > 0 ? (
            <FlatList
              horizontal
              showsHorizontalScrollIndicator={false}
              data={stats.userBadges}
              keyExtractor={(ub) => ub.id}
              contentContainerStyle={{ paddingHorizontal: 24 }}
              renderItem={({ item: ub }) => (
                <View style={{
                  width: 72, marginRight: 10,
                  backgroundColor: '#071333',
                  borderWidth: 1, borderColor: 'rgba(255,199,0,0.12)',
                  borderRadius: 16, padding: 12, alignItems: 'center',
                }}>
                  <Text style={{ fontSize: 26, marginBottom: 6 }}>{ub.badge.icon}</Text>
                  <Text style={{ color: 'rgba(255,199,0,0.7)', fontSize: 10, textAlign: 'center', fontWeight: '600' }} numberOfLines={2}>
                    {ub.badge.name}
                  </Text>
                </View>
              )}
            />
          ) : (
            <TouchableOpacity
              onPress={() => router.push(ROUTES.RECHARGE)}
              style={{
                marginHorizontal: 24,
                backgroundColor: '#071333',
                borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
                borderRadius: 16, padding: 20,
                flexDirection: 'row', alignItems: 'center', gap: 14,
              }}
            >
              <Text style={{ fontSize: 28 }}>🎖</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, lineHeight: 20 }}>
                  Jouez pour débloquer vos premiers badges
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.15)" />
            </TouchableOpacity>
          )}
        </View>

        {/* Menu */}
        <View style={{ marginHorizontal: 24, marginBottom: 16 }}>
          <Text style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, letterSpacing: 2.5, fontWeight: '700', textTransform: 'uppercase', marginBottom: 12 }}>
            Compte
          </Text>
          <View style={{
            backgroundColor: '#071333',
            borderRadius: 16,
            borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
            overflow: 'hidden',
          }}>
            {MENU_ITEMS.map((item, index) => (
              <TouchableOpacity
                key={item.label}
                onPress={() => router.push(item.route as any)}
                style={{
                  flexDirection: 'row', alignItems: 'center',
                  paddingHorizontal: 18, paddingVertical: 15,
                  borderBottomWidth: index < MENU_ITEMS.length - 1 ? 1 : 0,
                  borderBottomColor: 'rgba(255,255,255,0.04)',
                }}
              >
                <View style={{
                  width: 32, height: 32, borderRadius: 10,
                  backgroundColor: 'rgba(255,255,255,0.04)',
                  alignItems: 'center', justifyContent: 'center', marginRight: 12,
                }}>
                  <Ionicons name={item.icon} size={16} color="rgba(255,255,255,0.4)" />
                </View>
                <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, flex: 1 }}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={14} color="rgba(255,255,255,0.15)" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Historique des transactions */}
        {recentTransactions.length > 0 && (
          <View style={{ marginHorizontal: 24, marginBottom: 16 }}>
            <Text style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, letterSpacing: 2.5, fontWeight: '700', textTransform: 'uppercase', marginBottom: 12 }}>
              Dernières transactions
            </Text>
            <View style={{
              backgroundColor: '#071333',
              borderRadius: 16,
              borderWidth: 1, borderColor: 'rgba(255,255,255,0.05)',
              overflow: 'hidden',
            }}>
              {recentTransactions.map((tx, index) => {
                const cfg = TX_CONFIG[tx.type] ?? TX_CONFIG.DEBIT;
                return (
                  <View
                    key={tx.id}
                    style={{
                      flexDirection: 'row', alignItems: 'center',
                      paddingHorizontal: 16, paddingVertical: 13,
                      borderBottomWidth: index < recentTransactions.length - 1 ? 1 : 0,
                      borderBottomColor: 'rgba(255,255,255,0.04)',
                    }}
                  >
                    <View style={{
                      width: 30, height: 30, borderRadius: 10,
                      backgroundColor: `${cfg.color}14`,
                      alignItems: 'center', justifyContent: 'center', marginRight: 12,
                    }}>
                      <Ionicons name={cfg.icon} size={15} color={cfg.color} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: '500' }} numberOfLines={1}>
                        {tx.description ?? tx.type}
                      </Text>
                      <Text style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11, marginTop: 2 }}>
                        {new Date(tx.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </Text>
                    </View>
                    <Text style={{ color: cfg.color, fontWeight: '700', fontSize: 14 }}>
                      {cfg.sign}{Math.abs(tx.amount)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Déconnexion */}
        <TouchableOpacity
          style={{
            marginHorizontal: 24,
            backgroundColor: 'rgba(254,83,187,0.06)',
            borderWidth: 1, borderColor: 'rgba(254,83,187,0.15)',
            borderRadius: 16, paddingVertical: 15, paddingHorizontal: 18,
            flexDirection: 'row', alignItems: 'center', gap: 12,
          }}
        >
          <View style={{
            width: 32, height: 32, borderRadius: 10,
            backgroundColor: 'rgba(254,83,187,0.08)',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Ionicons name="log-out-outline" size={16} color="#FE53BB" />
          </View>
          <Text style={{ color: '#FE53BB', fontSize: 15, fontWeight: '500' }}>Se déconnecter</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}
