import { useState } from "react";
import {
  Text, TextInput, Pressable, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator
} from 'react-native';

import { supabase } from "../lib/supabase";

export default function LoginScreen({ navigation }) {
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
      <Text style={styles.heading}>Welcome Back</Text>
      <Text style={styles.subtitle}>Sign in to manage your therapies.</Text>
      <Text style={styles.label}>Email *</Text>
      <TextInput
         style={styles.input}
         placeholder="Enter your email"
         value={email}
         onChangeText={setEmail}
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
        value={password}
        onChangeText={setPassword}
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
            <ActivityIndicator color="#FFF" />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4FAF6',
  },
  content: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 65,
    paddingBottom: 40,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#237A57',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    marginBottom: 30,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#C8DCD0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 18,
  },
  errorText: {
    color: '#D64545',
    fontSize: 13,
    marginTop: -10,
    marginBottom: 14,
  },
  serverError: {
    color: '#D64545',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#237A57',
    padding: 16,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerLink: {
    marginTop: 20,
    alignItems: 'center',
  },
  linkText: {
    color: '#237A57',
    fontSize: 14,
    fontWeight: '600',
  },
});
