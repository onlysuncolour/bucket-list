import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { useEffect, useMemo, useState } from 'react';
import Octicons from '@expo/vector-icons/Octicons';
import { fetchModelChat } from '@/request/chat.request';
import { completeJSON, handleChat, makeInitialSteps } from '@/utils';
import { TStepInit } from 'bucket-list-types';
import { useLatest } from 'ahooks';
import axios from 'axios';
import { StepItem } from '@/components/StepItem';

const defaultChatCb = (v: boolean) => {};

export default function AddScreen() {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [tempText, setTempText] = useState('');
  const [steps, setSteps] = useState<any[]>([]);
  const [tempStepNode, setTempStepNode] = useState<any>([0]);
  const [chatCb, setChatCb] = useState<{cb: (v: boolean) => void}>({cb: defaultChatCb});

  // const loadingLatestRef = useLatest(loading)
  const tempSteps = useMemo<TStepInit[]>(() => {
    if (!tempText) return [];
    try {
      const data = completeJSON(tempText) as {steps: TStepInit[]};
      return makeInitialSteps(data?.steps || [])
    } catch (error) {
      return []
    }
  }, [tempText])

  useEffect(() => {
    if (chatCb.cb !== defaultChatCb && typeof chatCb.cb === 'function' && !loading) {
      chatCb.cb(loading)
      setChatCb({cb: defaultChatCb})
    }
  }, [loading])

  const handleSendRequest = async () => {
    setTempText('')
    if (!title.trim()) return;
    setLoading(true);
    const newChatCb = handleChat(
      [title.trim()],
      ({
        content, done
      }) => {
        if (content) {
          setTempText(content)
        };
        if (done) {
          setLoading(false)
          setChatCb({cb: defaultChatCb})
        }
      }
    )
    setChatCb({cb: newChatCb})
  };

  return (
    <ThemedView style={styles.container}>
      <Text style={styles.title}>添加新的清单项</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="输入你想要完成的事情"
          placeholderTextColor="#999"
          editable={!loading}
        />
        <TouchableOpacity
          onPress={loading ? () => setLoading(false) : handleSendRequest}
          style={[styles.button, loading && styles.buttonDisabled]}
        >
          <Octicons name={loading ? "stop" : "paper-airplane"} size={24} color={loading ? "#ccc" : "#0a7ea4"} />
        </TouchableOpacity>
      </View>
      {loading && <Text style={styles.loadingText}>正在生成任务清单...</Text>}
      {
        tempSteps.length > 0 && <View>
          {
            tempSteps.map(step => <StepItem step={step} />)
          }
        </View>
      }
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8
  },
  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16
  },
  button: {
    padding: 8,
  },
  buttonDisabled: {
    opacity: 0.5
  },
  loadingText: {
    color: '#666',
    textAlign: 'center',
    marginTop: 8
  }
});