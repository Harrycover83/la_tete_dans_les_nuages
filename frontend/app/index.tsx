import { Redirect } from 'expo-router';
import { useAuthStore } from '../stores/auth.store';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color="#6366f1" />
      </View>
    );
  }

  return isAuthenticated ? <Redirect href="/(tabs)/home" /> : <Redirect href="/(auth)/login" />;
}
