/**
 * InputField Component
 * Glassmorphism-styled text input with icon, label, error state, and password toggle.
 */

import React, { useState } from 'react';
import {
    View,
    TextInput,
    Text,
    TouchableOpacity,
    StyleSheet,
    TextInputProps,
    Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';

interface InputFieldProps extends TextInputProps {
    label?: string;
    icon?: string;
    error?: string;
    isPassword?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
    label,
    icon,
    error,
    isPassword = false,
    style,
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [shakeAnim] = useState(new Animated.Value(0));

    // Shake animation on error
    React.useEffect(() => {
        if (error) {
            Animated.sequence([
                Animated.timing(shakeAnim, {
                    toValue: 10,
                    duration: 50,
                    useNativeDriver: true,
                }),
                Animated.timing(shakeAnim, {
                    toValue: -10,
                    duration: 50,
                    useNativeDriver: true,
                }),
                Animated.timing(shakeAnim, {
                    toValue: 6,
                    duration: 50,
                    useNativeDriver: true,
                }),
                Animated.timing(shakeAnim, {
                    toValue: -6,
                    duration: 50,
                    useNativeDriver: true,
                }),
                Animated.timing(shakeAnim, {
                    toValue: 0,
                    duration: 50,
                    useNativeDriver: true,
                }),
            ]).start();
        }
    }, [error, shakeAnim]);

    return (
        <Animated.View
            style={[
                styles.container,
                { transform: [{ translateX: shakeAnim }] },
            ]}>
            {label && <Text style={styles.label}>{label}</Text>}
            <View
                style={[
                    styles.inputContainer,
                    isFocused && styles.inputFocused,
                    error ? styles.inputError : null,
                ]}>
                {icon && (
                    <Icon
                        name={icon}
                        size={20}
                        color={
                            error
                                ? Colors.error
                                : isFocused
                                    ? Colors.primary
                                    : Colors.textMuted
                        }
                        style={styles.icon}
                    />
                )}
                <TextInput
                    style={[styles.input, style]}
                    placeholderTextColor={Colors.textMuted}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    secureTextEntry={isPassword && !showPassword}
                    {...props}
                />
                {isPassword && (
                    <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={styles.eyeButton}>
                        <Icon
                            name={showPassword ? 'eye-off' : 'eye'}
                            size={20}
                            color={Colors.textMuted}
                        />
                    </TouchableOpacity>
                )}
            </View>
            {error && (
                <View style={styles.errorContainer}>
                    <Icon name="alert-circle" size={12} color={Colors.error} />
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            )}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
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
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.inputBackground,
        borderRadius: BorderRadius.md,
        borderWidth: 1.5,
        borderColor: Colors.inputBorder,
        paddingHorizontal: Spacing.md,
        minHeight: 52,
    },
    inputFocused: {
        borderColor: Colors.inputBorderFocused,
        backgroundColor: 'rgba(28, 33, 69, 0.7)',
    },
    inputError: {
        borderColor: Colors.error,
    },
    icon: {
        marginRight: Spacing.sm,
    },
    input: {
        flex: 1,
        color: Colors.textPrimary,
        fontSize: Typography.fontSize.lg,
        paddingVertical: Spacing.md,
    },
    eyeButton: {
        padding: Spacing.xs,
    },
    errorContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: Spacing.xs,
        marginLeft: Spacing.xs,
    },
    errorText: {
        color: Colors.error,
        fontSize: Typography.fontSize.sm,
        marginLeft: Spacing.xs,
    },
});

export default InputField;
