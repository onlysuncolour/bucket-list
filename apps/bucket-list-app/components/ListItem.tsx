import { View, Text, StyleSheet, Pressable } from 'react-native';
import { TBucketListBrief } from 'bucket-list-types';
import { useRouter } from 'expo-router';

interface ListItemProps {
  item: TBucketListBrief;
}

export function ListItem({ item }: ListItemProps) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/item?id=${item.id}`);
  };

  return (
    <Pressable onPress={handlePress} style={styles.item}>
      <Text>{item.title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
});