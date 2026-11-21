import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Pressable, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useCallback, useState } from 'react';

export default function TherapyDetailsScreen({ route, navigation }) {
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
                       color='#237a57'
                    />
                    <Text style={styles.infoText}>
                        {therapy.therapy_type}
                    </Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons
                       name='calendar-outline'
                       size={20}
                       color='#237a57'
                     />
                    <Text style={styles.infoText}>
                        {formatdate(therapy.start_date)}
                    </Text>
                </View>
                <View style={styles.infoRow}>
                    <Ionicons
                      name='time-outline'
                      size={20}
                      color='#237a57'
                    />
                    <Text style={styles.infoRow}>
                        {therapy.duration} minutes
                    </Text>
                </View>
                <View style={styles.divider} />
               <Text style={styles.sectionTitle}>
                Description
               </Text>
               <Text style={styles.description}>
                  {therapy.description || 'No descripton.'}
               </Text>
            </View>
            <Pressable
              style={styles.editButton}
              onPress={() => navigation.navigate('TherapyForm', {
                therapyId: therapy.id,
              })}
            >
                <Ionicons
                   name='create-outline'
                   size={20}
                   color='#fff'
                 />
                <Text style={styles.backButtonText}>Edit Therapy</Text>
            </Pressable>
            <Pressable
               style={styles.deleteButton}
               onPress={handleDelete}
            >
                <Ionicons
                   name='trash-outline'
                   size={20}
                   color='#fff'
                />
                <Text style={styles.backButtonText}>Delete Therapy</Text>

            </Pressable>
            <Pressable
               style={styles.backButton}
               onPress={() => navigation.goBack()}
            >
                <Ionicons
                   name='arrow-back'
                   size={20}
                   color='#fff'
                 />
               <Text style={styles.backButtonText}>Back to Therapies</Text>
            </Pressable>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F4FAF6',
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F4FAF6',
        padding: 20,
    },
    card: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#DDEAE2',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#237A57',
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
        color: '#333',
        textTransform: 'capitalize',
    },
    divider: {
        height: 1,
        backgroundColor: '#E0EAE4',
        marginVertical: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#237A57',
        marginBottom: 10,
    },
    description: {
        fontSize: 15,
        color: '#444',
        lineHeight: 23,
    },
    backButton: {
        backgroundColor: '#237A57',
        padding: 15,
        borderRadius: 12,
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    backButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    errorText: {
        color: '#C0392B',
        textAlign: 'center',
        marginBottom: 12,
    },
    retryText: {
        color: '#237A57',
        fontWeight: 'bold',
    },
    editButton: {
        backgroundColor: '#237A57',
        padding: 15,
        borderRadius: 12,
        marginTop: 20,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
    deleteButton: {
        backgroundColor: '#C0392B',
        padding: 15,
        borderRadius: 12,
        marginTop: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
    },
});
