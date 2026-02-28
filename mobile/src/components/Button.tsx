/**
 * Button Component
 * Gradient button with loading spinner and press animation.
 */

import React, { useRef } from 'react';
import {
    TouchableOpacity,
    Text,
    ActivityIndicator,
    StyleSheet,
    Animated,
    ViewStyle,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { Colors, Typography, Spacing, BorderRadius, Shadows } from '../theme';

interface ButtonProps {
    title: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
    variant?: 'primary' | 'secondary' | 'outline';
    style?: ViewStyle;
    icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
    title,
    onPress,
    loading = false,
    disabled = false,
    variant = 'primary',
    style,
    icon,
}) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.96,
            useNativeDriver: true,
            speed: 50,
            bounciness: 4,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            useNativeDriver: true,
            speed: 50,
            bounciness: 4,
        }).start();
    };

    const isDisabled = disabled || loading;

    if (variant === 'outline') {
        return (
            <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
                <TouchableOpacity
                    onPress={onPress}
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    disabled={isDisabled}
                    style={[styles.outlineButton, isDisabled && styles.disabled]}
                    activeOpacity={0.8}>
                    {loading ? (
                        <ActivityIndicator color={Colors.primary} size="small" />
                    ) : (
                        <>
                            {icon}
                            <Text style={styles.outlineText}>{title}</Text>
                        </>
                    )}
                </TouchableOpacity>
            </Animated.View>
        );
    }

    return (
        <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
            <TouchableOpacity
                onPress={onPress}
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                disabled={isDisabled}
                activeOpacity={0.8}>
                <LinearGradient
                    colors={
                        variant === 'secondary'
                            ? [Colors.secondary, '#0098CC']
                            : [Colors.primary, Colors.accent]
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={[
                        styles.gradient,
                        isDisabled && styles.disabled,
                    ]}>
                    {loading ? (
                        <ActivityIndicator color={Colors.white} size="small" />
                    ) : (
                        <>
                            {icon}
                            <Text style={styles.text}>{title}</Text>
                        </>
                    )}
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    gradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.xxl,
        borderRadius: BorderRadius.md,
        minHeight: 52,
        ...Shadows.button,
    },
    text: {
        color: Colors.white,
        fontSize: Typography.fontSize.lg,
        fontWeight: Typography.fontWeight.bold,
        letterSpacing: 0.5,
    },
    outlineButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: Spacing.lg,
        paddingHorizontal: Spacing.xxl,
        borderRadius: BorderRadius.md,
        minHeight: 52,
        borderWidth: 1.5,
        borderColor: Colors.primary,
        backgroundColor: 'rgba(108, 99, 255, 0.08)',
    },
    outlineText: {
        color: Colors.primary,
        fontSize: Typography.fontSize.lg,
        fontWeight: Typography.fontWeight.bold,
        letterSpacing: 0.5,
    },
    disabled: {
        opacity: 0.5,
    },
});

export default Button;
