import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { gazetteService } from '../../services';

export default function ArticleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [imageError, setImageError] = useState(false);

  const { data: article, isLoading } = useQuery({
    queryKey: ['article', id],
    queryFn: () => gazetteService.getArticleById(id),
    enabled: !!id,
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#040D21' }} edges={['top']}>
      {/* Header */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.06)',
        gap: 12,
      }}>
        <TouchableOpacity onPress={() => router.canGoBack() ? router.back() : router.replace('/(tabs)/gazette')} style={{ padding: 4 }}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700', flex: 1 }}>
          Article
        </Text>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#00D3FF" />
        </View>
      ) : !article ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: 'rgba(255,255,255,0.5)' }}>Article introuvable</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Cover image — uniquement si elle existe et charge correctement */}
          {!!article.coverImage && !imageError && (
            <Image
              source={{ uri: article.coverImage }}
              style={{ width: '100%', height: 200 }}
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
          )}

          <View style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 40, gap: 16 }}>
            {/* Catégorie + date */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <View style={{
                backgroundColor: 'rgba(0,211,255,0.15)',
                paddingHorizontal: 12,
                paddingVertical: 4,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: 'rgba(0,211,255,0.3)',
              }}>
                <Text style={{ color: '#00D3FF', fontSize: 11, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  {article.category}
                </Text>
              </View>
              <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                {new Date(article.publishedAt).toLocaleDateString('fr-FR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </Text>
            </View>

            {/* Titre */}
            <Text style={{ color: '#FFFFFF', fontSize: 24, fontWeight: '800', lineHeight: 32 }}>
              {article.title}
            </Text>

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {article.tags.map((tag: string) => (
                  <View key={tag} style={{
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    borderRadius: 20,
                    borderWidth: 1,
                    borderColor: 'rgba(255,255,255,0.1)',
                  }}>
                    <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12 }}>{tag}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Séparateur */}
            <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.07)' }} />

            {/* Corps de l'article */}
            <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 15, lineHeight: 26 }}>
              {article.body}
            </Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
