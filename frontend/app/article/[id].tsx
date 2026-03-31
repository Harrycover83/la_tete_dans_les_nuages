import React from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { gazetteService } from '../../services';

export default function ArticleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: article, isLoading } = useQuery({
    queryKey: ['article', id],
    queryFn: () => gazetteService.getArticleById(id),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#6366f1" />
      </SafeAreaView>
    );
  }

  if (!article) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-white">
        <Text className="text-gray-500">Article introuvable</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView>
        {article.coverImage ? (
          <Image
            source={{ uri: article.coverImage }}
            className="w-full h-60"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-40 bg-primary-100 items-center justify-center">
            <Text className="text-primary-400 text-5xl">📰</Text>
          </View>
        )}

        <View className="px-5 py-6">
          <View className="flex-row items-center gap-2 mb-3">
            <View className="bg-primary-100 px-3 py-1 rounded-full">
              <Text className="text-primary-600 text-xs font-medium">{article.category}</Text>
            </View>
            <Text className="text-gray-400 text-xs">
              {new Date(article.publishedAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          </View>

          <Text className="text-2xl font-bold text-gray-900 mb-4">{article.title}</Text>
          <Text className="text-gray-700 text-base leading-7">{article.body}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
