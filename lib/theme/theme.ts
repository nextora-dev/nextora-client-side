'use client';

import { createTheme, ThemeOptions } from '@mui/material/styles';
import { Poppins } from 'next/font/google';
import { componentOverrides } from './components';

// ============================================
// Font Configuration - Using Poppins for Modern Look
// ============================================
const poppins = Poppins({
    weight: ['300', '400', '500', '600', '700', '800'],
    subsets: ['latin'],
    display: 'swap',
});

// ============================================
// Dark Mode Color Palette (Primary Theme)
// ============================================
const darkPalette = {
    mode: 'dark' as const,
    primary: {
        main: '#3B82F6', // Blue
        light: '#60A5FA',
        dark: '#2563EB',
        contrastText: '#FFFFFF',
    },
    secondary: {
        main: '#10B981', // Green
        light: '#34D399',
        dark: '#059669',
        contrastText: '#FFFFFF',
    },
    error: {
        main: '#EF4444',
        light: '#F87171',
        dark: '#DC2626',
    },
    warning: {
        main: '#F59E0B',
        light: '#FBBF24',
        dark: '#D97706',
    },
    info: {
        main: '#3B82F6',
        light: '#60A5FA',
        dark: '#2563EB',
    },
    success: {
        main: '#10B981',
        light: '#34D399',
        dark: '#059669',
    },
    grey: {
        50: '#F9FAFB',
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#4B5563',
        700: '#374151',
        800: '#1F2937',
        900: '#111827',
        950: '#0D1117',
    },
    background: {
        default: '#0D1117',
        paper: '#161B22',
    },
    text: {
        primary: '#F0F6FC',
        secondary: '#8B949E',
        disabled: '#484F58',
    },
    divider: '#30363D',
    action: {
        active: '#F0F6FC',
        hover: 'rgba(240, 246, 252, 0.08)',
        selected: 'rgba(240, 246, 252, 0.16)',
        disabled: 'rgba(240, 246, 252, 0.3)',
        disabledBackground: 'rgba(240, 246, 252, 0.12)',
    },
};

// ============================================
// Light Mode Color Palette (Optional)
// ============================================
const lightPalette = {
    mode: 'light' as const,
    primary: {
        main: '#3B82F6',
        light: '#60A5FA',
        dark: '#2563EB',
        contrastText: '#FFFFFF',
    },
    secondary: {
        main: '#10B981',
        light: '#34D399',
        dark: '#059669',
        contrastText: '#FFFFFF',
    },
    error: {
        main: '#EF4444',
        light: '#F87171',
        dark: '#DC2626',
    },
    warning: {
        main: '#F59E0B',
        light: '#FBBF24',
        dark: '#D97706',
    },
    info: {
        main: '#3B82F6',
        light: '#60A5FA',
        dark: '#2563EB',
    },
    success: {
        main: '#10B981',
        light: '#34D399',
        dark: '#059669',
    },
    grey: {
        50: '#F9FAFB',
        100: '#F3F4F6',
        200: '#E5E7EB',
        300: '#D1D5DB',
        400: '#9CA3AF',
        500: '#6B7280',
        600: '#4B5563',
        700: '#374151',
        800: '#1F2937',
        900: '#111827',
    },
    background: {
        default: '#F9FAFB',
        paper: '#FFFFFF',
    },
    text: {
        primary: '#1F2937',
        secondary: '#6B7280',
        disabled: '#9CA3AF',
    },
    divider: '#E5E7EB',
};

// ============================================
// Typography Configuration - SaaS Dashboard Scale
// ============================================
const typography = {
    fontFamily: poppins.style.fontFamily,
    h1: {
        fontSize: '1.5rem', // 24px base, responsive in components
        fontWeight: 600,
        lineHeight: 1.2,
        letterSpacing: '-0.02em',
        '@media (min-width:600px)': {
            fontSize: '1.875rem', // 30px
        },
        '@media (min-width:1200px)': {
            fontSize: '2rem', // 32px
        },
    },
    h2: {
        fontSize: '1.5rem', // 24px
        fontWeight: 600,
        lineHeight: 1.3,
        letterSpacing: '-0.02em',
    },
    h3: {
        fontSize: '1.125rem', // 18px base
        fontWeight: 600,
        lineHeight: 1.4,
        letterSpacing: '-0.01em',
        '@media (min-width:600px)': {
            fontSize: '1.25rem', // 20px
        },
    },
    h4: {
        fontSize: '1.5rem', // 24px base - for large stat values
        fontWeight: 600,
        lineHeight: 1.4,
        letterSpacing: '-0.01em',
        '@media (min-width:600px)': {
            fontSize: '1.875rem', // 30px
        },
    },
    h5: {
        fontSize: '1.125rem', // 18px
        fontWeight: 600,
        lineHeight: 1.5,
    },
    h6: {
        fontSize: '1rem', // 16px
        fontWeight: 600,
        lineHeight: 1.5,
    },
    body1: {
        fontSize: '0.875rem', // 14px - Primary content text
        lineHeight: 1.6,
        fontWeight: 400,
    },
    body2: {
        fontSize: '0.875rem', // 14px - Secondary/description text
        lineHeight: 1.6,
        fontWeight: 400,
    },
    button: {
        fontSize: '0.875rem',
        fontWeight: 500,
        textTransform: 'none' as const,
        letterSpacing: '0.01em',
    },
    caption: {
        fontSize: '0.75rem', // 12px - Labels, hints, timestamps
        lineHeight: 1.5,
        fontWeight: 400,
    },
    overline: {
        fontSize: '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase' as const,
    },
};

// ============================================
// Component Overrides - Using imported componentOverrides from components.ts
// ============================================

// ============================================
// Breakpoints - MUI Standard
// ============================================
const breakpoints = {
    values: {
        xs: 0,
        sm: 600,
        md: 900,
        lg: 1200,
        xl: 1536,
    },
};

// ============================================
// Shape - Border Radius System
// ============================================
const shape = {
    borderRadius: 4, // Base radius - low for clean look
};

// ============================================
// Shadows - Dark Mode Optimized
// ============================================
const shadows = [
    'none',
    '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
    '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
    '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
    '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
    ...Array(18).fill('none'),
] as any;

// ============================================
// Create Dark Theme (Primary)
// ============================================
export const theme = createTheme({
    palette: darkPalette,
    typography,
    components: componentOverrides,
    breakpoints,
    shape,
    shadows,
    spacing: 8, // 8px base spacing
} as ThemeOptions);

// ============================================
// Create Light Theme (Optional)
// ============================================
export const lightTheme = createTheme({
    palette: lightPalette,
    typography,
    components: componentOverrides,
    breakpoints,
    shape,
    shadows,
    spacing: 8,
} as ThemeOptions);

// Alias for backwards compatibility
export const darkTheme = theme;

// ============================================
// Role-Based Theme Colors (Optional)
// ============================================
export const roleThemeColors = {
    ROLE_STUDENT: '#3B82F6', // Blue
    ROLE_LECTURER: '#10B981', // Green
    ROLE_ACADEMIC_STAFF: '#F59E0B', // Orange
    ROLE_NON_ACADEMIC_STAFF: '#8B5CF6', // Purple
    ROLE_ADMIN: '#EF4444', // Red
    ROLE_SUPER_ADMIN: '#374151', // Dark Gray
};

export default theme;