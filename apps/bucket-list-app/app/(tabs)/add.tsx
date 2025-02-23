import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { useEffect, useMemo, useState } from 'react';
import Octicons from '@expo/vector-icons/Octicons';
import { completeJSON, fixSteps, getUuid, makeInitialSteps } from '@/utils';
import { handleChat } from '@/utils/handleChat'
import { TStep, TStepInit } from 'bucket-list-types';
import { StepItem } from '@/components/StepItem';
import { PortalProvider } from 'tamagui';
import { fetchCreateBucketList } from '@/request/bucketList.request';
import { getBucketListCount } from '@/request/getBucketListCount';

const defaultChatCb = (v: boolean) => {};

export default function AddScreen() {
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [tempText, setTempText] = useState('');
  const [chatCb, setChatCb] = useState<{cb: (v: boolean) => void}>({cb: defaultChatCb});
  const [steps, setSteps] = useState<TStepInit[]>([]);

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
    setSteps(tempSteps)
  }, [tempSteps])

  const updateStepByUuid = (steps: TStepInit[], uuid: string, updater: (step: TStepInit) => TStepInit): TStepInit[] => {
    return steps.map(step => {
      if (step.uuid === uuid) {
        return updater(step);
      }
      if (step.steps && step.steps.length > 0) {
        return {
          ...step,
          steps: updateStepByUuid(step.steps, uuid, updater)
        };
      }
      return step;
    });
  };

  const deleteStepByUuid = (steps: TStepInit[], uuid: string): TStepInit[] => {
    return steps.filter(step => {
      if (step.uuid === uuid) {
        return false;
      }
      if (step.steps && step.steps.length > 0) {
        step.steps = deleteStepByUuid(step.steps, uuid);
      }
      return true;
    });
  };

  useEffect(() => {
    if (!tempText) return;
    try {
      const data = completeJSON(tempText) as {steps: TStepInit[]};
      setSteps(makeInitialSteps(data?.steps || []));
    } catch (error) {
      setSteps([]);
    }
  }, [tempText]);

  const handleUpdateStep = (step: TStepInit | TStep, title: string) => {
    setSteps(prev => updateStepByUuid(prev, step.uuid!, (s) => ({
      ...s,
      title
    })));
  };

  const handleCompleteStep = (step: TStepInit | TStep) => {
    setSteps(prev => updateStepByUuid(prev, step.uuid!, (s) => ({
      ...s,
      isCompleted: !s.isCompleted
    })));
  };

  const handleDeleteStep = (step: TStepInit | TStep) => {
    setSteps(prev => deleteStepByUuid(prev, step.uuid!));
  };

  const handleAddSubTask = (step: TStepInit | TStep) => {
    setSteps(prev => updateStepByUuid(prev, step.uuid!, (s) => ({
      ...s,
      steps: [
        ...(s.steps || []),
        {
          uuid: getUuid(),
          title: '',
          isCompleted: false,
          steps: []
        }
      ]
    })));
  };

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

  const handleAdd = () => {
    const bucketSteps = fixSteps(steps)
    const bucketList = {
      title: title,
      steps: bucketSteps,
      isCompleted: false,
      ...getBucketListCount(bucketSteps)
    }
    fetchCreateBucketList(
      bucketList
    )
  };

  const isDisabled = useMemo(() => {
    if (!title.trim() || steps.length === 0 || loading) {
      return true;
    } else {
      return false;
    }
  }, [title, steps, loading]);

  return (
    <PortalProvider shouldAddRootHost>
      <ThemedView style={styles.container}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>添加新的清单项</Text>
          <TouchableOpacity style={[styles.saveButton, isDisabled && styles.buttonDisabled]} onPress={handleAdd} disabled={isDisabled}>
            <Octicons name="check" size={24} color={isDisabled ? "#ccc" : "#0a7ea4"} />
          </TouchableOpacity>
        </View>
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
            {/* @ts-ignore */}
            <Octicons name={loading ? "stop" : "paper-airplane"} size={24} color={loading ? "#ccc" : "#0a7ea4"} />
          </TouchableOpacity>
        </View>
        {/* {loading && <Text style={styles.loadingText}>正在生成任务清单...</Text>} */}
        {
          steps.length > 0 && <ScrollView style={styles.scrollContainer}>
            {
              steps.map(step => <StepItem
                key={step.uuid}
                step={step}
                onUpdate={handleUpdateStep}
                onComplete={handleCompleteStep}
                onDelete={handleDeleteStep}
                onAddSubTask={handleAddSubTask}
                onGenerateAI={() => {}}
              />)
            }
          </ScrollView>
        }
      </ThemedView>
    </PortalProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  saveButton: {
    padding: 8,
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
  },
  scrollContainer: {
    flex: 1,
    marginTop: 8
  }
});