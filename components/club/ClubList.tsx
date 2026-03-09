'use client';

import React from 'react';
import { Grid, Box, Typography, Skeleton, alpha, useTheme } from '@mui/material';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import { motion, AnimatePresence } from 'framer-motion';
import { ClubCard } from './ClubCard';
import type { ClubResponse } from '@/features/club/types';

const MotionBox = motion.create(Box);

interface ClubListProps {
    clubs: ClubResponse[];
    isLoading: boolean;
    onView: (club: ClubResponse) => void;
    onJoin?: (club: ClubResponse) => void;
    onManage?: (club: ClubResponse) => void;
    canJoin?: boolean;
    canManage?: boolean;
    memberClubIds?: number[];
    emptyMessage?: string;
}

export function ClubList({
    clubs,
    isLoading,
    onView,
    onJoin,
    onManage,
    canJoin = false,
    canManage = false,
    memberClubIds = [],
    emptyMessage = 'No clubs found.',
}: ClubListProps) {
    const theme = useTheme();

    if (isLoading) {
        return (
            <Grid container spacing={3}>
                {Array.from({ length: 6 }).map((_, i) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                        <Box sx={{ borderRadius: 3, overflow: 'hidden', border: `1px solid ${theme.palette.divider}` }}>
                            <Skeleton
                                variant="rectangular"
                                height={100}
                                animation="wave"
                                sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}
                            />
                            <Box sx={{ p: 2 }}>
                                <Skeleton variant="text" width="70%" height={28} animation="wave" />
                                <Skeleton variant="text" width="40%" height={18} animation="wave" />
                                <Skeleton variant="text" width="100%" height={18} animation="wave" sx={{ mt: 1 }} />
                                <Skeleton variant="text" width="90%" height={18} animation="wave" />
                                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                    <Skeleton variant="rounded" width={60} height={24} animation="wave" />
                                    <Skeleton variant="rounded" width={80} height={24} animation="wave" />
                                </Box>
                            </Box>
                        </Box>
                    </Grid>
                ))}
            </Grid>
        );
    }

    if (!clubs.length) {
        return (
            <MotionBox
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                sx={{
                    textAlign: 'center',
                    py: { xs: 6, sm: 10 },
                    px: 3,
                }}
            >
                <Box
                    sx={{
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 3,
                    }}
                >
                    <Diversity3Icon sx={{ fontSize: 40, color: alpha(theme.palette.primary.main, 0.4) }} />
                </Box>
                <Typography variant="h6" fontWeight={600} color="text.secondary" sx={{ mb: 1 }}>
                    {emptyMessage}
                </Typography>
                <Typography variant="body2" color="text.disabled" sx={{ maxWidth: 400, mx: 'auto' }}>
                    Clubs will appear here once they&apos;re available. Check back later or try a different search.
                </Typography>
            </MotionBox>
        );
    }

    return (
        <Grid container spacing={3}>
            <AnimatePresence mode="popLayout">
                {clubs.map((club, index) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={club.id}>
                        <ClubCard
                            club={club}
                            onView={onView}
                            onJoin={onJoin}
                            onManage={onManage}
                            canJoin={canJoin}
                            canManage={canManage}
                            isMember={memberClubIds.includes(club.id)}
                            index={index}
                        />
                    </Grid>
                ))}
            </AnimatePresence>
        </Grid>
    );
}
