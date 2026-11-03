import { View, Text, StyleSheet, Button } from 'react-native';

export default function TherapiesScreen({ navigation }) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>My Therapies</Text>
            <Text>Your therapies will appear here.</Text>

            <Button
              title='Add New Therapy'
              color='#237A57'
              onPress={() => navigation.navigate('TherapyForm')}
            />
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