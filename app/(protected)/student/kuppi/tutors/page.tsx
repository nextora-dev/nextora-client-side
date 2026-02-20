'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Box,
    Typography,
    Button,
    alpha,
    useTheme,
    Grid,
    Card,
    CardContent,
    Stack,
    TextField,
    InputAdornment,
    IconButton,
    Chip,
    Avatar,
    Snackbar,
    Alert,
    Tabs,
    Tab,
    Paper,
    Tooltip,
    Skeleton,
    MenuItem,
    Pagination,
} from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import StarIcon from '@mui/icons-material/Star';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupsIcon from '@mui/icons-material/Groups';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

import { useAppDispatch, useAppSelector } from '@/store';
import {
    fetchKuppiStudents,
    fetchTopRatedKuppiStudents,
    searchKuppiStudentsByNameAsync,
    searchKuppiStudentsBySubjectAsync,
    fetchKuppiStudentsByFaculty,
    selectKuppiStudents,
    selectTopRatedKuppiStudents,
    selectTotalKuppiStudents,
    selectKuppiStudentsLoading,
    selectKuppiError,
    clearKuppiError,
    KuppiStudentResponse,
    Faculty,
} from '@/features/kuppi';

const MotionBox = motion.create(Box);
const MotionCard = motion.create(Card);

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

// Experience level colors
const EXPERIENCE_COLORS = {
    BEGINNER: '#10B981',
    INTERMEDIATE: '#3B82F6',
    ADVANCED: '#8B5CF6',
};

// Faculty options
const FACULTY_OPTIONS: { value: Faculty | 'ALL'; label: string }[] = [
    { value: 'ALL', label: 'All Faculties' },
    { value: 'COMPUTING', label: 'Computing' },
    { value: 'BUSINESS', label: 'Business' },
];

// Search type options
const SEARCH_TYPE_OPTIONS = [
    { value: 'name', label: 'Search by Name' },
    { value: 'subject', label: 'Search by Subject' },
];

// Get initials from name
const getInitials = (name: string): string => {
    return name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
};

export default function KuppiTutorsPage() {
    const router = useRouter();
    const theme = useTheme();
    const dispatch = useAppDispatch();

    // Redux state
    const kuppiStudents = useAppSelector(selectKuppiStudents);
    const topRatedStudents = useAppSelector(selectTopRatedKuppiStudents);
    const totalStudents = useAppSelector(selectTotalKuppiStudents);
    const isLoading = useAppSelector(selectKuppiStudentsLoading);
    const error = useAppSelector(selectKuppiError);

    // Local state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState<'name' | 'subject'>('name');
    const [selectedFaculty, setSelectedFaculty] = useState<Faculty | 'ALL'>('ALL');
    const [activeTab, setActiveTab] = useState(0);
    const [page, setPage] = useState(0);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' as 'success' | 'error' });

    const PAGE_SIZE = 12;

    // Fetch students on mount
    useEffect(() => {
        dispatch(fetchKuppiStudents({ page: 0, size: PAGE_SIZE, sortBy: 'kuppiRating', sortDirection: 'DESC' }));
        dispatch(fetchTopRatedKuppiStudents({ page: 0, size: 5 }));
    }, [dispatch]);

    // Handle tab change
    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
        setPage(0);
        setSearchQuery('');
        setSelectedFaculty('ALL');

        if (newValue === 0) {
            dispatch(fetchKuppiStudents({ page: 0, size: PAGE_SIZE, sortBy: 'kuppiRating', sortDirection: 'DESC' }));
        } else if (newValue === 1) {
            dispatch(fetchTopRatedKuppiStudents({ page: 0, size: PAGE_SIZE }));
        }
    };

    // Handle search
    const handleSearch = useCallback(() => {
        setPage(0);
        if (searchQuery.trim()) {
            if (searchType === 'name') {
                dispatch(searchKuppiStudentsByNameAsync({ name: searchQuery, page: 0, size: PAGE_SIZE }));
            } else {
                dispatch(searchKuppiStudentsBySubjectAsync({ subject: searchQuery, page: 0, size: PAGE_SIZE }));
            }
        } else if (selectedFaculty !== 'ALL') {
            dispatch(fetchKuppiStudentsByFaculty({ faculty: selectedFaculty, params: { page: 0, size: PAGE_SIZE } }));
        } else {
            dispatch(fetchKuppiStudents({ page: 0, size: PAGE_SIZE, sortBy: 'kuppiRating', sortDirection: 'DESC' }));
        }
    }, [dispatch, searchQuery, searchType, selectedFaculty]);

    // Handle faculty filter change
    const handleFacultyChange = (faculty: Faculty | 'ALL') => {
        setSelectedFaculty(faculty);
        setPage(0);
        setSearchQuery('');

        if (faculty === 'ALL') {
            dispatch(fetchKuppiStudents({ page: 0, size: PAGE_SIZE, sortBy: 'kuppiRating', sortDirection: 'DESC' }));
        } else {
            dispatch(fetchKuppiStudentsByFaculty({ faculty, params: { page: 0, size: PAGE_SIZE } }));
        }
    };

    // Handle page change
    const handlePageChange = (_: React.ChangeEvent<unknown>, newPage: number) => {
        const pageIndex = newPage - 1;
        setPage(pageIndex);

        if (searchQuery.trim()) {
            if (searchType === 'name') {
                dispatch(searchKuppiStudentsByNameAsync({ name: searchQuery, page: pageIndex, size: PAGE_SIZE }));
            } else {
                dispatch(searchKuppiStudentsBySubjectAsync({ subject: searchQuery, page: pageIndex, size: PAGE_SIZE }));
            }
        } else if (selectedFaculty !== 'ALL') {
            dispatch(fetchKuppiStudentsByFaculty({ faculty: selectedFaculty, params: { page: pageIndex, size: PAGE_SIZE } }));
        } else if (activeTab === 1) {
            dispatch(fetchTopRatedKuppiStudents({ page: pageIndex, size: PAGE_SIZE }));
        } else {
            dispatch(fetchKuppiStudents({ page: pageIndex, size: PAGE_SIZE, sortBy: 'kuppiRating', sortDirection: 'DESC' }));
        }
    };

    // Handle refresh
    const handleRefresh = () => {
        setSearchQuery('');
        setSelectedFaculty('ALL');
        setPage(0);
        if (activeTab === 0) {
            dispatch(fetchKuppiStudents({ page: 0, size: PAGE_SIZE, sortBy: 'kuppiRating', sortDirection: 'DESC' }));
        } else {
            dispatch(fetchTopRatedKuppiStudents({ page: 0, size: PAGE_SIZE }));
        }
    };

    // Handle clear search
    const handleClearSearch = () => {
        setSearchQuery('');
        setPage(0);
        if (selectedFaculty !== 'ALL') {
            dispatch(fetchKuppiStudentsByFaculty({ faculty: selectedFaculty, params: { page: 0, size: PAGE_SIZE } }));
        } else {
            dispatch(fetchKuppiStudents({ page: 0, size: PAGE_SIZE, sortBy: 'kuppiRating', sortDirection: 'DESC' }));
        }
    };

    // Handle tutor click
    const handleTutorClick = (student: KuppiStudentResponse) => {
        router.push(`/student/kuppi/tutors/${student.id}`);
    };

    // Handle error messages
    useEffect(() => {
        if (error) {
            setSnackbar({ open: true, message: error, severity: 'error' });
            dispatch(clearKuppiError());
        }
    }, [error, dispatch]);

    // Stats for header
    const stats = [
        { label: 'Total Tutors', value: totalStudents, icon: GroupsIcon, color: '#3B82F6' },
        { label: 'Top Rated', value: topRatedStudents.length, icon: StarIcon, color: '#F59E0B' },
    ];

    // Get display students based on active tab
    const displayStudents = activeTab === 1 ? topRatedStudents : kuppiStudents;
    const totalPages = Math.ceil(totalStudents / PAGE_SIZE);

    return (
        <MotionBox variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 1400, mx: 'auto' }}>
            {/* Back Button */}
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => router.push('/student/kuppi')}
                sx={{ mb: 2, textTransform: 'none', color: 'text.secondary' }}
            >
                Back to Sessions
            </Button>

            {/* Page Header */}
            <MotionBox variants={itemVariants} sx={{ mb: 4 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
                    <Box>
                        <Typography variant="h4" fontWeight={700} gutterBottom>Kuppi Tutors</Typography>
                        <Typography variant="body2" color="text.secondary">Find expert peer tutors to help you excel in your studies</Typography>
                    </Box>
                </Stack>
            </MotionBox>

            {/* Stats Grid */}
            <MotionBox variants={itemVariants} sx={{ mb: 4 }}>
                <Grid container spacing={2}>
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <Grid size={{ xs: 6, sm: 3 }} key={index}>
                                <Card elevation={0} sx={{ borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                                    <CardContent sx={{ p: 2 }}>
                                        <Stack direction="row" alignItems="center" spacing={1.5}>
                                            <Box sx={{ width: 40, height: 40, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(stat.color, 0.1) }}>
                                                <Icon sx={{ color: stat.color, fontSize: 20 }} />
                                            </Box>
                                            <Box>
                                                <Typography variant="h6" fontWeight={700}>{stat.value}</Typography>
                                                <Typography variant="caption" color="text.secondary">{stat.label}</Typography>
                                            </Box>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            </MotionBox>

            {/* Filters */}
            <MotionCard variants={itemVariants} elevation={0} sx={{ mb: 4, borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                <CardContent sx={{ p: 2 }}>
                    <Stack spacing={2}>
                        {/* Search Row */}
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }}>
                            <TextField
                                select
                                size="small"
                                value={searchType}
                                onChange={(e) => setSearchType(e.target.value as 'name' | 'subject')}
                                sx={{ minWidth: 150 }}
                            >
                                {SEARCH_TYPE_OPTIONS.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                                ))}
                            </TextField>
                            <TextField
                                placeholder={searchType === 'name' ? 'Search tutors by name...' : 'Search by subject (e.g., Mathematics)...'}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                size="small"
                                sx={{ flex: 1, maxWidth: { sm: 400 }, '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                                slotProps={{
                                    input: {
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <IconButton size="small" onClick={handleSearch} disabled={isLoading}>
                                                    <SearchIcon sx={{ color: 'text.secondary' }} />
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                        endAdornment: searchQuery && (
                                            <InputAdornment position="end">
                                                <IconButton size="small" onClick={handleClearSearch}>
                                                    <CloseIcon fontSize="small" />
                                                </IconButton>
                                            </InputAdornment>
                                        )
                                    }
                                }}
                            />
                        </Stack>

                        {/* Tabs and Faculty Filter */}
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
                            <Tabs value={activeTab} onChange={handleTabChange} sx={{ minHeight: 40, '& .MuiTab-root': { minHeight: 40, textTransform: 'none' } }}>
                                <Tab label="All Tutors" icon={<GroupsIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
                                <Tab label="Top Rated" icon={<TrendingUpIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
                            </Tabs>

                            <Stack direction="row" spacing={2} alignItems="center">
                                <TextField
                                    select
                                    size="small"
                                    value={selectedFaculty}
                                    onChange={(e) => handleFacultyChange(e.target.value as Faculty | 'ALL')}
                                    sx={{ minWidth: 150 }}
                                    slotProps={{
                                        input: {
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <FilterListIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                                </InputAdornment>
                                            )
                                        }
                                    }}
                                >
                                    {FACULTY_OPTIONS.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                                    ))}
                                </TextField>
                                <Tooltip title="Refresh">
                                    <IconButton onClick={handleRefresh} disabled={isLoading}>
                                        <RefreshIcon />
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                        </Stack>
                    </Stack>
                </CardContent>
            </MotionCard>

            {/* Tutors Grid */}
            {isLoading ? (
                <Grid container spacing={3}>
                    {[...Array(6)].map((_, i) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                            <Card elevation={0} sx={{ borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                                <CardContent sx={{ p: 3 }}>
                                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                                        <Skeleton variant="circular" width={56} height={56} />
                                        <Box sx={{ flex: 1 }}>
                                            <Skeleton variant="text" width="60%" />
                                            <Skeleton variant="text" width="40%" />
                                        </Box>
                                    </Stack>
                                    <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 1 }} />
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : displayStudents.length === 0 ? (
                <Paper elevation={0} sx={{ p: 6, textAlign: 'center', borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                    <PersonIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary" gutterBottom>No tutors found</Typography>
                    <Typography variant="body2" color="text.secondary">Try adjusting your search criteria or filters</Typography>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    <AnimatePresence mode="popLayout">
                        {displayStudents.map((student, index) => (
                            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={student.id}>
                                <MotionCard
                                    variants={itemVariants}
                                    initial="hidden"
                                    animate="show"
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ delay: index * 0.05 }}
                                    elevation={0}
                                    sx={{
                                        borderRadius: 2,
                                        border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        height: '100%',
                                        '&:hover': {
                                            borderColor: theme.palette.primary.main,
                                            transform: 'translateY(-4px)',
                                            boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
                                        }
                                    }}
                                    onClick={() => handleTutorClick(student)}
                                >
                                    <CardContent sx={{ p: 3 }}>
                                        <Stack spacing={2}>
                                            {/* Header with Avatar and Name */}
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Avatar
                                                    src={student.profilePictureUrl || undefined}
                                                    sx={{
                                                        width: 56,
                                                        height: 56,
                                                        bgcolor: alpha(theme.palette.primary.main, 0.15),
                                                        color: 'primary.main',
                                                        fontWeight: 700,
                                                        fontSize: '1.25rem',
                                                    }}
                                                >
                                                    {getInitials(student.fullName)}
                                                </Avatar>
                                                <Box sx={{ flex: 1, minWidth: 0 }}>
                                                    <Typography variant="subtitle1" fontWeight={600} noWrap>
                                                        {student.fullName}
                                                    </Typography>
                                                    <Stack direction="row" alignItems="center" spacing={0.5}>
                                                        <SchoolIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                                                        <Typography variant="caption" color="text.secondary" noWrap>
                                                            {student.program}
                                                        </Typography>
                                                    </Stack>
                                                </Box>
                                            </Stack>

                                            {/* Rating and Sessions */}
                                            <Stack direction="row" spacing={2} justifyContent="space-between">
                                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                                    <StarIcon sx={{ fontSize: 18, color: 'warning.main' }} />
                                                    <Typography variant="body2" fontWeight={600}>{(student.kuppiRating ?? 0).toFixed(1)}</Typography>
                                                </Stack>
                                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                                    <EmojiEventsIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                                    <Typography variant="body2" color="text.secondary">{student.kuppiSessionsCompleted ?? 0} sessions</Typography>
                                                </Stack>
                                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                                    <VisibilityIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                                    <Typography variant="body2" color="text.secondary">{student.totalViews ?? 0}</Typography>
                                                </Stack>
                                            </Stack>

                                            {/* Experience Level */}
                                            <Chip
                                                label={student.kuppiExperienceLevel}
                                                size="small"
                                                sx={{
                                                    alignSelf: 'flex-start',
                                                    bgcolor: alpha(EXPERIENCE_COLORS[student.kuppiExperienceLevel] || '#6B7280', 0.1),
                                                    color: EXPERIENCE_COLORS[student.kuppiExperienceLevel] || '#6B7280',
                                                    fontWeight: 500,
                                                    textTransform: 'capitalize',
                                                }}
                                            />

                                            {/* Subjects */}
                                            <Box>
                                                <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>
                                                    Subjects:
                                                </Typography>
                                                <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ gap: 0.5 }}>
                                                    {(student.kuppiSubjects ?? []).slice(0, 3).map((subject, idx) => (
                                                        <Chip
                                                            key={idx}
                                                            label={subject}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{ fontSize: '0.7rem' }}
                                                        />
                                                    ))}
                                                    {(student.kuppiSubjects ?? []).length > 3 && (
                                                        <Chip
                                                            label={`+${(student.kuppiSubjects ?? []).length - 3}`}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{ fontSize: '0.7rem' }}
                                                        />
                                                    )}
                                                </Stack>
                                            </Box>

                                            {/* Faculty Badge */}
                                            <Chip
                                                label={student.faculty}
                                                size="small"
                                                sx={{
                                                    alignSelf: 'flex-start',
                                                    bgcolor: alpha(theme.palette.grey[500], 0.1),
                                                    fontSize: '0.7rem',
                                                }}
                                            />
                                        </Stack>
                                    </CardContent>
                                </MotionCard>
                            </Grid>
                        ))}
                    </AnimatePresence>
                </Grid>
            )}

            {/* Pagination */}
            {!isLoading && totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination
                        count={totalPages}
                        page={page + 1}
                        onChange={handlePageChange}
                        color="primary"
                        size="large"
                        showFirstButton
                        showLastButton
                    />
                </Box>
            )}

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            >
                <Alert
                    severity={snackbar.severity}
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    variant="filled"
                    sx={{ borderRadius: 2 }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </MotionBox>
    );
}

