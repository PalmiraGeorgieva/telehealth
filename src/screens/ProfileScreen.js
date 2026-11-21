import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useState } from 'react';
import { supabase } from '../lib/supabase';

export default function ProfileScreen() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // const user = supabase.auth.getUser;

    const handleLogout = async () => {
        if (loading) return;

        setLoading(true);
        setError('');

        try {
            const { error: signOutError } = await supabase.auth.signOut();

            if (signOutError) {
                setError(signOutError.message);
                return;
            }
            console.log('Logout successful');

        } catch (error) {
            setError(error.message || 'Logout failed.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>My Profile</Text>
            <Text style={styles.subtitle}>Manage your account and personal information.</Text>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Account</Text>
                <Text style={styles.cardText}>You are currently signed in.</Text>
            </View>
            {error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : null}

            <Pressable
              style={[styles.logoutButton, loading && styles.disabled]}
              onPress={handleLogout}
              disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color='#fff' />
                ) : (
                    <Text style={styles.logoutText}>Sign Out</Text>
                )}
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f4faf6',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#237a57',
        marginBottom: 0,
    },
    subtitle: {
        fontSize: 14,
        color: '#666',
        marginBottom: 24,
    },
    card: {
        backgroundColor: '#fff',
        borderWidth: 1,
        borderColor: '#c8dcd0',
        borderRadius: 12,
        padding: 18,
        marginBottom: 24,
    },
    cardTitle:{
        fontSize: 18,
        fontWeight: 'bold',
        color: '#237a57',
        marginBottom: 8,
    },
    cardText: {
        fontSize: 14,
        color: '#555',
    },
    logoutButton: {
        backgroundColor: '#d64545',
        padding: 16,
        borderRadius: 10,
        alignItems: 'center',
    },

    logoutText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    disabled: {
        opacity: 0.6,
    },
    errorText: {
        color: '#D64545',
        marginBottom: 14,
    },
});
