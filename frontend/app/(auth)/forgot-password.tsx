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
      className="flex-1 bg-bg-primary"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1 justify-center px-6">
        <Text className="text-3xl font-bold text-center text-neon-cyan mb-2">
          Mot de passe oublié
        </Text>
        <Text className="text-base text-center mb-10" style={{ color: 'rgba(255,255,255,0.65)' }}>
          Entrez votre email pour recevoir un lien de réinitialisation.
        </Text>

        <Text className="text-sm font-medium text-white mb-1">Email</Text>
        <TextInput
          className="border-2 border-neon-cyan/30 bg-bg-secondary rounded-xl px-4 py-3 text-base text-white mb-6"
          style={{ color: 'white' }}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholder="votre@email.fr"
          placeholderTextColor="rgba(255,255,255,0.4)"
        />

        <TouchableOpacity
          className="border-2 border-white/80 rounded-full py-4 items-center flex-row justify-center gap-3"
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <>
              <Text className="text-white font-bold text-base">Envoyer le lien</Text>
              <View className="w-2 h-2 rounded-full bg-neon-orange" />
            </>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}
