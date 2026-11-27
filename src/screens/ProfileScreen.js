import { View, Text, Image, Switch, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { useState, useCallback} from 'react';
import { supabase } from '../lib/supabase';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useAppTheme } from '../theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import * as ImageManipulator from 'expo-image-manipulator';
import { decode } from 'base64-arraybuffer';

export default function ProfileScreen() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [profileLoading, setProfileLoading] = useState(true);
    const [profileImage, setProfileImage] = useState(null);
    const [uploading, setUploading] = useState(false);
    const { isDark, theme, toggleTheme } = useAppTheme();

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

                    const filePath = `${user.id}/avatar.jpg`;

                    const { data: avatarFiles, error: storageError } = await supabase.storage
                      .from('avatars')
                      .list(user.id, {
                        search: 'avatar.jpg',
                      });

                    if(storageError) throw storageError;

                    const hasAvatar = avatarFiles?.some(
                        file => file.name === 'avatar.jpg'
                    );

                    if(hasAvatar) {
                        const { data, error: urlError } = await supabase.storage
                         .from('avatars')
                         .createSignedUrl(filePath, 3600)
                        ;

                        if(urlError) throw urlError;

                        if(active){
                            setProfileImage(data.signedUrl)
                        }
                    } else {
                        if(active) {
                            setProfileImage(null);
                        }
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
       if (uploading) return;

       setUploading(true);
       setError('');

        try {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permission.granted) {
                throw new Error("Gallery permission is required.");

            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                aspect: [1, 1],
                quality: 0.8,
            });

            if (result.canceled || !result.assets?.length) return;

            const { data: { user }, error: userError } = await supabase.auth.getUser();

            if (userError || !user) {
                throw new Error("Please log in again.");

            }

            const context = ImageManipulator.ImageManipulator.manipulate(result.assets[0].uri);

            context.resize({
                width: 400,
                height: 400,
            });

            const image = await context.renderAsync();

            const processedImage = await image.saveAsync({
                compress: 0.8,
                format: ImageManipulator.SaveFormat.JPEG,
                base64: true,
            });

            const filePath = `${user.id}/avatar.jpg`;

            const { error: uploadError } = await supabase.storage
                .from('avatars')
                .upload(filePath, decode(processedImage.base64), {
                    contentType: 'image/jpeg',
                    upsert: true,
                })
                ;

            if (uploadError) throw uploadError;

            const { data, error: urlError } = await supabase.storage
                .from('avatars')
                .createSignedUrl(filePath, 3600);

            if (urlError) throw urlError;

             setProfileImage(data.signedUrl);

        } catch (error) {
            setError(error.message || 'Failed to upload photo.');
        } finally {
            setUploading(false);
        }
    };

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
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={styles.avatarContainer}>
                {profileImage ? (
                    <Image source={{ uri: profileImage }} style={styles.avatar} />
                ) : (
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarInitial}><Ionicons name='person-outline' size={60} color={theme.primary} /></Text>
                    </View>
                )}

                <Pressable style={[styles.photoButton, { backgroundColor: theme.primary }, uploading && styles.disabled]}
                  onPress={pickImage}
                  disabled={uploading || loading || profileLoading}
                >
                    {uploading ? (
                        <ActivityIndicator
                           color={isDark ? theme.background : '#fff'}
                        />
                    ) : (
                    <Text style={[styles.photoButtonText, { color: isDark ? theme.background : '#ffffff' }]}>
                        Change Photo
                    </Text>
                    )}
                </Pressable>
            </View>
            <View style={[styles.card, { backgroundColor: theme.surface }]}>

                {profileLoading ? (
                   <ActivityIndicator color='#237a57' />
                ): (
                    <>
                       <Text style={[styles.emailLabel, { color: theme.secondaryText }]}>Email address</Text>
                       <Text style={[styles.emailText, { color: theme.text }]}>{userEmail || 'Email unavailable'}</Text>
                    </>
                )}
            </View>
            {error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : null}


            <Text style={[styles.settingsTitle, { color: theme.primary }]}>Appearance</Text>
            <View style={[
                styles.themeCard,
                {
                    backgroundColor: theme.surface,
                    borderColor: theme.border
                }
            ]}>
                <View style={[
                    styles.themeIcon,
                    {
                        backgroundColor: isDark ? '#40564a' : '#e0f0e6'
                    }
                ]}>
                    <Ionicons
                       name={isDark ? 'moon-outline' : 'sunny-outline'}
                       size={24}
                       color={theme.primary}
                     />
                </View>
                <View style={styles.themeInfo}>
                    <Text style={[
                        styles.themeTitle,
                        { color: theme.text }
                    ]}>
                        Dark Mode
                    </Text>
                    <Text style={[
                        styles.themeDescription,
                        { color: theme.secondaryText }
                    ]}>
                        {isDark
                           ? 'Dark theme enabled'
                           : 'Light theme enabled'}
                    </Text>
                </View>
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  trackColor={{
                    false: '#c5D2ca',
                    true: theme.primary
                  }}
                  thumbColor={isDark ? theme.background : '#fff'}
                />
            </View>

            <Pressable
              style={[styles.logoutButton,{ borderColor: theme.danger }, (loading || uploading) && styles.disabled]}
              onPress={handleLogout}
              disabled={loading || uploading}
            >
                {loading ? (
                    <ActivityIndicator color='#fff' />
                ) : (
                    <>
                    <Ionicons name='log-out-outline' size={20} color={theme.danger} />
                    <Text style={[styles.logoutText,{ color: theme.danger }]}>Sign Out</Text>
                    </>
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'center',
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 20,
        paddingVertical: 10,
        gap: 8,
        marginTop: 16,
    },

    logoutText: {
        fontSize: 14,
        fontWeight: '600',
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
    themeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        marginVertical: 12,
        borderRadius: 12,
    },
    settingsTitle: {
        fontSize: 16,
        fontWeight: '600',
        marginTop: 20,
        marginBottom: 10,
    },

    themeCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 16,
        padding: 14,
        gap: 12,
    },

    themeIcon: {
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },

    themeInfo: {
        flex: 1,
    },

    themeTitle: {
        fontSize: 15,
        fontWeight: '600',
    },

    themeDescription: {
        fontSize: 12,
        marginTop: 4,
    },
});
