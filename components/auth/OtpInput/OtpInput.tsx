// OtpInput - Reusable OTP input component with individual digit boxes
'use client';

import { useState, useRef, useEffect, KeyboardEvent, ClipboardEvent } from 'react';
import { Box, TextField, Typography, useTheme } from '@mui/material';

export interface OtpInputProps {
    length?: number;
    value?: string;
    onChange?: (otp: string) => void;
    onComplete?: (otp: string) => void;
    error?: string;
    disabled?: boolean;
    autoFocus?: boolean;
}

export function OtpInput({
    length = 6,
    value = '',
    onChange,
    onComplete,
    error,
    disabled = false,
    autoFocus = true,
}: OtpInputProps) {
    const theme = useTheme();
    const [otp, setOtp] = useState<string[]>(
        value.split('').slice(0, length).concat(Array(length - value.length).fill(''))
    );
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (autoFocus && inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, [autoFocus]);

    useEffect(() => {
        // Sync external value changes
        if (value !== otp.join('')) {
            setOtp(value.split('').slice(0, length).concat(Array(length - value.length).fill('')));
        }
    }, [value, length]);

    const updateOtp = (newOtp: string[]) => {
        setOtp(newOtp);
        const otpString = newOtp.join('');
        onChange?.(otpString);

        if (otpString.length === length && !newOtp.includes('')) {
            onComplete?.(otpString);
        }
    };

    const handleChange = (index: number, inputValue: string) => {
        if (disabled) return;

        // Only allow digits
        const digit = inputValue.replace(/\D/g, '').slice(-1);

        const newOtp = [...otp];
        newOtp[index] = digit;
        updateOtp(newOtp);

        // Move to next input
        if (digit && index < length - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: KeyboardEvent<HTMLDivElement>) => {
        if (disabled) return;

        if (e.key === 'Backspace') {
            e.preventDefault();
            const newOtp = [...otp];

            if (otp[index]) {
                newOtp[index] = '';
                updateOtp(newOtp);
            } else if (index > 0) {
                newOtp[index - 1] = '';
                updateOtp(newOtp);
                inputRefs.current[index - 1]?.focus();
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            e.preventDefault();
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < length - 1) {
            e.preventDefault();
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e: ClipboardEvent<HTMLDivElement>) => {
        if (disabled) return;

        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);

        if (pastedData) {
            const newOtp = pastedData.split('').concat(Array(length - pastedData.length).fill(''));
            updateOtp(newOtp);

            // Focus the next empty input or the last one
            const nextEmptyIndex = newOtp.findIndex(val => !val);
            const focusIndex = nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex;
            inputRefs.current[focusIndex]?.focus();
        }
    };

    const handleFocus = (index: number) => {
        inputRefs.current[index]?.select();
    };

    return (
        <Box>
            <Box
                sx={{
                    display: 'flex',
                    gap: { xs: 1, sm: 1.5 },
                    justifyContent: 'center',
                }}
                onPaste={handlePaste}
            >
                {Array.from({ length }, (_, index) => (
                    <TextField
                        key={index}
                        inputRef={(el) => (inputRefs.current[index] = el)}
                        value={otp[index]}
                        onChange={(e) => handleChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        onFocus={() => handleFocus(index)}
                        disabled={disabled}
                        error={!!error}
                        slotProps={{
                            input: {
                                sx: {
                                    width: { xs: 40, sm: 48 },
                                    height: { xs: 48, sm: 56 },
                                    fontSize: { xs: '1.25rem', sm: '1.5rem' },
                                    fontWeight: 600,
                                    textAlign: 'center',
                                    borderRadius: 2,
                                    '& input': {
                                        textAlign: 'center',
                                        padding: '8px',
                                    },
                                },
                            },
                            htmlInput: {
                                inputMode: 'numeric',
                                pattern: '[0-9]*',
                                maxLength: 1,
                                'aria-label': `OTP digit ${index + 1}`,
                            },
                        }}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                borderRadius: 2,
                                backgroundColor: theme.palette.mode === 'dark'
                                    ? 'rgba(255, 255, 255, 0.05)'
                                    : 'rgba(0, 0, 0, 0.02)',
                                transition: 'all 0.2s ease-in-out',
                                '&:hover': {
                                    backgroundColor: theme.palette.mode === 'dark'
                                        ? 'rgba(255, 255, 255, 0.08)'
                                        : 'rgba(0, 0, 0, 0.04)',
                                },
                                '&.Mui-focused': {
                                    backgroundColor: 'transparent',
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: error ? theme.palette.error.main : theme.palette.primary.main,
                                        borderWidth: 2,
                                    },
                                },
                            },
                        }}
                    />
                ))}
            </Box>
            {error && (
                <Typography
                    variant="caption"
                    color="error"
                    sx={{ display: 'block', textAlign: 'center', mt: 1 }}
                >
                    {error}
                </Typography>
            )}
        </Box>
    );
}

