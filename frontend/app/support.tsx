import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const FAQ_ITEMS = [
  {
    question: 'Comment recharger mon compte ?',
    answer:
      'Rendez-vous dans l\'onglet "Recharge" et choisissez un pack. Le paiement est sécurisé via Stripe. Les crédits sont ajoutés instantanément.',
  },
  {
    question: 'Comment fonctionne la carte TDLN ?',
    answer:
      'Votre carte virtuelle est liée à votre compte. Elle stocke vos crédits et s\'utilise directement en salle pour accéder aux expériences de réalité virtuelle.',
  },
  {
    question: 'Puis-je annuler une réservation ?',
    answer:
      'Oui, vous pouvez annuler une réservation depuis l\'onglet Accueil > Mes réservations, jusqu\'à 24h avant l\'événement.',
  },
  {
    question: 'Comment gagner des badges ?',
    answer:
      'Les badges se débloquent automatiquement en jouant. Chaque expérience et chaque accomplissement vous rapporte des XP et peut vous valoir un badge.',
  },
  {
    question: 'Mon paiement a échoué, que faire ?',
    answer:
      'Vérifiez les informations de votre carte bancaire et réessayez. Si le problème persiste, contactez-nous par email ou téléphone.',
  },
];

export default function SupportScreen() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

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
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '700' }}>
          Aide & Support
        </Text>
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, gap: 24 }} showsVerticalScrollIndicator={false}>

        {/* Contacter */}
        <View>
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
            Nous contacter
          </Text>
          <View style={{ gap: 10 }}>
            <ContactButton
              icon="mail-outline"
              label="Par email"
              value="contact@tete-dans-les-nuages.fr"
              onPress={() => Linking.openURL('mailto:contact@tete-dans-les-nuages.fr')}
            />
            <ContactButton
              icon="call-outline"
              label="Par téléphone"
              value="+33 1 23 45 67 89"
              onPress={() => Linking.openURL('tel:+33123456789')}
            />
            <ContactButton
              icon="globe-outline"
              label="Site web"
              value="tete-dans-les-nuages.fr"
              onPress={() => Linking.openURL('https://tete-dans-les-nuages.fr')}
            />
          </View>
        </View>

        {/* FAQ */}
        <View>
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>
            Questions fréquentes
          </Text>
          <View style={{ gap: 8 }}>
            {FAQ_ITEMS.map((item, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setOpenIndex(openIndex === i ? null : i)}
                activeOpacity={0.7}
                style={{
                  backgroundColor: '#071333',
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: openIndex === i ? 'rgba(0,211,255,0.2)' : 'rgba(255,255,255,0.06)',
                  overflow: 'hidden',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', padding: 16, gap: 12 }}>
                  <Text style={{ flex: 1, color: '#FFFFFF', fontSize: 14, fontWeight: '600', lineHeight: 20 }}>
                    {item.question}
                  </Text>
                  <Ionicons
                    name={openIndex === i ? 'chevron-up' : 'chevron-down'}
                    size={16}
                    color="rgba(255,255,255,0.4)"
                  />
                </View>
                {openIndex === i && (
                  <View style={{
                    paddingHorizontal: 16,
                    paddingBottom: 16,
                    borderTopWidth: 1,
                    borderTopColor: 'rgba(255,255,255,0.05)',
                  }}>
                    <Text style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, lineHeight: 20, marginTop: 12 }}>
                      {item.answer}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Version */}
        <Text style={{ textAlign: 'center', color: 'rgba(255,255,255,0.15)', fontSize: 12, marginTop: 8 }}>
          La TÃªte Dans Les Nuages â€” v1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function ContactButton({
  icon,
  label,
  value,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={{
        backgroundColor: '#071333',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.06)',
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
      }}
    >
      <View style={{
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: 'rgba(0,211,255,0.08)',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Ionicons name={icon} size={20} color="#00D3FF" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: '600', marginBottom: 2 }}>
          {label}
        </Text>
        <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '500' }}>
          {value}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.2)" />
    </TouchableOpacity>
  );
}
