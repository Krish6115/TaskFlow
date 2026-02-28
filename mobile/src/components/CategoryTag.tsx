/**
 * CategoryTag Component
 * Pill-shaped tag with subtle background color for task categories.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';

interface CategoryTagProps {
    category: string;
}

const categoryIcons: Record<string, string> = {
    General: 'folder-outline',
    Work: 'briefcase-outline',
    Personal: 'account-outline',
    Health: 'heart-outline',
    Shopping: 'cart-outline',
    Study: 'book-outline',
};

const categoryColors: Record<string, string> = {
    General: 'rgba(108, 99, 255, 0.15)',
    Work: 'rgba(0, 210, 255, 0.15)',
    Personal: 'rgba(255, 140, 66, 0.15)',
    Health: 'rgba(255, 59, 92, 0.15)',
    Shopping: 'rgba(74, 222, 128, 0.15)',
    Study: 'rgba(255, 217, 61, 0.15)',
};

const categoryTextColors: Record<string, string> = {
    General: '#8B83FF',
    Work: '#00D2FF',
    Personal: '#FF8C42',
    Health: '#FF3B5C',
    Shopping: '#4ADE80',
    Study: '#FFD93D',
};

const CategoryTag: React.FC<CategoryTagProps> = ({ category }) => {
    const bgColor = categoryColors[category] || categoryColors.General;
    const textColor = categoryTextColors[category] || categoryTextColors.General;
    const iconName = categoryIcons[category] || categoryIcons.General;

    return (
        <View style={[styles.tag, { backgroundColor: bgColor }]}>
            <Icon name={iconName} size={12} color={textColor} />
            <Text style={[styles.label, { color: textColor }]}>{category}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    tag: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.sm,
        paddingVertical: Spacing.xs,
        borderRadius: BorderRadius.round,
        gap: 4,
    },
    label: {
        fontSize: Typography.fontSize.xs,
        fontWeight: Typography.fontWeight.medium,
        letterSpacing: 0.3,
    },
});

export default CategoryTag;
