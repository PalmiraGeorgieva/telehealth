import { useState } from "react";
import { Text, TextInput, Pressable, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";

import { supabase } from "../lib/supabase";
import { useAppTheme } from "../theme/ThemeContext";
import { Ionicons } from "@expo/vector-icons";

export default function RegisterScreen({ navigation}) {
    const { theme, isDark, toggleTheme } = useAppTheme();
    const styles = createStyles(theme, isDark);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
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
                    setErrors({
                        server: signOutError.message,
                    });
                    return;
                }
            }

           /* if (!data.session) {
                setMessage('Account created! Please confirm your email before signing in.')
                return;
            }*/

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
                <Text style={styles.heading}>Create Account</Text>
                <Text style={styles.subtitle}>
                    Register to start managing your therapies.
                </Text>

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
                            setErrors((prev) => ({
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
                    <Text style={styles.errorText}>{errors.email}</Text>
                ) : null}

                <Text style={styles.label}>Password *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Enter your password"
                    placeholderTextColor={theme.placeholder}
                    value={password}
                    onChangeText={(value) => {
                        setPassword(value);

                        setErrors(prev => ({
                            ...prev,
                            password: value.length >= 6 ? '' : prev.password,
                            confirmPassword:
                                value === confirmPassword && confirmPassword
                                    ? ''
                                    : prev.confirmPassword,
                        }));
                    }}
                    secureTextEntry
                    autoComplete="new-password"
                />
                {errors.password ? (
                    <Text style={styles.errorText}>{errors.password}</Text>
                ) : null}

                <Text style={styles.label}>Confirm Password *</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Confirm your password"
                    placeholderTextColor={theme.placeholder}
                    value={confirmPassword}
                    onChangeText={(value) => {
                        setConfirmPassword(value);

                        if (errors.confirmPassword && value.length > 0 &&  value === password) {
                            setErrors((prev) => ({
                                ...prev,
                                confirmPassword: '',
                            }));
                        }
                    }}
                    secureTextEntry
                    autoComplete="new-password"
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
                        <ActivityIndicator  color={isDark ? theme.background : '#fff'} />
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
    successText: {
        color: theme.success,
        marginBottom: 16,
    },

    button: {
        backgroundColor: theme.primary,
        padding: 16,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 8,
    },
    buttonDisabled: {
        opacity: 0.6,
    },
    buttonText: {
        color: isDark ? theme.background : '#FFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    loginLink: {
        marginTop: 20,
        alignItems: 'center',
    },
    linkText: {
        color: theme.primary,
        fontSize: 14,
        fontWeight: '600',
    },
});
