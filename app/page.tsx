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
    Divider,
    Link,
    Paper,
    Grid,
} from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import GroupIcon from '@mui/icons-material/Group';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

export default function LandingPage() {
    const router = useRouter();

    const onLogin = () => router.push('/login');

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
                background: 'linear-gradient(135deg, #EBF5FF 0%, #FFFFFF 50%, #F5F3FF 100%)',
            }}
        >
            <Container maxWidth="lg">
                {/* Header */}
                <Box component="header" sx={{ py: 3 }}>
                    <Stack direction="row" alignItems="center" justifyContent="space-between">
                        <Stack direction="row" alignItems="center" spacing={1.5}>
                            <Box
                                sx={{
                                    width: 48,
                                    height: 48,
                                    background: 'linear-gradient(135deg, #2563EB 0%, #7C3AED 100%)',
                                    borderRadius: 3,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <SchoolIcon sx={{ color: 'white', fontSize: 28 }} />
                            </Box>
                            <Typography
                                variant="h5"
                                sx={{
                                    fontWeight: 700,
                                    background: 'linear-gradient(90deg, #2563EB 0%, #7C3AED 100%)',
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent',
                                }}
                            >
                                Nextora
                            </Typography>
                        </Stack>
                    </Stack>
                </Box>

                {/* Hero Section */}
                <Box sx={{ py: { xs: 8, lg: 14 } }}>
                    <Grid container spacing={6} alignItems="center">
                        {/* Left Content */}
                        <Grid size={{ xs: 12, lg: 6 }}>
                            <Box sx={{ textAlign: { xs: 'center', lg: 'left' } }}>
                                <Typography
                                    variant="h2"
                                    sx={{
                                        fontWeight: 700,
                                        mb: 3,
                                        fontSize: { xs: '2.5rem', lg: '3.5rem' },
                                        lineHeight: 1.2,
                                    }}
                                >
                                    Welcome to
                                    <Box
                                        component="span"
                                        sx={{
                                            display: 'block',
                                            background: 'linear-gradient(90deg, #2563EB 0%, #7C3AED 100%)',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                        }}
                                    >
                                        Nextora LMS
                                    </Box>
                                </Typography>
                                <Typography
                                    variant="h6"
                                    color="text.secondary"
                                    sx={{ mb: 4, fontWeight: 400, lineHeight: 1.7 }}
                                >
                                    Your comprehensive learning management system for modern education.
                                    Access courses, collaborate with peers, and excel in your academic journey.
                                </Typography>

                                {/* CTA Buttons */}
                                <Stack
                                    direction={{ xs: 'column', sm: 'row' }}
                                    spacing={2}
                                    justifyContent={{ xs: 'center', lg: 'flex-start' }}
                                >
                                    <Button
                                        variant="contained"
                                        size="large"
                                        onClick={onLogin}
                                        sx={{
                                            px: 4,
                                            py: 1.5,
                                            background: 'linear-gradient(90deg, #2563EB 0%, #7C3AED 100%)',
                                            borderRadius: 3,
                                            fontWeight: 600,
                                            fontSize: '1rem',
                                            '&:hover': {
                                                background: 'linear-gradient(90deg, #1D4ED8 0%, #6D28D9 100%)',
                                                transform: 'scale(1.02)',
                                            },
                                            transition: 'all 0.2s',
                                        }}
                                    >
                                        Login
                                    </Button>
                                </Stack>

                                {/* Stats */}
                                <Box sx={{ mt: 6, pt: 4, borderTop: 1, borderColor: 'divider' }}>
                                    <Grid container spacing={3}>
                                        <Grid size={{ xs: 4 }}>
                                            <Typography variant="h4" color="primary" fontWeight={700}>
                                                10K+
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Students
                                            </Typography>
                                        </Grid>
                                        <Grid size={{ xs: 4 }}>
                                            <Typography
                                                variant="h4"
                                                fontWeight={700}
                                                sx={{ color: '#7C3AED' }}
                                            >
                                                500+
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                Courses
                                            </Typography>
                                        </Grid>
                                        <Grid size={{ xs: 4 }}>
                                            <Typography variant="h4" color="primary" fontWeight={700}>
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

                        {/* Right Image */}
                        <Grid size={{ xs: 12, lg: 6 }} sx={{ display: { xs: 'none', lg: 'block' } }}>
                            <Box sx={{ position: 'relative' }}>
                                <Box
                                    sx={{
                                        position: 'absolute',
                                        inset: 0,
                                        background: 'linear-gradient(90deg, #60A5FA 0%, #A78BFA 100%)',
                                        borderRadius: 6,
                                        transform: 'rotate(3deg)',
                                        opacity: 0.2,
                                    }}
                                />
                                <Box
                                    component="img"
                                    src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800"
                                    alt="Students collaborating"
                                    sx={{
                                        position: 'relative',
                                        borderRadius: 6,
                                        boxShadow: 6,
                                        width: '100%',
                                        height: 'auto',
                                        objectFit: 'cover',
                                    }}
                                />

                                {/* Floating Card */}
                                <Paper
                                    elevation={6}
                                    sx={{
                                        position: 'absolute',
                                        bottom: -24,
                                        left: -24,
                                        p: 2,
                                        borderRadius: 4,
                                        maxWidth: 200,
                                    }}
                                >
                                    <Stack direction="row" alignItems="center" spacing={1.5}>
                                        <Box
                                            sx={{
                                                width: 40,
                                                height: 40,
                                                bgcolor: 'success.light',
                                                borderRadius: 2,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <EmojiEventsIcon sx={{ color: 'success.main' }} />
                                        </Box>
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight={600}>
                                                4.8/5.0
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Student Rating
                                            </Typography>
                                        </Box>
                                    </Stack>
                                </Paper>
                            </Box>
                        </Grid>
                    </Grid>
                </Box>

                {/* Features Section */}
                <Box sx={{ pb: 10 }}>
                    <Typography
                        variant="h4"
                        align="center"
                        fontWeight={700}
                        sx={{ mb: 6 }}
                    >
                        Why Choose Nextora?
                    </Typography>
                    <Grid container spacing={3}>
                        {features.map((feature) => {
                            const Icon = feature.icon;
                            return (
                                <Grid size={{ xs: 12, md: 6, lg: 3 }} key={feature.title}>
                                    <Card
                                        sx={{
                                            height: '100%',
                                            borderRadius: 4,
                                            transition: 'all 0.2s',
                                            '&:hover': {
                                                boxShadow: 6,
                                                borderColor: 'primary.light',
                                            },
                                        }}
                                        variant="outlined"
                                    >
                                        <CardContent sx={{ p: 3 }}>
                                            <Box
                                                sx={{
                                                    width: 48,
                                                    height: 48,
                                                    background: 'linear-gradient(135deg, #DBEAFE 0%, #EDE9FE 100%)',
                                                    borderRadius: 3,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    mb: 2,
                                                }}
                                            >
                                                <Icon sx={{ color: 'primary.main' }} />
                                            </Box>
                                            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>
                                                {feature.title}
                                            </Typography>
                                            <Typography variant="body2" color="text.secondary">
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
                <Divider />
                <Box
                    component="footer"
                    sx={{
                        py: 4,
                        display: 'flex',
                        flexDirection: { xs: 'column', md: 'row' },
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 2,
                    }}
                >
                    <Typography variant="body2" color="text.secondary">
                        © 2026 Nextora LMS. All rights reserved.
                    </Typography>
                    <Stack direction="row" spacing={3}>
                        <Link href="#" underline="hover" color="text.secondary" variant="body2">
                            Privacy Policy
                        </Link>
                        <Link href="#" underline="hover" color="text.secondary" variant="body2">
                            Terms of Service
                        </Link>
                        <Link href="#" underline="hover" color="text.secondary" variant="body2">
                            Contact Support
                        </Link>
                    </Stack>
                </Box>
            </Container>
        </Box>
    );
}
