import React from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuthStore } from '../../stores/auth.store';
import { userService } from '../../services';

export default function ProfileScreen() {
  const { user, logout } = useAuthStore();

  const { data: stats } = useQuery({
    queryKey: ['user-stats', user?.id],
    queryFn: () => userService.getMe(),
    enabled: !!user?.id,
  });

  function handleLogout() {
    Alert.alert('Déconnexion', 'Êtes-vous sûr de vouloir vous déconnecter ?', [
      { text: 'Annuler', style: 'cancel' },
      { text: 'Déconnecter', style: 'destructive', onPress: logout },
    ]);
  }

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <ScrollView contentContainerClassName="px-4 pb-8">
        <View className="pt-4 pb-2">
          <Text className="text-2xl font-bold text-neon-cyan">Profil 👤</Text>
        </View>

        {/* Avatar & Info */}
        <View className="bg-bg-secondary rounded-3xl p-6 mt-4 items-center shadow-sm border-2 border-neon-cyan/20">
          <View className="w-20 h-20 rounded-full bg-neon-cyan/20 items-center justify-center mb-3 border-2 border-neon-cyan">
            <Text className="text-4xl">
              {user?.firstName?.[0]?.toUpperCase() ?? '?'}
            </Text>
          </View>
          <Text className="text-xl font-bold text-text-primary">
            {user?.firstName} {user?.lastName}
          </Text>
          <Text className="text-text-secondary text-sm">{user?.email}</Text>
          {!user?.emailVerified && (
            <View className="mt-2 bg-neon-yellow/20 px-3 py-1 rounded-full border border-neon-yellow/50">
              <Text className="text-neon-yellow text-xs">Email non vérifié</Text>
            </View>
          )}
        </View>

        {/* Stats placeholder */}
        <View className="bg-bg-secondary rounded-3xl p-6 mt-4 shadow-sm border-2 border-neon-pink/20">
          <Text className="font-bold text-neon-pink text-lg mb-4">🏆 Statistiques & Rangs</Text>
          <View className="bg-bg-primary rounded-2xl p-4 items-center">
            <Text className="text-text-secondary text-sm text-center">
              Vos statistiques de jeu apparaîtront ici après vos premières parties.
            </Text>
          </View>
          <View className="flex-row mt-4 gap-3">
            <View className="flex-1 bg-neon-cyan/10 border border-neon-cyan/30 rounded-2xl p-3 items-center">
              <Text className="text-2xl font-bold text-neon-cyan">
                {stats?.totalXp ?? 0}
              </Text>
              <Text className="text-neon-cyan/70 text-xs">XP Total</Text>
            </View>
            <View className="flex-1 bg-neon-pink/10 border border-neon-pink/30 rounded-2xl p-3 items-center">
              <Text className="text-2xl font-bold text-neon-pink">
                {stats?.gameSessions?.length ?? 0}
              </Text>
              <Text className="text-neon-pink/70 text-xs">Parties</Text>
            </View>
            <View className="flex-1 bg-neon-yellow/10 border border-neon-yellow/30 rounded-2xl p-3 items-center">
              <Text className="text-2xl font-bold text-neon-yellow">
                {stats?.userBadges?.length ?? 0}
              </Text>
              <Text className="text-neon-yellow/70 text-xs">Badges</Text>
            </View>
          </View>
        </View>

        {/* Badges placeholder */}
        <View className="bg-bg-secondary rounded-3xl p-6 mt-4 shadow-sm border-2 border-neon-cyan/20">
          <Text className="font-bold text-neon-pink text-lg mb-3">🎖 Badges</Text>
          {stats?.userBadges && stats.userBadges.length > 0 ? (
            <View className="flex-row flex-wrap gap-2">
              {stats.userBadges.map((ub: any) => (
                <View key={ub.id} className="bg-neon-yellow/10 border border-neon-yellow/30 rounded-xl p-3 items-center w-20">
                  <Text className="text-3xl mb-1">{ub.badge.icon}</Text>
                  <Text className="text-neon-yellow text-xs text-center">{ub.badge.name}</Text>
                </View>
              ))}
            </View>
          ) : (
            <View className="bg-bg-primary rounded-2xl p-4 items-center">
              <Text className="text-text-secondary text-sm text-center">
                Gagnez des badges en jouant et en progressant dans le réseau.
              </Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View className="mt-6 gap-3">
          <TouchableOpacity className="bg-bg-secondary rounded-2xl p-4 flex-row items-center border-2 border-neon-cyan/20 shadow-sm">
            <Text className="text-base mr-3">✏️</Text>
            <Text className="text-text-primary font-medium">Modifier mon profil</Text>
            <Text className="ml-auto text-neon-cyan">›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-neon-pink/10 rounded-2xl p-4 flex-row items-center border-2 border-neon-pink"
            onPress={handleLogout}
          >
            <Text className="text-base mr-3">🚪</Text>
            <Text className="text-neon-pink font-medium">Se déconnecter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
