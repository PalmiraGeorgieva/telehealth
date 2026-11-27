import { View, Text, StyleSheet, ActivityIndicator, Pressable, Image, ScrollView, Alert} from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAppTheme } from '../theme/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import SwipeableTherapyCard from '../components/SwipeableTherapyCard';

export default function HomeScreen({ navigation }) {
    const { theme } = useAppTheme();
    const styles = createStyles(theme);

    const [totalTherapies, setTotalTherapies] = useState(0);
    const [upcomingTherapies, setUpcomingTherapies] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [nextTherapy, setNextTherapy] = useState(null);


    const fetchDashboard = useCallback(async () => {
        setLoading(true);
        setError('');

        try {
            const { data: { user }, error: userError, } = await supabase.auth.getUser();

            if(userError || !user) {
                throw new Error('Please log in again.');
            }

            const { data, error: fetchError } = await supabase
               .from('therapies')
               .select('id, name, start_date, duration')
               .eq('user_id', user.id)
            ;

            if(fetchError) {
                throw fetchError;
            }

            const therapies = data ?? [];

            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            const todayString = `${year}-${month}-${day}`;

            const upcoming = therapies.filter(
                (therapy) =>
                    therapy.start_date &&
                    therapy.start_date >= todayString

            )

            setTotalTherapies(therapies.length);
            setUpcomingTherapies(upcoming.length);
            const sortedUpcoming = [...upcoming].sort(
                (a, b) => a.start_date.localeCompare(b.start_date)
            );

            setNextTherapy(sortedUpcoming[0] ?? null);

        } catch (error) {
            setError(error.message || 'Failed to load dashboard.');
        } finally {
            setLoading(false);
        }
    }, []);


    useFocusEffect(
        useCallback(() => {
            fetchDashboard();
        }, [fetchDashboard])
    );

    const handleDelete = (therapyId) => {
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
                    onPress: async () => {
                        try {
                            const {
                                data: { user },
                                error: userError
                            } = await supabase.auth.getUser();

                            if (userError || !user) {
                                throw new Error('Please log in again.');
                            }

                            const { data, error } = await supabase
                                .from('therapies')
                                .delete()
                                .eq('id', therapyId)
                                .eq('user_id', user.id)
                                .select('id');

                            if (error) {
                                throw error;
                            }

                            if (!data?.length) {
                                throw new Error(
                                    'Therapy could not be deleted.'
                                );
                            }

                            await fetchDashboard();

                        } catch (error) {
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

    return (
        <ScrollView
            style={{ backgroundColor: theme.background }}
            contentContainerStyle={styles.container}
            showsVerticalScrollIndicator={false}
        >
                <Text style={styles.title}>Welcome to Telehealth</Text>

            <Text style={styles.subtitle}>
                Here's an overview of your therapies.
            </Text>
            <Image
                source={require('../../assets/dashboard-illustration.png')}
                style={styles.dashboardImage}
                resizeMode="contain"
            />

            {loading ? (
                <ActivityIndicator size="large" color={theme.primary} />
            ) : error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : (
                <>
                    <View style={styles.statsContainer}>
                        <View style={styles.statCard}>
                                    <Ionicons
                                        name="clipboard-outline"
                                        size={28}
                                        color={theme.primary}
                                        style={styles.statIcon}
                                    />
                            <Text style={styles.statNumber}>
                                {totalTherapies}
                            </Text>
                            <Text style={styles.statLabel}>
                                Total Therapies
                            </Text>
                        </View>

                        <View style={styles.statCard}>
                                    <Ionicons
                                        name="calendar-outline"
                                        size={28}
                                        color={theme.primary}
                                        style={styles.statIcon}
                                    />
                            <Text style={styles.statNumber}>
                                {upcomingTherapies}
                            </Text>
                            <Text style={styles.statLabel}>
                                Upcoming Therapies
                            </Text>
                        </View>
                    </View>

                    <View style={styles.nextCardContainer}>
                        {nextTherapy ? (
                            <SwipeableTherapyCard
                                key={nextTherapy.id}
                                onEdit={() =>
                                    navigation.navigate('TherapyForm', {
                                        therapyId: nextTherapy.id,
                                    })
                                }
                                onDelete={() => handleDelete(nextTherapy.id)}
                            >
                                <Pressable
                                   style={styles.nextCard}
                                   onPress={() =>
                                    navigation.navigate('TherapyDetails', {
                                        therapyId: nextTherapy.id,
                                    })
                                   }
                                >
                                    <View style={styles.nextHeader}>
                                        <Ionicons
                                             name='calendar-outline'
                                             size={24}
                                             color={theme.primary}
                                         />
                                         <Text style={styles.nextTitle}>
                                            Next Therapy
                                         </Text>
                                    </View>
                                    <Text style={styles.therapyName}>
                                        {nextTherapy.name}
                                    </Text>
                                    <Text style={styles.therapyInfo}>
                                        {nextTherapy.start_date} · {nextTherapy.duration} min
                                    </Text>
                                </Pressable>
                            </SwipeableTherapyCard>
                        ) : (
                            <View style={styles.nextCard}>
                                <View style={styles.nextHeader}>
                                    <Ionicons
                                        name='calendar-outline'
                                        size={24}
                                        color={theme.primary}
                                    />
                                    <Text style={styles.nextTitle}>
                                        Next Therapy
                                    </Text>
                                </View>
                                <Text style={styles.therapyInfo}>
                                    No upcoming therapies.
                                </Text>
                            </View>
                        )}
                    </View>
                </>
            )}
        </ScrollView>
    );
}

const createStyles = (theme) => StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: theme.background,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.primary,
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        color: theme.secondaryText,
        marginBottom: 24,
        textAlign: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: theme.surface,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.border,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.primary,
        marginBottom: 6,
    },
    statLabel: {
        fontSize: 13,
        color: theme.secondaryText,
        textAlign: 'center',
    },
    errorText: {
        color: theme.danger,
        textAlign: 'center',
        marginTop: 20,
    },
    nextCard: {
        backgroundColor: theme.surface,
        padding: 18,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.border,
    },
    nextCardContainer: {
        marginTop: 16,
    },

    therapyName: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.text,
        marginBottom: 6,
    },

    therapyInfo: {
        fontSize: 14,
        color: theme.secondaryText,
    },
    dashboardImage: {
        width: '100%',
        height: 190,
        alignSelf: 'center',
        marginBottom: 20,
    },
    statIcon: {
        marginBottom: 8,
    },
    nextHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 12,
    },

    nextTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: theme.primary,
    },
});
