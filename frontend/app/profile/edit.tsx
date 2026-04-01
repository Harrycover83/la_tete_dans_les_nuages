import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/auth.store';
import { userService } from '../../services';

export default function EditProfileScreen() {
  const { user, setUser } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['user-profile-edit'],
    queryFn: () => userService.getMe(),
  });

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName ?? '');
      setLastName(profile.lastName ?? '');
      if (profile.dateOfBirth) {
        setDateOfBirth(new Date(profile.dateOfBirth).toLocaleDateString('fr-FR'));
      }
    }
  }, [profile]);

  const mutation = useMutation({
    mutationFn: () => {
      let dob: string | undefined;
      if (dateOfBirth.trim()) {
        const [day, month, year] = dateOfBirth.split('/');
        const parsed = new Date(`${year}-${month}-${day}`);
        if (!isNaN(parsed.getTime())) dob = parsed.toISOString();
      }
      return userService.updateMe({
        firstName: firstName.trim() || undefined,
        lastName: lastName.trim() || undefined,
        dateOfBirth: dob,
      });
    },
    onSuccess: (updated) => {
      setUser({
        ...user!,
        firstName: updated.firstName,
        lastName: updated.lastName,
      });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      queryClient.invalidateQueries({ queryKey: ['user-profile-edit'] });
      Alert.alert('Profil mis à jour', 'Vos informations ont bien été enregistrées.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    },
    onError: () => {
      Alert.alert('Erreur', 'Impossible de mettre à jour le profil. Réessayez.');
    },
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#040D21' }} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
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
          <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700', flex: 1 }}>
            Modifier le profil
          </Text>
          {mutation.isPending && <ActivityIndicator size="small" color="#00D3FF" />}
        </View>

        {isLoading ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color="#00D3FF" />
          </View>
        ) : (
          <ScrollView contentContainerStyle={{ padding: 24, gap: 20 }} keyboardShouldPersistTaps="handled">

            {/* Prénom */}
            <FieldBlock label="Prénom">
              <TextInput
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Votre prénom"
                placeholderTextColor="rgba(255,255,255,0.25)"
                autoCapitalize="words"
                style={inputStyle}
              />
            </FieldBlock>

            {/* Nom */}
            <FieldBlock label="Nom">
              <TextInput
                value={lastName}
                onChangeText={setLastName}
                placeholder="Votre nom"
                placeholderTextColor="rgba(255,255,255,0.25)"
                autoCapitalize="words"
                style={inputStyle}
              />
            </FieldBlock>

            {/* Date de naissance */}
            <FieldBlock label="Date de naissance" hint="Format : JJ/MM/AAAA">
              <TextInput
                value={dateOfBirth}
                onChangeText={setDateOfBirth}
                placeholder="01/01/1990"
                placeholderTextColor="rgba(255,255,255,0.25)"
                keyboardType="numeric"
                style={inputStyle}
              />
            </FieldBlock>

            {/* Email (lecture seule) */}
            <FieldBlock label="Email" hint="Non modifiable">
              <View style={[inputStyle, { opacity: 0.5, justifyContent: 'center' }]}>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15 }}>
                  {profile?.email ?? user?.email ?? ''}
                </Text>
              </View>
            </FieldBlock>

            {/* Bouton sauvegarder */}
            <TouchableOpacity
              onPress={() => mutation.mutate()}
              disabled={mutation.isPending}
              style={{
                marginTop: 8,
                backgroundColor: '#00D3FF',
                borderRadius: 16,
                paddingVertical: 16,
                alignItems: 'center',
                opacity: mutation.isPending ? 0.6 : 1,
              }}
            >
              <Text style={{ color: '#040D21', fontWeight: '800', fontSize: 15 }}>
                Enregistrer
              </Text>
            </TouchableOpacity>
          </ScrollView>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function FieldBlock({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 8 }}>
        <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase' }}>
          {label}
        </Text>
        {hint && (
          <Text style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11 }}>{hint}</Text>
        )}
      </View>
      {children}
    </View>
  );
}

const inputStyle = {
  backgroundColor: '#071333',
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.08)',
  borderRadius: 14,
  paddingHorizontal: 16,
  paddingVertical: 14,
  color: '#FFFFFF',
  fontSize: 15,
} as const;
