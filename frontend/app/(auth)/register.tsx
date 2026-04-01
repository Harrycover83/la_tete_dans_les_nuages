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
import { authService } from '../../services/auth.service';

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!firstName || !lastName || !email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    setLoading(true);
    try {
      await authService.register({ email, password, firstName, lastName });
      Alert.alert(
        'Compte créé !',
        'Un email de vérification vous a été envoyé. Vérifiez votre boîte mail.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      );
    } catch (err: unknown) {
      Alert.alert('Erreur', 'Cet email est déjà utilisé ou une erreur est survenue.');
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
        <Text className="text-3xl font-bold text-center text-white mb-2" style={TEXT_SHADOW.cloudGlowStrong}>
          Créer un compte
        </Text>
        <Text className="text-base text-text-secondary text-center mb-10">
          Rejoignez Tête dans les Nuages
        </Text>

        <View className="flex-row gap-3 mb-4">
          <View className="flex-1">
            <Text className="text-sm font-medium text-text-primary mb-1">Prénom</Text>
            <TextInput
              className="border-2 border-neon-cyan/30 bg-bg-secondary rounded-xl px-4 py-3 text-base text-text-primary"
              style={{ color: 'white' }}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Jean"
              placeholderTextColor="rgba(255,255,255,0.4)"
            />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-medium text-text-primary mb-1">Nom</Text>
            <TextInput
              className="border-2 border-neon-cyan/30 bg-bg-secondary rounded-xl px-4 py-3 text-base text-text-primary"
              style={{ color: 'white' }}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Dupont"
              placeholderTextColor="rgba(255,255,255,0.4)"
            />
          </View>
        </View>

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
          <Text className="text-sm font-medium text-text-primary mb-1">Mot de passe (min. 8 caractères)</Text>
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
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text className="text-white font-bold text-base">S'inscrire</Text>
              <View className="w-2 h-2 rounded-full bg-neon-orange" />
            </>
          )}
        </TouchableOpacity>

        <View className="flex-row justify-center">
          <Text className="text-text-secondary text-sm">Déjà un compte ? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text className="text-neon-cyan text-sm font-semibold">Se connecter</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
