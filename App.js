import { StyleSheet, Text, View, StatusBar } from 'react-native';

export default function App() {
  return (
     <View style={styles.container}>
        <StatusBar barStyle='dark-content' />
        <Text style={styles.title}>Telehealt</Text>
        <Text style={styles.subtitle}> Your Personal Therapy Tracker</Text>
        <Text style={styles.description}> Manage your therapies and track your progress.</Text>
     </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4FAF6',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 34,
    fontWeight: 'bold',
    color: '#237A57',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    color: '#344E41',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 14,
    color: '#66756C',
    textAlign: 'center',
  },
});
