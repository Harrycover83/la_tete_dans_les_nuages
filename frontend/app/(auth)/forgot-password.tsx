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
import { router } from 'expo-router';
import { authService } from '../../services/auth.service';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!email) return;
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      Alert.alert(
        'Email envoyé',
        'Si cet email existe, un lien de réinitialisation vous a été envoyé.',
        [{ text: 'OK', onPress: () => router.back() }]
      );
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
        <Text className="text-2xl font-bold text-gray-900 mb-2">Mot de passe oublié</Text>
        <Text className="text-base text-gray-500 mb-8">
          Entrez votre email pour recevoir un lien de réinitialisation.
        </Text>

        <Text className="text-sm font-medium text-gray-700 mb-1">Email</Text>
        <TextInput
          className="border border-gray-300 rounded-xl px-4 py-3 text-base mb-6"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="votre@email.fr"
        />

        <TouchableOpacity
          className="bg-primary-600 rounded-xl py-4 items-center"
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold text-base">Envoyer le lien</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
