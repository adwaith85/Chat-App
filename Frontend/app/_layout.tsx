import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function RootLayout() {
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const token = await AsyncStorage.getItem('token');

      // Public routes are the landing page (segments[0] is undefined), login, and not-found
      const isPublicRoute = segments[0] === undefined || segments[0] === 'login' || segments[0] === '+not-found';

      if (!token && !isPublicRoute) {
        // Redirect to landing if no token and hits a protected route
        router.replace('/');
      } else if (token && (segments[0] === undefined || segments[0] === 'login')) {
        // Redirect to home if logged in and hits landing or login
        router.replace('/(tabs)/home');
      }
    };

    checkAuth();
  }, [segments, segments[0]]);
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index"
        options={{
          title: "index",

        }} />
      <Stack.Screen name="(tabs)" />
      {/* <Stack.Screen
        name="profileedit"
        options={{
          presentation: 'modal',
          animation: 'slide_from_bottom'
        }}
      /> */}
    </Stack>
  );
}
