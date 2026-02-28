/**
 * TaskCard Component
 * Glassmorphism card with priority color indicator, swipe-to-delete,
 * animated completion toggle, and deadline display.
 */

import React, { useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Animated,
    PanResponder,
    Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Task } from '../types';
import { Colors, Typography, Spacing, BorderRadius, GlassCard, getPriorityColor } from '../theme';
import PriorityBadge from './PriorityBadge';
import CategoryTag from './CategoryTag';

interface TaskCardProps {
    task: Task;
    onToggleComplete: (task: Task) => void;
    onDelete: (taskId: string) => void;
    onPress?: (task: Task) => void;
}

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = -80;

const TaskCard: React.FC<TaskCardProps> = ({
    task,
    onToggleComplete,
    onDelete,
    onPress,
}) => {
    const translateX = useRef(new Animated.Value(0)).current;
    const completionAnim = useRef(new Animated.Value(task.completed ? 1 : 0)).current;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => false,
            onMoveShouldSetPanResponder: (_evt, gestureState) => {
                return Math.abs(gestureState.dx) > 10 && Math.abs(gestureState.dy) < 10;
            },
            onPanResponderMove: (_evt, gestureState) => {
                if (gestureState.dx < 0) {
                    translateX.setValue(Math.max(gestureState.dx, -120));
                }
            },
            onPanResponderRelease: (_evt, gestureState) => {
                if (gestureState.dx < SWIPE_THRESHOLD) {
                    // Show delete action
                    Animated.spring(translateX, {
                        toValue: -100,
                        useNativeDriver: true,
                    }).start();
                } else {
                    // Snap back
                    Animated.spring(translateX, {
                        toValue: 0,
                        useNativeDriver: true,
                    }).start();
                }
            },
        }),
    ).current;

    const handleToggleComplete = () => {
        Animated.timing(completionAnim, {
            toValue: task.completed ? 0 : 1,
            duration: 300,
            useNativeDriver: false,
        }).start();
        onToggleComplete(task);
    };

    const handleDelete = () => {
        Animated.timing(translateX, {
            toValue: -SCREEN_WIDTH,
            duration: 250,
            useNativeDriver: true,
        }).start(() => {
            onDelete(task._id);
        });
    };

    const formatDeadline = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = date.getTime() - now.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

        if (days < 0) { return 'Overdue'; }
        if (days === 0) { return 'Due today'; }
        if (days === 1) { return 'Due tomorrow'; }
        if (days <= 7) { return `${days} days left`; }
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
        });
    };

    const getDeadlineColor = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diff = date.getTime() - now.getTime();
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24));

        if (days < 0) { return Colors.error; }
        if (days <= 1) { return Colors.warning; }
        if (days <= 3) { return Colors.priorityHigh; }
        return Colors.textSecondary;
    };

    const priorityColor = getPriorityColor(task.priority);

    const textDecorationStyle = completionAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [0, 1],
    });

    return (
        <View style={styles.wrapper}>
            {/* Delete action behind the card */}
            <View style={styles.deleteAction}>
                <TouchableOpacity onPress={handleDelete} style={[styles.deleteButton, { width: 100, height: '100%' }]} activeOpacity={0.7}>
                    <Icon name="trash-can-outline" size={24} color={Colors.white} />
                    <Text style={styles.deleteText}>Delete</Text>
                </TouchableOpacity>
            </View>

            <Animated.View
                style={[styles.cardOuter, { transform: [{ translateX }] }]}
                {...panResponder.panHandlers}>
                <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={() => onPress?.(task)}
                    style={styles.touchable}>
                    {/* Priority color strip */}
                    <View
                        style={[styles.priorityStrip, { backgroundColor: priorityColor }]}
                    />

                    <View style={styles.cardContent}>
                        {/* Top row: Checkbox + Title */}
                        <View style={styles.topRow}>
                            <TouchableOpacity
                                onPress={handleToggleComplete}
                                style={styles.checkboxContainer}>
                                <View
                                    style={[
                                        styles.checkbox,
                                        task.completed && {
                                            backgroundColor: Colors.success,
                                            borderColor: Colors.success,
                                        },
                                    ]}>
                                    {task.completed && (
                                        <Icon name="check" size={14} color={Colors.white} />
                                    )}
                                </View>
                            </TouchableOpacity>

                            <View style={styles.titleContainer}>
                                <Animated.Text
                                    style={[
                                        styles.title,
                                        task.completed && styles.titleCompleted,
                                        {
                                            opacity: completionAnim.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [1, 0.5],
                                            }),
                                        },
                                    ]}
                                    numberOfLines={1}>
                                    {task.title}
                                </Animated.Text>
                                {task.description ? (
                                    <Text style={styles.description} numberOfLines={1}>
                                        {task.description}
                                    </Text>
                                ) : null}
                            </View>
                        </View>

                        {/* Bottom row: badges + deadline */}
                        <View style={styles.bottomRow}>
                            <View style={styles.badges}>
                                <PriorityBadge priority={task.priority} />
                                <CategoryTag category={task.category} />
                            </View>

                            <View style={styles.deadlineContainer}>
                                <Icon
                                    name="clock-outline"
                                    size={12}
                                    color={getDeadlineColor(task.deadline)}
                                />
                                <Text
                                    style={[
                                        styles.deadlineText,
                                        { color: getDeadlineColor(task.deadline) },
                                    ]}>
                                    {formatDeadline(task.deadline)}
                                </Text>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        marginHorizontal: Spacing.lg,
        marginBottom: Spacing.md,
    },
    deleteAction: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: 100,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.error,
        borderRadius: BorderRadius.lg,
    },
    deleteButton: {
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
    },
    deleteText: {
        color: Colors.white,
        fontSize: Typography.fontSize.xs,
        fontWeight: Typography.fontWeight.semibold,
    },
    cardOuter: {
        ...GlassCard,
        overflow: 'hidden',
        flexDirection: 'row',
    },
    touchable: {
        flex: 1,
        flexDirection: 'row',
    },
    priorityStrip: {
        width: 4,
        borderTopLeftRadius: BorderRadius.lg,
        borderBottomLeftRadius: BorderRadius.lg,
    },
    cardContent: {
        flex: 1,
        padding: Spacing.md,
        gap: Spacing.sm,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    checkboxContainer: {
        paddingRight: Spacing.md,
        paddingTop: 2,
    },
    checkbox: {
        width: 22,
        height: 22,
        borderRadius: 6,
        borderWidth: 2,
        borderColor: Colors.textMuted,
        alignItems: 'center',
        justifyContent: 'center',
    },
    titleContainer: {
        flex: 1,
    },
    title: {
        color: Colors.textPrimary,
        fontSize: Typography.fontSize.lg,
        fontWeight: Typography.fontWeight.semibold,
        letterSpacing: 0.2,
    },
    titleCompleted: {
        textDecorationLine: 'line-through',
        color: Colors.textMuted,
    },
    description: {
        color: Colors.textSecondary,
        fontSize: Typography.fontSize.sm,
        marginTop: 2,
    },
    bottomRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginLeft: 34, // align with title (checkbox width + padding)
    },
    badges: {
        flexDirection: 'row',
        gap: Spacing.xs,
        flexShrink: 1,
    },
    deadlineContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    deadlineText: {
        fontSize: Typography.fontSize.xs,
        fontWeight: Typography.fontWeight.medium,
    },
});

export default TaskCard;
