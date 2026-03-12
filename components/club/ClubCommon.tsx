'use client';

import React from 'react';
import {
    Box,
    Grid,
    Card,
    CardContent,
    Stack,
    Typography,
    Tabs,
    Tab,
    Tooltip,
    IconButton,
    alpha,
    useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import RefreshIcon from '@mui/icons-material/Refresh';

const MotionBox = motion.create(Box);
const MotionCard = motion.create(Card);

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
};

export type ClubOverviewStat = {
    label: string;
    value: number | string;
    icon: any;
    color: string;
};

type Props = {
    title?: string;
    description?: string;
    overviewStats?: ClubOverviewStat[];
    mainTab: number;
    onMainTabChange: (e: React.SyntheticEvent, v: number) => void;
    tabLabels: string[];
    isLoading?: boolean;
    children?: React.ReactNode;
    showTabs?: boolean;
    showStats?: boolean;
    onRefresh?: () => void;
    headerActions?: React.ReactNode;
};

export default function ClubCommon({
    title = 'Club Management',
    description = 'Manage clubs, memberships, announcements & elections',
    overviewStats = [],
    mainTab,
    onMainTabChange,
    tabLabels,
    isLoading,
    children,
    showTabs = true,
    showStats = true,
    onRefresh,
    headerActions,
}: Props) {
    const theme = useTheme();

    return (
        <MotionBox
            variants={containerVariants}
            initial="hidden"
            animate="show"
            sx={{ maxWidth: 1600, mx: 'auto', px: { xs: 1, sm: 2, md: 0 } }}
        >
            {/* Header */}
            <MotionBox variants={itemVariants} sx={{ mb: 4 }}>
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    spacing={2}
                >
                    <Box>
                        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ letterSpacing: '-0.02em' }}>
                            {title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {description}
                        </Typography>
                    </Box>
                    <Stack direction="row" spacing={1} alignItems="center">
                        {headerActions}
                        <Tooltip title="Refresh">
                            <span>
                                <IconButton
                                    onClick={onRefresh}
                                    sx={{
                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                        '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) },
                                    }}
                                    disabled={!!isLoading}
                                >
                                    <RefreshIcon />
                                </IconButton>
                            </span>
                        </Tooltip>
                    </Stack>
                </Stack>
            </MotionBox>

            {/* Overview Stats */}
            {showStats && overviewStats.length > 0 && (
                <MotionBox variants={itemVariants} sx={{ mb: 4 }}>
                    <Grid container spacing={2}>
                        {overviewStats.map((stat, index) => {
                            const Icon = stat.icon;
                            return (
                                <Grid
                                    size={{ xs: 6, sm: 4, md: Math.min(12 / overviewStats.length, 3) }}
                                    key={index}
                                >
                                    <Card
                                        elevation={0}
                                        sx={{
                                            borderRadius: 1,
                                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                            height: '100%',
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                                borderColor: stat.color,
                                                boxShadow: `0 4px 16px ${alpha(stat.color, 0.15)}`,
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
                                                        bgcolor: alpha(stat.color, 0.1),
                                                        border: '1px solid',
                                                        borderColor: alpha(stat.color, 0.15),
                                                    }}
                                                >
                                                    <Icon sx={{ color: stat.color, fontSize: 22 }} />
                                                </Box>
                                                <Box>
                                                    <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.1 }}>
                                                        {stat.value}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
                                                        {stat.label}
                                                    </Typography>
                                                </Box>
                                            </Stack>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>
                </MotionBox>
            )}

            {/* Tabs */}
            {showTabs && (
                <MotionCard
                    variants={itemVariants}
                    elevation={0}
                    sx={{
                        mb: 3,
                        borderRadius: 1,
                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    }}
                >
                    <CardContent sx={{ p: 2 }}>
                        <Tabs
                            value={mainTab}
                            onChange={onMainTabChange}
                            variant="scrollable"
                            scrollButtons="auto"
                            sx={{
                                minHeight: 36,
                                '& .MuiTab-root': {
                                    minHeight: 36,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontSize: '0.8125rem',
                                    borderRadius: 1,
                                    px: 2,
                                },
                                '& .MuiTabs-indicator': { borderRadius: 1, height: 2 },
                            }}
                        >
                            {tabLabels.map((label, i) => (
                                <Tab key={i} label={label} />
                            ))}
                        </Tabs>
                    </CardContent>
                </MotionCard>
            )}

            {/* Children (tab contents) */}
            {children}
        </MotionBox>
    );
}

