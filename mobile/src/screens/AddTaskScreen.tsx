/**
 * AddTaskScreen
 * Form to create a new task with title, description, date/time pickers,
 * priority selector, and category selector.
 */

import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    StatusBar,
    Alert,
    Platform,
    TextInput,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import DateTimePicker, {
    DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Colors, Typography, Spacing, BorderRadius, getPriorityColor, getPriorityBgColor, GlassCard } from '../theme';
import { Priority } from '../types';
import { createTask } from '../api/tasks';
import Button from '../components/Button';
import InputField from '../components/InputField';

const PRIORITIES: Priority[] = ['low', 'medium', 'high', 'urgent'];
const PRIORITY_LABELS: Record<Priority, string> = {
    low: '🟢 Low',
    medium: '🟡 Medium',
    high: '🟠 High',
    urgent: '🔴 Urgent',
};

const CATEGORIES = ['General', 'Work', 'Personal', 'Health', 'Shopping', 'Study'];
const CATEGORY_ICONS: Record<string, string> = {
    General: 'folder-outline',
    Work: 'briefcase-outline',
    Personal: 'account-outline',
    Health: 'heart-outline',
    Shopping: 'cart-outline',
    Study: 'book-outline',
};

const AddTaskScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [deadline, setDeadline] = useState(new Date(Date.now() + 86400000)); // tomorrow
    const [priority, setPriority] = useState<Priority>('medium');
    const [category, setCategory] = useState('General');
    const [loading, setLoading] = useState(false);

    // DateTimePicker state
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [showTimePicker, setShowTimePicker] = useState(false);

    const [errors, setErrors] = useState<{ title?: string }>({});

    const handleDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowDatePicker(false);
        if (selectedDate) {
            const newDeadline = new Date(deadline);
            newDeadline.setFullYear(selectedDate.getFullYear());
            newDeadline.setMonth(selectedDate.getMonth());
            newDeadline.setDate(selectedDate.getDate());
            setDeadline(newDeadline);
        }
    };

    const handleTimeChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
        setShowTimePicker(false);
        if (selectedDate) {
            const newDeadline = new Date(deadline);
            newDeadline.setHours(selectedDate.getHours());
            newDeadline.setMinutes(selectedDate.getMinutes());
            setDeadline(newDeadline);
        }
    };

    const handleSave = async () => {
        if (!title.trim()) {
            setErrors({ title: 'Task title is required' });
            return;
        }

        setLoading(true);
        try {
            await createTask({
                title: title.trim(),
                description: description.trim(),
                deadline: deadline.toISOString(),
                priority,
                category,
            });
            navigation.goBack();
        } catch (error: any) {
            const message =
                error.response?.data?.message || 'Failed to create task.';
            Alert.alert('Error', message);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (date: Date) =>
        date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });

    const formatTime = (date: Date) =>
        date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
        });

    return (
        <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientMiddle, Colors.gradientEnd]}
            style={styles.gradient}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.gradientStart} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color={Colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>New Task</Text>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled">
                {/* Title */}
                <InputField
                    label="Title"
                    icon="format-title"
                    placeholder="What needs to be done?"
                    value={title}
                    onChangeText={text => {
                        setTitle(text);
                        if (errors.title) { setErrors({}); }
                    }}
                    error={errors.title}
                    maxLength={100}
                />

                {/* Description */}
                <View style={styles.fieldContainer}>
                    <Text style={styles.label}>DESCRIPTION</Text>
                    <View style={styles.textAreaContainer}>
                        <Icon
                            name="text-box-outline"
                            size={20}
                            color={Colors.textMuted}
                            style={styles.textAreaIcon}
                        />
                        <TextInput
                            style={styles.textArea}
                            placeholder="Add some details..."
                            placeholderTextColor={Colors.textMuted}
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={4}
                            maxLength={500}
                            textAlignVertical="top"
                        />
                    </View>
                </View>

                {/* Deadline: Date & Time */}
                <Text style={styles.sectionLabel}>DEADLINE</Text>
                <View style={styles.dateTimeRow}>
                    <TouchableOpacity
                        style={styles.dateTimeButton}
                        onPress={() => setShowDatePicker(true)}>
                        <Icon name="calendar" size={20} color={Colors.primary} />
                        <View style={styles.dateTimeTextContainer}>
                            <Text style={styles.dateTimeLabel}>Date</Text>
                            <Text style={styles.dateTimeValue}>{formatDate(deadline)}</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.dateTimeButton}
                        onPress={() => setShowTimePicker(true)}>
                        <Icon name="clock-outline" size={20} color={Colors.secondary} />
                        <View style={styles.dateTimeTextContainer}>
                            <Text style={styles.dateTimeLabel}>Time</Text>
                            <Text style={styles.dateTimeValue}>{formatTime(deadline)}</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {showDatePicker && (
                    <DateTimePicker
                        value={deadline}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={handleDateChange}
                        minimumDate={new Date()}
                    />
                )}
                {showTimePicker && (
                    <DateTimePicker
                        value={deadline}
                        mode="time"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={handleTimeChange}
                    />
                )}

                {/* Priority Selector */}
                <Text style={styles.sectionLabel}>PRIORITY</Text>
                <View style={styles.priorityRow}>
                    {PRIORITIES.map(p => {
                        const isActive = priority === p;
                        const color = getPriorityColor(p);
                        const bgColor = getPriorityBgColor(p);
                        return (
                            <TouchableOpacity
                                key={p}
                                style={[
                                    styles.priorityButton,
                                    { backgroundColor: isActive ? bgColor : 'rgba(255,255,255,0.05)' },
                                    isActive && { borderColor: color, borderWidth: 1.5 },
                                ]}
                                onPress={() => setPriority(p)}>
                                <Text style={[styles.priorityText, isActive && { color }]}>
                                    {PRIORITY_LABELS[p]}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Category Selector */}
                <Text style={styles.sectionLabel}>CATEGORY</Text>
                <View style={styles.categoryGrid}>
                    {CATEGORIES.map(cat => {
                        const isActive = category === cat;
                        return (
                            <TouchableOpacity
                                key={cat}
                                style={[
                                    styles.categoryButton,
                                    isActive && styles.categoryButtonActive,
                                ]}
                                onPress={() => setCategory(cat)}>
                                <Icon
                                    name={CATEGORY_ICONS[cat]}
                                    size={20}
                                    color={isActive ? Colors.primary : Colors.textMuted}
                                />
                                <Text
                                    style={[
                                        styles.categoryText,
                                        isActive && styles.categoryTextActive,
                                    ]}>
                                    {cat}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                {/* Save Button */}
                <Button
                    title="Create Task"
                    onPress={handleSave}
                    loading={loading}
                    style={styles.saveButton}
                />
            </ScrollView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.xxl,
        paddingTop: Spacing.huge,
        paddingBottom: Spacing.lg,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(108, 99, 255, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        flex: 1,
        textAlign: 'center',
        fontSize: Typography.fontSize.xxl,
        fontWeight: Typography.fontWeight.bold,
        color: Colors.textPrimary,
        letterSpacing: 0.5,
    },
    headerSpacer: {
        width: 44,
    },
    scrollContent: {
        paddingHorizontal: Spacing.xxl,
        paddingBottom: Spacing.huge,
    },
    fieldContainer: {
        marginBottom: Spacing.lg,
    },
    label: {
        color: Colors.textSecondary,
        fontSize: Typography.fontSize.sm,
        fontWeight: Typography.fontWeight.medium,
        marginBottom: Spacing.xs,
        marginLeft: Spacing.xs,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    textAreaContainer: {
        backgroundColor: Colors.inputBackground,
        borderRadius: BorderRadius.md,
        borderWidth: 1.5,
        borderColor: Colors.inputBorder,
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.md,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    textAreaIcon: {
        marginRight: Spacing.sm,
        marginTop: 2,
    },
    textArea: {
        flex: 1,
        color: Colors.textPrimary,
        fontSize: Typography.fontSize.lg,
        minHeight: 100,
        paddingBottom: Spacing.md,
    },
    sectionLabel: {
        color: Colors.textSecondary,
        fontSize: Typography.fontSize.sm,
        fontWeight: Typography.fontWeight.medium,
        marginBottom: Spacing.md,
        marginLeft: Spacing.xs,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    dateTimeRow: {
        flexDirection: 'row',
        gap: Spacing.md,
        marginBottom: Spacing.xxl,
    },
    dateTimeButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        ...GlassCard,
        padding: Spacing.md,
        gap: Spacing.sm,
    },
    dateTimeTextContainer: {
        flex: 1,
    },
    dateTimeLabel: {
        color: Colors.textMuted,
        fontSize: Typography.fontSize.xs,
        fontWeight: Typography.fontWeight.medium,
        textTransform: 'uppercase',
        letterSpacing: 0.3,
    },
    dateTimeValue: {
        color: Colors.textPrimary,
        fontSize: Typography.fontSize.md,
        fontWeight: Typography.fontWeight.semibold,
        marginTop: 2,
    },
    priorityRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
        marginBottom: Spacing.xxl,
    },
    priorityButton: {
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    priorityText: {
        fontSize: Typography.fontSize.md,
        fontWeight: Typography.fontWeight.medium,
        color: Colors.textMuted,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: Spacing.sm,
        marginBottom: Spacing.xxxl,
    },
    categoryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.md,
        borderRadius: BorderRadius.md,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'transparent',
    },
    categoryButtonActive: {
        backgroundColor: 'rgba(108, 99, 255, 0.12)',
        borderColor: 'rgba(108, 99, 255, 0.4)',
    },
    categoryText: {
        color: Colors.textMuted,
        fontSize: Typography.fontSize.md,
        fontWeight: Typography.fontWeight.medium,
    },
    categoryTextActive: {
        color: Colors.primary,
    },
    saveButton: {
        marginTop: Spacing.md,
    },
});

export default AddTaskScreen;
