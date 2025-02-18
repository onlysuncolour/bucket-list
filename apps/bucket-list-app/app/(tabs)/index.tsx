import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { request } from '@/request/request'
import { fetchUserLogin } from '@/request/user.request';
import { fetchAllBucketList } from '@/request/bucketList.request';
import { ThemedView } from '@/components/ThemedView';
import { getUuid } from '@/utils';
import { TBucketList } from 'bucket-list-types';

export default function ListScreen() {
  const [bucketList, setBucketList] = useState<TBucketList[]>([]);

  useEffect(() => {
    checkAuthAndFetchList();
  }, []);

  const checkAuthAndFetchList = async () => {
    try {
      const refreshToken = await request.getRefreshToken()
      
      if (!refreshToken) {
        const deviceUuid = await request.getDeviceUuid();

        const loginResult = await fetchUserLogin({ deviceUuid });
        
        if (loginResult.refreshToken) {
          // await AsyncStorage.setItem('refreshToken', loginResult.refreshToken);
          await request.setRefreshToken(loginResult.refreshToken)
          await request.setAccessToken(loginResult.accessToken)
        }
      }
      
      const listResult = await fetchAllBucketList();
      setBucketList(listResult || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Text style={styles.title}>我的清单</Text>
      {bucketList.length === 0 ? (
        <Text style={styles.emptyText}>暂无内容</Text>
      ) : (
        bucketList.map((item: any) => (
          <View key={item.id} style={styles.item}>
            <Text>{item.title}</Text>
          </View>
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
