import { useState } from "react";
import { Text, TextInput, Pressable, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";

import { supabase } from "../lib/supabase";

export default function RegisterScreen({ navigation}) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState('');
    const [message, setMessage] = useState('');

    const validateForm = () => {
        const newErrors = {};

        if (!email.trim()) {
            newErrors.email = 'Email is required.';
        } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
            newErrors.email = 'Please enter a valid email address.';
        }

        if (!password) {
            newErrors.password = 'Password is required.';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters.';
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password.';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match.';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        if (!validateForm()) {
            return;
        }

        setLoading(true);
        setErrors({});
        setMessage('');

        try {
            const { data, error } = await supabase.auth.signUp({
                email: email.trim(),
                password: password,
            });

            if (error) {
                setErrors((prev) => ({ ...prev, server: error.message }));
                return;
            }

            if (data.session) {
                const { error: signOutError } = await supabase.auth.signOut();

                if (signOutError) {
                    setErrors(
                        signOutError.message
                    );
                    return;
                }
            }

           /* if (!data.session) {
                setMessage('Account created! Please confirm your email before signing in.')
                return;
            }*/

            setSuccess('Registration successful! Plese sign in.')
            navigation.navigate('Login');



        } catch (err) {
            setErrors((prev) => ({
                ...prev,
                server: err.message || 'Registration failed. Please try again.',
            }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <ScrollView
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps='handled'
            >
                <Text style={styles.heading}>Create Account</Text>
                <Text style={styles.subtitle}>
                    Register to start managing your therapies.
                </Text>

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
                    <Text style={styles.errorText}>{errors.email}</Text>
                ) : null}

                <Text style={styles.label}>Password *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    autoComplete="password"
                />
                {errors.password ? (
                    <Text style={styles.errorText}>{errors.password}</Text>
                ) : null}

                <Text style={styles.label}>Confirm Password *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Confirm your password"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry
                />
                {errors.confirmPassword ? (
                    <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                ) : null}

                {errors.server ? (
                    <Text style={styles.serverError}>{errors.server}</Text>
                ) : null}

                {message ? (
                    <Text style={styles.successText}>{message}</Text>
                ) : null}

                <Pressable
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleRegister}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Register</Text>
                    )}
                </Pressable>
                <Pressable
                   style={styles.loginLink}
                   onPress={() => navigation.navigate('Login')}
                >
                    <Text style={styles.linkText}>
                        Already have an account? Sign in
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
        color: '#d64545',
        fontSize: 13,
        marginTop: -10,
        marginBottom: 14,

    },
    serverError: {
       color: '#d64545',
       marginBottom: 16,
    },
    successText: {
        color: '#237a57',
        marginBottom: 16,
    },

    button: {
        backgroundColor: '#237a57',
        padding: 16,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loginLink: {
        marginTop: 20,
        alignItems: 'center',
    },
    linkText: {
        color: '#237a57',
        fontSize: 14,
        fontWeight: '600',
    },
});
