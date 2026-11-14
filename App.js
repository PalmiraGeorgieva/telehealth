import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "react-native";
import AppNavigator from "./src/navigation/AppNavigator";
import { useEffect } from "react";
import { supabase } from "./src/lib/supabase";

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
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar barStyle="dark-content" />
        <AppNavigator />
      </NavigationContainer>
    </SafeAreaProvider>

  );
}

