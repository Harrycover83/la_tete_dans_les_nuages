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
      <SafeAreaView className="flex-1 items-center justify-center bg-bg-primary">
        <ActivityIndicator size="large" color="#00D3FF" />
      </SafeAreaView>
    );
  }

  if (!article) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-bg-primary">
        <Text className="text-text-secondary">Article introuvable</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-bg-primary">
      <ScrollView>
        {article.coverImage ? (
          <Image
            source={{ uri: article.coverImage }}
            className="w-full h-60"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-40 bg-bg-secondary items-center justify-center border-b-2 border-neon-cyan/20">
            <Text className="text-neon-cyan text-5xl">📰</Text>
          </View>
        )}

        <View className="px-5 py-6">
          <View className="flex-row items-center gap-2 mb-3">
            <View className="bg-neon-cyan/20 px-3 py-1 rounded-full border border-neon-cyan/30">
              <Text className="text-neon-cyan text-xs font-medium">{article.category}</Text>
            </View>
            <Text className="text-text-secondary text-xs">
              {new Date(article.publishedAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </Text>
          </View>

          <Text className="text-2xl font-bold text-neon-cyan mb-4">{article.title}</Text>
          <Text className="text-text-primary text-base leading-7">{article.body}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
