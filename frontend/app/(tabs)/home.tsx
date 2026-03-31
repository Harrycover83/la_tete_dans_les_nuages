import React from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { gazetteService } from '../../services';

interface Article {
  id: string;
  title: string;
  coverImage?: string;
  category: string;
  publishedAt: string;
  isPinned: boolean;
}

function ArticleCard({ item }: { item: Article }) {
  return (
    <TouchableOpacity
      className="bg-white rounded-2xl mb-4 shadow-sm overflow-hidden border border-gray-100"
      onPress={() => router.push(`/article/${item.id}`)}
    >
      {item.coverImage ? (
        <Image source={{ uri: item.coverImage }} className="w-full h-48" resizeMode="cover" />
      ) : (
        <View className="w-full h-48 bg-primary-100 items-center justify-center">
          <Text className="text-primary-400 text-4xl">📰</Text>
        </View>
      )}
      <View className="p-4">
        <View className="flex-row items-center justify-between mb-2">
          <View className="bg-primary-100 px-3 py-1 rounded-full">
            <Text className="text-primary-600 text-xs font-medium">{item.category}</Text>
          </View>
          {item.isPinned && (
            <View className="bg-amber-100 px-3 py-1 rounded-full">
              <Text className="text-amber-600 text-xs font-medium">📌 Épinglé</Text>
            </View>
          )}
        </View>
        <Text className="text-gray-900 font-semibold text-base mb-1">{item.title}</Text>
        <Text className="text-gray-400 text-xs">
          {new Date(item.publishedAt).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const { data, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['articles'],
    queryFn: () => gazetteService.getArticles(),
  });

  const pinnedArticles: Article[] = data?.articles?.filter((a: Article) => a.isPinned) ?? [];
  const regularArticles: Article[] = data?.articles?.filter((a: Article) => !a.isPinned) ?? [];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="px-4 pt-4 pb-2">
        <Text className="text-2xl font-bold text-gray-900">La Gazette ☁️</Text>
        <Text className="text-gray-500 text-sm mt-1">Actualités, promos & événements</Text>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#6366f1" />
        </View>
      ) : (
        <FlatList
          data={regularArticles}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <ArticleCard item={item} />}
          contentContainerClassName="px-4 pb-6"
          refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
          ListHeaderComponent={
            pinnedArticles.length > 0 ? (
              <View className="mb-4">
                <Text className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  À la une
                </Text>
                {pinnedArticles.map((item) => (
                  <ArticleCard key={item.id} item={item} />
                ))}
                <Text className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  Toutes les actualités
                </Text>
              </View>
            ) : null
          }
          ListEmptyComponent={
            <View className="items-center py-16">
              <Text className="text-4xl mb-4">📭</Text>
              <Text className="text-gray-500 text-base">Aucun article pour le moment</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}
