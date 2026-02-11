'use client';

import React from 'react';
import { Box, Typography, Grid, Paper, alpha } from '@mui/material';
import { motion } from 'framer-motion';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PeopleIcon from '@mui/icons-material/People';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import StarIcon from '@mui/icons-material/Star';
import { KuppiSession } from '@/types/kuppi';

interface StatsGridProps {
    sessions: KuppiSession[];
}

const MotionPaper = motion.create(Paper);

const statsConfig = [
    { key: 'activeSessions', label: 'Active Sessions', icon: MenuBookIcon, color: '#3B82F6' },
    { key: 'totalHosts', label: 'Total Hosts', icon: PeopleIcon, color: '#10B981' },
    { key: 'thisWeek', label: 'This Week', icon: CalendarMonthIcon, color: '#8B5CF6' },
    { key: 'avgRating', label: 'Avg. Rating', icon: StarIcon, color: '#F59E0B' },
];

export const StatsGrid: React.FC<StatsGridProps> = ({ sessions }) => {

    // Calculate stats from sessions
    const stats = {
        activeSessions: sessions.filter((s) => s.status === 'upcoming').length,
        totalHosts: new Set(sessions.map((s) => s.host.id)).size,
        thisWeek: sessions.length,
        avgRating: (sessions.reduce((acc, s) => acc + s.host.rating, 0) / sessions.length).toFixed(1),
    };

    return (
        <Grid container spacing={2} sx={{ mb: 4 }}>
            {statsConfig.map((stat, index) => {
                const Icon = stat.icon;
                const value = stats[stat.key as keyof typeof stats];

                return (
                    <Grid size={{ xs: 6, md: 3 }} key={stat.key}>
                        <MotionPaper
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            whileHover={{ y: -2 }}
                            sx={{
                                p: 2.5,
                                borderRadius: 1,
                                border: '1px solid',
                                borderColor: 'divider',
                                bgcolor: 'background.paper',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    borderColor: alpha(stat.color, 0.5),
                                    boxShadow: `0 4px 20px ${alpha(stat.color, 0.15)}`,
                                },
                            }}
                        >
                            <Box
                                sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 2,
                                    bgcolor: alpha(stat.color, 0.1),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    mb: 1.5,
                                }}
                            >
                                <Icon sx={{ color: stat.color, fontSize: 24 }} />
                            </Box>
                            <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: 700,
                                    color: 'text.primary',
                                    lineHeight: 1.2,
                                }}
                            >
                                {value}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {stat.label}
                            </Typography>
                        </MotionPaper>
                    </Grid>
                );
            })}
        </Grid>
    );
};

