import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import Head from 'expo-router/head';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';
import Toast from 'react-native-toast-message';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { persistor, store } from '../src/store';
import { KioskManager } from '../components/KioskManager';
import { Platform, View, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import CustomText from '../components/CustomText';

// Web-only global refinements for a Native Kiosk feel
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    ${!__DEV__ ? `
    * {
      touch-action: pan-y;
      user-select: none;
      -webkit-user-select: none;
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
      user-select: text;
      -webkit-user-select: text;
    }
  `;
  document.head.appendChild(style);

  // Disable right-click context menu for PWA security
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
  }, false);

  // Request fullscreen on the very first interaction to ensure kiosk feel from start
  const requestFullscreen = () => {
    const docElm = document.documentElement;
    if (docElm.requestFullscreen) {
      docElm.requestFullscreen().catch(() => {
        // Silently fail if blocked or already fullscreen
      });
    }
    // Remove listener after first successful or attempted trigger
    document.removeEventListener('mousedown', requestFullscreen);
    document.removeEventListener('touchstart', requestFullscreen);
  };

  document.addEventListener('mousedown', requestFullscreen);
  document.addEventListener('touchstart', requestFullscreen);
}

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const toastConfig = {
  printerError: ({ text1, props }: any) => (
    <View style={{
      height: 60,
      width: '90%',
      backgroundColor: '#FF5252',
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 15,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 4.65,
      elevation: 8,
    }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
        <Ionicons name="print" size={24} color="#fff" />
        <CustomText style={{ marginLeft: 10, color: '#fff', fontWeight: 'bold' }}>{text1}</CustomText>
      </View>
      <TouchableOpacity 
        onPress={() => props.onRetry()}
        style={{
          backgroundColor: 'rgba(255,255,255,0.2)',
          paddingVertical: 6,
          paddingHorizontal: 12,
          borderRadius: 8,
        }}
      >
        <CustomText style={{ color: '#fff', fontWeight: 'bold' }}>REFRESH</CustomText>
      </TouchableOpacity>
    </View>
  )
};

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
        <Head>
          <title>Devourin Kiosk</title>
        </Head>
        <KioskManager>
          <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="login" />
              <Stack.Screen name="(modules)" />
              <Stack.Screen name="mode" />
              <Stack.Screen name="menu" />
              <Stack.Screen name="cart" />
              <Stack.Screen name="customer" />
              <Stack.Screen name="payment" />
              <Stack.Screen name="confirmation" />
          </Stack>
        </KioskManager>
        <StatusBar style="dark" />
        <Toast config={toastConfig} />
      </PersistGate>
    </Provider>
  );
}
