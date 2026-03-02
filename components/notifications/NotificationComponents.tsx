"use client";

/**
 * Push Notification Components
 *
 * UI components for push notification management.
 */

import React, { useState, useEffect } from 'react';
import {
  Alert,
  AlertTitle,
  Button,
  IconButton,
  Snackbar,
  Box,
  Card,
  CardContent,
  Typography,
  Switch,
  FormControlLabel,
  CircularProgress,
  Chip,
  Stack,
  Collapse,
  Paper,
  Badge,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import NotificationsOffIcon from '@mui/icons-material/NotificationsOff';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import WarningIcon from '@mui/icons-material/Warning';
import AnnouncementIcon from '@mui/icons-material/Announcement';
import EventIcon from '@mui/icons-material/Event';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import SettingsIcon from '@mui/icons-material/Settings';
import SchoolIcon from '@mui/icons-material/School';
import AlarmIcon from '@mui/icons-material/Alarm';
import { usePushNotificationContext } from '@/contexts/PushNotificationContext';
import { useNotificationHistory } from '@/hooks/useNotificationHistory';
import type { DisplayedNotification, NotificationType } from '@/types/push-notification.d';

/**
 * Get icon for notification type
 */
function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case 'ANNOUNCEMENT':
      return <AnnouncementIcon color="primary" />;
    case 'EVENT':
      return <EventIcon color="info" />;
    case 'VOTING_ALERT':
      return <HowToVoteIcon color="secondary" />;
    case 'ALERT':
      return <ErrorIcon color="error" />;
    case 'REMINDER':
      return <WarningIcon color="warning" />;
    case 'KUPPI_SESSION':
      return <SchoolIcon color="primary" />;
    case 'KUPPI_REMINDER':
      return <AlarmIcon color="warning" />;
    case 'SYSTEM':
    case 'SYSTEM_MESSAGE':
      return <SettingsIcon color="action" />;
    default:
      return <NotificationsIcon color="primary" />;
  }
}

/**
 * Notification Toast Component
 * Displays foreground notifications as toast/snackbar
 */
interface NotificationToastProps {
  notification: DisplayedNotification | null;
  open: boolean;
  onClose: () => void;
  onClick?: () => void;
  autoHideDuration?: number;
}

export function NotificationToast({
  notification,
  open,
  onClose,
  onClick,
  autoHideDuration = 6000,
}: NotificationToastProps) {
  if (!notification) return null;

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      sx={{ mt: 8 }}
    >
      <Alert
        severity="info"
        icon={getNotificationIcon(notification.type)}
        onClose={onClose}
        onClick={onClick}
        sx={{
          width: '100%',
          maxWidth: 400,
          cursor: onClick ? 'pointer' : 'default',
          '&:hover': onClick
            ? { bgcolor: 'action.hover' }
            : undefined,
        }}
        action={
          <IconButton
            size="small"
            color="inherit"
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        }
      >
        <AlertTitle sx={{ fontWeight: 'bold' }}>{notification.title}</AlertTitle>
        <Typography variant="body2" noWrap>
          {notification.body}
        </Typography>
      </Alert>
    </Snackbar>
  );
}

/**
 * Push Settings Component
 * Allows users to enable/disable push notifications
 */
interface PushSettingsProps {
  showStatus?: boolean;
  compact?: boolean;
}

export function PushSettings({ showStatus = true, compact = false }: PushSettingsProps) {
  const {
    isSupported,
    permission,
    isRegistered,
    isLoading,
    error,
    requestPermission,
    registerToken,
    unregisterToken,
    clearError,
  } = usePushNotificationContext();

  const [isEnabled, setIsEnabled] = useState(isRegistered);

  useEffect(() => {
    setIsEnabled(isRegistered);
  }, [isRegistered]);

  const handleToggle = async () => {
    if (isLoading) return;

    if (isEnabled) {
      // Disable notifications
      const success = await unregisterToken();
      if (success) {
        setIsEnabled(false);
      }
    } else {
      // Enable notifications
      if (permission !== 'granted') {
        const granted = await requestPermission();
        if (!granted) return;
      }
      const success = await registerToken();
      if (success) {
        setIsEnabled(true);
      }
    }
  };

  if (!isSupported) {
    return (
      <Alert severity="warning" sx={{ mb: 2 }}>
        Push notifications are not supported in this browser.
      </Alert>
    );
  }

  if (permission === 'denied') {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        <AlertTitle>Notifications Blocked</AlertTitle>
        Push notifications are blocked. Please enable them in your browser settings.
      </Alert>
    );
  }

  if (compact) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <FormControlLabel
          control={
            <Switch
              checked={isEnabled}
              onChange={handleToggle}
              disabled={isLoading}
              color="primary"
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {isEnabled ? (
                <NotificationsActiveIcon fontSize="small" color="primary" />
              ) : (
                <NotificationsOffIcon fontSize="small" color="disabled" />
              )}
              <Typography variant="body2">
                {isLoading ? 'Processing...' : isEnabled ? 'Enabled' : 'Disabled'}
              </Typography>
            </Box>
          }
        />
      </Box>
    );
  }

  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <NotificationsIcon color="primary" />
            <Typography variant="h6">Push Notifications</Typography>
          </Box>
          {isLoading && <CircularProgress size={24} />}
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Receive instant notifications about important updates, announcements, and events.
        </Typography>

        <FormControlLabel
          control={
            <Switch
              checked={isEnabled}
              onChange={handleToggle}
              disabled={isLoading}
              color="primary"
            />
          }
          label={isEnabled ? 'Notifications Enabled' : 'Enable Notifications'}
        />

        {showStatus && (
          <Collapse in={isEnabled}>
            <Box sx={{ mt: 2 }}>
              <Stack direction="row" spacing={1}>
                <Chip
                  icon={<CheckCircleIcon />}
                  label="Active"
                  color="success"
                  size="small"
                  variant="outlined"
                />
                <Chip
                  label={`Permission: ${permission}`}
                  size="small"
                  variant="outlined"
                />
              </Stack>
            </Box>
          </Collapse>
        )}

        {error && (
          <Alert
            severity="error"
            sx={{ mt: 2 }}
            onClose={clearError}
          >
            {error}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Enable Notifications Banner
 * Prompts users to enable notifications
 */
interface EnableNotificationsBannerProps {
  onDismiss?: () => void;
}

export function EnableNotificationsBanner({ onDismiss }: EnableNotificationsBannerProps) {
  const { isSupported, permission, isRegistered, isLoading, registerToken, requestPermission } =
    usePushNotificationContext();

  const [dismissed, setDismissed] = useState(false);

  // Don't show if not supported, already registered, or permission denied
  if (!isSupported || isRegistered || permission === 'denied' || dismissed) {
    return null;
  }

  const handleEnable = async () => {
    if (permission !== 'granted') {
      await requestPermission();
    }
    await registerToken();
  };

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  return (
    <Alert
      severity="info"
      icon={<NotificationsIcon />}
      sx={{
        position: 'fixed',
        bottom: 16,
        left: 16,
        right: 16,
        maxWidth: 500,
        mx: 'auto',
        zIndex: 1300,
        boxShadow: 3,
      }}
      action={
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            color="inherit"
            size="small"
            onClick={handleEnable}
            disabled={isLoading}
          >
            {isLoading ? 'Enabling...' : 'Enable'}
          </Button>
          <IconButton color="inherit" size="small" onClick={handleDismiss}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      }
    >
      <AlertTitle>Enable Notifications</AlertTitle>
      Stay updated with important announcements and events.
    </Alert>
  );
}

/**
 * Notification List Component
 * Fetches and displays notification history from the backend.
 * Merges with any foreground notifications received in the current session.
 */
interface NotificationListProps {
  maxItems?: number;
  onNotificationClick?: (notification: DisplayedNotification) => void;
}

export function NotificationList({
  maxItems = 20,
  onNotificationClick,
}: NotificationListProps) {
  const { notifications: foregroundNotifications, markAsRead: markForegroundAsRead } =
    usePushNotificationContext();
  const {
    notifications: historyNotifications,
    unreadCount,
    isLoading,
    markAsRead: markHistoryAsRead,
    markAllAsRead,
    fetchHistory,
    hasMore,
    currentPage,
  } = useNotificationHistory({ autoFetch: true, pollInterval: 30000, pageSize: maxItems });

  // Merge foreground (in-memory) + backend history, deduplicate by matching title+body+timestamp proximity
  const mergedNotifications = React.useMemo(() => {
    const historyMapped: DisplayedNotification[] = historyNotifications.map((h) => ({
      id: `history-${h.id}`,
      _historyId: h.id,
      title: h.title,
      body: h.body || '',
      type: (h.type as NotificationType) || 'GENERAL',
      timestamp: new Date(h.sentAt || h.createdAt),
      read: h.read,
      clickAction: h.clickAction || undefined,
      image: h.imageUrl || undefined,
    })) as (DisplayedNotification & { _historyId?: number })[];

    // Add foreground notifications that aren't already in history
    const combined = [...historyMapped];
    for (const fg of foregroundNotifications) {
      const isDuplicate = historyMapped.some(
        (h) =>
          h.title === fg.title &&
          h.body === fg.body &&
          Math.abs(h.timestamp.getTime() - new Date(fg.timestamp).getTime()) < 60000
      );
      if (!isDuplicate) {
        combined.unshift(fg);
      }
    }

    // Sort by timestamp descending
    combined.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return combined;
  }, [historyNotifications, foregroundNotifications]);

  const handleNotificationClick = async (notification: DisplayedNotification & { _historyId?: number }) => {
    // Mark as read on backend if it's a history notification
    if (notification._historyId) {
      await markHistoryAsRead(notification._historyId);
    } else {
      markForegroundAsRead(notification.id);
    }
    onNotificationClick?.(notification);
  };

  if (isLoading && mergedNotifications.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress size={32} sx={{ mb: 1 }} />
        <Typography variant="body2" color="text.secondary">
          Loading notifications...
        </Typography>
      </Paper>
    );
  }

  if (mergedNotifications.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <NotificationsOffIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
        <Typography variant="body2" color="text.secondary">
          No notifications yet
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Badge badgeContent={unreadCount} color="primary">
            <NotificationsIcon />
          </Badge>
          <Typography variant="subtitle1" fontWeight="medium">
            Notifications
          </Typography>
        </Box>
        {unreadCount > 0 && (
          <Button size="small" onClick={markAllAsRead}>
            Mark all read
          </Button>
        )}
      </Box>

      <List sx={{ maxHeight: 400, overflow: 'auto' }}>
        {mergedNotifications.map((notification, index) => (
          <React.Fragment key={notification.id}>
            <ListItemButton
              onClick={() => handleNotificationClick(notification as DisplayedNotification & { _historyId?: number })}
              sx={{
                bgcolor: notification.read ? 'transparent' : 'action.hover',
              }}
            >
              <ListItemIcon>{getNotificationIcon(notification.type)}</ListItemIcon>
              <ListItemText
                primary={notification.title}
                secondary={
                  <>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      component="span"
                      sx={{
                        display: 'block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {notification.body}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(notification.timestamp).toLocaleString()}
                    </Typography>
                  </>
                }
              />
              {!notification.read && (
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    ml: 1,
                  }}
                />
              )}
            </ListItemButton>
            {index < mergedNotifications.length - 1 && <Divider />}
          </React.Fragment>
        ))}
        {hasMore && (
          <Box sx={{ p: 1, textAlign: 'center' }}>
            <Button
              size="small"
              onClick={() => fetchHistory(currentPage + 1)}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Load more'}
            </Button>
          </Box>
        )}
      </List>
    </Paper>
  );
}

/**
 * Notification Bell with Badge
 * Shows unread count from backend notification history.
 */
interface NotificationBellProps {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export function NotificationBell({ onClick }: NotificationBellProps) {
  const { isRegistered } = usePushNotificationContext();
  const { unreadCount } = useNotificationHistory({ autoFetch: true, pollInterval: 30000 });

  return (
    <IconButton onClick={onClick} sx={{ color: 'text.secondary' }}>
      <Badge badgeContent={unreadCount} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem' } }}>
        {isRegistered ? (
          <NotificationsActiveIcon sx={{ fontSize: 22 }} />
        ) : (
          <NotificationsIcon sx={{ fontSize: 22 }} />
        )}
      </Badge>
    </IconButton>
  );
}

export default {
  NotificationToast,
  PushSettings,
  EnableNotificationsBanner,
  NotificationList,
  NotificationBell,
};

