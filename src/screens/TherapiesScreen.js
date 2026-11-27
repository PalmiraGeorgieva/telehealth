import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '../lib/supabase';
import { useAppTheme } from '../theme/ThemeContext';


export default function TherapiesScreen({ navigation }) {
    const { theme, isDark } = useAppTheme();
    const styles = createStyles(theme, isDark);

    const [therapies, setTherapies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [error, setError] = useState('');

    const fetchTherapies = useCallback(async (isRefreshing = false) => {
        if (isRefreshing) {
            setRefreshing(true);
        } else {
            setLoading(true);
        }

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
            setRefreshing(false);
        }
    }, []);

    const handleRefresh = () => {
        fetchTherapies(true);
    };

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
            <Ionicons name='chevron-forward' size={20} color={theme.primary} />
           </View>
           <Text style={styles.cardType}>{item.therapy_type}</Text>
           <View style={styles.infoRow}>
               <Ionicons name='calendar-outline' size={16} color={theme.primary} />
               <Text style={styles.infoText}>{formatDate(item.start_date)}</Text>
               <Ionicons
                    name="time-outline"
                    size={16}
                    color={theme.primary}
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
                   style={styles.addButton}
                   onPress={() => navigation.navigate('TherapyForm')}
                >
                    <Ionicons
                       name='add'
                       size={18}
                       color={isDark ? theme.background : '#fff'}
                    />
                    <Text style={styles.addButtonText}>Add Therapy</Text>
                </Pressable>
            </View>
            {loading ? (
                <ActivityIndicator size='large' color={theme.primary} style={styles.loader} />
            ) : error ? (
                 <View style={styles.emptyContainer}>
                    <Text style={styles.errorText}>{error}</Text>
                    <Pressable onPress={() => fetchTherapies()}>
                        <Text style={styles.retryText}>Try again</Text>
                    </Pressable>
                 </View>
            ) : (
                <FlatList
                    data={therapies}
                    keyExtractor={(item) => item.id}
                    renderItem={renderTherapy}
                    onRefresh={handleRefresh}
                    refreshing={refreshing}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <Ionicons
                              name='heart-outline'
                              size={48}
                              color={theme.primary}
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

const createStyles = (theme, isDark) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.background,
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
        color: theme.primary,
    },
    addButton: {
        backgroundColor: theme.primary,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
    },
    addButtonText: {
        color: isDark ? theme.background : '#fff',
        fontSize: 13,
        fontWeight: '500',
    },
    listContent: {
        paddingBottom: 30,
        flexGrow: 1,
    },
    card: {
        backgroundColor: theme.surface,
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: theme.border,
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
        color: theme.primary,
        flex: 1,
    },
    cardType: {
        fontSize: 14,
        color: theme.secondaryText,
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
        color: theme.text,
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
        color: theme.primary,
        marginTop: 12,
    },
    emptySubtitle: {
        fontSize: 14,
        color: theme.secondaryText,
        textAlign: 'center',
        marginTop: 8,
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
});
