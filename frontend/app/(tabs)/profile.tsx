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
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView contentContainerClassName="px-4 pb-8">
        <View className="pt-4 pb-2">
          <Text className="text-2xl font-bold text-gray-900">Profil 👤</Text>
        </View>

        {/* Avatar & Info */}
        <View className="bg-white rounded-3xl p-6 mt-4 items-center shadow-sm border border-gray-100">
          <View className="w-20 h-20 rounded-full bg-primary-100 items-center justify-center mb-3">
            <Text className="text-4xl">
              {user?.firstName?.[0]?.toUpperCase() ?? '?'}
            </Text>
          </View>
          <Text className="text-xl font-bold text-gray-900">
            {user?.firstName} {user?.lastName}
          </Text>
          <Text className="text-gray-500 text-sm">{user?.email}</Text>
          {!user?.emailVerified && (
            <View className="mt-2 bg-amber-100 px-3 py-1 rounded-full">
              <Text className="text-amber-700 text-xs">Email non vérifié</Text>
            </View>
          )}
        </View>

        {/* Stats placeholder */}
        <View className="bg-white rounded-3xl p-6 mt-4 shadow-sm border border-gray-100">
          <Text className="font-bold text-gray-900 text-lg mb-4">🏆 Statistiques & Rangs</Text>
          <View className="bg-gray-50 rounded-2xl p-4 items-center">
            <Text className="text-gray-400 text-sm text-center">
              Vos statistiques de jeu apparaîtront ici après vos premières parties.
            </Text>
          </View>
          <View className="flex-row mt-4 gap-3">
            <View className="flex-1 bg-primary-50 rounded-2xl p-3 items-center">
              <Text className="text-2xl font-bold text-primary-600">
                {stats?.totalXp ?? 0}
              </Text>
              <Text className="text-primary-400 text-xs">XP Total</Text>
            </View>
            <View className="flex-1 bg-green-50 rounded-2xl p-3 items-center">
              <Text className="text-2xl font-bold text-green-600">
                {stats?.gameSessions?.length ?? 0}
              </Text>
              <Text className="text-green-400 text-xs">Parties</Text>
            </View>
            <View className="flex-1 bg-amber-50 rounded-2xl p-3 items-center">
              <Text className="text-2xl font-bold text-amber-600">
                {stats?.userBadges?.length ?? 0}
              </Text>
              <Text className="text-amber-400 text-xs">Badges</Text>
            </View>
          </View>
        </View>

        {/* Badges placeholder */}
        <View className="bg-white rounded-3xl p-6 mt-4 shadow-sm border border-gray-100">
          <Text className="font-bold text-gray-900 text-lg mb-3">🎖 Badges</Text>
          <View className="bg-gray-50 rounded-2xl p-4 items-center">
            <Text className="text-gray-400 text-sm text-center">
              Gagnez des badges en jouant et en progressant dans le réseau.
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View className="mt-6 gap-3">
          <TouchableOpacity className="bg-white rounded-2xl p-4 flex-row items-center border border-gray-100 shadow-sm">
            <Text className="text-base mr-3">✏️</Text>
            <Text className="text-gray-700 font-medium">Modifier mon profil</Text>
            <Text className="ml-auto text-gray-400">›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-red-50 rounded-2xl p-4 flex-row items-center border border-red-100"
            onPress={handleLogout}
          >
            <Text className="text-base mr-3">🚪</Text>
            <Text className="text-red-600 font-medium">Se déconnecter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
