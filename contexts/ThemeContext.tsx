'use client';

import React, { useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, responsiveFontSizes, ThemeOptions } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { colors, gradients } from '@/lib/theme/colors';

// Extend MUI Palette
declare module '@mui/material/styles' {
    interface Palette {
        gradient: {
            primary: string;
            secondary: string;
            accent: string;
            hero: string;
            card: string;
            cardHover: string;
            bluePrimary: string;
            blueIndigo: string;
            skyBlue: string;
            indigoAccent: string;
            cyanAccent: string;
            success: string;
            glassLight: string;
            glassMedium: string;
        };
        sky: { main: string; light: string; lighter: string; };
        cyan: { main: string; light: string; lighter: string; };
        indigo: { main: string; light: string; lighter: string; };
    }
    interface PaletteOptions {
        gradient?: {
            primary: string;
            secondary: string;
            accent: string;
            hero: string;
            card: string;
            cardHover: string;
            bluePrimary: string;
            blueIndigo: string;
            skyBlue: string;
            indigoAccent: string;
            cyanAccent: string;
            success: string;
            glassLight: string;
            glassMedium: string;
        };
        sky?: { main: string; light: string; lighter: string; };
        cyan?: { main: string; light: string; lighter: string; };
        indigo?: { main: string; light: string; lighter: string; };
    }
}

// Light theme design tokens
const getLightThemeTokens = (): ThemeOptions => ({
    palette: {
        mode: 'light',
        primary: {
            main: colors.primary.main,
            light: colors.primary.light,
            dark: colors.primary.dark,
            contrastText: colors.white,
        },
        secondary: {
            main: colors.indigo.main,
            light: colors.indigo.light,
            dark: colors.indigo.dark,
            contrastText: colors.white,
        },
        sky: {
            main: colors.sky.main,
            light: colors.sky.light,
            lighter: colors.sky.lighter,
        },
        cyan: {
            main: colors.cyan.main,
            light: colors.cyan.light,
            lighter: colors.cyan.lighter,
        },
        indigo: {
            main: colors.indigo.main,
            light: colors.indigo.light,
            lighter: colors.indigo.lighter,
        },
        success: {
            main: colors.success.main,
            light: colors.success.light,
            dark: colors.success.dark,
            contrastText: colors.white,
        },
        error: {
            main: colors.error.main,
            light: colors.error.light,
            dark: colors.error.dark,
        },
        warning: {
            main: colors.warning.main,
            light: colors.warning.light,
            dark: colors.warning.dark,
        },
        info: {
            main: colors.sky.main,
            light: colors.sky.light,
            dark: colors.sky.dark,
        },
        gradient: {
            primary: gradients.bluePrimary,
            secondary: gradients.blueIndigo,
            accent: gradients.indigoAccent,
            hero: gradients.hero,
            card: gradients.card,
            cardHover: gradients.cardHover,
            bluePrimary: gradients.bluePrimary,
            blueIndigo: gradients.blueIndigo,
            skyBlue: gradients.skyBlue,
            indigoAccent: gradients.indigoAccent,
            cyanAccent: gradients.cyanAccent,
            success: gradients.success,
            glassLight: gradients.glassLight,
            glassMedium: gradients.glassMedium,
        },
        background: {
            default: colors.background,
            paper: colors.white,
        },
        text: {
            primary: colors.text.primary,
            secondary: colors.text.secondary,
            disabled: colors.text.disabled,
        },
        divider: 'rgba(148, 163, 184, 0.12)',
        grey: colors.grey,
        action: {
            hover: 'rgba(96, 165, 250, 0.08)',
            selected: 'rgba(96, 165, 250, 0.14)',
            disabled: 'rgba(0, 0, 0, 0.26)',
            disabledBackground: 'rgba(0, 0, 0, 0.12)',
        },
    },
    typography: {
        fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        h1: { fontWeight: 800, letterSpacing: '-0.025em', lineHeight: 1.1 },
        h2: { fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.2 },
        h3: { fontWeight: 700, letterSpacing: '-0.015em', lineHeight: 1.3 },
        h4: { fontWeight: 600, letterSpacing: '-0.01em', lineHeight: 1.4 },
        h5: { fontWeight: 600, letterSpacing: '-0.005em', lineHeight: 1.5 },
        h6: { fontWeight: 600, lineHeight: 1.5 },
        subtitle1: { fontSize: '1.125rem', fontWeight: 500, lineHeight: 1.6 },
        subtitle2: { fontSize: '0.875rem', fontWeight: 600, lineHeight: 1.6 },
        body1: { fontSize: '1rem', lineHeight: 1.7 },
        body2: { fontSize: '0.875rem', lineHeight: 1.65 },
        caption: { fontSize: '0.75rem', lineHeight: 1.5 },
        overline: { fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.1em', lineHeight: 1.5, textTransform: 'uppercase' },
        button: { textTransform: 'none', fontWeight: 600, letterSpacing: '0.01em' },
    },
    shape: { borderRadius: 16 },
    shadows: [
        'none',
        '0 1px 2px 0 rgba(0, 0, 0, 0.03)',
        '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
        '0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -2px rgba(0, 0, 0, 0.06)',
        '0 10px 15px -3px rgba(0, 0, 0, 0.06), 0 4px 6px -4px rgba(0, 0, 0, 0.06)',
        '0 20px 25px -5px rgba(0, 0, 0, 0.06), 0 8px 10px -6px rgba(0, 0, 0, 0.06)',
        ...Array(19).fill('0 25px 50px -12px rgba(0, 0, 0, 0.15)'),
    ] as unknown as ThemeOptions['shadows'],
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: { scrollBehavior: 'smooth', WebkitFontSmoothing: 'antialiased', MozOsxFontSmoothing: 'grayscale' },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 12,
                    padding: '12px 28px',
                    fontSize: '0.9375rem',
                    fontWeight: 600,
                    transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                },
                containedPrimary: {
                    background: gradients.bluePrimary,
                    boxShadow: '0 4px 14px rgba(96, 165, 250, 0.35)',
                    '&:hover': {
                        background: `linear-gradient(135deg, ${colors.primary.lighter} 0%, ${colors.primary.light} 100%)`,
                        boxShadow: '0 8px 25px rgba(96, 165, 250, 0.45)',
                        transform: 'translateY(-2px)',
                    },
                },
                containedSecondary: {
                    background: gradients.indigoAccent,
                    boxShadow: '0 4px 14px rgba(129, 140, 248, 0.35)',
                    '&:hover': {
                        background: `linear-gradient(135deg, ${colors.indigo.light} 0%, ${colors.indigo.lighter} 100%)`,
                        boxShadow: '0 8px 25px rgba(129, 140, 248, 0.45)',
                        transform: 'translateY(-2px)',
                    },
                },
                outlined: { borderWidth: 2, '&:hover': { borderWidth: 2, transform: 'translateY(-2px)' } },
                sizeLarge: { padding: '14px 32px', fontSize: '1rem' },
                sizeSmall: { padding: '8px 20px', fontSize: '0.875rem' },
            },
        },
        MuiCard: {
            styleOverrides: {
                root: {
                    borderRadius: 20,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -1px rgba(0, 0, 0, 0.04)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': { boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.08), 0 8px 10px -6px rgba(0, 0, 0, 0.04)' },
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: { borderRadius: 8, fontWeight: 600, fontSize: '0.75rem' },
                colorPrimary: {
                    backgroundColor: 'rgba(96, 165, 250, 0.15)',
                    color: colors.primary.main,
                    '&:hover': { backgroundColor: 'rgba(96, 165, 250, 0.25)' },
                },
                colorSecondary: {
                    backgroundColor: 'rgba(129, 140, 248, 0.15)',
                    color: colors.indigo.main,
                    '&:hover': { backgroundColor: 'rgba(129, 140, 248, 0.25)' },
                },
            },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 12,
                        transition: 'all 0.2s ease',
                        '& fieldset': { borderWidth: 1.5 },
                        '&.Mui-focused fieldset': { borderWidth: 2 },
                    },
                },
            },
        },
        MuiAppBar: { styleOverrides: { root: { backgroundColor: 'transparent', backdropFilter: 'none', boxShadow: 'none' } } },
        MuiAccordion: {
            styleOverrides: {
                root: { borderRadius: '16px !important', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)', '&:before': { display: 'none' }, '&.Mui-expanded': { margin: 0 } },
            },
        },
        MuiLink: { styleOverrides: { root: { textDecoration: 'none', fontWeight: 500, transition: 'color 0.2s ease' } } },
    },
});

// Theme Provider Component - Light theme only
interface ThemeContextProviderProps {
    children: React.ReactNode;
}

export const ThemeContextProvider: React.FC<ThemeContextProviderProps> = ({ children }) => {
    const theme = useMemo(() => responsiveFontSizes(createTheme(getLightThemeTokens())), []);

    return (
        <MuiThemeProvider theme={theme}>
            <CssBaseline />
            {children}
        </MuiThemeProvider>
    );
};

export default ThemeContextProvider;
