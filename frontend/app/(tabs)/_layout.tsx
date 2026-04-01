import { Tabs, Redirect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { View } from 'react-native';
import { useAuthStore } from '../../stores/auth.store';

export default function TabsLayout() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#00D3FF',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.25)',
        tabBarStyle: {
          backgroundColor: '#020810',
          borderTopWidth: 1,
          borderTopColor: 'rgba(0,211,255,0.2)',
          elevation: 0,
          height: 64,
          paddingBottom: 10,
          paddingTop: 10,
        },
        tabBarShowLabel: false,
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={focused ? 'newspaper' : 'newspaper-outline'} size={22} color={color} />
              {focused && (
                <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#00D3FF', marginTop: 3 }} />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="card"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={focused ? 'card' : 'card-outline'} size={22} color={color} />
              {focused && (
                <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#00D3FF', marginTop: 3 }} />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="recharge"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: focused ? '#00D3FF' : 'rgba(0,211,255,0.12)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 6,
              borderWidth: focused ? 0 : 1,
              borderColor: 'rgba(0,211,255,0.2)',
            }}>
              <Ionicons name="add" size={26} color={focused ? '#07010F' : '#00D3FF'} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="venues"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={focused ? 'map' : 'map-outline'} size={22} color={color} />
              {focused && (
                <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#00D3FF', marginTop: 3 }} />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen name="history" options={{ href: null }} />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />
              {focused && (
                <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: '#00D3FF', marginTop: 3 }} />
              )}
            </View>
          ),
        }}
      />
    </Tabs>
  );
}
