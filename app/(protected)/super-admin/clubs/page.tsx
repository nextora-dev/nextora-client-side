'use client';

import React, { useState, useEffect } from 'react';
import {
    Box,
    TextField,
    InputAdornment,
    Button,
    Snackbar,
    Alert,
    Stack,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useRouter } from 'next/navigation';
import { useClub } from '@/hooks/useClub';
import { ClubList } from '@/components/club/ClubList';
import { CreateClubDialog } from '@/components/club/CreateClubDialog';
import ClubCommon from '@/components/club/ClubCommon';
import type { ClubResponse } from '@/features/club/types';
import GroupsIcon from '@mui/icons-material/Groups';
import Diversity3Icon from '@mui/icons-material/Diversity3';
import { FACULTY_LABELS } from '@/constants/faculty';

/**
 * Super Admin Club Management — Club List
 * Click any club to navigate to /super-admin/clubs/[id] for full administration
 */
export default function SuperAdminClubsPage() {
    const router = useRouter();
    const {
        clubs,
        totalClubs,
        isClubLoading,
        isCreating,
        error,
        successMessage,
        loadClubs,
        searchClubs,
        loadClubsByFaculty,
        loadClubByCode,
        createClub,
        clearError,
        clearSuccess,
    } = useClub();

    const [searchQuery, setSearchQuery] = useState('');
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [mainTab, setMainTab] = useState(0);
    const [facultyFilter, setFacultyFilter] = useState('');


    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchQuery.trim()) {
                if (/^[A-Z]{2,}-\d+$/i.test(searchQuery.trim())) {
                    loadClubByCode(searchQuery.trim());
                } else {
                    searchClubs({ keyword: searchQuery, page: 0, size: 20 });
                }
            } else if (facultyFilter) {
                loadClubsByFaculty(facultyFilter, { page: 0, size: 20 });
            } else {
                loadClubs({ page: 0, size: 20 });
            }
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery, facultyFilter, searchClubs, loadClubs, loadClubsByFaculty, loadClubByCode]);

    const handleFacultyChange = (faculty: string) => {
        setFacultyFilter(faculty);
        setSearchQuery('');
    };

    const handleViewClub = (club: ClubResponse) => {
        router.push(`/super-admin/clubs/${club.id}`);
    };

    const overviewStats = [
        { label: 'Total Clubs', value: totalClubs, icon: Diversity3Icon, color: '#3B82F6' },
        { label: 'Open Registration', value: clubs.filter(c => c.registrationOpen).length, icon: GroupsIcon, color: '#10B981' },
    ];

    return (
        <ClubCommon
            title="Super Admin — Club Management"
            description="Full control over all university clubs — click a club for administration"
            overviewStats={overviewStats}
            mainTab={mainTab}
            onMainTabChange={(_, v) => setMainTab(v)}
            tabLabels={[`All Clubs (${totalClubs})`]}
            isLoading={isClubLoading}
            onRefresh={() => { setFacultyFilter(''); setSearchQuery(''); loadClubs({ page: 0, size: 20 }); }}
            headerActions={
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setCreateDialogOpen(true)}
                    size="small"
                    sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 700, boxShadow: 'none' }}
                >
                    Create Club
                </Button>
            }
        >
            <Box>
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3 }}>
                    <TextField
                        placeholder="Search by name or club code..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        size="small"
                        sx={{ flex: 1 }}
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <InputAdornment position="start"><SearchIcon /></InputAdornment>
                                ),
                            },
                        }}
                    />
                    <FormControl size="small" sx={{ minWidth: 180 }}>
                        <InputLabel>Faculty</InputLabel>
                        <Select value={facultyFilter} label="Faculty" onChange={(e) => handleFacultyChange(e.target.value)} sx={{ borderRadius: 1 }}>
                            <MenuItem value="">All Faculties</MenuItem>
                            {Object.entries(FACULTY_LABELS).map(([key, label]) => (
                                <MenuItem key={key} value={key}>{label}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Stack>
                <ClubList
                    clubs={clubs}
                    isLoading={isClubLoading}
                    onView={handleViewClub}
                />
            </Box>

            <CreateClubDialog
                open={createDialogOpen}
                onClose={() => setCreateDialogOpen(false)}
                onSubmit={(data, logo) => {
                    createClub(data, logo).then(() => {
                        setCreateDialogOpen(false);
                        loadClubs({ page: 0, size: 20 });
                    });
                }}
                isCreating={isCreating}
            />

            <Snackbar open={!!error} autoHideDuration={5000} onClose={clearError} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity="error" onClose={clearError} variant="filled" sx={{ borderRadius: 1 }}>{error}</Alert>
            </Snackbar>
            <Snackbar open={!!successMessage} autoHideDuration={4000} onClose={clearSuccess} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity="success" onClose={clearSuccess} variant="filled" sx={{ borderRadius: 1 }}>{successMessage}</Alert>
            </Snackbar>
        </ClubCommon>
    );
}
