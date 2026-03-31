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
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerClassName="flex-grow justify-center px-6 py-12">
        <Text className="text-3xl font-bold text-center text-primary-600 mb-2">
          Créer un compte
        </Text>
        <Text className="text-base text-gray-500 text-center mb-10">
          Rejoignez Tête dans les Nuages
        </Text>

        <View className="flex-row gap-3 mb-4">
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 mb-1">Prénom</Text>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3 text-base"
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Jean"
            />
          </View>
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 mb-1">Nom</Text>
            <TextInput
              className="border border-gray-300 rounded-xl px-4 py-3 text-base"
              value={lastName}
              onChangeText={setLastName}
              placeholder="Dupont"
            />
          </View>
        </View>

        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 mb-1">Email</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 text-base"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            placeholder="votre@email.fr"
          />
        </View>

        <View className="mb-6">
          <Text className="text-sm font-medium text-gray-700 mb-1">Mot de passe (min. 8 caractères)</Text>
          <TextInput
            className="border border-gray-300 rounded-xl px-4 py-3 text-base"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="••••••••"
          />
        </View>

        <TouchableOpacity
          className="bg-primary-600 rounded-xl py-4 items-center mb-4"
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">S'inscrire</Text>
          )}
        </TouchableOpacity>

        <View className="flex-row justify-center">
          <Text className="text-gray-500 text-sm">Déjà un compte ? </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text className="text-primary-600 text-sm font-semibold">Se connecter</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
