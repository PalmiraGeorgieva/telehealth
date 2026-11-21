import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';

export default function TherapiesScreen({ navigation }) {
    const [therapies, setTherapies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchTherapies = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const { data: { user }, error: useError } = await supabase.auth.getUser();

            if(useError || !user) {
                throw new Error('Please log in again.');
            }

            const { data, error: fetchError } = await supabase.from('therapies').select('id, name, therapy_type, description, duration, start_date')
                .eq('user_id', user.id)
                .order('start_date', { ascending: true});

            if (fetchError) {
                throw fetchError;
            }

            setTherapies(data ?? []);

        } catch (error) {
            setError(error.message || 'Failed to load therapies.');
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchTherapies();

        }, [fetchTherapies])
    );

    const formatDate = (dateString) => {
        if (!dateString) return 'No date';

        const [year, month, day] = dateString.split('-');
        return `${day}.${month}.${year}`;
    };

    const renderTherapy = ({ item }) => (
        <Pressable
            style={styles.card}
            onPress={() =>
                navigation.navigate('TherapyDetails',{
                    therapyId: item.id,
                })
            }
        >
           <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Ionicons name='chevron-forward' size={20} color='#237a57' />
           </View>
           <Text style={styles.cardType}>{item.therapy_type}</Text>
           <View style={styles.infoRow}>
               <Ionicons name='calendar-outline' size={16} color='#237a57' />
               <Text style={styles.infoText}>{formatDate(item.start_date)}</Text>
               <Ionicons
                    name="time-outline"
                    size={16}
                    color="#237A57"
                />
                <Text style={styles.infoText}>{item.duration} min</Text>
           </View>
        </Pressable>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>My Therapies</Text>
                <Pressable
                   styles={styles.addButton}
                   onPress={() => navigation.navigate('TherapyForm')}
                >
                    <Ionicons
                       name='add'
                       size={26}
                       color='fff'
                    />
                </Pressable>
            </View>
            {loading ? (
                <ActivityIndicator size='large' color='#237a57' style={styles.loader} />
            ) : error ? (
                 <View style={styles.emptyContainer}>
                    <Text style={styles.errortext}>{error}</Text>
                    <Pressable onPress={fetchTherapies}>
                        <Text style={styles.retryText}>Try again</Text>
                    </Pressable>
                 </View>
            ) : (
                <FlatList
                    data={therapies}
                    keyExtractor={(item) => item.id}
                    renderItem={renderTherapy}
                    contentContainerStyle={styles.listContent}
                    onRefresh={fetchTherapies}
                    refreshing={loading}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons
                              name='heart-outline'
                              size={48}
                              color='#237a57'
                             />
                            <Text style={styles.emptyText}>No therapies yet.</Text>
                            <Text style={styles.emptySubtitle}>Add your first therapy to get started.</Text>
                        </View>

                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F4FAF6',
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#237A57',
    },
    addButton: {
        backgroundColor: '#237A57',
        width: 44,
        height: 44,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    listContent: {
        paddingBottom: 30,
        flexGrow: 1,
    },
    card: {
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E0EAE4',
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#237A57',
        flex: 1,
    },
    cardType: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
        textTransform: 'capitalize',
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    infoText: {
        fontSize: 13,
        color: '#444',
        marginRight: 12,
    },
    loader: {
        marginTop: 40,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#237A57',
        marginTop: 12,
    },
    emptySubtitle: {
        fontSize: 14,
        color: '#777',
        textAlign: 'center',
        marginTop: 8,
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
});
