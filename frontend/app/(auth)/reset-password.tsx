import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { authService } from '../../services/auth.service';

export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!password || !confirm) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas.');
      return;
    }
    if (password.length < 8) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    setLoading(true);
    try {
      await authService.resetPassword(token ?? '', password);
      Alert.alert('Succès', 'Mot de passe réinitialisé. Vous pouvez maintenant vous connecter.', [
        { text: 'OK', onPress: () => router.replace('/(auth)/login') },
      ]);
    } catch {
      Alert.alert('Erreur', 'Le lien est invalide ou a expiré.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1 justify-center px-6">
        <Text className="text-2xl font-bold text-gray-900 mb-2">Nouveau mot de passe</Text>
        <Text className="text-base text-gray-500 mb-8">Choisissez un mot de passe sécurisé.</Text>

        <Text className="text-sm font-medium text-gray-700 mb-1">Nouveau mot de passe</Text>
        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3 text-base mb-4"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholder="••••••••"
        />

        <Text className="text-sm font-medium text-gray-700 mb-1">Confirmer le mot de passe</Text>
        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3 text-base mb-6"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
          placeholder="••••••••"
        />

        <TouchableOpacity
          className="bg-primary-600 rounded-xl py-4 items-center"
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">Réinitialiser</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
