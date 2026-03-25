import React from 'react';
import { Stack } from 'expo-router';

/**
 * Auth Layout - routes for unauthenticated users
 * Includes login screen and any other auth-related screens
 */
export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
        gestureEnabled: false, // Disable swipe back gesture
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          title: 'Login',
        }}
      />
    </Stack>
  );
}
