import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { TBucketList } from 'bucket-list-types';
import { fetchBucketListById } from '../request/bucketList.request';
import { StepItem } from '@/components/StepItem';

export default function ItemDetail() {
  const { id } = useLocalSearchParams();
  const [item, setItem] = useState<TBucketList | null>(null);

  useEffect(() => {
    if (id) {
      fetchBucketListById(id as string).then(data => {
        setItem(data);
      });
    }
  }, [id]);

  if (!item) {
    return (
      <View style={styles.container}>
        <Text>加载中...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{item.title}</Text>
        {item.description && (
          <Text style={styles.description}>{item.description}</Text>
        )}
      </View>
      
      <View style={styles.stepsContainer}>
        <Text style={styles.sectionTitle}>步骤</Text>
        {item.steps.map((step) => (
          <StepItem
            key={step.id || step.uuid}
            step={step}
            bucketListId={id as string}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
  },
  stepsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  stepItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#666',
  },
});