import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { Provider } from 'react-redux';
import { store } from '../src/store';

export default function RootLayout() {
  return (
    <Provider store={store}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="mode" />
        <Stack.Screen name="menu" />
        <Stack.Screen name="cart" />
        <Stack.Screen name="payment" />
      </Stack>
      <StatusBar style="dark" />
    </Provider>
  );
}
