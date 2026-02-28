/**
 * TaskListScreen
 * Main screen showing all tasks with sort/filter bar, pull-to-refresh,
 * swipe-to-delete, FAB, and empty state.
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    Animated,
    StatusBar,
    Modal,
    Alert,
    Linking,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';
import { Task, TaskQueryParams, Priority } from '../types';
import { getTasks, updateTask, deleteTask } from '../api/tasks';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';

const SORT_OPTIONS = [
    { label: 'Smart Sort', value: 'mixed', icon: 'auto-fix' },
    { label: 'Priority', value: 'priority', icon: 'alert-circle-outline' },
    { label: 'Deadline', value: 'deadline', icon: 'clock-outline' },
    { label: 'Newest', value: 'dateTime', icon: 'sort-calendar-descending' },
];

const PRIORITY_FILTERS: (Priority | 'all')[] = ['all', 'urgent', 'high', 'medium', 'low'];

const CATEGORIES = ['All', 'General', 'Work', 'Personal', 'Health', 'Shopping', 'Study'];

const TaskListScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const { user, logout } = useAuth();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [refreshing, setRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    // Sort & Filter state
    const [sortBy, setSortBy] = useState<string>('mixed');
    const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
    const [filterCategory, setFilterCategory] = useState<string>('All');
    const [filterCompleted, setFilterCompleted] = useState<string>('');
    const [showSortModal, setShowSortModal] = useState(false);

    // FAB animation
    const fabScale = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(fabScale, {
            toValue: 1,
            useNativeDriver: true,
            tension: 50,
            friction: 5,
            delay: 500,
        }).start();
    }, [fabScale]);

    const fetchTasks = useCallback(async () => {
        try {
            const params: TaskQueryParams = { sortBy: sortBy as any };
            if (filterPriority !== 'all') {
                params.filterPriority = filterPriority;
            }
            if (filterCategory !== 'All') {
                params.filterCategory = filterCategory;
            }
            if (filterCompleted) {
                params.filterCompleted = filterCompleted;
            }
            const response = await getTasks(params);
            setTasks(response.tasks);
        } catch (error: any) {
            console.error('Failed to fetch tasks:', error);
            Alert.alert('Error', 'Failed to load tasks. Please try again.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, [sortBy, filterPriority, filterCategory, filterCompleted]);

    useEffect(() => {
        fetchTasks();
    }, [fetchTasks]);

    // Re-fetch when navigating back from AddTask
    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', () => {
            fetchTasks();
        });
        return unsubscribe;
    }, [navigation, fetchTasks]);

    const handleRefresh = () => {
        setRefreshing(true);
        fetchTasks();
    };

    const handleToggleComplete = async (task: Task) => {
        try {
            // Optimistic update
            setTasks(prev =>
                prev.map(t =>
                    t._id === task._id ? { ...t, completed: !t.completed } : t,
                ),
            );
            await updateTask(task._id, { completed: !task.completed });
        } catch (error: any) {
            // Revert on error
            setTasks(prev =>
                prev.map(t =>
                    t._id === task._id ? { ...t, completed: task.completed } : t,
                ),
            );
            Alert.alert('Error', 'Failed to update task.');
        }
    };

    const handleDelete = async (taskId: string) => {
        try {
            setTasks(prev => prev.filter(t => t._id !== taskId));
            await deleteTask(taskId);
        } catch (error: any) {
            fetchTasks(); // Revert
            Alert.alert('Error', 'Failed to delete task.');
        }
    };

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: logout,
            },
        ]);
    };

    const completedCount = tasks.filter(t => t.completed).length;
    const totalCount = tasks.length;

    const renderEmptyState = () => (
        <View style={styles.emptyContainer}>
            <Icon name="clipboard-text-outline" size={80} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>No tasks yet</Text>
            <Text style={styles.emptySubtitle}>
                Tap the + button to create your first task
            </Text>
        </View>
    );

    const renderHeader = () => (
        <View style={styles.listHeader}>
            {/* Sort & Filter Bar */}
            <View style={styles.filterRow}>
                <TouchableOpacity
                    style={styles.sortButton}
                    onPress={() => setShowSortModal(true)}>
                    <Icon
                        name={
                            SORT_OPTIONS.find(s => s.value === sortBy)?.icon || 'auto-fix'
                        }
                        size={16}
                        color={Colors.primary}
                    />
                    <Text style={styles.sortButtonText}>
                        {SORT_OPTIONS.find(s => s.value === sortBy)?.label}
                    </Text>
                    <Icon name="chevron-down" size={14} color={Colors.textMuted} />
                </TouchableOpacity>

                {/* Completion filter */}
                <View style={styles.completionFilter}>
                    {['', 'false', 'true'].map(val => (
                        <TouchableOpacity
                            key={val}
                            style={[
                                styles.filterChip,
                                filterCompleted === val && styles.filterChipActive,
                            ]}
                            onPress={() => setFilterCompleted(val)}>
                            <Text
                                style={[
                                    styles.filterChipText,
                                    filterCompleted === val && styles.filterChipTextActive,
                                ]}>
                                {val === '' ? 'All' : val === 'true' ? 'Done' : 'Active'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            </View>

            {/* Priority filter row */}
            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={PRIORITY_FILTERS}
                keyExtractor={item => item}
                contentContainerStyle={styles.priorityFilterList}
                renderItem={({ item }) => {
                    const isActive = filterPriority === item;
                    return (
                        <TouchableOpacity
                            style={[
                                styles.priorityChip,
                                isActive && styles.priorityChipActive,
                            ]}
                            onPress={() => setFilterPriority(item)}>
                            <Text
                                style={[
                                    styles.priorityChipText,
                                    isActive && styles.priorityChipTextActive,
                                ]}>
                                {item === 'all'
                                    ? '✨ All'
                                    : item === 'urgent'
                                        ? '🔴 Urgent'
                                        : item === 'high'
                                            ? '🟠 High'
                                            : item === 'medium'
                                                ? '🟡 Medium'
                                                : '🟢 Low'}
                            </Text>
                        </TouchableOpacity>
                    );
                }}
            />

            {/* Category filter */}
            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={CATEGORIES}
                keyExtractor={item => item}
                contentContainerStyle={styles.categoryFilterList}
                renderItem={({ item }) => {
                    const isActive = filterCategory === item;
                    return (
                        <TouchableOpacity
                            style={[
                                styles.categoryChip,
                                isActive && styles.categoryChipActive,
                            ]}
                            onPress={() => setFilterCategory(item)}>
                            <Text
                                style={[
                                    styles.categoryChipText,
                                    isActive && styles.categoryChipTextActive,
                                ]}>
                                {item}
                            </Text>
                        </TouchableOpacity>
                    );
                }}
            />

            {/* Stats */}
            {totalCount > 0 && (
                <View style={styles.statsRow}>
                    <Text style={styles.statsText}>
                        {completedCount}/{totalCount} completed
                    </Text>
                    <View style={styles.progressBarBg}>
                        <View
                            style={[
                                styles.progressBarFill,
                                {
                                    width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
                                },
                            ]}
                        />
                    </View>
                </View>
            )}
        </View>
    );

    const renderFooter = () => (
        <View style={styles.footerContainer}>
            <Text style={styles.footerText}>
                Built with ❤️ by{' '}
                <Text
                    style={styles.footerLink}
                    onPress={() =>
                        Linking.openURL(
                            'https://www.linkedin.com/in/siva-rama-krishna-reddy-padala/',
                        )
                    }>
                    SRKREDDY
                </Text>
            </Text>
        </View>
    );

    return (
        <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientMiddle, Colors.gradientEnd]}
            style={styles.gradient}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.gradientStart} />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <Text style={styles.greeting}>Hello! 👋</Text>
                    <Text style={styles.email} numberOfLines={1}>
                        {user?.email}
                    </Text>
                </View>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <Icon name="logout" size={22} color={Colors.textSecondary} />
                </TouchableOpacity>
            </View>

            {/* Task List */}
            <FlatList
                data={tasks}
                keyExtractor={item => item._id}
                renderItem={({ item }) => (
                    <TaskCard
                        task={item}
                        onToggleComplete={handleToggleComplete}
                        onDelete={handleDelete}
                    />
                )}
                ListHeaderComponent={renderHeader}
                ListFooterComponent={renderFooter}
                ListEmptyComponent={loading ? null : renderEmptyState}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor={Colors.primary}
                        colors={[Colors.primary]}
                    />
                }
            />

            {/* FAB */}
            <Animated.View
                style={[styles.fab, { transform: [{ scale: fabScale }] }]}>
                <TouchableOpacity
                    onPress={() => navigation.navigate('AddTask')}
                    activeOpacity={0.85}>
                    <LinearGradient
                        colors={[Colors.primary, Colors.accent]}
                        style={styles.fabGradient}>
                        <Icon name="plus" size={28} color={Colors.white} />
                    </LinearGradient>
                </TouchableOpacity>
            </Animated.View>

            {/* Sort Modal */}
            <Modal
                visible={showSortModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowSortModal(false)}>
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setShowSortModal(false)}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Sort Tasks</Text>
                        {SORT_OPTIONS.map(option => (
                            <TouchableOpacity
                                key={option.value}
                                style={[
                                    styles.sortOption,
                                    sortBy === option.value && styles.sortOptionActive,
                                ]}
                                onPress={() => {
                                    setSortBy(option.value);
                                    setShowSortModal(false);
                                }}>
                                <Icon
                                    name={option.icon}
                                    size={20}
                                    color={
                                        sortBy === option.value
                                            ? Colors.primary
                                            : Colors.textSecondary
                                    }
                                />
                                <Text
                                    style={[
                                        styles.sortOptionText,
                                        sortBy === option.value && styles.sortOptionTextActive,
                                    ]}>
                                    {option.label}
                                </Text>
                                {sortBy === option.value && (
                                    <Icon name="check" size={18} color={Colors.primary} />
                                )}
                            </TouchableOpacity>
                        ))}
                    </View>
                </TouchableOpacity>
            </Modal>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: Spacing.xxl,
        paddingTop: Spacing.huge,
        paddingBottom: Spacing.lg,
    },
    headerLeft: {
        flex: 1,
    },
    greeting: {
        fontSize: Typography.fontSize.xxxl,
        fontWeight: Typography.fontWeight.extrabold,
        color: Colors.textPrimary,
        letterSpacing: 0.5,
    },
    email: {
        fontSize: Typography.fontSize.md,
        color: Colors.textSecondary,
        marginTop: Spacing.xs,
    },
    logoutButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(108, 99, 255, 0.12)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    listHeader: {
        paddingBottom: Spacing.md,
    },
    filterRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.xxl,
        marginBottom: Spacing.sm,
        gap: Spacing.sm,
    },
    sortButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(108, 99, 255, 0.12)',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        borderRadius: BorderRadius.round,
        gap: 6,
    },
    sortButtonText: {
        color: Colors.primary,
        fontSize: Typography.fontSize.sm,
        fontWeight: Typography.fontWeight.semibold,
    },
    completionFilter: {
        flexDirection: 'row',
        gap: 4,
    },
    filterChip: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.round,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
    },
    filterChipActive: {
        backgroundColor: 'rgba(108, 99, 255, 0.2)',
    },
    filterChipText: {
        color: Colors.textMuted,
        fontSize: Typography.fontSize.xs,
        fontWeight: Typography.fontWeight.medium,
    },
    filterChipTextActive: {
        color: Colors.primary,
    },
    priorityFilterList: {
        paddingHorizontal: Spacing.xxl,
        marginBottom: Spacing.sm,
    },
    priorityChip: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.round,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        marginRight: Spacing.xs,
    },
    priorityChipActive: {
        backgroundColor: 'rgba(108, 99, 255, 0.2)',
        borderWidth: 1,
        borderColor: 'rgba(108, 99, 255, 0.4)',
    },
    priorityChipText: {
        color: Colors.textMuted,
        fontSize: Typography.fontSize.xs,
        fontWeight: Typography.fontWeight.medium,
    },
    priorityChipTextActive: {
        color: Colors.textPrimary,
    },
    categoryFilterList: {
        paddingHorizontal: Spacing.xxl,
        marginBottom: Spacing.md,
    },
    categoryChip: {
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.round,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        marginRight: Spacing.xs,
    },
    categoryChipActive: {
        backgroundColor: 'rgba(0, 210, 255, 0.15)',
        borderWidth: 1,
        borderColor: 'rgba(0, 210, 255, 0.3)',
    },
    categoryChipText: {
        color: Colors.textMuted,
        fontSize: Typography.fontSize.xs,
        fontWeight: Typography.fontWeight.medium,
    },
    categoryChipTextActive: {
        color: Colors.secondary,
    },
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.xxl,
        gap: Spacing.sm,
        marginBottom: Spacing.sm,
    },
    statsText: {
        color: Colors.textMuted,
        fontSize: Typography.fontSize.xs,
        fontWeight: Typography.fontWeight.medium,
        minWidth: 85,
    },
    progressBarBg: {
        flex: 1,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        overflow: 'hidden',
    },
    progressBarFill: {
        height: '100%',
        borderRadius: 2,
        backgroundColor: Colors.success,
    },
    listContent: {
        paddingBottom: 100,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: Spacing.huge * 2,
        gap: Spacing.md,
    },
    emptyTitle: {
        fontSize: Typography.fontSize.xxl,
        fontWeight: Typography.fontWeight.bold,
        color: Colors.textSecondary,
    },
    emptySubtitle: {
        fontSize: Typography.fontSize.md,
        color: Colors.textMuted,
        textAlign: 'center',
        maxWidth: 250,
    },
    fab: {
        position: 'absolute',
        right: Spacing.xxl,
        bottom: Spacing.xxxl,
        ...Shadows.fab,
    },
    fabGradient: {
        width: 58,
        height: 58,
        borderRadius: 29,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.xxl,
    },
    modalContent: {
        backgroundColor: Colors.backgroundMid,
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        padding: Spacing.xxl,
        width: '100%',
        maxWidth: 340,
    },
    modalTitle: {
        fontSize: Typography.fontSize.xl,
        fontWeight: Typography.fontWeight.bold,
        color: Colors.textPrimary,
        marginBottom: Spacing.lg,
        textAlign: 'center',
    },
    sortOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.md,
        gap: Spacing.md,
        marginBottom: Spacing.xs,
    },
    sortOptionActive: {
        backgroundColor: 'rgba(108, 99, 255, 0.12)',
    },
    sortOptionText: {
        flex: 1,
        fontSize: Typography.fontSize.lg,
        color: Colors.textSecondary,
        fontWeight: Typography.fontWeight.medium,
    },
    sortOptionTextActive: {
        color: Colors.primary,
        fontWeight: Typography.fontWeight.bold,
    },
    footerContainer: {
        paddingVertical: Spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    footerText: {
        color: Colors.textMuted,
        fontSize: Typography.fontSize.sm,
        fontWeight: Typography.fontWeight.medium,
    },
    footerLink: {
        color: Colors.primary,
        fontWeight: Typography.fontWeight.bold,
        textDecorationLine: 'underline',
    },
});

export default TaskListScreen;
