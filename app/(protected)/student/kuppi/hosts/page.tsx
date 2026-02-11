'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Box, Typography, Card, CardContent, TextField, InputAdornment,
    Avatar, Chip, IconButton, Stack, Grid, alpha, useTheme, Button,
} from '@mui/material';
import { motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import StarIcon from '@mui/icons-material/Star';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

import { KuppiHost } from '@/types/kuppi';
import { SAMPLE_HOSTS } from '@/lib/constants/kuppi.constants';
import { getTutorInitials } from '@/components/features/kuppi';

const MotionCard = motion.create(Card);

export default function HostsListPage() {
    const router = useRouter();
    const theme = useTheme();
    const [searchQuery, setSearchQuery] = useState('');
    const [hosts] = useState<KuppiHost[]>(SAMPLE_HOSTS);

    const filteredHosts = hosts.filter(host => {
        const matchesSearch =
            host.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            host.department.toLowerCase().includes(searchQuery.toLowerCase()) ||
            host.expertise.some(e => e.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesSearch;
    });

    const handleHostClick = (hostId: string) => {
        router.push(`/student/kuppi/hosts/${hostId}`);
    };

    return (
        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
            {/* Header */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => router.push('/student/kuppi')}
                    sx={{ color: 'text.secondary', textTransform: 'none' }}
                >
                    Back
                </Button>
            </Box>

            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 0.5, color: 'text.primary' }}>
                    Kuppi Hosts
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Connect with experienced tutors and get personalized help
                </Typography>
            </Box>

            {/* Stats */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                {[
                    { label: 'Total Hosts', value: hosts.length, color: theme.palette.primary.main, icon: PeopleIcon },
                    { label: 'Top Rated', value: hosts.filter(h => h.rating >= 4.8).length, color: theme.palette.warning.main, icon: StarIcon },
                    { label: 'Total Sessions', value: hosts.reduce((acc, h) => acc + h.sessionsHosted, 0), color: theme.palette.secondary.main, icon: EmojiEventsIcon },
                ].map((stat, i) => (
                    <Grid size={{ xs: 12, sm: 4 }} key={stat.label}>
                        <MotionCard
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}
                        >
                            <CardContent sx={{ p: 2.5 }}>
                                <Stack direction="row" alignItems="center" spacing={2}>
                                    <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: alpha(stat.color, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <stat.icon sx={{ fontSize: 24, color: stat.color }} />
                                    </Box>
                                    <Box>
                                        <Typography variant="h4" fontWeight={700}>{stat.value}</Typography>
                                        <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </MotionCard>
                    </Grid>
                ))}
            </Grid>

            {/* Search */}
            <TextField
                fullWidth
                placeholder="Search hosts by name, department, or expertise..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <SearchIcon sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                    ),
                }}
                sx={{
                    mb: 4,
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                        bgcolor: 'background.paper',
                    },
                }}
            />

            {/* Hosts Grid */}
            <Grid container spacing={3}>
                {filteredHosts.map((host, index) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={host.id}>
                        <MotionCard
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            whileHover={{ y: -4 }}
                            onClick={() => handleHostClick(host.id)}
                            sx={{
                                borderRadius: 3,
                                cursor: 'pointer',
                                border: '1px solid',
                                borderColor: 'divider',
                                transition: 'all 0.2s ease',
                                '&:hover': {
                                    borderColor: 'primary.main',
                                    boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
                                },
                            }}
                        >
                            <CardContent sx={{ p: 3 }}>
                                <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                                    <Avatar
                                        sx={{
                                            width: 56,
                                            height: 56,
                                            bgcolor: alpha(theme.palette.primary.main, 0.15),
                                            color: 'primary.main',
                                            fontWeight: 700,
                                        }}
                                    >
                                        {getTutorInitials(host.name)}
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="subtitle1" fontWeight={600}>{host.name}</Typography>
                                        <Stack direction="row" alignItems="center" spacing={0.5}>
                                            <SchoolIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                            <Typography variant="caption" color="text.secondary">{host.department}</Typography>
                                        </Stack>
                                    </Box>
                                </Stack>

                                <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 0.5 }}>
                                    {host.expertise.slice(0, 3).map((exp) => (
                                        <Chip
                                            key={exp}
                                            label={exp}
                                            size="small"
                                            sx={{
                                                fontSize: '0.7rem',
                                                height: 24,
                                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                color: 'primary.main',
                                            }}
                                        />
                                    ))}
                                </Stack>

                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                        <StarIcon sx={{ fontSize: 16, color: 'warning.main' }} />
                                        <Typography variant="body2" fontWeight={600}>{host.rating}</Typography>
                                    </Stack>
                                    <Typography variant="caption" color="text.secondary">
                                        {host.sessionsHosted} sessions
                                    </Typography>
                                </Stack>
                            </CardContent>
                        </MotionCard>
                    </Grid>
                ))}
            </Grid>

            {filteredHosts.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="h6" color="text.secondary">No hosts found</Typography>
                    <Typography variant="body2" color="text.secondary">Try adjusting your search</Typography>
                </Box>
            )}
        </Box>
    );
}

