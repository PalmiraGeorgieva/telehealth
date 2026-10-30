import { View, Text, StyleSheet } from 'react-native';

export default function HomeScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome to Telehealth</Text>
            <Text>Track your therapies and progress.</Text>
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
