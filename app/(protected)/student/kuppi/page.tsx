'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Typography, Button, alpha, useTheme, Grid } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import PeopleIcon from '@mui/icons-material/People';

// Types
import { KuppiSession, KuppiViewType } from '@/types/kuppi';

// Constants
import { SAMPLE_SESSIONS } from '@/lib/constants/kuppi.constants';

// Hooks
import { useSavedSessions, useSessionFilters, useSessionBooking } from '@/hooks/useKuppi';

// Components
import {
    SessionCard,
    StatsGrid,
    HeroBanner,
    SessionFilters,
    EmptyState,
    SessionDetailModal,
    MessageHostModal,
} from '@/components/features/kuppi';
import HostApplicationForm from './HostApplicationForm';

const MotionBox = motion.create(Box);

export default function KuppiPage() {
    const router = useRouter();
    const theme = useTheme();
    const [currentView, setCurrentView] = useState<KuppiViewType>('list');
    const [sessions] = useState<KuppiSession[]>(SAMPLE_SESSIONS);
    const [selectedSession, setSelectedSession] = useState<KuppiSession | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

    // Custom hooks for state management
    const { savedIds, toggleSave, isSaved, savedCount } = useSavedSessions();
    const { isBooking, bookSession, isBooked } = useSessionBooking();
    const {
        searchQuery,
        setSearchQuery,
        activeTab,
        setActiveTab,
        subjectFilter,
        setSubjectFilter,
        difficultyFilter,
        setDifficultyFilter,
        modeFilter,
        setModeFilter,
        filteredSessions
    } = useSessionFilters(sessions, savedIds);

    // Open modal with session details
    const handleSessionClick = (session: KuppiSession) => {
        setSelectedSession(session);
        setIsModalOpen(true);
    };

    // Close modal
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedSession(null);
    };

    // Open message modal
    const handleMessageHost = () => {
        setIsModalOpen(false);
        setIsMessageModalOpen(true);
    };

    // Close message modal
    const handleCloseMessageModal = () => {
        setIsMessageModalOpen(false);
        setSelectedSession(null);
    };

    // Book session handler
    const handleBookSession = async (sessionId: string) => {
        const result = await bookSession(sessionId);
        if (result.success) {
            // Could show a toast notification here
            handleCloseModal();
        }
    };

    // View handlers
    const handleBecomeHost = () => setCurrentView('host');
    const handleBackToList = () => setCurrentView('list');
    const handleViewHosts = () => router.push('/student/kuppi/hosts');

    // Render Host Application View
    if (currentView === 'host') {
        return <HostApplicationForm onBack={handleBackToList} />;
    }

    // Render List View (default)
    return (
        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
            {/* Page Header */}
            <MotionBox
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    mb: 4,
                    flexWrap: 'wrap',
                    gap: 2
                }}
            >
                <Box>
                    <Typography
                        variant="h4"
                        sx={{
                            fontWeight: 700,
                            mb: 0.5,
                            letterSpacing: '-0.02em',
                            color: 'text.primary',
                        }}
                    >
                        Kuppi Sessions
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                        Join peer-led study sessions and excel in your studies
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        variant="outlined"
                        startIcon={<PeopleIcon />}
                        onClick={handleViewHosts}
                        sx={{
                            borderRadius: 1,
                            textTransform: 'none',
                            fontWeight: 600,
                            borderColor: 'divider',
                            '&:hover': {
                                borderColor: 'primary.main',
                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                            },
                        }}
                    >
                        View Hosts
                    </Button>
                </Box>
            </MotionBox>

            {/* Hero Banner */}
            <HeroBanner onApply={handleBecomeHost} />

            {/* Stats Grid */}
            <StatsGrid sessions={sessions} />

            {/* Filters & Search */}
            <SessionFilters
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                activeTab={activeTab}
                onTabChange={setActiveTab}
                savedCount={savedCount}
                subjectFilter={subjectFilter}
                onSubjectChange={setSubjectFilter}
                difficultyFilter={difficultyFilter}
                onDifficultyChange={setDifficultyFilter}
                modeFilter={modeFilter}
                onModeChange={setModeFilter}
            />

            {/* Section Title */}
            <MotionBox
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 700,
                        mb: 3,
                        color: 'text.primary',
                    }}
                >
                    {activeTab === 'saved' ? 'Saved Sessions' : activeTab === 'upcoming' ? 'Upcoming Sessions' : 'All Sessions'}
                </Typography>
            </MotionBox>

            {/* Sessions Grid */}
            <Grid container spacing={3}>
                <AnimatePresence mode="popLayout">
                    {filteredSessions.map((session, index) => (
                        <Grid size={{ xs: 12, md: 6 }} key={session.id}>
                            <SessionCard
                                session={session}
                                isSaved={isSaved(session.id)}
                                onToggleSave={toggleSave}
                                onClick={handleSessionClick}
                                animationDelay={index * 0.05}
                            />
                        </Grid>
                    ))}
                </AnimatePresence>
            </Grid>

            {/* Empty State */}
            {filteredSessions.length === 0 && (
                <EmptyState
                    title={activeTab === 'saved' ? 'No saved sessions' : 'No sessions found'}
                    description={
                        activeTab === 'saved'
                            ? 'Save sessions to access them quickly later.'
                            : 'Try adjusting your search or filters to find what you\'re looking for.'
                    }
                />
            )}

            {/* Session Detail Modal */}
            <SessionDetailModal
                session={selectedSession}
                open={isModalOpen}
                onClose={handleCloseModal}
                isSaved={selectedSession ? isSaved(selectedSession.id) : false}
                onToggleSave={toggleSave}
                isBooked={selectedSession ? isBooked(selectedSession.id) : false}
                onBook={handleBookSession}
                isBooking={isBooking}
                onMessageHost={handleMessageHost}
            />

            {/* Message Host Modal */}
            <MessageHostModal
                host={selectedSession?.host || null}
                session={selectedSession}
                open={isMessageModalOpen}
                onClose={handleCloseMessageModal}
            />
        </Box>
    );
}
