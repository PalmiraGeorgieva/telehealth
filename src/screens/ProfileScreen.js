import { View, Text, StyleSheet } from 'react-native';

export default function ProfileScreen() {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>My Profile</Text>
            <Text>Your profile information will apear here.</Text>
        </View>
    );
}

const styles = StyleSheet.create({
     container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F4FAF6',

    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#237A57',
        marginBottom: 12,
    },
});
