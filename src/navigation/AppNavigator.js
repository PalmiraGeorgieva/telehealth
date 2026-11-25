// BottomTabNavigation
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "../screens/HomeScreen";
import TherapiesScreen from "../screens/TherapiesScreen";
import ProfileScreen from "../screens/ProfileScreen";
import TherapyDetailsScreen from '../screens/TherapyDetailsScreen';
import TherapyFormScreen from '../screens/TherapyFormScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { supabase } from '../lib/supabase';
import { useAppTheme } from "../theme/ThemeContext";


const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
    const { theme } = useAppTheme();
    return (
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarActiveTintColor: theme.primary,
            tabBarInactiveTintColor: theme.secondaryText,
            tabBarStyle: {
                backgroundColor: theme.surface,
                borderTopColor: theme.border,
            },
            headerStyle: {
                backgroundColor: theme.background,
            },
            headerTintColor: theme.primary,

             tabBarIcon: ({ focused, color, size }) => {
                let iconName;

                if (route.name === 'Home') {
                    iconName = focused ? 'home' : 'home-outline';
                } else if (route.name === 'Therapies') {
                    iconName = focused ? 'heart' : 'heart-outline';
                } else if (route.name === 'Profile') {
                    iconName = focused ? 'person' : 'person-outline';
                }

                return (
                    <Ionicons
                      name={iconName}
                      size={size}
                      color={color}
                    />
                );
             },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Therapies" component={TherapiesScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

export default function AppNavigator() {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);
    const { theme } = useAppTheme();

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => {
            setSession(data.session);
            setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    if(loading) {
        return (
            <View style={{
                flex: 1,
                justifyContent: 'center',
                alignContent: 'center',
                backgroundColor: theme.background,
            }}>
                <ActivityIndicator size="large" color={theme.primary} />

            </View>
        );
    }
    return (
        <Stack.Navigator
            screenOptions={{
            headerStyle: {
                backgroundColor: theme.background,
            },
            headerTintColor: theme.primary,
        }}
        >
            {session ? (
                <>
                    <Stack.Screen
                        name="MainTabs"
                        component={MainTabs}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="TherapyDetails"
                        component={TherapyDetailsScreen}
                        options={{ title: 'Therapy Details' }}
                    />
                    <Stack.Screen
                        name="TherapyForm"
                        component={TherapyFormScreen}
                        options={{ title: 'Add Therapy' }}
                    />

                </>
            ) : (
                <>
                    <Stack.Screen
                        name="Login"
                        component={LoginScreen}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="Register"
                        component={RegisterScreen}
                        options={{ headerShown: false }}
                    />

                </>
            )}
        </Stack.Navigator>
    );
}
