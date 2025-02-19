import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { useMemo, useState } from 'react';
import Octicons from '@expo/vector-icons/Octicons';
import { fetchModelChat } from '@/request/chat.request';
import { completeJSON } from '@/utils';

type TModelType = 'textModel' | 'reasonerModel';
export default function AddScreen() {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const charactorPrompt = {
    role: 'user',
    content: '你是一个日程规划大师以及任务梳理大师，你需要帮我规划梳理我要做的接下来的事情，要按照步骤给我，可以更细粒度的给我。只需要给我返回JSON格式的数据，不要其他任何内容。JSON格式是 {steps: [{content: "", steps: []}]}'
  }
  const modelType: TModelType = 'textModel';

  const [tempText, setTempText] = useState('');

  const tempSteps = useMemo(() => {
    if (!tempText) return null;
    try {
      const steps = completeJSON(tempText)
      return steps
    } catch (error) {
      return null
    }
  }, [tempText])

  const handleSendRequest = async () => {
    if (!title.trim()) return;
    setLoading(true);
    try {
      const request = fetchModelChat({
        messages: [charactorPrompt, {
          role: 'user',
          content: title
        }],
        modelType,
      })

      request.then(response => {
        const reader = response.data.getReader();
        const decoder = new TextDecoder();

        function readStream() {
          reader.read().then(({ done, value }: { done: boolean, value: AllowSharedBufferSource }) => {
            if (done) {
              setTempText('')
              console.log('流式读取完成');
              return;
            }

            // 处理数据块
            const textChunk = decoder.decode(value);
            setTempText(prevValue => prevValue + textChunk)
            // console.log('收到数据:', textChunk);

            // 继续读取
            readStream();
          }).catch((err: any) => {
            console.error('读取失败:', err);
          });
        }

        readStream();
      })

    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
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
          onPress={handleSendRequest}
          style={[styles.button, loading && styles.buttonDisabled]}
          disabled={loading}
        >
          <Octicons name="paper-airplane" size={24} color={loading ? "#ccc" : "#0a7ea4"} />
        </TouchableOpacity>
      </View>
      {loading && <Text style={styles.loadingText}>正在生成任务清单...</Text>}
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