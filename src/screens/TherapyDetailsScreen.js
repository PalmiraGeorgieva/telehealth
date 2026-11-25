import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useCallback, useState } from 'react';
import { useAppTheme } from '../theme/ThemeContext';

export default function TherapyDetailsScreen({ route, navigation }) {
    const { theme, isDark } = useAppTheme();
    const styles = createStyles(theme, isDark);
    const { therapyId } = route.params ?? {};
    const [therapy, setTherapy] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchTherapy = useCallback(async () => {
        setLoading(true);
        setError('');
        setTherapy(null);

        try {
            if (!therapyId) {
                throw new Error("No therapy selected.");
            }

            const {
                data: { user},
                error: userError,
            } = await supabase.auth.getUser();

            if(userError || !user) {
                throw new Error('Please log in again.')
            }

            const { data, error: fetchError } = await supabase
                .from('therapies')
                .select('*')
                .eq('id', therapyId)
                .eq('user_id', user.id)
                .single();

            if(fetchError) {
                throw fetchError;
            }

            setTherapy(data);
        } catch (error) {
            setError(error.message || '')
        } finally {
            setLoading(false);
        }
    }, [therapyId]);

    useFocusEffect(
        useCallback(() => {
            fetchTherapy();
        }, [fetchTherapy])
    );

    const formatdate = (dateString) => {
        if (!dateString) {
            return 'No date';
        }

        const [year, month, day] = dateString.split('-');
        return `${day}.${month}.${year}`;
    };

    const handleDelete = () => {
        Alert.alert(
            'Delete Therapy',
            'Are you sure you want to delete this therapy?',
            [
                {
                   text: 'Cancel',
                   style: 'cancel',
              },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: async() => {
                    try {
                        const { data: { user }, error: userError } = await supabase.auth.getUser();

                        if(userError || !user) {
                            throw new Error('Please log in again.');
                        }

                        const { data, error } = await supabase.from('therapies')
                            .delete()
                            .eq('id', therapyId)
                            .eq('user_id', user.id)
                            .select('id')
                        ;

                        if(error) throw error;

                        if(!data || data.length === 0) {
                            throw new Error('Therapy not found or deletion not allowed.');
                        }

                        navigation.goBack();
                    } catch(error){
                        Alert.alert(
                            'Error',
                            error.message || 'Failed to delete therapy.'
                        );
                    }
                },
              },
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size='large' color='#237a57' />
            </View>
        );
    }

    if(error || !therapy) {
        return (
            <View style={styles.center}>
                <Text style={styles.errorText}>
                    {error || 'Therapy not found.'}
                </Text>

                <Pressable onPress={fetchTherapy}>
                    <Text style={styles.retryText}>Try again</Text>
                </Pressable>
            </View>
        );

    }

    return (
        <ScrollView
           style={styles.container}
           contentContainerStyle={styles.content}
        >
            <View style={styles.card}>
                <Text style={styles.title}>{therapy.name}</Text>
                <View style={styles.infoRow}>
                    <Ionicons
                       name='heart-outline'
                       size={20}
                       color={theme.primary}
                    />
                    <Text style={styles.infoText}>
                        {therapy.therapy_type}
                    </Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons
                       name='calendar-outline'
                       size={20}
                       color={theme.primary}
                     />
                    <Text style={styles.infoText}>
                        {formatdate(therapy.start_date)}
                    </Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons
                      name='time-outline'
                      size={20}
                      color={theme.primary}
                    />
                    <Text style={styles.infoText}>
                        {therapy.duration} minutes
                    </Text>
                </View>
                <View style={styles.divider} />
               <Text style={styles.sectionTitle}>
                Description
               </Text>
               <Text style={styles.description}>
                  {therapy.description || 'No description.'}
               </Text>
            </View>
            <View style={styles.actionsContainer}>
                <Pressable
                    style={[styles.actionButton, styles.editButton]}
                    onPress={() =>
                        navigation.navigate('TherapyForm', {
                            therapyId: therapy.id,
                        })
                    }
                >
                    <Ionicons name="pencil" size={16} color={isDark ? theme.background : '#fff'} />
                    <Text style={styles.actionButtonText}>Edit</Text>
                </Pressable>

                <Pressable
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={handleDelete}
                >
                    <Ionicons name="trash-outline" size={16} color={isDark ? theme.background : '#fff'} />
                    <Text style={styles.actionButtonText}>Delete</Text>
                </Pressable>

                <Pressable
                    style={[styles.actionButton, styles.backButton]}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={16} color={isDark ? theme.background : '#fff'} />
                    <Text style={styles.actionButtonText}>Back</Text>
                </Pressable>
            </View>
        </ScrollView>
    );
}

const createStyles = (theme, isDark) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.background,
        padding: 20,
    },
    card: {
        backgroundColor: theme.surface,
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.border,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.primary,
        marginBottom: 20,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 16,
    },
    infoText: {
        fontSize: 16,
        color: theme.text,
        textTransform: 'capitalize',
    },
    divider: {
        height: 1,
        backgroundColor: theme.border,
        marginVertical: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.primary,
        marginBottom: 10,
    },
    description: {
        fontSize: 15,
        color: theme.text,
        lineHeight: 23,
    },
    errorText: {
        color: theme.danger,
        textAlign: 'center',
        marginBottom: 12,
    },
    retryText: {
        color: theme.primary,
        fontWeight: 'bold',
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 20,
    },

    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        minHeight: 44,
    },

    actionButtonText: {
        color: isDark ? theme.background : '#fff',
        fontSize: 13,
        fontWeight: '600',
    },

    editButton: {
        backgroundColor: theme.primary,
    },

    deleteButton: {
        backgroundColor: theme.danger,
    },

    backButton: {
        backgroundColor: isDark ? '#94a3b8' : '#64748b',
    },
});
