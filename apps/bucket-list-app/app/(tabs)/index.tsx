import { useEffect, useState } from 'react';
import { Text, StyleSheet } from 'react-native';
import { fetchAllBucketList } from '@/request/bucketList.request';
import { ThemedView } from '@/components/ThemedView';
import { TBucketListBrief } from 'bucket-list-types';
import { ListItem } from '@/components/ListItem';

export default function ListScreen() {
  const [bucketList, setBucketList] = useState<TBucketListBrief[]>([]);

  useEffect(() => {
    fetchAllBucketList().then(listResult => {
      setBucketList(listResult || []);
    })
  }, []);

  return (
    <ThemedView style={styles.container}>
      <Text style={styles.title}>我的清单</Text>
      {bucketList.length === 0 ? (
        <Text style={styles.emptyText}>暂无内容</Text>
      ) : (
        bucketList.map((item) => (
          <ListItem key={item.id} item={item} />
        ))
      )}
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
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});
