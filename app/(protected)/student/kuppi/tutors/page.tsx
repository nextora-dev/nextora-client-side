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
    Paper,
    Tooltip,
    Skeleton,
    MenuItem,
    Pagination,
    Divider,
} from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import SchoolIcon from '@mui/icons-material/School';
import PersonIcon from '@mui/icons-material/Person';
import CloseIcon from '@mui/icons-material/Close';
import FilterListIcon from '@mui/icons-material/FilterList';
import GroupsIcon from '@mui/icons-material/Groups';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import { useAppDispatch, useAppSelector } from '@/store';
import {
    fetchKuppiStudents,
    searchKuppiStudentsByNameAsync,
    searchKuppiStudentsBySubjectAsync,
    fetchKuppiStudentsByFaculty,
    selectKuppiStudents,
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
    show: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const EXPERIENCE_COLORS: Record<string, string> = {
    BEGINNER: '#10B981',
    INTERMEDIATE: '#3B82F6',
    ADVANCED: '#8B5CF6',
};

const FACULTY_OPTIONS: { value: Faculty | 'ALL'; label: string }[] = [
    { value: 'ALL', label: 'All Faculties' },
    { value: 'COMPUTING', label: 'Computing' },
    { value: 'BUSINESS', label: 'Business' },
];

const SEARCH_TYPE_OPTIONS = [
    { value: 'name', label: 'Search by Name' },
    { value: 'subject', label: 'Search by Subject' },
];

const getInitials = (name: string): string =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

export default function KuppiTutorsPage() {
    const router = useRouter();
    const theme = useTheme();
    const dispatch = useAppDispatch();

    const kuppiStudents = useAppSelector(selectKuppiStudents);
    const totalStudents = useAppSelector(selectTotalKuppiStudents);
    const isLoading = useAppSelector(selectKuppiStudentsLoading);
    const error = useAppSelector(selectKuppiError);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState<'name' | 'subject'>('name');
    const [selectedFaculty, setSelectedFaculty] = useState<Faculty | 'ALL'>('ALL');
    const [page, setPage] = useState(0);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' as 'success' | 'error' });

    const PAGE_SIZE = 12;

    useEffect(() => {
        dispatch(fetchKuppiStudents({ page: 0, size: PAGE_SIZE, sortBy: 'kuppiRating', sortDirection: 'DESC' }));
    }, [dispatch]);


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
        } else {
            dispatch(fetchKuppiStudents({ page: pageIndex, size: PAGE_SIZE, sortBy: 'kuppiRating', sortDirection: 'DESC' }));
        }
    };

    const handleRefresh = () => {
        setSearchQuery('');
        setSelectedFaculty('ALL');
        setPage(0);
        dispatch(fetchKuppiStudents({ page: 0, size: PAGE_SIZE, sortBy: 'kuppiRating', sortDirection: 'DESC' }));
    };

    const handleClearSearch = () => {
        setSearchQuery('');
        setPage(0);
        if (selectedFaculty !== 'ALL') {
            dispatch(fetchKuppiStudentsByFaculty({ faculty: selectedFaculty, params: { page: 0, size: PAGE_SIZE } }));
        } else {
            dispatch(fetchKuppiStudents({ page: 0, size: PAGE_SIZE, sortBy: 'kuppiRating', sortDirection: 'DESC' }));
        }
    };

    const handleTutorClick = (student: KuppiStudentResponse) =>
        router.push(`/student/kuppi/tutors/${student.id}`);

    useEffect(() => {
        if (error) { setSnackbar({ open: true, message: error, severity: 'error' }); dispatch(clearKuppiError()); }
    }, [error, dispatch]);

    const stats = [
        { label: 'Total Tutors', value: totalStudents, icon: GroupsIcon, color: '#3B82F6' },
    ];

    const displayStudents = kuppiStudents;
    const totalPages = Math.ceil(totalStudents / PAGE_SIZE);

    return (
        <MotionBox variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 1400, mx: 'auto' }}>
            {/* ── Back ── */}
            <Button
                startIcon={<ArrowBackIcon />}
                onClick={() => router.push('/student/kuppi')}
                sx={{ mb: 2, textTransform: 'none', color: 'text.secondary', fontWeight: 600, '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.05) } }}
            >
                Back to Sessions
            </Button>

            {/* ══════════════  HEADER  ══════════════ */}
            <MotionBox variants={itemVariants} sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={700} gutterBottom sx={{ letterSpacing: '-0.02em' }}>Kuppi Tutors</Typography>
                <Typography variant="body2" color="text.secondary">Find expert peer tutors to help you excel in your studies</Typography>
            </MotionBox>

            {/* ══════════════  STATS  ══════════════ */}
            <MotionBox variants={itemVariants} sx={{ mb: 4 }}>
                <Grid container spacing={2}>
                    {stats.map((stat, idx) => {
                        const Icon = stat.icon;
                        return (
                            <Grid size={{ xs: 6, sm: 3 }} key={idx}>
                                <Card elevation={0} sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider', transition: 'all 0.2s', '&:hover': { borderColor: stat.color, boxShadow: `0 4px 16px ${alpha(stat.color, 0.15)}` } }}>
                                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                        <Stack direction="row" alignItems="center" spacing={1.5}>
                                            <Box sx={{ width: 44, height: 44, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(stat.color, 0.1), border: '1px solid', borderColor: alpha(stat.color, 0.15) }}>
                                                <Icon sx={{ color: stat.color, fontSize: 22 }} />
                                            </Box>
                                            <Box>
                                                <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.1 }}>{stat.value}</Typography>
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

            {/* ══════════════  FILTERS  ══════════════ */}
            <MotionCard variants={itemVariants} elevation={0} sx={{ mb: 4, borderRadius: 1, border: '1px solid', borderColor: 'divider', backdropFilter: 'blur(12px)', bgcolor: alpha(theme.palette.background.paper, 0.8) }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Stack spacing={2}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
                            <TextField
                                select size="small" value={searchType}
                                onChange={(e) => setSearchType(e.target.value as 'name' | 'subject')}
                                sx={{ minWidth: 160, '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                            >
                                {SEARCH_TYPE_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                            </TextField>
                            <TextField
                                placeholder={searchType === 'name' ? 'Search tutors by name...' : 'Search by subject (e.g., Mathematics)...'}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                size="small"
                                sx={{ flex: 1, maxWidth: { sm: 400 }, '& .MuiOutlinedInput-root': { borderRadius: 1, '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' } } }}
                                slotProps={{
                                    input: {
                                        startAdornment: <InputAdornment position="start"><IconButton size="small" onClick={handleSearch} disabled={isLoading}><SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} /></IconButton></InputAdornment>,
                                        endAdornment: searchQuery && <InputAdornment position="end"><IconButton size="small" onClick={handleClearSearch}><CloseIcon fontSize="small" /></IconButton></InputAdornment>,
                                    }
                                }}
                            />
                        </Stack>
                        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
                            <Typography variant="subtitle2" fontWeight={600} color="text.secondary">All Tutors</Typography>
                            <Stack direction="row" spacing={1.5} alignItems="center">
                                <TextField
                                    select size="small" value={selectedFaculty}
                                    onChange={(e) => handleFacultyChange(e.target.value as Faculty | 'ALL')}
                                    sx={{ minWidth: 150, '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                                    slotProps={{ input: { startAdornment: <InputAdornment position="start"><FilterListIcon sx={{ fontSize: 16, color: 'text.secondary' }} /></InputAdornment> } }}
                                >
                                    {FACULTY_OPTIONS.map((o) => <MenuItem key={o.value} value={o.value}>{o.label}</MenuItem>)}
                                </TextField>
                                <Tooltip title="Refresh">
                                    <IconButton onClick={handleRefresh} disabled={isLoading} size="small" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1, '&:hover': { borderColor: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.05) } }}>
                                        <RefreshIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Stack>
                        </Stack>
                    </Stack>
                </CardContent>
            </MotionCard>

            {/* ══════════════  TUTORS GRID  ══════════════ */}
            {isLoading ? (
                <Grid container spacing={3}>
                    {[...Array(6)].map((_, i) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={i}>
                            <Card elevation={0} sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                                <Skeleton variant="rectangular" height={4} />
                                <CardContent sx={{ p: 3 }}>
                                    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                                        <Skeleton variant="circular" width={56} height={56} />
                                        <Box sx={{ flex: 1 }}>
                                            <Skeleton variant="text" width="60%" />
                                            <Skeleton variant="text" width="40%" />
                                        </Box>
                                    </Stack>
                                    <Skeleton variant="rounded" height={48} sx={{ borderRadius: 1 }} />
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : displayStudents.length === 0 ? (
                <Paper elevation={0} sx={{ p: 8, textAlign: 'center', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: alpha(theme.palette.primary.main, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2 }}>
                        <PersonIcon sx={{ fontSize: 40, color: alpha(theme.palette.primary.main, 0.4) }} />
                    </Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>No Tutors Found</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 340, mx: 'auto' }}>Try adjusting your search criteria or filters.</Typography>
                </Paper>
            ) : (
                <AnimatePresence mode="popLayout">
                    <Grid container spacing={3}>
                        {displayStudents.map((student, index) => {
                            const expColor = EXPERIENCE_COLORS[student.kuppiExperienceLevel] || '#6B7280';
                            return (
                                <Grid size={{ xs: 12, sm: 6, md: 4 }} key={student.id}>
                                    <MotionCard
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.3, delay: index * 0.04 }}
                                        elevation={0}
                                        onClick={() => handleTutorClick(student)}
                                        sx={{
                                            borderRadius: 1,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            cursor: 'pointer',
                                            overflow: 'hidden',
                                            height: '100%',
                                            transition: 'all 0.25s ease',
                                            '&:hover': {
                                                borderColor: 'primary.main',
                                                transform: 'translateY(-3px)',
                                                boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.15)}`,
                                            },
                                        }}
                                    >
                                        {/* Accent bar */}
                                        <Box sx={{ height: 4, background: `linear-gradient(90deg, ${expColor}, ${alpha(expColor, 0.3)})` }} />

                                        <CardContent sx={{ p: 3 }}>
                                            <Stack spacing={2}>
                                                {/* ── Avatar + Name ── */}
                                                <Stack direction="row" spacing={2} alignItems="center">
                                                    <Avatar
                                                         src={student.profilePictureUrl || undefined}
                                                        sx={{
                                                            width: 56,
                                                            height: 56,
                                                            bgcolor: alpha(theme.palette.primary.main, 0.15),
                                                            color: 'primary.main',
                                                            fontWeight: 700,
                                                            fontSize: '1.15rem',
                                                            border: '3px solid',
                                                            borderColor: alpha(theme.palette.primary.main, 0.2),
                                                        }}
                                                    >
                                                        {getInitials(student.fullName)}
                                                    </Avatar>
                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <Stack direction="row" alignItems="center" spacing={0.5}>
                                                            <Typography variant="subtitle1" fontWeight={700} noWrap>{student.fullName}</Typography>
                                                        </Stack>
                                                        <Stack direction="row" alignItems="center" spacing={0.5}>
                                                            <SchoolIcon sx={{ fontSize: 13, color: 'text.disabled' }} />
                                                            <Typography variant="caption" color="text.secondary" noWrap>{student.program}</Typography>
                                                        </Stack>
                                                    </Box>
                                                </Stack>

                                                {/* ── Experience + Faculty ── */}
                                                <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                                                    <Chip
                                                        label={student.kuppiExperienceLevel}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: alpha(expColor, 0.1),
                                                            color: expColor,
                                                            fontWeight: 600,
                                                            fontSize: '0.65rem',
                                                            textTransform: 'capitalize',
                                                            border: '1px solid',
                                                            borderColor: alpha(expColor, 0.15),
                                                        }}
                                                    />
                                                    <Chip label={student.faculty} size="small" sx={{ fontSize: '0.65rem', bgcolor: alpha(theme.palette.grey[500], 0.08), fontWeight: 500 }} />
                                                </Stack>

                                                <Divider />

                                                {/* ── Subjects ── */}
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary" sx={{ mb: 0.75, display: 'block', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: '0.6rem' }}>
                                                        Expertise
                                                    </Typography>
                                                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                                        {(student.kuppiSubjects ?? []).slice(0, 3).map((subject, idx) => (
                                                            <Chip
                                                                key={idx}
                                                                icon={<CheckCircleIcon sx={{ fontSize: 12, color: 'primary.main !important' }} />}
                                                                label={subject}
                                                                size="small"
                                                                sx={{ fontSize: '0.65rem', bgcolor: alpha(theme.palette.primary.main, 0.06), color: 'primary.main', fontWeight: 500, '& .MuiChip-icon': { color: 'primary.main' } }}
                                                            />
                                                        ))}
                                                        {(student.kuppiSubjects ?? []).length > 3 && (
                                                            <Chip
                                                                label={`+${(student.kuppiSubjects ?? []).length - 3} more`}
                                                                size="small"
                                                                sx={{ fontSize: '0.65rem', fontWeight: 500, bgcolor: alpha(theme.palette.grey[500], 0.08) }}
                                                            />
                                                        )}
                                                    </Stack>
                                                </Box>
                                            </Stack>
                                        </CardContent>
                                    </MotionCard>
                                </Grid>
                            );
                        })}
                    </Grid>
                </AnimatePresence>
            )}

            {/* ── Pagination ── */}
            {!isLoading && totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                    <Pagination count={totalPages} page={page + 1} onChange={handlePageChange} color="primary" size="large" showFirstButton showLastButton />
                </Box>
            )}

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} variant="filled" sx={{ borderRadius: 1 }}>{snackbar.message}</Alert>
            </Snackbar>
        </MotionBox>
    );
}
