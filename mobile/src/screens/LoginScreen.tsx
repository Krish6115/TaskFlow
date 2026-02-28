/**
 * LoginScreen
 * Dark gradient background with glassmorphism inputs, animated logo, and error display.
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

const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

    // Animations
    const logoAnim = useRef(new Animated.Value(0)).current;
    const formAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.stagger(200, [
            Animated.spring(logoAnim, {
                toValue: 1,
                useNativeDriver: true,
                tension: 50,
                friction: 7,
            }),
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 600,
                useNativeDriver: true,
            }),
            Animated.spring(formAnim, {
                toValue: 1,
                useNativeDriver: true,
                tension: 50,
                friction: 8,
            }),
        ]).start();
    }, [logoAnim, fadeAnim, formAnim]);

    const validate = (): boolean => {
        const newErrors: { email?: string; password?: string } = {};

        if (!email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            newErrors.email = 'Enter a valid email';
        }

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLogin = async () => {
        if (!validate()) { return; }

        setLoading(true);
        try {
            await login(email.trim().toLowerCase(), password);
        } catch (error: any) {
            const message =
                error.response?.data?.message || 'Login failed. Please try again.';
            Alert.alert('Login Failed', message);
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
                    {/* Logo & Title */}
                    <Animated.View
                        style={[
                            styles.logoContainer,
                            {
                                transform: [
                                    {
                                        scale: logoAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0.3, 1],
                                        }),
                                    },
                                    {
                                        translateY: logoAnim.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [-50, 0],
                                        }),
                                    },
                                ],
                                opacity: logoAnim,
                            },
                        ]}>
                        <View style={styles.logoCircle}>
                            <Icon name="check-bold" size={40} color={Colors.white} />
                        </View>
                        <Text style={styles.appName}>TaskFlow</Text>
                        <Text style={styles.tagline}>Organize. Prioritize. Accomplish.</Text>
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
                        <Text style={styles.welcomeText}>Welcome Back</Text>
                        <Text style={styles.subtitle}>Sign in to continue</Text>

                        <InputField
                            label="Email"
                            icon="email-outline"
                            placeholder="Enter your email"
                            value={email}
                            onChangeText={text => {
                                setEmail(text);
                                if (errors.email) { setErrors(prev => ({ ...prev, email: undefined })); }
                            }}
                            error={errors.email}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                        />

                        <InputField
                            label="Password"
                            icon="lock-outline"
                            placeholder="Enter your password"
                            value={password}
                            onChangeText={text => {
                                setPassword(text);
                                if (errors.password) { setErrors(prev => ({ ...prev, password: undefined })); }
                            }}
                            error={errors.password}
                            isPassword
                        />

                        <Button
                            title="Sign In"
                            onPress={handleLogin}
                            loading={loading}
                            style={styles.loginButton}
                        />

                        <Animated.View style={[styles.registerContainer, { opacity: fadeAnim }]}>
                            <Text style={styles.registerText}>Don't have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                                <Text style={styles.registerLink}>Create one</Text>
                            </TouchableOpacity>
                        </Animated.View>
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
    logoContainer: {
        alignItems: 'center',
        marginBottom: Spacing.xxxl,
    },
    logoCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: Spacing.lg,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 16,
        elevation: 12,
    },
    appName: {
        fontSize: Typography.fontSize.hero,
        fontWeight: Typography.fontWeight.extrabold,
        color: Colors.textPrimary,
        letterSpacing: 1,
    },
    tagline: {
        fontSize: Typography.fontSize.md,
        color: Colors.textSecondary,
        marginTop: Spacing.xs,
        letterSpacing: 0.5,
    },
    formContainer: {
        backgroundColor: 'rgba(20, 24, 50, 0.5)',
        borderRadius: BorderRadius.xl,
        borderWidth: 1,
        borderColor: Colors.cardBorder,
        padding: Spacing.xxl,
    },
    welcomeText: {
        fontSize: Typography.fontSize.xxl,
        fontWeight: Typography.fontWeight.bold,
        color: Colors.textPrimary,
        marginBottom: Spacing.xs,
    },
    subtitle: {
        fontSize: Typography.fontSize.md,
        color: Colors.textSecondary,
        marginBottom: Spacing.xxl,
    },
    loginButton: {
        marginTop: Spacing.sm,
    },
    registerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: Spacing.xl,
    },
    registerText: {
        color: Colors.textSecondary,
        fontSize: Typography.fontSize.md,
    },
    registerLink: {
        color: Colors.primary,
        fontSize: Typography.fontSize.md,
        fontWeight: Typography.fontWeight.bold,
    },
});

export default LoginScreen;
