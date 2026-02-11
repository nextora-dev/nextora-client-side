'use client';

import React, { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    Box, Typography, Card, CardContent, Button, Avatar, Stack, Grid,
    Chip, Divider, alpha, useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import StarIcon from '@mui/icons-material/Star';
import SchoolIcon from '@mui/icons-material/School';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import MessageIcon from '@mui/icons-material/Message';

import { SAMPLE_HOSTS, SAMPLE_SESSIONS } from '@/lib/constants/kuppi.constants';
import { getTutorInitials, MessageHostModal } from '@/components/features/kuppi';

const MotionCard = motion.create(Card);

export default function HostDetailPage() {
    const params = useParams();
    const router = useRouter();
    const theme = useTheme();
    const hostId = params.id as string;
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

    const host = useMemo(() => SAMPLE_HOSTS.find(h => h.id === hostId), [hostId]);
    const hostSessions = useMemo(() => SAMPLE_SESSIONS.filter(s => s.host.id === hostId), [hostId]);

    if (!host) {
        return (
            <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h5" color="text.secondary" sx={{ mb: 2 }}>Host not found</Typography>
                <Button startIcon={<ArrowBackIcon />} onClick={() => router.push('/student/kuppi/hosts')} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none' }}>Back to Hosts</Button>
            </Box>
        );
    }

    return (
        <Box sx={{ maxWidth: 1000, mx: 'auto' }}>
            <Button startIcon={<ArrowBackIcon />} onClick={() => router.push('/student/kuppi/hosts')} sx={{ mb: 3, color: 'text.secondary', textTransform: 'none' }}>Back to Hosts</Button>

            <MotionCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider', mb: 3 }}>
                <CardContent sx={{ p: 4 }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={3} alignItems="center">
                        <Avatar sx={{ width: 100, height: 100, bgcolor: alpha(theme.palette.primary.main, 0.15), color: 'primary.main', fontWeight: 700, fontSize: '2rem' }}>{getTutorInitials(host.name)}</Avatar>
                        <Box sx={{ flex: 1, textAlign: { xs: 'center', sm: 'left' } }}>
                            <Typography variant="h4" fontWeight={700} sx={{ mb: 0.5 }}>{host.name}</Typography>
                            <Stack direction="row" alignItems="center" spacing={0.5} justifyContent={{ xs: 'center', sm: 'flex-start' }}>
                                <SchoolIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                <Typography variant="body1" color="text.secondary">{host.department}</Typography>
                            </Stack>
                            <Button
                                variant="contained"
                                startIcon={<MessageIcon />}
                                onClick={() => setIsMessageModalOpen(true)}
                                sx={{
                                    mt: 2,
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                }}
                            >
                                Message Host
                            </Button>
                        </Box>
                    </Stack>

                    <Divider sx={{ my: 3 }} />

                    <Grid container spacing={3}>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Stack direction="row" alignItems="center" justifyContent="center" spacing={0.5}>
                                    <StarIcon sx={{ color: 'warning.main' }} />
                                    <Typography variant="h5" fontWeight={700}>{host.rating}</Typography>
                                </Stack>
                                <Typography variant="body2" color="text.secondary">Rating</Typography>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h5" fontWeight={700}>{host.sessionsHosted}</Typography>
                                <Typography variant="body2" color="text.secondary">Sessions</Typography>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h5" fontWeight={700}>{host.gpa}</Typography>
                                <Typography variant="body2" color="text.secondary">GPA</Typography>
                            </Box>
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                            <Box sx={{ textAlign: 'center' }}>
                                <Typography variant="h5" fontWeight={700}>{host.expertise.length}</Typography>
                                <Typography variant="body2" color="text.secondary">Expertise</Typography>
                            </Box>
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 3 }} />

                    <Box>
                        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>Expertise</Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {host.expertise.map((exp) => (
                                <Chip key={exp} label={exp} icon={<EmojiEventsIcon sx={{ fontSize: 16 }} />} sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontWeight: 500, '& .MuiChip-icon': { color: 'primary.main' } }} />
                            ))}
                        </Stack>
                    </Box>
                </CardContent>
            </MotionCard>

            <Box>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Sessions by {host.name}</Typography>
                {hostSessions.length > 0 ? (
                    <Grid container spacing={2}>
                        {hostSessions.map((session, index) => (
                            <Grid size={{ xs: 12, sm: 6 }} key={session.id}>
                                <MotionCard initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }} whileHover={{ y: -2 }} onClick={() => router.push(`/student/kuppi/${session.id}`)} sx={{ borderRadius: 2, cursor: 'pointer', border: '1px solid', borderColor: 'divider', '&:hover': { borderColor: 'primary.main' } }}>
                                    <CardContent sx={{ p: 2 }}>
                                        <Stack direction="row" spacing={1} sx={{ mb: 1 }}>
                                            <Chip label={session.subject} size="small" sx={{ fontSize: '0.7rem' }} />
                                            <Chip label={session.difficulty} size="small" variant="outlined" sx={{ fontSize: '0.7rem', textTransform: 'capitalize' }} />
                                        </Stack>
                                        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 0.5 }}>{session.title}</Typography>
                                        <Typography variant="caption" color="text.secondary">{session.date} • {session.time}</Typography>
                                    </CardContent>
                                </MotionCard>
                            </Grid>
                        ))}
                    </Grid>
                ) : (
                    <Card sx={{ borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                        <CardContent sx={{ textAlign: 'center', py: 4 }}>
                            <AutoStoriesIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                            <Typography variant="body2" color="text.secondary">No sessions available</Typography>
                        </CardContent>
                    </Card>
                )}
            </Box>

            {/* Message Host Modal */}
            <MessageHostModal
                host={host}
                open={isMessageModalOpen}
                onClose={() => setIsMessageModalOpen(false)}
            />
        </Box>
    );
}

