'use client';

import React from 'react';
import { Box, Typography, Avatar, Skeleton, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import TimelineIcon from '@mui/icons-material/Timeline';

interface Activity {
    id: string;
    user: { name: string; avatar?: string };
    action: string;
    target: string;
    time: string;
    type: 'create' | 'update' | 'delete' | 'comment' | 'join' | 'complete';
}

interface ActivityFeedProps {
    activities: Activity[];
    title?: string;
    onViewAll?: () => void;
    isLoading?: boolean;
}

const MotionBox = motion.create(Box);

const getActivityColor = (type: Activity['type']) => {
    const colors = {
        create: '#10B981',
        update: '#60A5FA',
        delete: '#EF4444',
        comment: '#8B5CF6',
        join: '#F59E0B',
        complete: '#10B981',
    };
    return colors[type];
};

export const ActivityFeed: React.FC<ActivityFeedProps> = ({
    activities,
    title = 'Recent Activity',
    onViewAll,
    isLoading = false,
}) => {
    if (isLoading) {
        return (
            <Box sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'grey.100', height: '100%' }}>
                <Skeleton width={140} height={28} sx={{ mb: 3 }} />
                {[...Array(4)].map((_, i) => (
                    <Box key={i} sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <Skeleton variant="circular" width={40} height={40} />
                        <Box sx={{ flex: 1 }}>
                            <Skeleton width="80%" height={20} />
                            <Skeleton width="40%" height={16} />
                        </Box>
                    </Box>
                ))}
            </Box>
        );
    }

    return (
        <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
            sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'grey.100', height: '100%', display: 'flex', flexDirection: 'column' }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}>{title}</Typography>
                {onViewAll && (
                    <IconButton size="small" onClick={onViewAll} sx={{ bgcolor: 'grey.50', '&:hover': { bgcolor: 'grey.100' } }}>
                        <ArrowForwardIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                )}
            </Box>

            <Box sx={{ flex: 1, position: 'relative' }}>
                {activities.length === 0 ? (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', py: 4 }}>
                        <TimelineIcon sx={{ fontSize: 48, color: 'grey.300', mb: 2 }} />
                        <Typography color="text.secondary">No recent activity</Typography>
                    </Box>
                ) : (
                    <Box sx={{ position: 'relative', pl: 3 }}>
                        <Box sx={{ position: 'absolute', left: 7, top: 0, bottom: 0, width: 2, bgcolor: 'grey.100' }} />
                        {activities.map((activity, index) => {
                            const color = getActivityColor(activity.type);
                            return (
                                <MotionBox
                                    key={activity.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    sx={{ display: 'flex', gap: 2, mb: 2.5, position: 'relative' }}
                                >
                                    <Box sx={{ position: 'absolute', left: -22, top: 4, width: 12, height: 12, borderRadius: '50%', bgcolor: color, border: '2px solid white', boxShadow: '0 0 0 2px ' + color + '30' }} />
                                    <Avatar src={activity.user.avatar} sx={{ width: 36, height: 36, bgcolor: `${color}15`, color, fontSize: '0.875rem', fontWeight: 600 }}>
                                        {activity.user.name.charAt(0)}
                                    </Avatar>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography variant="body2" sx={{ color: 'text.primary' }}>
                                            <Box component="span" sx={{ fontWeight: 600 }}>{activity.user.name}</Box>
                                            {' '}{activity.action}{' '}
                                            <Box component="span" sx={{ fontWeight: 500, color: 'primary.main' }}>{activity.target}</Box>
                                        </Typography>
                                        <Typography variant="caption" color="text.disabled">{activity.time}</Typography>
                                    </Box>
                                </MotionBox>
                            );
                        })}
                    </Box>
                )}
            </Box>
        </MotionBox>
    );
};

export default ActivityFeed;
