import React from 'react';
import { Box, Grid, Card, CardContent, Stack, Typography, Icon, Tabs, Tab, Tooltip, IconButton, alpha, useTheme } from '@mui/material';
import { motion } from 'framer-motion';
import RefreshIcon from '@mui/icons-material/Refresh';

const MotionBox = motion.create(Box);
const MotionCard = motion.create(Card);

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export type OverviewStat = { label: string; value: number | string; icon: any; color: string };

type Props = {
    title?: string;
    description?: string;
    overviewStats: OverviewStat[];
    mainTab: number;
    onMainTabChange: (e: React.SyntheticEvent, v: number) => void;
    isLoading?: boolean;
    children?: React.ReactNode;
    showTabs?: boolean;
    onRefresh?: () => void;
    // optional extra tab labels to render after the default tabs
    extraTabs?: string[];
};

export default function KuppiCommon({ title = 'Kuppi Management', description = 'Manage sessions, notes, and applications', overviewStats, mainTab, onMainTabChange, isLoading, children, showTabs = true, onRefresh, extraTabs = [] }: Props) {
    const theme = useTheme();

    return (
        <MotionBox variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 1600, mx: 'auto', px: { xs: 1, sm: 2, md: 0 } }}>
            {/* Header */}
            <MotionBox variants={itemVariants} sx={{ mb: 4 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
                    <Box>
                        <Typography variant="h4" fontWeight={700} gutterBottom>{title}</Typography>
                        <Typography variant="body2" color="text.secondary">{description}</Typography>
                    </Box>
                    <Tooltip title="Refresh">
                        <span>
                            <IconButton onClick={onRefresh} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) } }} disabled={!!isLoading}>
                                <RefreshIcon />
                            </IconButton>
                        </span>
                    </Tooltip>
                </Stack>
            </MotionBox>

            {/* Overview */}
            <MotionBox variants={itemVariants} sx={{ mb: 4 }}>
                <Grid container spacing={2}>
                    {overviewStats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <Grid size={{ xs: 6, sm: 4, md: 2 }} key={index}>
                                <Card elevation={0} sx={{ borderRadius: 1, border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, height: '100%' }}>
                                    <CardContent sx={{ p: 2 }}>
                                        <Stack direction="row" alignItems="center" spacing={1.5}>
                                            <Box sx={{ width: 40, height: 40, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(stat.color, 0.1) }}>
                                                <Icon sx={{ color: stat.color, fontSize: 20 }} />
                                            </Box>
                                            <Box>
                                                <Typography variant="h6" fontWeight={700}>{stat.value}</Typography>
                                                <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                                            </Box>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            </MotionBox>

            {/* Tabs (optional) */}
            {showTabs && (
                <MotionCard variants={itemVariants} elevation={0} sx={{ mb: 3, borderRadius: 1, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                    <CardContent sx={{ p: 2 }}>
                        <Tabs value={mainTab} onChange={onMainTabChange} variant="scrollable" scrollButtons="auto">
                            <Tab label="Applications" />
                            <Tab label="Sessions" />
                            <Tab label="Notes" />
                            {/* render optional extra tabs passed by pages */}
                            {Array.isArray(extraTabs) && extraTabs.map((t, i) => <Tab key={"extra-" + i} label={t} />)}
                        </Tabs>
                     </CardContent>
                 </MotionCard>
             )}

            {/* Children (tab contents) */}
            {children}
        </MotionBox>
    );
}
