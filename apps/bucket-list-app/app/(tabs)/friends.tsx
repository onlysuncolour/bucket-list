import { View, Text, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ThemedView';

export default function FriendsScreen() {
  return (
    <ThemedView style={styles.container}>
      <Text style={styles.title}>好友列表</Text>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
});