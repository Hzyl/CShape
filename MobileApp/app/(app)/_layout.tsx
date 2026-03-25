import React from 'react';
import { Stack } from 'expo-router';

/**
 * App Layout - routes for authenticated users (protected)
 * Includes map, POI detail, tours, settings, etc.
 */
export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animationEnabled: true,
      }}
    >
      <Stack.Screen
        name="map"
        options={{
          title: 'Map',
        }}
      />
      <Stack.Screen
        name="poi/[id]"
        options={{
          title: 'POI Details',
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="tours"
        options={{
          title: 'Tours',
        }}
      />
      <Stack.Screen
        name="qr-scanner"
        options={{
          title: 'QR Scanner',
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}
