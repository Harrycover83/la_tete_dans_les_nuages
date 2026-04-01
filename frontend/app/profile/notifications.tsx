import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { storage } from '../../utils/storage';
import { STORAGE_KEYS } from '../../constants/storage-keys';

interface NotifPrefs {
  events: boolean;
  offers: boolean;
  news: boolean;
  reminders: boolean;
}

const DEFAULT_PREFS: NotifPrefs = {
  events: true,
  offers: true,
  news: false,
  reminders: true,
};

const NOTIF_ITEMS: { key: keyof NotifPrefs; icon: keyof typeof Ionicons.glyphMap; label: string; desc: string }[] = [
  {
    key: 'events',
    icon: 'calendar-outline',
    label: 'Événements',
    desc: 'Nouveaux événements dans vos salles préférées',
  },
  {
    key: 'offers',
    icon: 'pricetag-outline',
    label: 'Offres & promotions',
    desc: 'Packs de recharge en promotion, offres exclusives',
  },
  {
    key: 'news',
    icon: 'newspaper-outline',
    label: 'Actualités',
    desc: 'Articles et nouvelles de La Tête Dans Les Nuages',
  },
  {
    key: 'reminders',
    icon: 'alarm-outline',
    label: 'Rappels',
    desc: 'Rappels avant vos réservations',
  },
];

export default function NotificationsScreen() {
  const [prefs, setPrefs] = useState<NotifPrefs>(DEFAULT_PREFS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    storage.getItem(STORAGE_KEYS.NOTIF_PREFS).then((raw) => {
      if (raw) {
        try {
          setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(raw) });
        } catch {
          // ignore
        }
      }
      setIsLoading(false);
    });
  }, []);

  async function toggle(key: keyof NotifPrefs, value: boolean) {
    const next = { ...prefs, [key]: value };
    setPrefs(next);
    await storage.setItem(STORAGE_KEYS.NOTIF_PREFS, JSON.stringify(next));
  }

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
          Notifications
        </Text>
      </View>

      {isLoading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#00D3FF" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 24, gap: 12 }}>
          <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: 13, marginBottom: 8, lineHeight: 20 }}>
            Choisissez les types de notifications que vous souhaitez recevoir.
          </Text>

          {NOTIF_ITEMS.map((item) => (
            <View
              key={item.key}
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
                backgroundColor: `rgba(0,211,255,0.08)`,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Ionicons name={item.icon} size={20} color="#00D3FF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600', marginBottom: 2 }}>
                  {item.label}
                </Text>
                <Text style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, lineHeight: 17 }}>
                  {item.desc}
                </Text>
              </View>
              <Switch
                value={prefs[item.key]}
                onValueChange={(v) => toggle(item.key, v)}
                trackColor={{ false: 'rgba(255,255,255,0.1)', true: 'rgba(0,211,255,0.35)' }}
                thumbColor={prefs[item.key] ? '#00D3FF' : 'rgba(255,255,255,0.4)'}
              />
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
