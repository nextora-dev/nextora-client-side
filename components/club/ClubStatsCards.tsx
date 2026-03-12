'use client';

import React from 'react';
 import { Grid, Card, CardContent, Typography, Box, Stack, alpha, useTheme, Skeleton } from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import PersonIcon from '@mui/icons-material/Person';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import CampaignIcon from '@mui/icons-material/Campaign';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import UpcomingIcon from '@mui/icons-material/Upcoming';
import { motion } from 'framer-motion';
import type { ClubStatistics } from '@/features/club/types';

const MotionCard = motion(Card);

interface ClubStatsCardsProps {
    stats: ClubStatistics | null;
    isLoading: boolean;
}

export function ClubStatsCards({ stats, isLoading }: ClubStatsCardsProps) {
    const theme = useTheme();

    const cards = [
        {
            title: 'Total Members',
            value: stats?.totalMembers ?? 0,
            icon: GroupsIcon,
            color: theme.palette.primary.main,
            bgColor: alpha(theme.palette.primary.main, 0.08),
        },
        {
            title: 'Active Members',
            value: stats?.activeMembers ?? 0,
            icon: PersonIcon,
            color: theme.palette.success.main,
            bgColor: alpha(theme.palette.success.main, 0.08),
        },
        {
            title: 'Pending Requests',
            value: stats?.pendingMembers ?? 0,
            icon: HourglassEmptyIcon,
            color: theme.palette.warning.main,
            bgColor: alpha(theme.palette.warning.main, 0.08),
        },
        {
            title: 'Announcements',
            value: stats?.totalAnnouncements ?? 0,
            icon: CampaignIcon,
            color: theme.palette.info.main,
            bgColor: alpha(theme.palette.info.main, 0.08),
        },
        {
            title: 'Total Elections',
            value: stats?.totalElections ?? 0,
            icon: HowToVoteIcon,
            color: theme.palette.secondary.main,
            bgColor: alpha(theme.palette.secondary.main, 0.08),
        },
        {
            title: 'Upcoming Elections',
            value: stats?.upcomingElections ?? 0,
            icon: UpcomingIcon,
            color: theme.palette.error.main,
            bgColor: alpha(theme.palette.error.main, 0.08),
        },
    ];

    if (isLoading) {
        return (
            <Grid container spacing={2}>
                {Array.from({ length: 6 }).map((_, i) => (
                    <Grid size={{ xs: 6, sm: 4, md: 2 }} key={i}>
                        <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, p: 2 }}>
                            <Stack direction="row" alignItems="center" spacing={1.5}>
                                <Skeleton variant="rounded" width={44} height={44} sx={{ borderRadius: 1 }} />
                                <Box>
                                    <Skeleton variant="text" width={40} height={32} />
                                    <Skeleton variant="text" width={70} height={16} />
                                </Box>
                            </Stack>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        );
    }

    return (
        <Grid container spacing={2}>
            {cards.map((card, index) => {
                const Icon = card.icon;
                return (
                    <Grid size={{ xs: 6, sm: 4, md: 2 }} key={card.title}>
                        <MotionCard
                            elevation={0}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.35, delay: index * 0.06 }}
                            sx={{
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'divider',
                                height: '100%',
                                transition: 'all 0.2s',
                                '&:hover': {
                                    borderColor: card.color,
                                    boxShadow: `0 4px 16px ${alpha(card.color, 0.15)}`,
                                },
                            }}
                        >
                            <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                <Stack direction="row" alignItems="center" spacing={1.5}>
                                    <Box
                                        sx={{
                                            width: 44,
                                            height: 44,
                                            borderRadius: 1,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            bgcolor: card.bgColor,
                                            border: '1px solid',
                                            borderColor: alpha(card.color, 0.15),
                                        }}
                                    >
                                        <Icon sx={{ fontSize: 22, color: card.color }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.1 }}>
                                            {String(card.value)}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
                                            {card.title}
                                        </Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </MotionCard>
                    </Grid>
                );
            })}
        </Grid>
    );
}
