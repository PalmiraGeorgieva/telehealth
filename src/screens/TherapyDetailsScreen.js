import { View, Text, StyleSheet } from 'react-native';

export default function TherapyDetailsScreen({ route }) {
    const { therapyId } = route.params ?? {};

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Therapy Details</Text>
            <Text>Therapy ID: {therapyId ?? 'Not selected'}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F4FAF6',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#237A57',
        marginBottom: 12,
    },
});
