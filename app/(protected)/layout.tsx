'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import {
    Box,
    Drawer,
    AppBar,
    Toolbar,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    IconButton,
    Typography,
    useTheme,
    useMediaQuery,
    Avatar,
    Tooltip,
    Divider,
    Menu,
    MenuItem,
    Popover,
    Backdrop,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import KeyboardCommandKeyIcon from '@mui/icons-material/KeyboardCommandKey';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CloseIcon from '@mui/icons-material/Close';
import { AuthProvider } from '@/providers/AuthProvider';
import { PushNotificationProvider } from '@/contexts/PushNotificationContext';
import { NotificationBell, NotificationList } from '@/components/notifications';
import { useAppDispatch, useAppSelector } from '@/store';
import { selectUser, logoutAsync } from '@/features/auth/authSlice';
import { getNavigationByRole, getBrandingByRole } from '@/features/dashboard';
import { ROLES } from '@/constants/roles';
import { useProfile } from '@/hooks/useProfile';

const DRAWER_WIDTH = 256;
const DRAWER_COLLAPSED_WIDTH = 64;

export default function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    const theme = useTheme();
    const router = useRouter();
    const pathname = usePathname();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
    const [mobileOpen, setMobileOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [notificationAnchorEl, setNotificationAnchorEl] = useState<null | HTMLElement>(null);
    const profileMenuOpen = Boolean(anchorEl);
    const notificationPopoverOpen = Boolean(notificationAnchorEl);

    // Get user from Redux store
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectUser);
    const userRole = user?.role || ROLES.STUDENT;

    // Get full profile data (includes profile picture)
    const { profile } = useProfile();

    // Get role-based navigation and branding
    const navigationItems = useMemo(() => getNavigationByRole(userRole), [userRole]);
    const branding = useMemo(() => getBrandingByRole(userRole), [userRole]);

    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
    const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
    const handleProfileMenuClose = () => setAnchorEl(null);
    const handleNotificationOpen = (event: React.MouseEvent<HTMLElement>) => setNotificationAnchorEl(event.currentTarget);
    const handleNotificationClose = () => setNotificationAnchorEl(null);

    const handleNavigation = (path: string) => {
        router.push(path);
        if (isMobile) setMobileOpen(false);
    };

    const handleLogout = async () => {
        handleProfileMenuClose();
        await dispatch(logoutAsync());
        router.push('/login');
    };

    // Use profile data if available, fallback to auth user data
    const getUserDisplayName = () => {
        // Prefer profile data over auth user data
        const firstName = profile?.firstName?.trim() || user?.firstName?.trim() || '';
        const lastName = profile?.lastName?.trim() || user?.lastName?.trim() || '';
        if (firstName && lastName) return `${firstName} ${lastName}`;
        if (firstName) return firstName;
        if (lastName) return lastName;
        const email = profile?.email || user?.email;
        if (email) return email.split('@')[0];
        return 'User';
    };

    const getUserInitials = () => {
        const firstName = profile?.firstName?.trim() || user?.firstName?.trim() || '';
        const lastName = profile?.lastName?.trim() || user?.lastName?.trim() || '';
        if (firstName && lastName) return `${firstName[0]}${lastName[0]}`.toUpperCase();
        if (firstName) return firstName[0].toUpperCase();
        if (lastName) return lastName[0].toUpperCase();
        const email = profile?.email || user?.email;
        if (email) return email[0].toUpperCase();
        return 'U';
    };

    const getUserRoleLabel = () => {
        switch (userRole) {
            case ROLES.SUPER_ADMIN: return 'Super Admin';
            case ROLES.ADMIN: return 'Administrator';
            case ROLES.ACADEMIC_STAFF: return 'Academic Staff';
            case ROLES.NON_ACADEMIC_STAFF: return 'Non-Academic Staff';
            default: return 'Student';
        }
    };

    const userData = {
        name: getUserDisplayName(),
        email: profile?.email || user?.email || '',
        initials: getUserInitials(),
        role: getUserRoleLabel(),
        profilePictureUrl: profile?.profilePictureUrl || null,
    };

    // Get role-based profile path
    const getProfilePath = (subPath?: string) => {
        const basePath = userRole === ROLES.SUPER_ADMIN ? '/super-admin'
            : userRole === ROLES.ADMIN ? '/admin'
            : userRole === ROLES.ACADEMIC_STAFF ? '/academic'
            : userRole === ROLES.NON_ACADEMIC_STAFF ? '/non-academic'
            : '/student';
        return subPath ? `${basePath}/profile/${subPath}` : `${basePath}/profile`;
    };

    const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

    const drawer = (
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative', bgcolor: 'background.paper' }}>
            {/* Logo Section - 64px height to match header */}
            <Box
                sx={{
                    height: 64,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: isCollapsed ? 'center' : 'space-between',
                    px: isCollapsed ? 1 : 2,
                    borderBottom: '1px solid',
                    borderColor: 'divider',
                }}
            >
                {!isCollapsed ? (
                    <>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Box
                                sx={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: 1,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    overflow: 'hidden',
                                    flexShrink: 0,
                                }}
                            >
                                <Image
                                    src="/assets/logos/nextora.png"
                                    alt="Nextora Logo"
                                    width={32}
                                    height={32}
                                    style={{ objectFit: 'contain' }}
                                />
                            </Box>
                            <Typography sx={{ fontWeight: 600, color: 'text.primary', whiteSpace: 'nowrap' }}>
                                {branding.title}
                            </Typography>
                        </Box>
                        {/* Desktop collapse button */}
                        {isDesktop && (
                            <IconButton
                                onClick={() => setIsCollapsed(true)}
                                size="small"
                            >
                                <ChevronLeftIcon fontSize="small" />
                            </IconButton>
                        )}
                        {/* Mobile close button */}
                        {!isDesktop && (
                            <IconButton
                                onClick={() => setMobileOpen(false)}
                                size="small"
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        )}
                    </>
                ) : (
                    <Box
                        sx={{
                            width: 32,
                            height: 32,
                            borderRadius: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            overflow: 'hidden',
                        }}
                    >
                        <Image
                            src="/assets/logos/nextora.png"
                            alt="Nextora Logo"
                            width={32}
                            height={32}
                            style={{ objectFit: 'contain' }}
                        />
                    </Box>
                )}
            </Box>

            {/* Navigation List */}
            <Box sx={{ flex: 1, overflow: 'auto', px: 1, py: 1.5 }}>
                <List disablePadding>
                    {navigationItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);

                        const navButton = (
                            <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                                <ListItemButton
                                    onClick={() => handleNavigation(item.path)}
                                    sx={{
                                        borderRadius: 1,
                                        py: 1,
                                        px: isCollapsed ? 1.5 : 2,
                                        minHeight: 44,
                                        justifyContent: isCollapsed ? 'center' : 'initial',
                                        position: 'relative',
                                        overflow: 'hidden',
                                        bgcolor: active ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                                        color: active ? 'primary.main' : 'text.primary',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            bgcolor: active ? 'rgba(59, 130, 246, 0.15)' : 'action.hover',
                                        },
                                        '&::before': active ? {
                                            content: '""',
                                            position: 'absolute',
                                            left: 0,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            width: 3,
                                            height: 20,
                                            borderRadius: '0 2px 2px 0',
                                            bgcolor: 'primary.main',
                                        } : {},
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            color: active ? 'primary.main' : 'text.secondary',
                                            minWidth: isCollapsed ? 0 : 40,
                                            mr: isCollapsed ? 0 : 1,
                                            justifyContent: 'center',
                                        }}
                                    >
                                        <Icon sx={{ fontSize: 20 }} />
                                    </ListItemIcon>
                                    {!isCollapsed && (
                                        <>
                                            <ListItemText
                                                primary={item.label}
                                                slotProps={{
                                                    primary: {
                                                        fontWeight: active ? 500 : 400,
                                                        fontSize: '0.875rem',
                                                        color: active ? 'primary.main' : 'text.primary',
                                                    },
                                                }}
                                            />
                                            {(item.badge ?? 0) > 0 && (
                                                <Box
                                                    sx={{
                                                        minWidth: 20,
                                                        height: 20,
                                                        borderRadius: 10,
                                                        bgcolor: 'primary.main',
                                                        color: 'white',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '0.7rem',
                                                        fontWeight: 600,
                                                        px: 0.75,
                                                    }}
                                                >
                                                    {(item.badge ?? 0) > 99 ? '99+' : item.badge}
                                                </Box>
                                            )}
                                            </>
                                        )}
                                    </ListItemButton>
                            </ListItem>
                        );

                        return isCollapsed ? (
                            <Tooltip key={item.id} title={item.label} placement="right" arrow>
                                {navButton}
                            </Tooltip>
                        ) : (
                            <React.Fragment key={item.id}>{navButton}</React.Fragment>
                        );
                    })}
                </List>
            </Box>

            {/* Expand Button (when collapsed) */}
            {isCollapsed && isDesktop && (
                <Box sx={{ position: 'absolute', bottom: 80, left: 0, right: 0, px: 1 }}>
                    <IconButton
                        onClick={() => setIsCollapsed(false)}
                        sx={{ width: '100%' }}
                    >
                        <ChevronRightIcon fontSize="small" />
                    </IconButton>
                </Box>
            )}

            {/* Footer with Version */}
            {!isCollapsed && (
                <Box
                    sx={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        p: 2,
                        borderTop: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Typography variant="caption" color="text.disabled">
                        v1.0.0
                    </Typography>
                    <Typography variant="caption" color="text.disabled" display="block" sx={{ mt: 0.5 }}>
                        {branding.subtitle}
                    </Typography>
                </Box>
            )}
        </Box>
    );

    return (
        <AuthProvider>
            <PushNotificationProvider>
            <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
                {/* AppBar */}
                <AppBar
                    position="fixed"
                    elevation={0}
                    sx={{
                        width: { md: `calc(100% - ${isCollapsed ? DRAWER_COLLAPSED_WIDTH : DRAWER_WIDTH}px)` },
                        ml: { md: `${isCollapsed ? DRAWER_COLLAPSED_WIDTH : DRAWER_WIDTH}px` },
                        transition: 'width 0.3s ease-in-out, margin-left 0.3s ease-in-out',
                        bgcolor: 'background.paper',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Toolbar sx={{ justifyContent: 'space-between', minHeight: 64 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <IconButton
                                aria-label="open drawer"
                                edge="start"
                                onClick={handleDrawerToggle}
                                sx={{ display: { md: 'none' } }}
                            >
                                <MenuIcon />
                            </IconButton>

                            {/* Search Bar */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    bgcolor: 'background.default',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 1,
                                    px: 2,
                                    py: 1,
                                    width: { xs: 180, sm: 280, md: 400 },
                                    maxWidth: 400,
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        borderColor: 'action.hover',
                                    },
                                    '&:focus-within': {
                                        borderColor: 'primary.main',
                                        boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)',
                                    },
                                }}
                            >
                                <SearchIcon sx={{ color: 'text.disabled', fontSize: 20, mr: 1 }} />
                                <Box
                                    component="input"
                                    type="text"
                                    placeholder="Search..."
                                    sx={{
                                        border: 'none',
                                        outline: 'none',
                                        background: 'transparent',
                                        flex: 1,
                                        fontSize: '0.875rem',
                                        color: 'text.primary',
                                        '&::placeholder': {
                                            color: 'text.disabled',
                                            opacity: 1,
                                        },
                                    }}
                                />
                                <Box
                                    sx={{
                                        display: { xs: 'none', sm: 'flex' },
                                        alignItems: 'center',
                                        gap: 0.5,
                                        bgcolor: 'action.selected',
                                        borderRadius: 1,
                                        px: 0.75,
                                        py: 0.25,
                                    }}
                                >
                                    <KeyboardCommandKeyIcon sx={{ fontSize: 12, color: 'text.secondary' }} />
                                    <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                        K
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, lg: 2 } }}>
                            <Tooltip title="Help">
                                <IconButton>
                                    <HelpOutlineIcon sx={{ fontSize: 22 }} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Notifications">
                                <Box component="span">
                                    <NotificationBell onClick={handleNotificationOpen} />
                                </Box>
                            </Tooltip>
                            <Popover
                                open={notificationPopoverOpen}
                                anchorEl={notificationAnchorEl}
                                onClose={handleNotificationClose}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'right',
                                }}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                sx={{ mt: 1 }}
                            >
                                <Box sx={{ width: 360, maxWidth: '100vw' }}>
                                    <NotificationList maxItems={10} />
                                </Box>
                            </Popover>

                            {/* User Section with Divider */}
                            <Divider orientation="vertical" flexItem sx={{ mx: { xs: 0.5, lg: 1 } }} />

                            <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, lg: 1.5 } }}>
                                <Box sx={{ textAlign: 'right', display: { xs: 'none', xl: 'block' } }}>
                                    <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.primary' }}>
                                        {userData.name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {userData.role}
                                    </Typography>
                                </Box>
                                <Avatar
                                    src={userData.profilePictureUrl || undefined}
                                    sx={{
                                        width: { xs: 32, lg: 36 },
                                        height: { xs: 32, lg: 36 },
                                        bgcolor: 'primary.main',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            bgcolor: 'primary.dark',
                                        },
                                    }}
                                    onClick={handleProfileMenuOpen}
                                >
                                    {!userData.profilePictureUrl && userData.initials}
                                </Avatar>
                            </Box>
                        </Box>
                    </Toolbar>
                </AppBar>

                {/* Profile Menu */}
                <Menu
                    anchorEl={anchorEl}
                    open={profileMenuOpen}
                    onClose={handleProfileMenuClose}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                    slotProps={{
                        paper: {
                            sx: {
                                mt: 1,
                                minWidth: 220,
                                borderRadius: 1,
                                boxShadow: '0 10px 40px rgba(0,0,0,0.12)',
                            },
                        },
                    }}
                >
                    {/* User Info Header */}
                    <Box sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}>
                        <Typography variant="subtitle2" fontWeight={600}>
                            {userData.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {userData.email}
                        </Typography>
                    </Box>

                    <MenuItem onClick={() => { handleProfileMenuClose(); handleNavigation(getProfilePath()); }}>
                        <AccountCircleIcon sx={{ fontSize: 18, mr: 1.5, color: 'text.secondary' }} />
                        My Profile
                    </MenuItem>
                    <MenuItem onClick={() => { handleProfileMenuClose(); handleNavigation(getProfilePath('settings')); }}>
                        <SettingsIcon sx={{ fontSize: 18, mr: 1.5, color: 'text.secondary' }} />
                        Settings
                    </MenuItem>
                    <Divider sx={{ my: 1 }} />
                    <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                        <LogoutIcon sx={{ fontSize: 18, mr: 1.5 }} />
                        Log out
                    </MenuItem>
                </Menu>

                {/* Drawer */}
                <Box component="nav" sx={{ width: { md: isCollapsed ? DRAWER_COLLAPSED_WIDTH : DRAWER_WIDTH }, flexShrink: { md: 0 }, transition: 'width 0.3s ease-in-out' }}>
                    {/* Mobile Backdrop */}
                    <Backdrop
                        open={mobileOpen && !isDesktop}
                        onClick={() => setMobileOpen(false)}
                        sx={{ zIndex: (theme) => theme.zIndex.drawer - 1, display: { md: 'none' } }}
                    />

                    {/* Mobile Drawer */}
                    <Drawer
                        variant="temporary"
                        open={mobileOpen}
                        onClose={handleDrawerToggle}
                        ModalProps={{ keepMounted: true }}
                        sx={{
                            display: { xs: 'block', md: 'none' },
                            '& .MuiDrawer-paper': {
                                boxSizing: 'border-box',
                                width: DRAWER_WIDTH,
                                borderRight: 'none',
                                boxShadow: '4px 0 24px rgba(0,0,0,0.08)',
                            },
                        }}
                    >
                        {drawer}
                    </Drawer>

                    {/* Desktop Drawer */}
                    <Drawer
                        variant="permanent"
                        sx={{
                            display: { xs: 'none', md: 'block' },
                            '& .MuiDrawer-paper': {
                                boxSizing: 'border-box',
                                width: isCollapsed ? DRAWER_COLLAPSED_WIDTH : DRAWER_WIDTH,
                                borderRight: '1px solid',
                                borderColor: 'divider',
                                bgcolor: 'background.paper',
                                transition: 'width 0.3s ease-in-out',
                                overflowX: 'hidden',
                            },
                        }}
                        open
                    >
                        {drawer}
                    </Drawer>
                </Box>

                {/* Main Content */}
                <Box
                    component="main"
                    sx={{
                        flexGrow: 1,
                        p: { xs: 2, sm: 3, lg: 4 },
                        width: { md: `calc(100% - ${isCollapsed ? DRAWER_COLLAPSED_WIDTH : DRAWER_WIDTH}px)` },
                        mt: '64px',
                        minHeight: 'calc(100vh - 64px)',
                        transition: 'width 0.3s ease-in-out',
                    }}
                >
                    {children}
                </Box>
            </Box>
            </PushNotificationProvider>
        </AuthProvider>
    );
}
