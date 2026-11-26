import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "react-native";
import AppNavigator from "./src/navigation/AppNavigator";
import { useEffect } from "react";
import { supabase } from "./src/lib/supabase";
import { useAppTheme, ThemeProvider } from "./src/theme/ThemeContext";
import { NavigationContainer, DarkTheme, DefaultTheme } from "@react-navigation/native";
import { GestureHandlerRootView } from "react-native-gesture-handler";

function AppContent() {
  const { isDark, theme } = useAppTheme();

  const navigationTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      primary: theme.primary,
      background: theme.background,
      card: theme.surface,
      text: theme.text,
      border: theme.border,

    },
  };
  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar
         barStyle={isDark ? 'light-content' : 'dark-content'}
         backgroundColor={theme.background}
      />
      <AppNavigator />
    </NavigationContainer>
  );
}

export default function App() {


  useEffect(() => {
    console.log('1. App useEffect started');

    const checkSupabase = async () => {
      console.log('2. Checking Supabase session');

      try {
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error('Supabase error:', error.message);
        } else {
          console.log('3. Supabase session check completed');
          console.log('Session exists:', !!data.session);
        }
      } catch (error) {
        console.error('Supabase exception:', error);
      }
    };

    checkSupabase();
  }, []);


  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>

    </SafeAreaProvider>
    </GestureHandlerRootView>

  );
}

