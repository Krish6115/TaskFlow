/**
 * RegisterScreen
 * Email, password, confirm password with validation.
 * Dark gradient background matching LoginScreen.
 */

import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    TouchableOpacity,
    Animated,
    StatusBar,
    Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Colors, Typography, Spacing, BorderRadius } from '../theme';
import InputField from '../components/InputField';
import Button from '../components/Button';
import { useAuth } from '../context/AuthContext';

const RegisterScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const { register } = useAuth();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{
        name?: string;
        email?: string;
        password?: string;
        confirmPassword?: string;
    }>({});

    const formAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.spring(formAnim, {
            toValue: 1,
            useNativeDriver: true,
            tension: 50,
            friction: 8,
        }).start();
    }, [formAnim]);

    const validate = (): boolean => {
        const newErrors: {
            name?: string;
            email?: string;
            password?: string;
            confirmPassword?: string;
        } = {};

        if (!name.trim()) {
            newErrors.name = 'Name is required';
        } else if (name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Enter a valid email address';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password';
        } else if (password !== confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleRegister = async () => {
        if (!validate()) { return; }

        setLoading(true);
        try {
            await register(name.trim(), email.trim().toLowerCase(), password);
        } catch (error: any) {
            const message =
                error.response?.data?.message ||
                'Registration failed. Please try again.';
            Alert.alert('Registration Failed', message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <LinearGradient
            colors={[Colors.gradientStart, Colors.gradientMiddle, Colors.gradientEnd]}
            style={styles.gradient}>
            <StatusBar barStyle="light-content" backgroundColor={Colors.gradientStart} />
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.flex}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="handled"
                    showsVerticalScrollIndicator={false}>
                    {/* Header */}
                    <Animated.View
                        style={[
                            styles.headerContainer,
                            {
                                transform: [
                                    {
                                        translateY: formAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [-30, 0],
                                        }),
                                    },
                                ],
                                opacity: formAnim,
                            },
                        ]}>
                        <TouchableOpacity
                            onPress={() => navigation.goBack()}
                            style={styles.backButton}>
                            <Icon name="arrow-left" size={24} color={Colors.textPrimary} />
                        </TouchableOpacity>
                        <View style={styles.headerTextContainer}>
                            <Text style={styles.headerTitle}>Create Account</Text>
                            <Text style={styles.headerSubtitle}>
                                Join TaskFlow and start organizing
                            </Text>
                        </View>
                    </Animated.View>

                    {/* Form */}
                    <Animated.View
                        style={[
                            styles.formContainer,
                            {
                                transform: [
                                    {
                                        translateY: formAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [60, 0],
                                        }),
                                    },
                                ],
                                opacity: formAnim,
                            },
                        ]}>
                        <InputField
                            label="Full Name"
                            icon="account-outline"
                            placeholder="Enter your full name"
                            value={name}
                            onChangeText={text => {
                                setName(text);
                                if (errors.name) {
                                    setErrors(prev => ({ ...prev, name: undefined }));
                                }
                            }}
                            error={errors.name}
                            autoCapitalize="words"
                        />

                        <InputField
                            label="Email"
                            icon="email-outline"
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={text => {
                                setEmail(text);
                                if (errors.email) {
                                    setErrors(prev => ({ ...prev, email: undefined }));
                                }
                            }}
                            error={errors.email}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />

                        <InputField
                            label="Password"
                            icon="lock-outline"
                            placeholder="Create a password"
                            value={password}
                            onChangeText={text => {
                                setPassword(text);
                                if (errors.password) {
                                    setErrors(prev => ({ ...prev, password: undefined }));
                                }
                            }}
                            error={errors.password}
                            isPassword
                        />

                        <InputField
                            label="Confirm Password"
                            icon="lock-check-outline"
                            placeholder="Confirm your password"
                            value={confirmPassword}
                            onChangeText={text => {
                                setConfirmPassword(text);
                                if (errors.confirmPassword) {
                                    setErrors(prev => ({
                                        ...prev,
                                        confirmPassword: undefined,
                                    }));
                                }
                            }}
                            error={errors.confirmPassword}
                            isPassword
                        />

                        <Button
                            title="Create Account"
                            onPress={handleRegister}
                            loading={loading}
                            style={styles.registerButton}
                        />

                        <View style={styles.loginContainer}>
                            <Text style={styles.loginText}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.goBack()}>
                                <Text style={styles.loginLink}>Sign In</Text>
                            </TouchableOpacity>
                        </View>
                    </Animated.View>
                </ScrollView>
            </KeyboardAvoidingView>
        </LinearGradient>
    );
};

const styles = StyleSheet.create({
    gradient: {
        flex: 1,
    },
    flex: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        paddingHorizontal: Spacing.xxl,
        paddingVertical: Spacing.huge,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: Spacing.xxxl,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(108, 99, 255, 0.15)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.lg,
    },
    headerTextContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: Typography.fontSize.xxxl,
        fontWeight: Typography.fontWeight.extrabold,
        color: Colors.textPrimary,
        letterSpacing: 0.5,
    },
    headerSubtitle: {
        fontSize: Typography.fontSize.md,
        color: Colors.textSecondary,
        marginTop: Spacing.xs,
    },
    formContainer: {
        backgroundColor: 'rgba(20, 24, 50, 0.5)',
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        padding: Spacing.xxl,
    },
    registerButton: {
        marginTop: Spacing.sm,
    },
    loginContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: Spacing.xl,
    },
    loginText: {
        color: Colors.textSecondary,
        fontSize: Typography.fontSize.md,
    },
    loginLink: {
        color: Colors.primary,
        fontSize: Typography.fontSize.md,
        fontWeight: Typography.fontWeight.bold,
    },
});

export default RegisterScreen;
