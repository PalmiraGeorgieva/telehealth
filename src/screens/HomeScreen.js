import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { supabase } from '../lib/supabase';
import { useAppTheme } from '../theme/ThemeContext';


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

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome to Telehealth</Text>

            <Text style={styles.subtitle}>
                Here's an overview of your therapies.
            </Text>

            {loading ? (
                <ActivityIndicator size="large" color={theme.primary} />
            ) : error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : (
                <>
                    <View style={styles.statsContainer}>
                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>
                                {totalTherapies}
                            </Text>
                            <Text style={styles.statLabel}>
                                Total Therapies
                            </Text>
                        </View>

                        <View style={styles.statCard}>
                            <Text style={styles.statNumber}>
                                {upcomingTherapies}
                            </Text>
                            <Text style={styles.statLabel}>
                                Upcoming Therapies
                            </Text>
                        </View>
                    </View>

                    <Pressable style={styles.nextCard}
                        onPress={() => {
                             if(nextTherapy?.id) {
                                navigation.navigate('TherapyDetails', {
                                    therapyId: nextTherapy.id,
                                });
                             }
                        }}
                        disabled={!nextTherapy?.id}
                    >
                        <Text style={styles.nextTitle}>
                            Next Therapy
                        </Text>

                        {nextTherapy ? (
                            <>
                                <Text style={styles.therapyName}>
                                    {nextTherapy.name}
                                </Text>

                                <Text style={styles.therapyInfo}>
                                    {nextTherapy.start_date} · {nextTherapy.duration} min
                                </Text>
                            </>
                        ) : (
                            <Text style={styles.therapyInfo}>
                                No upcoming therapies.
                            </Text>
                        )}
                    </Pressable>
                </>
            )}
        </View>
    );
}

const createStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
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
        marginTop: 16,
    },

    nextTitle: {
        fontSize: 17,
        fontWeight: 'bold',
        color: theme.primary,
        marginBottom: 12,
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
});
