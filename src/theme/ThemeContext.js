import { createContext, useContext, useState, useMemo, useEffect } from 'react';
import { lightTheme, darkTheme } from './themes';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ThemesContext = createContext(null);

export function ThemeProvider({ children }) {
    const [isDark, setIsDark] = useState(false);
    const [isThemeLoaded, setIsThemeLoaded] = useState(false);

    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem('appTheme');
                if(savedTheme !== null) {
                    setIsDark(savedTheme === 'dark');
                }
            } catch (error) {
                console.log('Error loading theme:', error);
            } finally {
                setIsThemeLoaded(true);
            }
        };
        loadTheme();
    }, []);

    useEffect(() => {
        if (!isThemeLoaded) return;

        const saveTheme = async () => {
            try {
                await AsyncStorage.setItem('appTheme', isDark ? 'dark' : 'light');
            } catch (error) {
                console.log('Error saving theme:', error);
            }
        };

        saveTheme();
    }, [isDark, isThemeLoaded]);

    const toggleTheme = () => {
        setIsDark((previous) => !previous);
    };

    const value = useMemo(() => ({
        isDark,
        theme: isDark ? darkTheme : lightTheme,
        toggleTheme,
    }), [isDark]);

     if (!isThemeLoaded) {
        return null;
    }

    return (
        <ThemesContext.Provider value={value}>{children}</ThemesContext.Provider>
    );
}

export function useAppTheme() {
    const context = useContext(ThemesContext);

    if(!context) {
        throw new Error('useAppTheme must be used inside ThemeProvider.');
    }

    return context;
}