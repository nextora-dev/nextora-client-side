'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    TextField,
    InputAdornment,
    Button,
    Snackbar,
    Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import { motion } from 'framer-motion';
import { useClub } from '@/hooks/useClub';
import { ClubList } from '@/components/club/ClubList';
import type { ClubResponse } from '@/features/club/types';

const MotionBox = motion.create(Box);

/**
 * Academic Staff Clubs Page (Read-Only)
 * - Browse & search clubs
 * - No write operations
 */
export default function AcademicClubsPage() {
    const {
        clubs,
        isClubLoading,
        error,
        loadClubs,
        searchClubs,
        clearError,
    } = useClub();

    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadClubs({ page: 0, size: 20 });
    }, [loadClubs]);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.trim()) {
                searchClubs({ keyword: searchQuery, page: 0, size: 20 });
            } else {
                loadClubs({ page: 0, size: 20 });
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery, searchClubs, loadClubs]);

    const handleViewClub = (_club: ClubResponse) => {
        // Read-only: academic staff can only view details
        // Could expand with a detail dialog in the future
    };

    return (
        <Box sx={{ maxWidth: 1200, mx: 'auto', p: { xs: 2, sm: 3 } }}>
            <MotionBox initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Box>
                        <Typography variant="h4" fontWeight={700}>Clubs</Typography>
                        <Typography variant="body2" color="text.secondary">
                            Browse university clubs (read-only)
                        </Typography>
                    </Box>
                    <Button
                        variant="outlined"
                        startIcon={<RefreshIcon />}
                        onClick={() => loadClubs({ page: 0, size: 20 })}
                        sx={{ textTransform: 'none' }}
                    >
                        Refresh
                    </Button>
                </Box>

                <TextField
                    placeholder="Search clubs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    fullWidth
                    size="small"
                    sx={{ mb: 3 }}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start"><SearchIcon /></InputAdornment>
                            ),
                        },
                    }}
                />
            </MotionBox>

            <ClubList
                clubs={clubs}
                isLoading={isClubLoading}
                onView={handleViewClub}
            />

            <Snackbar open={!!error} autoHideDuration={5000} onClose={clearError}>
                <Alert severity="error" onClose={clearError}>{error}</Alert>
            </Snackbar>
        </Box>
    );
}




