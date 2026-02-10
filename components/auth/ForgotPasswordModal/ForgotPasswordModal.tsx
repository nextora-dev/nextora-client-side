// ForgotPasswordModal - Email link based forgot password flow
'use client';

import { useState, useEffect, forwardRef } from 'react';
import {
    Dialog,
    DialogContent,
    Box,
    Typography,
    TextField,
    InputAdornment,
    IconButton,
    Fade,
    Slide,
    useTheme,
} from '@mui/material';
import { TransitionProps } from '@mui/material/transitions';
import CloseIcon from '@mui/icons-material/Close';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import ShieldIcon from '@mui/icons-material/Shield';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';
import { validators } from '@/lib/validators/auth.validator';
import { Button } from '@/components/common';

// ============================================================================
// Types
// ============================================================================

type Step = 'email' | 'sent';

export interface ForgotPasswordModalProps {
    open: boolean;
    onClose: () => void;
    onSendEmail: (email: string) => Promise<void>;
}

// ============================================================================
// Slide Transition
// ============================================================================

const SlideTransition = forwardRef(function Transition(
    props: TransitionProps & { children: React.ReactElement },
    ref: React.Ref<unknown>,
) {
    return <Slide direction="up" ref={ref} {...props} />;
});

// ============================================================================
// Email Step Component
// ============================================================================

interface EmailStepProps {
    onSubmit: (email: string) => Promise<void>;
    isLoading: boolean;
    error: string;
}

function EmailStep({ onSubmit, isLoading, error }: EmailStepProps) {
    const theme = useTheme();
    const [email, setEmail] = useState('');
    const [localError, setLocalError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const emailError = validators.email(email);
        if (emailError) {
            setLocalError(emailError);
            return;
        }
        setLocalError('');
        await onSubmit(email);
    };

    return (
        <Fade in timeout={300}>
            <Box component="form" onSubmit={handleSubmit}>
                {/* Icon */}
                <Box
                    sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 3,
                        boxShadow: `0 8px 32px ${theme.palette.primary.main}40`,
                    }}
                >
                    <LockOutlinedIcon sx={{ fontSize: 40, color: 'white' }} />
                </Box>

                {/* Title */}
                <Typography
                    variant="h5"
                    fontWeight={700}
                    textAlign="center"
                    gutterBottom
                    color="text.primary"
                >
                    Forgot Password?
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 4 }}>
                    No worries! Enter your email and we'll send you a reset link.
                </Typography>

                {/* Email Input */}
                <TextField
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        setLocalError('');
                    }}
                    error={!!(localError || error)}
                    helperText={localError || error}
                    fullWidth
                    placeholder="your.email@university.edu"
                    autoFocus
                    sx={{
                        mb: 3,
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            bgcolor: 'background.paper',
                            '&:hover': {
                                bgcolor: theme.palette.mode === 'dark'
                                    ? 'rgba(255,255,255,0.05)'
                                    : 'grey.100'
                            },
                        },
                    }}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <EmailOutlinedIcon color="action" />
                                </InputAdornment>
                            ),
                        },
                    }}
                />

                {/* Submit Button */}
                <Button
                    type="submit"
                    variant="primary"
                    fullWidth
                    loading={isLoading}
                    disabled={isLoading || !email}
                    sx={{
                        py: 1.5,
                        bgcolor: 'primary.main',
                        '&:hover': {
                            bgcolor: 'primary.dark',
                        },
                    }}
                >
                    Send Reset Link
                </Button>

                {/* Security Note */}
                <Box
                    sx={{
                        mt: 3,
                        p: 2,
                        borderRadius: 2,
                        bgcolor: theme.palette.mode === 'dark'
                            ? 'rgba(59, 130, 246, 0.1)'
                            : 'rgba(59, 130, 246, 0.05)',
                        border: '1px solid',
                        borderColor: theme.palette.mode === 'dark'
                            ? 'rgba(59, 130, 246, 0.3)'
                            : 'rgba(59, 130, 246, 0.1)',
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 1.5,
                    }}
                >
                    <ShieldIcon sx={{ fontSize: 20, color: 'primary.main', mt: 0.2 }} />
                    <Typography variant="caption" color="text.secondary">
                        For security, we'll only send reset instructions to registered email addresses.
                    </Typography>
                </Box>
            </Box>
        </Fade>
    );
}

// ============================================================================
// Email Sent Step Component
// ============================================================================

interface EmailSentStepProps {
    email: string;
    onClose: () => void;
    onResend: () => Promise<void>;
}

function EmailSentStep({ email, onClose, onResend }: EmailSentStepProps) {
    const theme = useTheme();
    const [isResending, setIsResending] = useState(false);
    const [resent, setResent] = useState(false);

    const handleResend = async () => {
        setIsResending(true);
        try {
            await onResend();
            setResent(true);
        } finally {
            setIsResending(false);
        }
    };

    return (
        <Fade in timeout={300}>
            <Box textAlign="center">
                {/* Success Icon */}
                <Box
                    sx={{
                        width: 100,
                        height: 100,
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 3,
                        boxShadow: `0 8px 32px ${theme.palette.success.main}40`,
                        animation: 'pulse 2s infinite',
                        '@keyframes pulse': {
                            '0%': { boxShadow: `0 0 0 0 ${theme.palette.success.main}40` },
                            '70%': { boxShadow: `0 0 0 20px ${theme.palette.success.main}00` },
                            '100%': { boxShadow: `0 0 0 0 ${theme.palette.success.main}00` },
                        },
                    }}
                >
                    <MarkEmailReadIcon sx={{ fontSize: 56, color: 'white' }} />
                </Box>

                <Typography
                    variant="h5"
                    fontWeight={700}
                    gutterBottom
                    color="success.main"
                >
                    Check Your Email
                </Typography>

                <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                    We've sent a password reset link to
                </Typography>

                <Typography
                    variant="body1"
                    fontWeight={600}
                    color="primary.main"
                    sx={{ mb: 3 }}
                >
                    {email}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                    Click the link in your email to reset your password.
                    <br />
                    The link will expire in 24 hours.
                </Typography>

                <Button
                    variant="primary"
                    fullWidth
                    onClick={onClose}
                    sx={{
                        py: 1.5,
                        mb: 2,
                        bgcolor: 'success.main',
                        '&:hover': {
                            bgcolor: 'success.dark',
                        },
                    }}
                >
                    Got it, close
                </Button>

                {/* Resend */}
                <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Didn't receive the email?
                    </Typography>
                    <Button
                        variant="ghost"
                        onClick={handleResend}
                        disabled={isResending || resent}
                        loading={isResending}
                        sx={{ textTransform: 'none' }}
                    >
                        {resent ? 'Email Resent!' : 'Resend Email'}
                    </Button>
                </Box>

                {/* Tips */}
                <Box
                    sx={{
                        mt: 3,
                        p: 2,
                        borderRadius: 2,
                        bgcolor: theme.palette.mode === 'dark'
                            ? 'rgba(59, 130, 246, 0.1)'
                            : 'rgba(59, 130, 246, 0.05)',
                        border: '1px solid',
                        borderColor: theme.palette.mode === 'dark'
                            ? 'rgba(59, 130, 246, 0.3)'
                            : 'rgba(59, 130, 246, 0.1)',
                        textAlign: 'left',
                    }}
                >
                    <Typography variant="caption" color="text.secondary">
                        <strong>Tips:</strong> Check your spam folder if you don't see the email.
                        Make sure you entered the correct email address.
                    </Typography>
                </Box>
            </Box>
        </Fade>
    );
}

// ============================================================================
// Main Component
// ============================================================================

export function ForgotPasswordModal({
    open,
    onClose,
    onSendEmail,
}: ForgotPasswordModalProps) {
    const theme = useTheme();
    const [step, setStep] = useState<Step>('email');
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    // Reset state when modal closes
    useEffect(() => {
        if (!open) {
            setTimeout(() => {
                setStep('email');
                setEmail('');
                setError('');
                setIsLoading(false);
            }, 300);
        }
    }, [open]);

    const handleSendEmail = async (emailValue: string) => {
        setIsLoading(true);
        setError('');
        try {
            await onSendEmail(emailValue);
            setEmail(emailValue);
            setStep('sent');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to send email');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        await onSendEmail(email);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            TransitionComponent={SlideTransition}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 2,
                    overflow: 'hidden',
                    maxWidth: 480,
                    m: 2,
                    bgcolor: 'background.paper',
                    border: theme.palette.mode === 'dark' ? '1px solid' : 'none',
                    borderColor: 'divider',
                },
            }}
        >
            {/* Header */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    p: 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                }}
            >
                <IconButton
                    onClick={onClose}
                    size="small"
                    sx={{
                        color: 'text.secondary',
                        '&:hover': {
                            bgcolor: theme.palette.mode === 'dark'
                                ? 'rgba(255,255,255,0.1)'
                                : 'rgba(0,0,0,0.04)',
                        },
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </Box>

            {/* Content */}
            <DialogContent sx={{ p: 4 }}>
                {step === 'email' && (
                    <EmailStep
                        onSubmit={handleSendEmail}
                        isLoading={isLoading}
                        error={error}
                    />
                )}
                {step === 'sent' && (
                    <EmailSentStep
                        email={email}
                        onClose={onClose}
                        onResend={handleResend}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
