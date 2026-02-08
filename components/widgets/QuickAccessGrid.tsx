'use client';

import React from 'react';
import { Box, Typography, Chip, Skeleton, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface QuickAction {
    id: string;
    icon: React.ReactNode;
    label: string;
    description?: string;
    count?: number;
    path: string;
    color: string;
    gradient?: string;
}

interface QuickAccessGridProps {
    actions: QuickAction[];
    onActionClick: (path: string) => void;
    isLoading?: boolean;
}

const MotionBox = motion.create(Box);

export const QuickAccessGrid: React.FC<QuickAccessGridProps> = ({
    actions,
    onActionClick,
    isLoading = false,
}) => {
    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.06 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 },
    };

    if (isLoading) {
        return (
            <Box>
                <Skeleton width={120} height={28} sx={{ mb: 3 }} />
                <Grid container spacing={2}>
                    {[...Array(8)].map((_, i) => (
                        <Grid size={{ xs: 6, sm: 4, md: 3 }} key={i}>
                            <Skeleton variant="rounded" height={140} sx={{ borderRadius: 3 }} />
                        </Grid>
                    ))}
                </Grid>
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
                    Quick Access
                </Typography>
                <Typography variant="body2" color="text.secondary">
                    Jump to your most used features
                </Typography>
            </Box>

            <motion.div variants={containerVariants} initial="hidden" animate="show">
                <Grid container spacing={2}>
                    {actions.map((action) => (
                        <Grid size={{ xs: 6, sm: 4, md: 3 }} key={action.id}>
                            <MotionBox
                                variants={itemVariants}
                                whileHover={{ y: -6, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onActionClick(action.path)}
                                sx={{
                                    p: 2.5,
                                    borderRadius: 3,
                                    bgcolor: 'background.paper',
                                    border: '1px solid',
                                    borderColor: 'grey.100',
                                    cursor: 'pointer',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    height: '100%',
                                    minHeight: 140,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    '&:hover': {
                                        borderColor: action.color,
                                        boxShadow: `0 16px 32px -8px ${action.color}20`,
                                        '& .action-arrow': { opacity: 1, transform: 'translateX(0)' },
                                        '& .action-icon': { transform: 'scale(1.1)' },
                                    },
                                }}
                            >
                                <Box
                                    className="action-icon"
                                    sx={{
                                        width: 52,
                                        height: 52,
                                        borderRadius: 2.5,
                                        background: `linear-gradient(135deg, ${action.color}15 0%, ${action.color}25 100%)`,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: action.color,
                                        mb: 2,
                                        transition: 'transform 0.3s ease',
                                    }}
                                >
                                    {action.icon}
                                </Box>

                                <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.95rem' }}>
                                    {action.label}
                                </Typography>

                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 'auto' }}>
                                    {action.count !== undefined && action.count > 0 && (
                                        <Chip
                                            label={`${action.count} new`}
                                            size="small"
                                            sx={{
                                                height: 24,
                                                bgcolor: `${action.color}12`,
                                                color: action.color,
                                                fontWeight: 600,
                                                fontSize: '0.7rem',
                                            }}
                                        />
                                    )}
                                    <Box
                                        className="action-arrow"
                                        sx={{
                                            opacity: 0,
                                            transform: 'translateX(-8px)',
                                            transition: 'all 0.3s ease',
                                            ml: 'auto',
                                        }}
                                    >
                                        <ArrowForwardIcon sx={{ fontSize: 18, color: action.color }} />
                                    </Box>
                                </Box>
                            </MotionBox>
                        </Grid>
                    ))}
                </Grid>
            </motion.div>
        </Box>
    );
};

export default QuickAccessGrid;
