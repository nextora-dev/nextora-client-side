'use client';

import React from 'react';
import { Box, Typography, Button, alpha, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface HeroBannerProps {
    onApply: () => void;
}

const MotionBox = motion.create(Box);

export const HeroBanner: React.FC<HeroBannerProps> = ({ onApply }) => {
    const theme = useTheme();

    return (
        <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            sx={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 1,
                p: { xs: 3, md: 4 },
                mb: 4,
                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 50%, #6366F1 100%)`,
                boxShadow: `0 20px 40px ${alpha(theme.palette.primary.main, 0.3)}`,
            }}
        >
            {/* Animated background elements */}
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

            {/* Grid pattern overlay */}
            <Box
                sx={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)`,
                    backgroundSize: '24px 24px',
                    pointerEvents: 'none',
                }}
            />

            {/* Content */}
            <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Box
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        mb: 2,
                    }}
                >
                    <Box
                        sx={{
                            width: 56,
                            height: 56,
                            borderRadius: 3,
                            bgcolor: 'rgba(255,255,255,0.15)',
                            backdropFilter: 'blur(10px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <AutoStoriesIcon sx={{ color: 'white', fontSize: 28 }} />
                    </Box>
                    <Box>
                        <Typography
                            variant="h5"
                            sx={{
                                fontWeight: 700,
                                color: 'white',
                                letterSpacing: '-0.02em',
                            }}
                        >
                            Become a Kuppi Host
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                color: 'rgba(255,255,255,0.8)',
                            }}
                        >
                            Share your knowledge & help fellow students
                        </Typography>
                    </Box>
                </Box>

                <Typography
                    variant="body1"
                    sx={{
                        color: 'rgba(255,255,255,0.9)',
                        mb: 3,
                        maxWidth: 500,
                    }}
                >
                    Have a GPA of 3.0 or above? Apply to become a Kuppi host and earn recognition while helping your peers succeed.
                </Typography>

                <Button
                    variant="contained"
                    endIcon={<ArrowForwardIcon />}
                    onClick={onApply}
                    sx={{
                        bgcolor: 'white',
                        color: theme.palette.primary.main,
                        fontWeight: 600,
                        px: 3,
                        py: 1.2,
                        borderRadius: 1,
                        textTransform: 'none',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                        '&:hover': {
                            bgcolor: 'rgba(255,255,255,0.95)',
                            boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
                        },
                    }}
                >
                    Apply Now
                </Button>
            </Box>
        </MotionBox>
    );
};

