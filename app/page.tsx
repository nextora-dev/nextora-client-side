'use client';

import { useRouter } from 'next/navigation';
import {
    Box,
    Container,
    Typography,
    Button,
    Card,
    CardContent,
    Stack,
    Grid,
} from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import GroupIcon from '@mui/icons-material/Group';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import Image from "next/image";

export default function LandingPage() {
    const router = useRouter();

    const onUserLogin = () => router.push('/login');
    const onAdminLogin = () => router.push('/admin/login');

    const features = [
        { icon: SchoolIcon, title: 'Academic Excellence', description: 'Access courses, assignments, and grades' },
        { icon: MenuBookIcon, title: 'Learning Resources', description: 'Comprehensive digital library and materials' },
        { icon: GroupIcon, title: 'Collaboration', description: 'Connect with peers and educators' },
        { icon: EmojiEventsIcon, title: 'Track Progress', description: 'Monitor your academic journey' }
    ];

    return (
        <Box
            sx={{
                minHeight: '100vh',
                position: 'relative',
                overflow: 'hidden',
                bgcolor: '#F8FAFF',
            }}
        >
            {/* Wavy Background Pattern */}
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 0,
                    opacity: 0.6,
                    background: `
                        radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99, 149, 255, 0.15) 0%, transparent 50%),
                        radial-gradient(ellipse 60% 30% at 80% 50%, rgba(99, 149, 255, 0.1) 0%, transparent 50%),
                        radial-gradient(ellipse 60% 30% at 20% 80%, rgba(147, 112, 219, 0.08) 0%, transparent 50%)
                    `,
                }}
            />

            {/* Curved Lines SVG Background */}
            <Box
                component="svg"
                viewBox="0 0 1440 800"
                preserveAspectRatio="xMidYMid slice"
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 0,
                    opacity: 0.4,
                }}
            >
                <defs>
                    <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#6395FF" stopOpacity="0.3" />
                        <stop offset="50%" stopColor="#8B9FFF" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#B8C5FF" stopOpacity="0.1" />
                    </linearGradient>
                </defs>
                {/* Wave lines */}
                <path
                    d="M0,150 Q360,50 720,150 T1440,150"
                    fill="none"
                    stroke="url(#wave-gradient)"
                    strokeWidth="2"
                />
                <path
                    d="M0,200 Q360,100 720,200 T1440,200"
                    fill="none"
                    stroke="url(#wave-gradient)"
                    strokeWidth="1.5"
                />
                <path
                    d="M0,250 Q360,150 720,250 T1440,250"
                    fill="none"
                    stroke="url(#wave-gradient)"
                    strokeWidth="1"
                />
                <path
                    d="M0,500 Q360,400 720,500 T1440,500"
                    fill="none"
                    stroke="url(#wave-gradient)"
                    strokeWidth="2"
                />
                <path
                    d="M0,550 Q360,450 720,550 T1440,550"
                    fill="none"
                    stroke="url(#wave-gradient)"
                    strokeWidth="1.5"
                />
                <path
                    d="M0,600 Q360,500 720,600 T1440,600"
                    fill="none"
                    stroke="url(#wave-gradient)"
                    strokeWidth="1"
                />
            </Box>

            <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1 }}>
                {/* Header */}
                <Box component="header" sx={{ py: 3 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Box
                                sx={{
                                    width: 44,
                                    height: 44,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                }}
                            >
                                <Image
                                    src="/assets/logos/nextora.png"
                                    alt="Nextora Logo"
                                    width={44}
                                    height={44}
                                    style={{ objectFit: 'contain', borderRadius: 8 }}
                                />
                            </Box>
                            <Typography
                                variant="h5"
                                sx={{
                                    fontWeight: 700,
                                    color: '#1E3A5F',
                                    letterSpacing: '-0.02em',
                                }}
                            >
                                Next<span style={{ color: '#4A90D9' }}>Ora</span>
                            </Typography>
                        </Stack>
                    </Stack>
                </Box>

                {/* Hero Section */}
                <Box sx={{ py: { xs: 8, lg: 10 } }}>
                    <Grid container spacing={6} alignItems="center">
                        {/* Left Content */}
                        <Grid size={{ xs: 12, lg: 6 }}>
                            <Box sx={{ textAlign: { xs: 'center', lg: 'left' } }}>
                                <Typography
                                    variant="h2"
                                    sx={{
                                        fontWeight: 800,
                                        mb: 3,
                                        fontSize: { xs: '2.5rem', lg: '3.5rem' },
                                        lineHeight: 1.2,
                                        color: '#1E3A5F',
                                    }}
                                >
                                    One App.
                                    <Box
                                        component="span"
                                        sx={{
                                            display: 'block',
                                            color: '#4A90D9',
                                        }}
                                    >
                                        Your Entire Campus.
                                    </Box>
                                </Typography>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        mb: 4,
                                        fontWeight: 400,
                                        lineHeight: 1.7,
                                        color: '#5A6A7A',
                                        fontSize: '1.1rem',
                                    }}
                                >
                                    NextOra is a Unified Campus platform for Sri Lanka Students.
                                    Access timetables, kuppi sessions, LMS navigation, events,
                                    elections—everything in one place.
                                </Typography>

                                {/* Stats */}
                                <Box sx={{ pt: 4, borderTop: '1px solid rgba(74, 144, 217, 0.2)' }}>
                                    <Grid container spacing={3}>
                                        <Grid size={{ xs: 4 }}>
                                            <Typography variant="h4" sx={{ color: '#4A90D9', fontWeight: 700 }}>
                                                10K+
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Students
                                            </Typography>
                                        </Grid>
                                        <Grid size={{ xs: 4 }}>
                                            <Typography variant="h4" sx={{ color: '#4A90D9', fontWeight: 700 }}>
                                                500+
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Courses
                                            </Typography>
                                        </Grid>
                                        <Grid size={{ xs: 4 }}>
                                            <Typography variant="h4" sx={{ color: '#4A90D9', fontWeight: 700 }}>
                                                200+
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Educators
                                            </Typography>
                                        </Grid>
                                    </Grid>
                                </Box>
                            </Box>
                        </Grid>

                        {/* Right - Login Cards */}
                        <Grid size={{ xs: 12, lg: 6 }}>
                            <Stack spacing={3}>
                                {/* User Login Card */}
                                <Card
                                    sx={{
                                        borderRadius: 4,
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        border: '1px solid rgba(74, 144, 217, 0.1)',
                                        bgcolor: 'rgba(255, 255, 255, 0.8)',
                                        backdropFilter: 'blur(10px)',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: '0 12px 40px rgba(74, 144, 217, 0.15)',
                                            borderColor: '#4A90D9',
                                        },
                                    }}
                                    onClick={onUserLogin}
                                >
                                    <CardContent sx={{ p: 3 }}>
                                        <Stack direction="row" spacing={3} alignItems="center">
                                            <Box
                                                sx={{
                                                    width: 64,
                                                    height: 64,
                                                    borderRadius: 3,
                                                    bgcolor: '#4A90D9',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <PersonIcon sx={{ color: 'white', fontSize: 32 }} />
                                            </Box>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="h6" fontWeight={600} sx={{ color: '#1E3A5F' }}>
                                                    Student / Staff Portal
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: '#5A6A7A', mb: 1 }}>
                                                    Access your courses, events, and campus services
                                                </Typography>
                                            </Box>
                                            <Button
                                                variant="contained"
                                                sx={{
                                                    bgcolor: '#4A90D9',
                                                    borderRadius: 2,
                                                    px: 3,
                                                    fontWeight: 600,
                                                    '&:hover': { bgcolor: '#3A7BC8' },
                                                }}
                                            >
                                                Login
                                            </Button>
                                        </Stack>
                                    </CardContent>
                                </Card>

                                {/* Admin Login Card */}
                                <Card
                                    sx={{
                                        borderRadius: 4,
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        border: '1px solid rgba(74, 144, 217, 0.1)',
                                        bgcolor: 'rgba(255, 255, 255, 0.8)',
                                        backdropFilter: 'blur(10px)',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: '0 12px 40px rgba(74, 144, 217, 0.15)',
                                            borderColor: '#1E3A5F',
                                        },
                                    }}
                                    onClick={onAdminLogin}
                                >
                                    <CardContent sx={{ p: 3 }}>
                                        <Stack direction="row" spacing={3} alignItems="center">
                                            <Box
                                                sx={{
                                                    width: 64,
                                                    height: 64,
                                                    borderRadius: 3,
                                                    bgcolor: '#1E3A5F',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <AdminPanelSettingsIcon sx={{ color: 'white', fontSize: 32 }} />
                                            </Box>
                                            <Box sx={{ flex: 1 }}>
                                                <Typography variant="h6" fontWeight={600} sx={{ color: '#1E3A5F' }}>
                                                    Administrator Portal
                                                </Typography>
                                                <Typography variant="body2" sx={{ color: '#5A6A7A', mb: 1 }}>
                                                    Manage users, content, and system settings
                                                </Typography>
                                            </Box>
                                            <Button
                                                variant="contained"
                                                sx={{
                                                    bgcolor: '#1E3A5F',
                                                    borderRadius: 2,
                                                    px: 3,
                                                    fontWeight: 600,
                                                    '&:hover': { bgcolor: '#152C4A' },
                                                }}
                                            >
                                                Login
                                            </Button>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Stack>
                        </Grid>
                    </Grid>
                </Box>

                {/* Features Section */}
                <Box sx={{ py: 8 }}>
                    <Typography
                        variant="h4"
                        fontWeight={700}
                        textAlign="center"
                        sx={{ mb: 2, color: '#1E3A5F' }}
                    >
                        Everything You Need, <span style={{ color: '#4A90D9' }}>One Place.</span>
                    </Typography>
                    <Typography
                        variant="body1"
                        textAlign="center"
                        sx={{ mb: 6, color: '#5A6A7A', maxWidth: 600, mx: 'auto' }}
                    >
                        Experience seamless campus life management with all essential tools at your fingertips.
                    </Typography>
                    <Grid container spacing={3}>
                        {features.map((feature, index) => {
                            const Icon = feature.icon;
                            return (
                                <Grid size={{ xs: 12, sm: 6, md: 3 }} key={index}>
                                    <Card
                                        sx={{
                                            height: '100%',
                                            borderRadius: 4,
                                            textAlign: 'center',
                                            p: 2,
                                            border: '1px solid rgba(74, 144, 217, 0.1)',
                                            bgcolor: 'rgba(255, 255, 255, 0.8)',
                                            backdropFilter: 'blur(10px)',
                                            transition: 'all 0.3s ease',
                                            '&:hover': {
                                                transform: 'translateY(-4px)',
                                                boxShadow: '0 8px 30px rgba(74, 144, 217, 0.12)',
                                            },
                                        }}
                                    >
                                        <CardContent>
                                            <Box
                                                sx={{
                                                    width: 56,
                                                    height: 56,
                                                    borderRadius: 3,
                                                    bgcolor: 'rgba(74, 144, 217, 0.1)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    mx: 'auto',
                                                    mb: 2,
                                                }}
                                            >
                                                <Icon sx={{ color: '#4A90D9', fontSize: 28 }} />
                                            </Box>
                                            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: '#1E3A5F' }}>
                                                {feature.title}
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#5A6A7A' }}>
                                                {feature.description}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            );
                        })}
                    </Grid>
                </Box>

                {/* Footer */}
                <Box component="footer" sx={{ py: 4, borderTop: '1px solid rgba(74, 144, 217, 0.1)', textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ color: '#5A6A7A' }}>
                        © 2026 NextOra. All rights reserved. | <a href="https://nextora.lk" style={{ color: '#4A90D9', textDecoration: 'none' }}>nextora.lk</a>
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
}
