import { useState } from "react";
import {
  Text, TextInput, Pressable, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';

import { useAppTheme } from "../theme/ThemeContext";
import { Ionicons } from '@expo/vector-icons';

import { supabase } from "../lib/supabase";

export default function LoginScreen({ navigation }) {
  const { theme, isDark, toggleTheme } = useAppTheme();
  const styles = createStyles(theme, isDark);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const newErrors = {};

    if(!email.trim()) {
      newErrors.email = 'Email is required.';
    }else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Enter a valid email address.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0 || loading) {
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (error) {
        setErrors({ server: error.message});
        return;
      }

      console.log('Login successful');

      // AppNavigator automatically switches to MainTabs
      // when Supabase updates the session.

    } catch (error) {
      setErrors({
        server: error.message || 'Login failed.',
      });
    } finally {
      setLoading(false);
    }

  };

  return (
    <KeyboardAvoidingView style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
     <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
     >
        <Pressable
          style={styles.themeButton}
          onPress={toggleTheme}
          accessibilityRole="button"
          accessibilityLabel={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <Ionicons
            name={isDark ? 'sunny-outline' : 'moon-outline'}
            size={24}
            color={theme.primary}
          />
        </Pressable>
      <Text style={styles.heading}>Welcome Back</Text>
      <Text style={styles.subtitle}>Sign in to manage your therapies.</Text>
      <Text style={styles.label}>Email *</Text>
      <TextInput
         style={styles.input}
         placeholder="Enter your email"
         placeholderTextColor={theme.placeholder}
          value={email}
          onChangeText={(value) => {
            setEmail(value);

            if (
              errors.email &&
              /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
            ) {
              setErrors(prev => ({
                ...prev,
                email: '',
              }));
            }
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
       />

       {errors.email ? (
          <Text style={styles.errorText}>
            {errors.email}
          </Text>
        ) : null}

      <Text style={styles.label}>Password *</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        placeholderTextColor={theme.placeholder}
        value={password}
        onChangeText={(value) => {
            setPassword(value);

            if (errors.password && value.length > 0) {
              setErrors(prev => ({
                ...prev,
                password: '',
              }));
            }
        }}
        secureTextEntry
        autoComplete="current-password"
      />


        {errors.password ? (
          <Text style={styles.errorText}>
            {errors.password}
          </Text>
        ) : null}
        {errors.server ? (
          <Text style={styles.serverError}>{errors.server}</Text>
        ) : null}
      <Pressable
          style={[
            styles.button,
            loading && styles.disabledButton,
          ]}
          onPress={handleLogin}
          disabled={loading}
      >
        {loading ? (
            <ActivityIndicator color={isDark ? theme.background : '#FFF'} />
          ) : (
            <Text style={styles.buttonText}>Sign In</Text>
        )}
      </Pressable>
      <Pressable
          style={styles.registerLink}
          onPress={() => navigation.navigate('Register')}
      >
          <Text style={styles.linkText}>
            Don't have an account? Register
          </Text>
      </Pressable>

     </ScrollView>
    </KeyboardAvoidingView>
  );
}

const createStyles = (theme, isDark) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 65,
    paddingBottom: 40,
  },
  themeButton: {
    alignSelf: 'flex-end',
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 24,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: theme.secondaryText,
    marginBottom: 30,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
  },
  input: {
    backgroundColor: theme.surface,
    color: theme.text,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 18,
  },
  errorText: {
    color: theme.danger,
    fontSize: 13,
    marginTop: -10,
    marginBottom: 14,
  },
  serverError: {
    color: theme.danger,
    marginBottom: 16,
  },
  button: {
    backgroundColor: theme.primary,
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: isDark ? theme.background : '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: theme.primary,
    fontSize: 14,
    fontWeight: '600',
  },
});
