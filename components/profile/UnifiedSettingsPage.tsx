/**
 * @fileoverview Unified Settings Page Component
 * @description Industry-standard reusable settings page that works for all user roles
 */

'use client';

import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    TextField,
    Button,
    Stack,
    Divider,
    Switch,
    Alert,
    IconButton,
    Paper,
    useTheme,
    alpha,
    Tabs,
    Tab,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Snackbar,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Chip,
    CircularProgress,
    InputAdornment,
    LinearProgress,
} from '@mui/material';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import LockIcon from '@mui/icons-material/Lock';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SecurityIcon from '@mui/icons-material/Security';
import PaletteIcon from '@mui/icons-material/Palette';
import PrivacyTipIcon from '@mui/icons-material/PrivacyTip';
import DevicesIcon from '@mui/icons-material/Devices';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import ComputerIcon from '@mui/icons-material/Computer';
import LogoutIcon from '@mui/icons-material/Logout';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import KeyIcon from '@mui/icons-material/Key';
import ShieldIcon from '@mui/icons-material/Shield';
import SmartphoneIcon from '@mui/icons-material/Smartphone';
import LaptopIcon from '@mui/icons-material/Laptop';
import TabletIcon from '@mui/icons-material/Tablet';
import { useRouter, usePathname } from 'next/navigation';
import { useProfile } from '@/hooks/useProfile';

const MotionCard = motion.create(Card);
const MotionBox = motion.create(Box);

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel({ children, value, index }: TabPanelProps) {
    return (
        <div hidden={value !== index} style={{ width: '100%' }}>
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
}

function getPasswordStrength(password: string): { score: number; label: string; color: string } {
    let score = 0;
    if (password.length >= 8) score += 25;
    if (password.length >= 12) score += 15;
    if (/[a-z]/.test(password)) score += 15;
    if (/[A-Z]/.test(password)) score += 15;
    if (/[0-9]/.test(password)) score += 15;
    if (/[^a-zA-Z0-9]/.test(password)) score += 15;

    if (score < 40) return { score, label: 'Weak', color: 'error.main' };
    if (score < 70) return { score, label: 'Medium', color: 'warning.main' };
    return { score, label: 'Strong', color: 'success.main' };
}

interface UnifiedSettingsPageProps {
    basePath?: string;
}

export default function UnifiedSettingsPage({ basePath }: UnifiedSettingsPageProps) {
    const router = useRouter();
    const pathname = usePathname();
    const theme = useTheme();
    const { profile } = useProfile({ forceRefresh: true });

    const profilePath = pathname.replace('/settings', '');

    const [tabValue, setTabValue] = useState(0);
    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });
    const [changePasswordDialog, setChangePasswordDialog] = useState(false);
    const [deleteAccountDialog, setDeleteAccountDialog] = useState(false);
    const [enable2FADialog, setEnable2FADialog] = useState(false);
    const [logoutSessionDialog, setLogoutSessionDialog] = useState<string | null>(null);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    // Settings state
    const [notifications, setNotifications] = useState({
        emailNotifications: true,
        pushNotifications: true,
        smsNotifications: false,
        eventUpdates: true,
        announcements: true,
        assignmentReminders: true,
        gradeNotifications: true,
    });

    const [privacy, setPrivacy] = useState({
        showEmail: true,
        showPhone: false,
        showProfile: true,
        showOnlineStatus: true,
        allowMessaging: true,
    });

    const [appearance, setAppearance] = useState({
        theme: 'system' as 'light' | 'dark' | 'system',
        language: 'en',
    });

    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [sessions, setSessions] = useState([
        { id: '1', device: 'Current Device', browser: 'Chrome', location: 'Sri Lanka', current: true, lastActive: 'Active now', icon: LaptopIcon },
        { id: '2', device: 'Mobile', browser: 'Safari', location: 'Sri Lanka', current: false, lastActive: '2 hours ago', icon: SmartphoneIcon },
    ]);

    // Load settings from localStorage
    useEffect(() => {
        const saved = {
            notifications: localStorage.getItem('notificationSettings'),
            privacy: localStorage.getItem('privacySettings'),
            appearance: localStorage.getItem('appearanceSettings'),
        };
        if (saved.notifications) setNotifications(JSON.parse(saved.notifications));
        if (saved.privacy) setPrivacy(JSON.parse(saved.privacy));
        if (saved.appearance) setAppearance(JSON.parse(saved.appearance));
    }, []);

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => setTabValue(newValue);

    const handleNotificationChange = (key: keyof typeof notifications) => {
        const updated = { ...notifications, [key]: !notifications[key] };
        setNotifications(updated);
        localStorage.setItem('notificationSettings', JSON.stringify(updated));
        setSnackbar({ open: true, message: 'Setting updated', severity: 'success' });
    };

    const handlePrivacyChange = (key: keyof typeof privacy) => {
        const updated = { ...privacy, [key]: !privacy[key] };
        setPrivacy(updated);
        localStorage.setItem('privacySettings', JSON.stringify(updated));
        setSnackbar({ open: true, message: 'Privacy setting updated', severity: 'success' });
    };

    const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
        const updated = { ...appearance, theme: newTheme };
        setAppearance(updated);
        localStorage.setItem('appearanceSettings', JSON.stringify(updated));
        setSnackbar({ open: true, message: `Theme changed to ${newTheme}`, severity: 'success' });
    };

    const handleLanguageChange = (lang: string) => {
        const updated = { ...appearance, language: lang };
        setAppearance(updated);
        localStorage.setItem('appearanceSettings', JSON.stringify(updated));
        setSnackbar({ open: true, message: 'Language updated', severity: 'success' });
    };

    const handleChangePassword = async () => {
        if (!passwordForm.currentPassword || passwordForm.newPassword.length < 8) {
            setSnackbar({ open: true, message: 'Password must be at least 8 characters', severity: 'error' });
            return;
        }
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setSnackbar({ open: true, message: 'Passwords do not match', severity: 'error' });
            return;
        }
        setSaving(true);
        await new Promise(r => setTimeout(r, 1500));
        setChangePasswordDialog(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setSnackbar({ open: true, message: 'Password changed successfully!', severity: 'success' });
        setSaving(false);
    };

    const handleLogoutSession = async (id: string) => {
        setSaving(true);
        await new Promise(r => setTimeout(r, 1000));
        setSessions(sessions.filter(s => s.id !== id));
        setLogoutSessionDialog(null);
        setSnackbar({ open: true, message: 'Session terminated', severity: 'success' });
        setSaving(false);
    };

    const passwordStrength = getPasswordStrength(passwordForm.newPassword);

    return (
        <MotionBox variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, sm: 3 } }}>
            {/* Header */}
            <MotionBox variants={itemVariants} sx={{ mb: 4 }}>
                <Paper elevation={0} sx={{ p: { xs: 2, md: 3 }, borderRadius: 2, background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)` }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Stack direction="row" alignItems="center" spacing={2}>
                            <IconButton onClick={() => router.push(profilePath)} sx={{ bgcolor: alpha('#fff', 0.2), color: 'white', '&:hover': { bgcolor: alpha('#fff', 0.3) } }}>
                                <ArrowBackIcon />
                            </IconButton>
                            <Box>
                                <Typography variant="h5" fontWeight={700} color="white">Settings</Typography>
                                <Typography variant="body2" sx={{ color: alpha('#fff', 0.8) }}>{profile?.email || 'Manage your account'}</Typography>
                            </Box>
                        </Stack>
                    </Stack>
                </Paper>
            </MotionBox>

            <Grid container spacing={3}>
                {/* Mobile Tabs */}
                <Grid size={{ xs: 12 }} sx={{ display: { xs: 'block', md: 'none' } }}>
                    <MotionCard variants={itemVariants} elevation={0} sx={{ borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, mb: 2 }}>
                        <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
                            <Tab icon={<NotificationsIcon />} iconPosition="start" label="Notifications" />
                            <Tab icon={<SecurityIcon />} iconPosition="start" label="Security" />
                            <Tab icon={<PrivacyTipIcon />} iconPosition="start" label="Privacy" />
                            <Tab icon={<PaletteIcon />} iconPosition="start" label="Appearance" />
                            <Tab icon={<DevicesIcon />} iconPosition="start" label="Sessions" />
                        </Tabs>
                    </MotionCard>
                </Grid>

                {/* Desktop Sidebar */}
                <Grid size={{ xs: 12, md: 3 }} sx={{ display: { xs: 'none', md: 'block' } }}>
                    <MotionCard variants={itemVariants} elevation={0} sx={{ borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}`, position: 'sticky', top: 100 }}>
                        <Tabs orientation="vertical" value={tabValue} onChange={handleTabChange} sx={{ '& .MuiTab-root': { alignItems: 'flex-start', textAlign: 'left', px: 3, py: 2, minHeight: 56, textTransform: 'none', fontWeight: 500, justifyContent: 'flex-start' }, '& .Mui-selected': { bgcolor: alpha(theme.palette.primary.main, 0.08), fontWeight: 600 } }}>
                            <Tab icon={<NotificationsIcon />} iconPosition="start" label="Notifications" />
                            <Tab icon={<SecurityIcon />} iconPosition="start" label="Security" />
                            <Tab icon={<PrivacyTipIcon />} iconPosition="start" label="Privacy" />
                            <Tab icon={<PaletteIcon />} iconPosition="start" label="Appearance" />
                            <Tab icon={<DevicesIcon />} iconPosition="start" label="Sessions" />
                        </Tabs>
                    </MotionCard>
                </Grid>

                {/* Content */}
                <Grid size={{ xs: 12, md: 9 }}>
                    {/* Notifications */}
                    <TabPanel value={tabValue} index={0}>
                        <Stack spacing={3}>
                            <MotionCard variants={itemVariants} elevation={0} sx={{ borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                                        <Box sx={{ width: 40, height: 40, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                                            <NotificationsActiveIcon sx={{ color: 'primary.main' }} />
                                        </Box>
                                        <Typography variant="h6" fontWeight={700}>Notification Channels</Typography>
                                    </Stack>
                                    <List disablePadding>
                                        {[
                                            { key: 'emailNotifications', icon: EmailIcon, label: 'Email Notifications', desc: 'Receive updates via email' },
                                            { key: 'pushNotifications', icon: NotificationsIcon, label: 'Push Notifications', desc: 'Browser notifications' },
                                            { key: 'smsNotifications', icon: PhoneAndroidIcon, label: 'SMS Notifications', desc: 'Text messages' },
                                        ].map((item, idx) => (
                                            <Box key={item.key}>
                                                {idx > 0 && <Divider />}
                                                <ListItem sx={{ px: 0, py: 2 }}>
                                                    <ListItemIcon><item.icon color="action" /></ListItemIcon>
                                                    <ListItemText primary={item.label} secondary={item.desc} />
                                                    <Switch checked={notifications[item.key as keyof typeof notifications]} onChange={() => handleNotificationChange(item.key as keyof typeof notifications)} />
                                                </ListItem>
                                            </Box>
                                        ))}
                                    </List>
                                </CardContent>
                            </MotionCard>
                        </Stack>
                    </TabPanel>

                    {/* Security */}
                    <TabPanel value={tabValue} index={1}>
                        <Stack spacing={3}>
                            <MotionCard variants={itemVariants} elevation={0} sx={{ borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                                        <Box sx={{ width: 40, height: 40, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                                            <LockIcon sx={{ color: 'primary.main' }} />
                                        </Box>
                                        <Typography variant="h6" fontWeight={700}>Password</Typography>
                                    </Stack>
                                    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: alpha(theme.palette.grey[500], 0.04), border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                                        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2}>
                                            <Box>
                                                <Stack direction="row" spacing={1} alignItems="center"><KeyIcon fontSize="small" /><Typography fontWeight={600}>Account Password</Typography></Stack>
                                                <Typography variant="body2" color="text.secondary">Last changed 30 days ago</Typography>
                                            </Box>
                                            <Button variant="contained" onClick={() => setChangePasswordDialog(true)}>Change Password</Button>
                                        </Stack>
                                    </Paper>
                                </CardContent>
                            </MotionCard>

                            <MotionCard variants={itemVariants} elevation={0} sx={{ borderRadius: 2, border: `1px solid ${alpha(theme.palette.error.main, 0.2)}` }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                                        <Box sx={{ width: 40, height: 40, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.error.main, 0.1) }}>
                                            <WarningAmberIcon sx={{ color: 'error.main' }} />
                                        </Box>
                                        <Typography variant="h6" fontWeight={700} color="error.main">Danger Zone</Typography>
                                    </Stack>
                                    <Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: alpha(theme.palette.error.main, 0.04), border: `1px solid ${alpha(theme.palette.error.main, 0.15)}` }}>
                                        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }} spacing={2}>
                                            <Box>
                                                <Typography fontWeight={600} color="error.main">Delete Account</Typography>
                                                <Typography variant="body2" color="text.secondary">Permanently delete all data</Typography>
                                            </Box>
                                            <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => setDeleteAccountDialog(true)}>Delete</Button>
                                        </Stack>
                                    </Paper>
                                </CardContent>
                            </MotionCard>
                        </Stack>
                    </TabPanel>

                    {/* Privacy */}
                    <TabPanel value={tabValue} index={2}>
                        <MotionCard variants={itemVariants} elevation={0} sx={{ borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                            <CardContent sx={{ p: 3 }}>
                                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                                    <Box sx={{ width: 40, height: 40, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                                        <PrivacyTipIcon sx={{ color: 'primary.main' }} />
                                    </Box>
                                    <Typography variant="h6" fontWeight={700}>Privacy Settings</Typography>
                                </Stack>
                                <Stack spacing={2}>
                                    {[
                                        { key: 'showEmail', label: 'Show Email', desc: 'Others can see your email', icon: EmailIcon },
                                        { key: 'showPhone', label: 'Show Phone', desc: 'Others can see your phone', icon: PhoneAndroidIcon },
                                        { key: 'showProfile', label: 'Public Profile', desc: 'Profile visible to everyone', icon: VisibilityIcon },
                                        { key: 'showOnlineStatus', label: 'Online Status', desc: 'Show when online', icon: CheckCircleIcon },
                                        { key: 'allowMessaging', label: 'Allow Messages', desc: 'Others can message you', icon: EmailIcon },
                                    ].map((item) => (
                                        <Paper key={item.key} elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.grey[500], 0.04), border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                <Stack direction="row" spacing={2} alignItems="center">
                                                    <item.icon color="action" />
                                                    <Box><Typography fontWeight={600}>{item.label}</Typography><Typography variant="caption" color="text.secondary">{item.desc}</Typography></Box>
                                                </Stack>
                                                <Switch checked={privacy[item.key as keyof typeof privacy]} onChange={() => handlePrivacyChange(item.key as keyof typeof privacy)} />
                                            </Stack>
                                        </Paper>
                                    ))}
                                </Stack>
                            </CardContent>
                        </MotionCard>
                    </TabPanel>

                    {/* Appearance */}
                    <TabPanel value={tabValue} index={3}>
                        <MotionCard variants={itemVariants} elevation={0} sx={{ borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                            <CardContent sx={{ p: 3 }}>
                                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                                    <Box sx={{ width: 40, height: 40, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                                        <PaletteIcon sx={{ color: 'primary.main' }} />
                                    </Box>
                                    <Typography variant="h6" fontWeight={700}>Appearance</Typography>
                                </Stack>
                                <Stack spacing={4}>
                                    <Box>
                                        <Typography fontWeight={600} sx={{ mb: 2 }}>Theme</Typography>
                                        <Grid container spacing={2}>
                                            {[
                                                { value: 'light', label: 'Light', icon: LightModeIcon },
                                                { value: 'dark', label: 'Dark', icon: DarkModeIcon },
                                                { value: 'system', label: 'System', icon: ComputerIcon },
                                            ].map((item) => (
                                                <Grid size={{ xs: 4 }} key={item.value}>
                                                    <Paper
                                                        elevation={0}
                                                        onClick={() => handleThemeChange(item.value as 'light' | 'dark' | 'system')}
                                                        sx={{ p: 3, borderRadius: 2, textAlign: 'center', cursor: 'pointer', border: `2px solid ${appearance.theme === item.value ? theme.palette.primary.main : alpha(theme.palette.divider, 0.2)}`, bgcolor: appearance.theme === item.value ? alpha(theme.palette.primary.main, 0.08) : 'transparent', '&:hover': { borderColor: theme.palette.primary.main } }}
                                                    >
                                                        <item.icon sx={{ fontSize: 32, color: appearance.theme === item.value ? 'primary.main' : 'text.secondary', mb: 1 }} />
                                                        <Typography fontWeight={appearance.theme === item.value ? 600 : 400}>{item.label}</Typography>
                                                        {appearance.theme === item.value && <CheckCircleIcon sx={{ color: 'primary.main', fontSize: 18, mt: 1 }} />}
                                                    </Paper>
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Box>
                                    <Divider />
                                    <Box>
                                        <Typography fontWeight={600} sx={{ mb: 2 }}>Language</Typography>
                                        <FormControl fullWidth>
                                            <InputLabel>Language</InputLabel>
                                            <Select value={appearance.language} label="Language" onChange={(e) => handleLanguageChange(e.target.value)}>
                                                <MenuItem value="en">🇬🇧 English</MenuItem>
                                                <MenuItem value="si">🇱🇰 සිංහල (Sinhala)</MenuItem>
                                                <MenuItem value="ta">🇱🇰 தமிழ் (Tamil)</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Box>
                                </Stack>
                            </CardContent>
                        </MotionCard>
                    </TabPanel>

                    {/* Sessions */}
                    <TabPanel value={tabValue} index={4}>
                        <MotionCard variants={itemVariants} elevation={0} sx={{ borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                            <CardContent sx={{ p: 3 }}>
                                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                                    <Stack direction="row" alignItems="center" spacing={1.5}>
                                        <Box sx={{ width: 40, height: 40, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                                            <DevicesIcon sx={{ color: 'primary.main' }} />
                                        </Box>
                                        <Box><Typography variant="h6" fontWeight={700}>Active Sessions</Typography><Typography variant="caption" color="text.secondary">{sessions.length} device(s)</Typography></Box>
                                    </Stack>
                                    <Button variant="outlined" color="error" size="small" disabled={sessions.length <= 1} onClick={() => setSessions(s => s.filter(x => x.current))}>Sign Out All Others</Button>
                                </Stack>
                                <Stack spacing={2}>
                                    {sessions.map((session) => {
                                        const Icon = session.icon;
                                        return (
                                            <Paper key={session.id} elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: session.current ? alpha(theme.palette.success.main, 0.04) : alpha(theme.palette.grey[500], 0.04), border: `1px solid ${session.current ? alpha(theme.palette.success.main, 0.15) : alpha(theme.palette.divider, 0.1)}` }}>
                                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                    <Stack direction="row" spacing={2} alignItems="center">
                                                        <Box sx={{ width: 48, height: 48, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: session.current ? alpha(theme.palette.success.main, 0.1) : alpha(theme.palette.grey[500], 0.1) }}>
                                                            <Icon color={session.current ? 'success' : 'action'} />
                                                        </Box>
                                                        <Box>
                                                            <Stack direction="row" alignItems="center" spacing={1}><Typography fontWeight={600}>{session.device}</Typography>{session.current && <Chip label="Current" size="small" color="success" />}</Stack>
                                                            <Typography variant="body2" color="text.secondary">{session.browser} • {session.location}</Typography>
                                                            <Typography variant="caption" color="text.secondary">{session.lastActive}</Typography>
                                                        </Box>
                                                    </Stack>
                                                    {!session.current && (
                                                        <IconButton color="error" onClick={() => setLogoutSessionDialog(session.id)} sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2) } }}>
                                                            <LogoutIcon />
                                                        </IconButton>
                                                    )}
                                                </Stack>
                                            </Paper>
                                        );
                                    })}
                                </Stack>
                            </CardContent>
                        </MotionCard>
                    </TabPanel>
                </Grid>
            </Grid>

            {/* Change Password Dialog */}
            <Dialog open={changePasswordDialog} onClose={() => !saving && setChangePasswordDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>Change Password</DialogTitle>
                <DialogContent>
                    <Stack spacing={3} sx={{ mt: 2 }}>
                        <TextField label="Current Password" type={showCurrentPassword ? 'text' : 'password'} fullWidth value={passwordForm.currentPassword} onChange={(e) => setPasswordForm(p => ({ ...p, currentPassword: e.target.value }))} InputProps={{ endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowCurrentPassword(!showCurrentPassword)}>{showCurrentPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}</IconButton></InputAdornment> }} />
                        <Box>
                            <TextField label="New Password" type={showNewPassword ? 'text' : 'password'} fullWidth value={passwordForm.newPassword} onChange={(e) => setPasswordForm(p => ({ ...p, newPassword: e.target.value }))} InputProps={{ endAdornment: <InputAdornment position="end"><IconButton onClick={() => setShowNewPassword(!showNewPassword)}>{showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}</IconButton></InputAdornment> }} />
                            {passwordForm.newPassword && (
                                <Box sx={{ mt: 1 }}>
                                    <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}><Typography variant="caption">Strength</Typography><Typography variant="caption" sx={{ color: passwordStrength.color, fontWeight: 600 }}>{passwordStrength.label}</Typography></Stack>
                                    <LinearProgress variant="determinate" value={passwordStrength.score} sx={{ height: 6, borderRadius: 1, '& .MuiLinearProgress-bar': { bgcolor: passwordStrength.color } }} />
                                </Box>
                            )}
                        </Box>
                        <TextField label="Confirm Password" type="password" fullWidth value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm(p => ({ ...p, confirmPassword: e.target.value }))} error={passwordForm.confirmPassword.length > 0 && passwordForm.newPassword !== passwordForm.confirmPassword} helperText={passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword ? 'Passwords do not match' : ''} />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setChangePasswordDialog(false)} disabled={saving}>Cancel</Button>
                    <Button variant="contained" onClick={handleChangePassword} disabled={saving} startIcon={saving ? <CircularProgress size={20} color="inherit" /> : null}>{saving ? 'Changing...' : 'Change Password'}</Button>
                </DialogActions>
            </Dialog>

            {/* Logout Session Dialog */}
            <Dialog open={!!logoutSessionDialog} onClose={() => setLogoutSessionDialog(null)} maxWidth="xs" fullWidth>
                <DialogTitle>Sign Out Device</DialogTitle>
                <DialogContent><Typography>Sign out this device?</Typography></DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => setLogoutSessionDialog(null)}>Cancel</Button>
                    <Button variant="contained" color="error" onClick={() => logoutSessionDialog && handleLogoutSession(logoutSessionDialog)} disabled={saving}>{saving ? 'Signing out...' : 'Sign Out'}</Button>
                </DialogActions>
            </Dialog>

            {/* Delete Account Dialog */}
            <Dialog open={deleteAccountDialog} onClose={() => setDeleteAccountDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ color: 'error.main' }}><Stack direction="row" spacing={1} alignItems="center"><WarningAmberIcon /><span>Delete Account</span></Stack></DialogTitle>
                <DialogContent>
                    <Stack spacing={2} sx={{ mt: 1 }}>
                        <Alert severity="error">This action cannot be undone!</Alert>
                        <TextField label="Type DELETE to confirm" fullWidth value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} error={deleteConfirmText.length > 0 && deleteConfirmText !== 'DELETE'} />
                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 3 }}>
                    <Button onClick={() => { setDeleteAccountDialog(false); setDeleteConfirmText(''); }}>Cancel</Button>
                    <Button variant="contained" color="error" disabled={deleteConfirmText !== 'DELETE'}>Delete Account</Button>
                </DialogActions>
            </Dialog>

            {/* Snackbar */}
            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar(p => ({ ...p, open: false }))} variant="filled" sx={{ borderRadius: 2 }}>{snackbar.message}</Alert>
            </Snackbar>
        </MotionBox>
    );
}

