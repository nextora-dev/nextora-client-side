'use client';

import React, { useState, useMemo } from 'react';
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
    Badge,
    Tooltip,
    Divider,
    Menu,
    MenuItem,
} from '@mui/material';
import { motion } from 'framer-motion';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import KeyboardCommandKeyIcon from '@mui/icons-material/KeyboardCommandKey';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { AuthProvider } from '@/providers/AuthProvider';
import { useAuthStore } from '@/store';
import { getNavigationByRole, getBrandingByRole } from '@/features/dashboard';
import { ROLES } from '@/constants/roles';

const drawerWidth = 280;

const MotionBox = motion.create(Box);

export default function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode;
}) {
    const theme = useTheme();
    const router = useRouter();
    const pathname = usePathname();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const profileMenuOpen = Boolean(anchorEl);

    // Get user from auth store
    const { user, logout: storeLogout } = useAuthStore();
    const userRole = user?.role || ROLES.STUDENT;

    // Get role-based navigation and branding
    const navigationItems = useMemo(() => getNavigationByRole(userRole), [userRole]);
    const branding = useMemo(() => getBrandingByRole(userRole), [userRole]);

    const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
    const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => setAnchorEl(event.currentTarget);
    const handleProfileMenuClose = () => setAnchorEl(null);

    const handleNavigation = (path: string) => {
        router.push(path);
        if (isMobile) setMobileOpen(false);
    };

    const handleLogout = async () => {
        handleProfileMenuClose();
        await storeLogout();
        router.push('/login');
    };

    const userData = {
        name: user ? `${user.firstName} ${user.lastName}` : 'User',
        email: user?.email || '',
        initials: user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}` : 'U',
        role: userRole === ROLES.SUPER_ADMIN ? 'Super Admin'
            : userRole === ROLES.ADMIN ? 'Administrator'
            : userRole === ROLES.ACADEMIC_STAFF ? 'Academic Staff'
            : userRole === ROLES.NON_ACADEMIC_STAFF ? 'Non-Academic Staff'
            : 'Student',
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
        <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            {/* Logo Section */}
            <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box
                    sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden',
                    }}
                >
                    <Image
                        src="/assets/logos/nextora.png"
                        alt="Nextora Logo"
                        width={44}
                        height={44}
                        style={{ objectFit: 'contain' }}
                    />
                </Box>
                <Box>
                    <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
                        {branding.title}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem', fontWeight: 500 }}>
                        {branding.subtitle}
                    </Typography>
                </Box>
            </Box>

            <Divider sx={{ mx: 2, mb: 1 }} />

            {/* Navigation List */}
            <Box sx={{ flex: 1, overflow: 'auto', px: 2, py: 1 }}>
                <List disablePadding>
                    {navigationItems.map((item) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);
                        return (
                            <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                                <MotionBox
                                    initial={false}
                                    animate={{ scale: active ? 1 : 1 }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    sx={{ width: '100%' }}
                                >
                                    <ListItemButton
                                        onClick={() => handleNavigation(item.path)}
                                        sx={{
                                            borderRadius: 2.5,
                                            py: 1.25,
                                            px: 2,
                                            position: 'relative',
                                            overflow: 'hidden',
                                            bgcolor: active ? 'primary.main' : 'transparent',
                                            color: active ? 'white' : 'text.primary',
                                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                            '&:hover': {
                                                bgcolor: active ? 'primary.dark' : 'action.hover',
                                            },
                                            '&::before': active ? {
                                                content: '""',
                                                position: 'absolute',
                                                left: 0,
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                width: 4,
                                                height: '60%',
                                                borderRadius: '0 4px 4px 0',
                                                bgcolor: 'white',
                                            } : {},
                                        }}
                                    >
                                        <ListItemIcon sx={{ color: active ? 'white' : 'text.secondary', minWidth: 40 }}>
                                            <Icon sx={{ fontSize: 22 }} />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={item.label}
                                            slotProps={{
                                                primary: {
                                                    fontWeight: active ? 600 : 500,
                                                    fontSize: '0.875rem',
                                                },
                                            }}
                                        />
                                        {(item.badge ?? 0) > 0 && (
                                            <Box
                                                sx={{
                                                    minWidth: 20,
                                                    height: 20,
                                                    borderRadius: 10,
                                                    bgcolor: active ? 'rgba(255,255,255,0.2)' : 'primary.main',
                                                    color: 'white',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 700,
                                                    px: 0.75,
                                                }}
                                            >
                                                {(item.badge ?? 0) > 99 ? '99+' : item.badge}
                                            </Box>
                                        )}
                                    </ListItemButton>
                                </MotionBox>
                            </ListItem>
                        );
                    })}
                </List>
            </Box>

            {/* User Profile Section */}
            <Box sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Box
                    onClick={handleProfileMenuOpen}
                    sx={{
                        p: 1.5,
                        borderRadius: 2.5,
                        bgcolor: 'action.hover',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        '&:hover': { bgcolor: 'action.selected' },
                    }}
                >
                    <Avatar
                        sx={{
                            width: 40,
                            height: 40,
                            bgcolor: 'primary.main',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                        }}
                    >
                        {userData.initials}
                    </Avatar>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Typography
                            variant="subtitle2"
                            sx={{
                                fontWeight: 600,
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {userData.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            {userData.role}
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    );

    return (
        <AuthProvider>
            <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
                {/* AppBar */}
                <AppBar
                    position="fixed"
                    elevation={0}
                    sx={{
                        width: { md: `calc(100% - ${drawerWidth}px)` },
                        ml: { md: `${drawerWidth}px` },
                        bgcolor: 'rgba(255, 255, 255, 0.8)',
                        backdropFilter: 'blur(20px)',
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Toolbar sx={{ justifyContent: 'space-between', minHeight: { xs: 64, md: 72 } }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <IconButton
                                aria-label="open drawer"
                                edge="start"
                                onClick={handleDrawerToggle}
                                sx={{ display: { md: 'none' }, color: 'text.primary' }}
                            >
                                <MenuIcon />
                            </IconButton>

                            {/* Search Bar */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    bgcolor: 'action.hover',
                                    borderRadius: 3,
                                    px: 2,
                                    py: 1,
                                    width: { xs: 180, sm: 280, md: 360 },
                                    transition: 'all 0.2s ease',
                                    '&:focus-within': {
                                        bgcolor: 'background.paper',
                                        boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)',
                                    },
                                }}
                            >
                                <SearchIcon sx={{ color: 'text.secondary', fontSize: 20, mr: 1 }} />
                                <Box
                                    component="input"
                                    type="text"
                                    placeholder="Search anything..."
                                    sx={{
                                        border: 'none',
                                        outline: 'none',
                                        background: 'transparent',
                                        flex: 1,
                                        fontSize: '0.875rem',
                                        color: 'text.primary',
                                        '&::placeholder': {
                                            color: 'text.secondary',
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

                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Tooltip title="Help">
                                <IconButton sx={{ color: 'text.secondary' }}>
                                    <HelpOutlineIcon sx={{ fontSize: 22 }} />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Notifications">
                                <IconButton>
                                    <Badge badgeContent={3} color="error" sx={{ '& .MuiBadge-badge': { fontSize: '0.65rem' } }}>
                                        <NotificationsIcon sx={{ color: 'text.secondary', fontSize: 22 }} />
                                    </Badge>
                                </IconButton>
                            </Tooltip>
                            <Avatar
                                sx={{
                                    width: 38,
                                    height: 38,
                                    bgcolor: 'primary.main',
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    cursor: 'pointer',
                                    ml: 1,
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        transform: 'scale(1.05)',
                                        boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
                                    },
                                }}
                                onClick={handleProfileMenuOpen}
                            >
                                {userData.initials}
                            </Avatar>
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
                                borderRadius: 2,
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
                <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
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
                                width: drawerWidth,
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
                                width: drawerWidth,
                                borderRight: '1px solid',
                                borderColor: 'divider',
                                bgcolor: 'background.paper',
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
                        p: { xs: 2, sm: 3 },
                        width: { md: `calc(100% - ${drawerWidth}px)` },
                        mt: { xs: '64px', md: '72px' },
                        minHeight: { xs: 'calc(100vh - 64px)', md: 'calc(100vh - 72px)' },
                    }}
                >
                    {children}
                </Box>
            </Box>
        </AuthProvider>
    );
}
