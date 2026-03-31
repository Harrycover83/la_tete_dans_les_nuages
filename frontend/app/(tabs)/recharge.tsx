import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { StripeProvider, useStripe } from '@stripe/stripe-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { rechargeService } from '../../services';

const STRIPE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';

interface Pack {
  id: string;
  name: string;
  priceEur: number;
  units: number;
  bonusUnits: number;
}

function RechargeContent() {
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null);
  const [loading, setLoading] = useState(false);
  const { initPaymentSheet, presentPaymentSheet } = useStripe();

  const { data: packs, isLoading } = useQuery({
    queryKey: ['packs'],
    queryFn: rechargeService.getPacks,
  });

  async function handleRecharge() {
    if (!selectedPack) return;
    setLoading(true);
    try {
      const { clientSecret } = await rechargeService.createPaymentIntent(selectedPack.id);

      const { error: initError } = await initPaymentSheet({
        paymentIntentClientSecret: clientSecret,
        merchantDisplayName: 'Tête dans les Nuages',
      });

      if (initError) {
        Alert.alert('Erreur', initError.message);
        return;
      }

      const { error: presentError } = await presentPaymentSheet();
      if (presentError) {
        if (presentError.code !== 'Canceled') {
          Alert.alert('Paiement échoué', presentError.message);
        }
      } else {
        Alert.alert(
          'Paiement réussi !',
          `${selectedPack.units + selectedPack.bonusUnits} unités seront créditées sur votre carte dans quelques instants.`
        );
      }
    } catch {
      Alert.alert('Erreur', 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  }

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#00D3FF" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1" contentContainerClassName="px-4 pb-8">
      <Text className="text-text-secondary mb-6">Choisissez un pack de recharge :</Text>

      {packs?.map((pack: Pack) => (
        <TouchableOpacity
          key={pack.id}
          className={`rounded-2xl p-4 mb-3 border-2 ${
            selectedPack?.id === pack.id
              ? 'border-neon-cyan bg-neon-cyan/10'
              : 'border-neon-pink/30 bg-bg-secondary'
          }`}
          onPress={() => setSelectedPack(pack)}
        >
          <View className="flex-row justify-between items-center">
            <View>
              <Text className="font-semibold text-text-primary text-base">{pack.name}</Text>
              <Text className="text-text-secondary text-sm">
                {pack.units} unités
                {pack.bonusUnits > 0 && (
                  <Text className="text-neon-yellow"> + {pack.bonusUnits} bonus</Text>
                )}
              </Text>
            </View>
            <View className="items-end">
              <Text className="text-2xl font-bold text-neon-cyan">{pack.priceEur}€</Text>
              {selectedPack?.id === pack.id && <Text className="text-neon-cyan text-xs">✓ Sélectionné</Text>}
            </View>
          </View>
        </TouchableOpacity>
      ))}

      {selectedPack && (
        <View className="mt-4 bg-bg-secondary rounded-2xl p-4 mb-6 border border-neon-pink/30">
          <Text className="font-semibold text-neon-pink mb-2">Récapitulatif</Text>
          <View className="flex-row justify-between">
            <Text className="text-text-secondary">Pack "{selectedPack.name}"</Text>
            <Text className="font-semibold text-text-primary">{selectedPack.priceEur}€</Text>
          </View>
          <View className="flex-row justify-between mt-1">
            <Text className="text-text-secondary">Unités créditées</Text>
            <Text className="font-semibold text-neon-yellow">
              {selectedPack.units + selectedPack.bonusUnits} unités
            </Text>
          </View>
        </View>
      )}

      <TouchableOpacity
        className={`rounded-xl py-4 items-center border-2 ${
          selectedPack ? 'bg-neon-cyan border-neon-cyan' : 'bg-bg-secondary border-neon-cyan/20'
        }`}
        onPress={handleRecharge}
        disabled={!selectedPack || loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className={`font-semibold text-base ${
            selectedPack ? 'text-bg-primary' : 'text-text-secondary'
          }`}>
            {selectedPack ? `Payer ${selectedPack.priceEur}€` : 'Sélectionnez un pack'}
          </Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

export default function RechargeScreen() {
  return (
    <StripeProvider publishableKey={STRIPE_KEY}>
      <SafeAreaView className="flex-1 bg-bg-primary">
        <View className="px-4 pt-4 pb-2">
          <Text className="text-2xl font-bold text-neon-cyan">Recharger 💰</Text>
        </View>
        <RechargeContent />
      </SafeAreaView>
    </StripeProvider>
  );
}
