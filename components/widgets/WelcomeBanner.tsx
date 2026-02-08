'use client';

import React from 'react';
import { Box, Typography, Avatar, IconButton, Skeleton } from '@mui/material';
import { motion } from 'framer-motion';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import WavingHandIcon from '@mui/icons-material/WavingHand';

interface WelcomeBannerProps {
    userName: string;
    userAvatar?: string;
    greeting?: string;
    subtitle?: string;
    isLoading?: boolean;
    onNotificationClick?: () => void;
    notificationCount?: number;
}

const MotionBox = motion.create(Box);

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({
    userName,
    userAvatar,
    greeting,
    subtitle = "Here's what's happening with your university life today",
    isLoading = false,
    onNotificationClick,
    notificationCount = 0,
}) => {
    const getGreeting = () => {
        if (greeting) return greeting;
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 17) return 'Good afternoon';
        return 'Good evening';
    };

    const getCurrentDate = () => {
        return new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        });
    };

    if (isLoading) {
        return (
            <Box
                sx={{
                    p: { xs: 3, md: 4 },
                    borderRadius: 4,
                    background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 50%, #818CF8 100%)',
                    position: 'relative',
                    overflow: 'hidden',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Skeleton variant="circular" width={64} height={64} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
                    <Box sx={{ flex: 1 }}>
                        <Skeleton width="60%" height={40} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
                        <Skeleton width="40%" height={24} sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />
                    </Box>
                </Box>
            </Box>
        );
    }

    return (
        <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            sx={{
                p: { xs: 3, md: 4 },
                borderRadius: 4,
                background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 50%, #818CF8 100%)',
                color: 'white',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(96, 165, 250, 0.3)',
            }}
        >
            {/* Animated Background Elements */}
            <Box
                component={motion.div}
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.15, 0.1],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
                sx={{
                    position: 'absolute',
                    top: -80,
                    right: -80,
                    width: 280,
                    height: 280,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.1)',
                    filter: 'blur(40px)',
                }}
            />
            <Box
                component={motion.div}
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.08, 0.12, 0.08],
                }}
                transition={{
                    duration: 5,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 1,
                }}
                sx={{
                    position: 'absolute',
                    bottom: -60,
                    left: -60,
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    bgcolor: 'rgba(255,255,255,0.08)',
                    filter: 'blur(30px)',
                }}
            />

            {/* Grid Pattern Overlay */}
            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)`,
                    backgroundSize: '24px 24px',
                    pointerEvents: 'none',
                }}
            />

            <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography
                        variant="caption"
                        sx={{
                            opacity: 0.8,
                            fontWeight: 500,
                            letterSpacing: 0.5,
                            textTransform: 'uppercase',
                            fontSize: '0.7rem',
                        }}
                    >
                        {getCurrentDate()}
                    </Typography>
                    {onNotificationClick && (
                        <IconButton
                            onClick={onNotificationClick}
                            sx={{
                                bgcolor: 'rgba(255,255,255,0.15)',
                                backdropFilter: 'blur(10px)',
                                '&:hover': {
                                    bgcolor: 'rgba(255,255,255,0.25)',
                                },
                            }}
                        >
                            <NotificationsActiveIcon sx={{ color: 'white', fontSize: 20 }} />
                            {notificationCount > 0 && (
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        top: 4,
                                        right: 4,
                                        width: 18,
                                        height: 18,
                                        borderRadius: '50%',
                                        bgcolor: '#EF4444',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '0.65rem',
                                        fontWeight: 700,
                                    }}
                                >
                                    {notificationCount > 9 ? '9+' : notificationCount}
                                </Box>
                            )}
                        </IconButton>
                    )}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    >
                        <Avatar
                            src={userAvatar}
                            sx={{
                                width: { xs: 56, md: 72 },
                                height: { xs: 56, md: 72 },
                                border: '3px solid rgba(255,255,255,0.3)',
                                bgcolor: 'rgba(255,255,255,0.2)',
                                fontSize: { xs: '1.25rem', md: '1.5rem' },
                                fontWeight: 700,
                                boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
                            }}
                        >
                            {userName?.charAt(0).toUpperCase()}
                        </Avatar>
                    </motion.div>

                    <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                            <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: 700,
                                    fontSize: { xs: '1.5rem', md: '2rem' },
                                    letterSpacing: '-0.02em',
                                }}
                            >
                                {getGreeting()}, {userName}!
                            </Typography>
                            <motion.div
                                animate={{ rotate: [0, 14, -8, 14, -4, 10, 0] }}
                                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 3 }}
                            >
                                <WavingHandIcon sx={{ fontSize: { xs: 24, md: 32 }, color: '#FCD34D' }} />
                            </motion.div>
                        </Box>
                        <Typography
                            variant="body1"
                            sx={{
                                opacity: 0.85,
                                fontWeight: 400,
                                fontSize: { xs: '0.875rem', md: '1rem' },
                            }}
                        >
                            {subtitle}
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </MotionBox>
    );
};

export default WelcomeBanner;
