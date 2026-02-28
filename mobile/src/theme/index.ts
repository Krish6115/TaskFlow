/**
 * Theme Constants
 * Dark gradient theme with glassmorphism styling.
 * Color-coded priority system and consistent design tokens.
 */

export const Colors = {
    // Primary dark gradient backgrounds
    backgroundDark: '#0A0E21',
    backgroundMid: '#141832',
    backgroundLight: '#1C2145',

    // Gradient stops for screens
    gradientStart: '#0A0E21',
    gradientMiddle: '#1A1F3D',
    gradientEnd: '#0F1328',

    // Accent / brand colors
    primary: '#6C63FF',
    primaryLight: '#8B83FF',
    primaryDark: '#4A42D4',
    secondary: '#00D2FF',
    accent: '#7C4DFF',

    // Priority colors
    priorityUrgent: '#FF3B5C',
    priorityHigh: '#FF8C42',
    priorityMedium: '#FFD93D',
    priorityLow: '#4ADE80',

    // Priority backgrounds (softer for badges)
    priorityUrgentBg: 'rgba(255, 59, 92, 0.15)',
    priorityHighBg: 'rgba(255, 140, 66, 0.15)',
    priorityMediumBg: 'rgba(255, 217, 61, 0.15)',
    priorityLowBg: 'rgba(74, 222, 128, 0.15)',

    // Text
    textPrimary: '#FFFFFF',
    textSecondary: '#B0B3C5',
    textMuted: '#6B7089',
    textDark: '#1A1A2E',

    // UI surfaces
    cardBackground: 'rgba(28, 33, 69, 0.65)',
    cardBorder: 'rgba(108, 99, 255, 0.2)',
    inputBackground: 'rgba(28, 33, 69, 0.5)',
    inputBorder: 'rgba(108, 99, 255, 0.3)',
    inputBorderFocused: 'rgba(108, 99, 255, 0.7)',

    // Status
    success: '#4ADE80',
    error: '#FF3B5C',
    warning: '#FFD93D',
    info: '#00D2FF',

    // Misc
    overlay: 'rgba(0, 0, 0, 0.5)',
    divider: 'rgba(108, 99, 255, 0.1)',
    white: '#FFFFFF',
    black: '#000000',
    transparent: 'transparent',
};

export const Typography = {
    fontFamily: {
        regular: 'System',
        medium: 'System',
        bold: 'System',
    },
    fontSize: {
        xs: 10,
        sm: 12,
        md: 14,
        lg: 16,
        xl: 18,
        xxl: 22,
        xxxl: 28,
        hero: 36,
    },
    fontWeight: {
        regular: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
        extrabold: '800' as const,
    },
    lineHeight: {
        tight: 1.2,
        normal: 1.5,
        relaxed: 1.75,
    },
};

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    huge: 48,
};

export const BorderRadius = {
    sm: 6,
    md: 10,
    lg: 14,
    xl: 18,
    xxl: 24,
    round: 999,
};

export const Shadows = {
    card: {
        shadowColor: '#6C63FF',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 6,
    },
    button: {
        shadowColor: '#6C63FF',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 8,
    },
    fab: {
        shadowColor: '#6C63FF',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.4,
        shadowRadius: 14,
        elevation: 12,
    },
};

export const GlassCard = {
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: BorderRadius.lg,
    ...Shadows.card,
};

// Map priority to color
export const getPriorityColor = (priority: string): string => {
    switch (priority) {
        case 'urgent': return Colors.priorityUrgent;
        case 'high': return Colors.priorityHigh;
        case 'medium': return Colors.priorityMedium;
        case 'low': return Colors.priorityLow;
        default: return Colors.textMuted;
    }
};

export const getPriorityBgColor = (priority: string): string => {
    switch (priority) {
        case 'urgent': return Colors.priorityUrgentBg;
        case 'high': return Colors.priorityHighBg;
        case 'medium': return Colors.priorityMediumBg;
        case 'low': return Colors.priorityLowBg;
        default: return 'rgba(107, 112, 137, 0.15)';
    }
};

export const getPriorityEmoji = (priority: string): string => {
    switch (priority) {
        case 'urgent': return '🔴';
        case 'high': return '🟠';
        case 'medium': return '🟡';
        case 'low': return '🟢';
        default: return '⚪';
    }
};
