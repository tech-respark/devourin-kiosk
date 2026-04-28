import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from '../src/store';
import { KioskManager } from '../components/KioskManager';
import { Platform, View } from 'react-native';

// Web-only global refinements for a Native Kiosk feel
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    ${!__DEV__ ? `
    * {
      user-select: none;
      -webkit-user-select: none;
      -webkit-touch-callout: none;
      user-drag: none;
      -webkit-user-drag: none;
      touch-action: pan-y;
    }
    body {
      overflow: hidden;
      overscroll-behavior: none;
    }
    ` : ''}
    input, textarea, [role="textbox"] {
      outline: none !important;
      box-shadow: none !important;
      -webkit-tap-highlight-color: transparent;
    }
  `;
  document.head.appendChild(style);
}

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Poppins-Black': require('../assets/fonts/Poppins-Black.ttf'),
    'Poppins-Bold': require('../assets/fonts/Poppins-Bold.ttf'),
    'Poppins-Light': require('../assets/fonts/Poppins-Light.ttf'),
    'Poppins-Medium': require('../assets/fonts/Poppins-Medium.ttf'),
    'Poppins-Regular': require('../assets/fonts/Poppins-Regular.ttf'),
    'Poppins-SemiBold': require('../assets/fonts/Poppins-SemiBold.ttf'),
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <KioskManager>
          <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="login" />
              <Stack.Screen name="mode" />
              <Stack.Screen name="menu" />
              <Stack.Screen name="cart" />
              <Stack.Screen name="customer" />
              <Stack.Screen name="payment" />
              <Stack.Screen name="confirmation" />
          </Stack>
        </KioskManager>
        <StatusBar style="dark" />
        <Toast />
      </PersistGate>
    </Provider>
  );
}
