'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    InputAdornment,
    Snackbar,
    Alert,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useClub } from '@/hooks/useClub';
import { ClubList } from '@/components/club/ClubList';
import ClubCommon from '@/components/club/ClubCommon';
import type { ClubResponse } from '@/features/club/types';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import GroupsIcon from '@mui/icons-material/Groups';

/**
 * Academic Staff Clubs Page (Read-Only)
 * - Browse & search clubs
 * - No write operations
 */
export default function AcademicClubsPage() {
    const {
        clubs,
        totalClubs,
        isClubLoading,
        error,
        loadClubs,
        searchClubs,
        clearError,
    } = useClub();

    const [searchQuery, setSearchQuery] = useState('');
    const [mainTab, setMainTab] = useState(0);


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
    };

    const overviewStats = [
        { label: 'Total Clubs', value: totalClubs, icon: Diversity3Icon, color: '#3B82F6' },
        { label: 'Open Registration', value: clubs.filter(c => c.registrationOpen).length, icon: GroupsIcon, color: '#10B981' },
    ];

    return (
        <ClubCommon
            title="Clubs"
            description="Browse university clubs (read-only)"
            overviewStats={overviewStats}
            mainTab={mainTab}
            onMainTabChange={(_, v) => setMainTab(v)}
            tabLabels={[`All Clubs (${totalClubs})`]}
            isLoading={isClubLoading}
            onRefresh={() => loadClubs({ page: 0, size: 20 })}
            showTabs={false}
        >
            <Box>
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

                <ClubList
                    clubs={clubs}
                    isLoading={isClubLoading}
                    onView={handleViewClub}
                />
            </Box>

            <Snackbar open={!!error} autoHideDuration={5000} onClose={clearError} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity="error" onClose={clearError} variant="filled" sx={{ borderRadius: 1 }}>{error}</Alert>
            </Snackbar>
        </ClubCommon>
    );
}
