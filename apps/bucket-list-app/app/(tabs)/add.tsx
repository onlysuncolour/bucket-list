import { View, Text, StyleSheet } from 'react-native';
import { ThemedView } from '@/components/ThemedView';

export default function AddScreen() {
  return (
    <ThemedView style={styles.container}>
      <Text style={styles.title}>添加新的清单项</Text>
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