'use client';

import React from 'react';
import { Box, Typography, Skeleton, Badge, Button } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';

interface Notification {
    id: string;
    title: string;
    message: string;
    time: string;
    type: 'info' | 'success' | 'warning' | 'error';
    isRead?: boolean;
}

interface NotificationsWidgetProps {
    notifications: Notification[];
    title?: string;
    onViewAll?: () => void;
    onMarkAllRead?: () => void;
    isLoading?: boolean;
}

const MotionBox = motion.create(Box);

const getNotificationIcon = (type: Notification['type']) => {
    const icons = {
        info: InfoOutlinedIcon,
        success: CheckCircleOutlineIcon,
        warning: WarningAmberIcon,
        error: ErrorOutlineIcon,
    };
    return icons[type];
};

const getNotificationColor = (type: Notification['type']) => {
    const colors = {
        info: '#60A5FA',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
    };
    return colors[type];
};

export const NotificationsWidget: React.FC<NotificationsWidgetProps> = ({
    notifications,
    title = 'Notifications',
    onViewAll,
    onMarkAllRead,
    isLoading = false,
}) => {
    const unreadCount = notifications.filter(n => !n.isRead).length;

    if (isLoading) {
        return (
            <Box sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'grey.100', height: '100%' }}>
                <Skeleton width={140} height={28} sx={{ mb: 3 }} />
                {[...Array(3)].map((_, i) => <Skeleton key={i} variant="rounded" height={70} sx={{ mb: 2, borderRadius: 2 }} />)}
            </Box>
        );
    }

    return (
        <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'grey.100', height: '100%', display: 'flex', flexDirection: 'column' }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}>{title}</Typography>
                    {unreadCount > 0 && <Badge badgeContent={unreadCount} sx={{ '& .MuiBadge-badge': { bgcolor: '#EF4444', color: 'white', fontWeight: 600, fontSize: '0.7rem' } }} />}
                </Box>
                {onMarkAllRead && unreadCount > 0 && (
                    <Button size="small" onClick={onMarkAllRead} sx={{ textTransform: 'none', fontWeight: 500, color: 'primary.main', fontSize: '0.75rem' }}>Mark all read</Button>
                )}
            </Box>

            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 1.5, overflow: 'auto' }}>
                <AnimatePresence>
                    {notifications.length === 0 ? (
                        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', py: 4 }}>
                            <NotificationsNoneIcon sx={{ fontSize: 48, color: 'grey.300', mb: 2 }} />
                            <Typography color="text.secondary">No notifications</Typography>
                        </Box>
                    ) : (
                        notifications.map((notification, index) => {
                            const Icon = getNotificationIcon(notification.type);
                            const color = getNotificationColor(notification.type);
                            return (
                                <MotionBox
                                    key={notification.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ delay: index * 0.05 }}
                                    sx={{
                                        p: 2,
                                        borderRadius: 2,
                                        bgcolor: notification.isRead ? 'grey.50' : `${color}08`,
                                        borderLeft: 4,
                                        borderColor: color,
                                        position: 'relative',
                                        transition: 'all 0.2s ease',
                                        '&:hover': { bgcolor: `${color}12` },
                                    }}
                                >
                                    {!notification.isRead && <Box sx={{ position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: '50%', bgcolor: color }} />}
                                    <Box sx={{ display: 'flex', gap: 1.5 }}>
                                        <Box sx={{ width: 32, height: 32, borderRadius: 1.5, bgcolor: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                            <Icon sx={{ fontSize: 18, color }} />
                                        </Box>
                                        <Box sx={{ flex: 1, minWidth: 0 }}>
                                            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.primary', mb: 0.25, pr: 2 }}>{notification.title}</Typography>
                                            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem', mb: 0.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{notification.message}</Typography>
                                            <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.7rem' }}>{notification.time}</Typography>
                                        </Box>
                                    </Box>
                                </MotionBox>
                            );
                        })
                    )}
                </AnimatePresence>
            </Box>

            {onViewAll && notifications.length > 0 && (
                <Button fullWidth variant="text" onClick={onViewAll} sx={{ mt: 2, textTransform: 'none', fontWeight: 500, color: 'text.secondary', '&:hover': { bgcolor: 'grey.50', color: 'primary.main' } }}>
                    View all notifications
                </Button>
            )}
        </MotionBox>
    );
};

export default NotificationsWidget;
