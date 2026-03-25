import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useRouter } from 'expo-router';
import { useAuth } from '../src/hooks/useAuth';

/**
 * Root Layout Component
 * - Handles routing between (auth) and (app) layouts based on authentication state
 * - Initializes auth store on app startup
 */
export default function RootLayout() {
  const router = useRouter();
  const { isAuthenticated, initializeAuth, isLoading: authLoading } = useAuth();

  // Initialize auth on app startup (load token from AsyncStorage)
  useEffect(() => {
    const initAuth = async () => {
      try {
        await initializeAuth();
      } catch (error) {
        console.error('Error initializing auth:', error);
      }
    };

    initAuth();
  }, []);

  // Route based on authentication state
  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        // User is authenticated - go to map
        router.replace('/(app)/map');
      } else {
        // User is not authenticated - go to login
        router.replace('/(auth)/login');
      }
    }
  }, [isAuthenticated, authLoading, router]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationEnabled: false,
      }}
    >
      {/* Auth Group - shown when not authenticated */}
      <Stack.Screen
        name="(auth)"
        options={{
          headerShown: false,
        }}
      />

      {/* App Group - shown when authenticated */}
      <Stack.Screen
        name="(app)"
        options={{
          headerShown: false,
        }}
      />
    </Stack>
  );
}
