/**
 * React Native To-Do App Entry Point
 * Wraps the app with AuthProvider, GestureHandler, and SafeArea.
 * Initializes notification channel for task reminders.
 */

import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import {
  initNotificationChannel,
  requestNotificationPermission,
} from './src/services/notificationService';

function App(): React.JSX.Element {
  useEffect(() => {
    // Create notification channel and request permission on app start
    const setupNotifications = async () => {
      await initNotificationChannel();
      await requestNotificationPermission();
    };
    setupNotifications();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar barStyle="light-content" backgroundColor="#0A0E21" />
          <AppNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

export default App;
