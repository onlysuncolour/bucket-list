import { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Animated, Dimensions } from 'react-native';
import AntDesign from '@expo/vector-icons/AntDesign';
import { TStep, TStepInit } from 'bucket-list-types';
import { PopoverMenu } from './popoverMenu';

interface StepItemProps {
  step: TStep | TStepInit;
  bucketListId?: string;
  onUpdate?: (step: TStep | TStepInit, title: string) => void;
  onComplete?: (step: TStep | TStepInit) => void;
  onDelete?: (step: TStep | TStepInit) => void;
  onAddSubTask?: (step: TStep | TStepInit) => void;
  onGenerateAI?: (step: TStep | TStepInit) => void;
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
  const [menuPosition, setMenuPosition] = useState({ top: 0, bottom: 'auto' });
  const pressTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const longPressTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const animationValue = useRef(new Animated.Value(0)).current;
  const containerRef = useRef<View>(null);

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
          onComplete(step || '');
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
    setEditedTitle(step.title)
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (editedTitle.trim() !== step.title && onUpdate) {
      onUpdate(step, editedTitle.trim());
    }
    setIsEditing(false);
  };

  // const handleToggleActions = () => {
  //   if (!showActions) {
  //     const headerElement = containerRef.current?.children[0];
  //     if (headerElement) {
  //       const header = headerElement as unknown as View;
  //       header.measure((x, y, width, headerHeight, pageX, pageY) => {
  //         const windowHeight = Dimensions.get('window').height;
  //         const spaceBelow = windowHeight - pageY - headerHeight - 16;
  //         const menuHeight = 160; // 估算的菜单高度

  //         if (spaceBelow < menuHeight && pageY > menuHeight) {
  //           // 如果下方空间不足且上方空间足够，向上展开
  //           setMenuPosition({ bottom: headerHeight, top: 'auto' });
  //         } else {
  //           // 默认向下展开
  //           setMenuPosition({ top: headerHeight + 16, bottom: 'auto' });
  //         }
  //       });
  //     }
  //   }
  //   setShowActions(!showActions);
  // };

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
    <View ref={containerRef} style={styles.container}>
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

        <PopoverMenu
          triggerNode={<AntDesign name="right" size={24} color="#666" />}
          menus={[
            {title: '完成', action: () => onComplete?.(step)},
            {title: '删除', action: () => onDelete?.(step)},
            {title: '添加子任务', action: () => onAddSubTask?.(step)},
            {title: 'AI生成', action: () => onGenerateAI?.(step)},
          ]}
        ></PopoverMenu>
        {/* <TouchableOpacity onPress={handleToggleActions} style={styles.actionsButton}> */}
          {/* @ts-ignore */}
          {/* <AntDesign name="right" size={24} color="#666" /> */}
        {/* </TouchableOpacity> */}
      </View>

      {/* {showActions && (
        <>
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={0}
            onPress={() => setShowActions(false)}
          />
          <View style={[styles.actionsMenu, menuPosition]}>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => onComplete?.(step)}>
              <Text>完成</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => onDelete?.(step)}>
              <Text>删除</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => onAddSubTask?.(step)}>
              <Text>添加子任务</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionItem}
              onPress={() => onGenerateAI?.(step)}>
              <Text>AI生成</Text>
            </TouchableOpacity>
          </View>
        </>
      )} */}

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
    position: 'relative',
    // zIndex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    zIndex: 3,
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
  overlay: {
    position: 'absolute',
    top: -1000,
    left: -1000,
    right: -1000,
    bottom: -1000,
    backgroundColor: 'transparent',
    zIndex: 2,
  },
  actionsMenu: {
    position: 'absolute',
    right: 0,
    padding: 8,
    backgroundColor: '#fff',
    borderRadius: 4,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 3,
    minWidth: 80,
  },
  actionItem: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  subSteps: {
    marginTop: 8,
    marginLeft: 24,
    position: 'relative',
    zIndex: 1,
  },
});