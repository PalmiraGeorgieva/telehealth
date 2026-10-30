// BottomTabNavigation

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import HomeScreen from "../screens/HomeScreen";
import TherapiesScreen from "../screens/TherapiesScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
    return (
        <Tab.Navigator
          screenOptions={({ route }) => ({
            tabBarActiveTintColor: '#237A57',
            tabBarInactiveTintColor: '#777',
            headerStyle: {
                backgroundColor: '#F4FAF6',
            },
            headerTintColor: '#237A57',

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


