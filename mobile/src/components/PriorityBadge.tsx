/**
 * PriorityBadge Component
 * Color-coded priority indicator with emoji and label.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Priority } from '../types';
import {
    getPriorityColor,
    getPriorityBgColor,
    getPriorityEmoji,
    Typography,
    Spacing,
    BorderRadius,
} from '../theme';

interface PriorityBadgeProps {
    priority: Priority;
    compact?: boolean;
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({
    priority,
    compact = false,
}) => {
    const color = getPriorityColor(priority);
    const bgColor = getPriorityBgColor(priority);
    const emoji = getPriorityEmoji(priority);

    if (compact) {
        return (
            <View style={[styles.compactBadge, { backgroundColor: bgColor }]}>
                <Text style={styles.emoji}>{emoji}</Text>
            </View>
        );
    }

    return (
        <View style={[styles.badge, { backgroundColor: bgColor }]}>
            <Text style={styles.emoji}>{emoji}</Text>
            <Text style={[styles.label, { color }]}>
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.round,
        gap: 4,
    },
    compactBadge: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 24,
        height: 24,
        borderRadius: 12,
    },
    emoji: {
        fontSize: Typography.fontSize.xs,
    },
    label: {
        fontSize: Typography.fontSize.xs,
        fontWeight: Typography.fontWeight.semibold,
        textTransform: 'capitalize',
        letterSpacing: 0.3,
    },
});

export default PriorityBadge;
