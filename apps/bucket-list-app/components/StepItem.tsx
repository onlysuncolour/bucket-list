import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Animated } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { TStep, TStepInit } from 'bucket-list-types';

interface StepItemProps {
  step: TStep | TStepInit;
  bucketListId?: string;
  onUpdate?: (stepId: string, title: string) => void;
  onComplete?: (stepId: string) => void;
  onDelete?: (stepId: string) => void;
  onAddSubTask?: (stepId: string) => void;
  onGenerateAI?: (stepId: string) => void;
}

export function StepItem({
  step,
  bucketListId,
  onUpdate,
  onComplete,
  onDelete,
  onAddSubTask,
  onGenerateAI,
}: StepItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(step.title);
  const [showActions, setShowActions] = useState(false);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const pressTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const longPressTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const animationValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    return () => {
      if (pressTimeoutRef.current) {
        clearTimeout(pressTimeoutRef.current);
      }
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
      }
    };
  }, []);

  const handlePressIn = () => {
    pressTimeoutRef.current = setTimeout(() => {
      setIsLongPressing(true);
      Animated.timing(animationValue, {
        toValue: 1,
        duration: 250,
        useNativeDriver: false,
      }).start();

      longPressTimeoutRef.current = setTimeout(() => {
        if (onComplete) {
          onComplete(step.id || step.uuid || '');
        }
        setIsLongPressing(false);
        animationValue.setValue(0);
      }, 400);
    }, 150);
  };

  const handlePressOut = () => {
    if (pressTimeoutRef.current) {
      clearTimeout(pressTimeoutRef.current);
    }
    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
    }

    if (isLongPressing) {
      setIsLongPressing(false);
      Animated.timing(animationValue, {
        toValue: 0,
        duration: 100,
        useNativeDriver: false,
      }).start();
    } else {
      handleToggleExpand();
    }
  };

  const handleToggleExpand = () => {
    if (step.steps && step.steps.length > 0) {
      setIsExpanded(!isExpanded);
    }
  };

  const handleStartEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (editedTitle.trim() !== step.title && onUpdate) {
      onUpdate(step.id || step.uuid || '', editedTitle.trim());
    }
    setIsEditing(false);
  };

  const handleToggleActions = () => {
    setShowActions(!showActions);
  };

  const getCurrentIcon = () => {
    if (!step.steps || step.steps.length === 0) {
      return step.isCompleted ? 'checkcircle' : 'clockcircleo';
    }
    return step.isCompleted
      ? (isExpanded ? 'upcircle' : 'downcircle')
      : (isExpanded ? 'upcircleo' : 'downcircleo');
  };

  const getTargetIcon = () => {
    if (!step.steps || step.steps.length === 0) {
      return step.isCompleted ? 'clockcircleo' : 'checkcircle';
    }
    return step.isCompleted
      ? (isExpanded ? 'upcircleo' : 'downcircleo')
      : (isExpanded ? 'upcircle' : 'downcircle');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity 
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          style={styles.expandButton}
        >
          <Animated.View style={{
            opacity: animationValue.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 0],
            }),
          }}>
            {/* @ts-ignore */}
            <AntDesign
              name={getCurrentIcon()}
              size={24}
              color="#666"
            />
          </Animated.View>
          <Animated.View style={{
            position: 'absolute',
            opacity: animationValue,
          }}>
            {/* @ts-ignore */}
            <AntDesign
              name={getTargetIcon()}
              size={24}
              color="#666"
            />
          </Animated.View>
        </TouchableOpacity>

        {isEditing ? (
          <TextInput
            style={styles.titleInput}
            value={editedTitle}
            onChangeText={setEditedTitle}
            onBlur={handleSaveEdit}
            autoFocus
          />
        ) : (
          <TouchableOpacity style={styles.titleContainer} onPress={handleStartEdit}>
            <Text style={styles.title}>{step.title}</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={handleToggleActions} style={styles.actionsButton}>
          {/* @ts-ignore */}
          <AntDesign name="right" size={24} color="#666" />
        </TouchableOpacity>
      </View>

      {showActions && (
        <View style={styles.actionsMenu}>
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => onComplete?.(step.id || step.uuid || '')}>
            <Text>完成</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => onDelete?.(step.id || step.uuid || '')}>
            <Text>删除</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => onAddSubTask?.(step.id || step.uuid || '')}>
            <Text>添加子任务</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => onGenerateAI?.(step.id || step.uuid || '')}>
            <Text>AI生成</Text>
          </TouchableOpacity>
        </View>
      )}

      {isExpanded && step.steps && step.steps.length > 0 && (
        <View style={styles.subSteps}>
          {step.steps.map((subStep) => (
            <StepItem
              key={subStep.id || subStep.uuid}
              step={subStep}
              bucketListId={bucketListId}
              onUpdate={onUpdate}
              onComplete={onComplete}
              onDelete={onDelete}
              onAddSubTask={onAddSubTask}
              onGenerateAI={onGenerateAI}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  expandButton: {
    marginRight: 8,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  titleInput: {
    flex: 1,
    fontSize: 16,
    padding: 0,
    borderBottomWidth: 1,
    borderBottomColor: '#666',
  },
  actionsButton: {
    marginLeft: 8,
  },
  actionsMenu: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  actionItem: {
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  subSteps: {
    marginTop: 8,
    marginLeft: 24,
  },
});