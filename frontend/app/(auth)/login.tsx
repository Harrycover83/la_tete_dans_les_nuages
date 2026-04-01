import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Link, router } from 'expo-router';
import { StarBackground } from '../../components/StarBackground';
import { TEXT_SHADOW } from '../../constants/typography';
import { useAuthStore } from '../../stores/auth.store';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }
    setLoading(true);
    try {
      await login(email, password);
      router.replace('/(tabs)/home');
    } catch (err: unknown) {
      Alert.alert('Erreur', 'Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-bg-primary"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StarBackground />
      <ScrollView contentContainerClassName="flex-grow justify-center px-6 py-12">
        <Text className="text-3xl font-bold text-white text-center mb-2" style={TEXT_SHADOW.cloudGlowStrong}>
          Tête dans les Nuages
        </Text>
        <Text className="text-base text-text-secondary text-center mb-10">
          Connectez-vous à votre compte
        </Text>

        <View className="mb-4">
          <Text className="text-sm font-medium text-text-primary mb-1">Email</Text>
          <TextInput
            className="border-2 border-neon-cyan/30 bg-bg-secondary rounded-xl px-4 py-3 text-base text-text-primary"
            style={{ color: 'white' }}
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="votre@email.fr"
            placeholderTextColor="rgba(255,255,255,0.4)"
          />
        </View>

        <View className="mb-6">
          <Text className="text-sm font-medium text-text-primary mb-1">Mot de passe</Text>
          <TextInput
            className="border-2 border-neon-cyan/30 bg-bg-secondary rounded-xl px-4 py-3 text-base text-text-primary"
            style={{ color: 'white' }}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor="rgba(255,255,255,0.4)"
          />
        </View>

        <TouchableOpacity
          className="border-2 border-white/80 rounded-full py-4 items-center flex-row justify-center gap-3 mb-4"
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text className="text-white font-bold text-base">Se connecter</Text>
              <View className="w-2 h-2 rounded-full bg-neon-orange" />
            </>
          )}
        </TouchableOpacity>

        <Link href="/(auth)/forgot-password" asChild>
          <TouchableOpacity className="items-center mb-6">
            <Text className="text-neon-pink text-sm">Mot de passe oublié ?</Text>
          </TouchableOpacity>
        </Link>

        <View className="flex-row justify-center">
          <Text className="text-text-secondary text-sm">Pas encore de compte ? </Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text className="text-neon-cyan text-sm font-semibold">S'inscrire</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
