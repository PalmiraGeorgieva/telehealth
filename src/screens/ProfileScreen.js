import { View, Text, Image, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileImage, setProfileImage] = useState(null);

    useFocusEffect(
        useCallback(() => {
            let active = true;

            const loadProfile = async () => {
                setProfileLoading(true);
                setError('');

                try {
                    const { data: {user}, error: userError, } = await supabase.auth.getUser();

                    if(userError || !user) {
                        throw new Error("Unable to load profile.");

                    }

                    if(active) {
                        setUserEmail(user.email ?? '');
                    }
                } catch (error) {
                    if(active) {
                        setError(error.message || 'Failed to load profile.');
                    }
                } finally {
                    if(active) {
                        setProfileLoading(false);
                    }
                }
            };
            loadProfile();

            return () => {
                active = false;
            };
        }, [])
    );

    const pickImage = async () => {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

        if(!permission.granted) {
            setError('Gallery permission is required.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets?.length > 0) {
            setProfileImage(result.assets[0].uri);
            setError('');
        }
    }

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
            <View style={styles.avatarContainer}>
                {profileImage ? (
                    <Image source={{ uri: profileImage }} style={styles.avatar} />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarInitial}>👤</Text>
                    </View>
                )}

                <Pressable style={styles.photoButton} onPress={pickImage}>
                    <Text style={styles.photoButtonText}>Change Photo</Text>
                </Pressable>
            </View>
            <View style={styles.card}>

                {profileLoading ? (
                   <ActivityIndicator color='#237a57' />
                ): (
                    <>
                       <Text style={styles.emalLabel}>Email address</Text>
                       <Text style={styles.emailText}>{userEmail || 'Email unavailable'}</Text>
                    </>
                )}
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
    emailLabel: {
        fontSize: 13,
        color: '#777',
        marginTop: 16,
        marginBottom: 4,
    },

    emailText: {
        fontSize: 15,
        color: '#333',
        fontWeight: '500',
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },

    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        marginBottom: 12,
    },

    avatarPlaceholder: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#E0F0E6',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },

    avatarInitial: {
        fontSize: 42,
    },

    photoButton: {
        backgroundColor: '#237A57',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },

    photoButtonText: {
        color: '#fff',
        fontSize: 13,
        fontWeight: '600',
    },
});
