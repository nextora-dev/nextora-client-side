'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Box, Typography, alpha, useTheme, Grid, Card, CardContent, Stack,
    TextField, InputAdornment, IconButton, Chip, Avatar, Snackbar, Alert,
    Tabs, Tab, Skeleton, Divider, Paper, Tooltip, Button,
    FormControl, InputLabel, Select, MenuItem, Collapse,
} from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import CategoryIcon from '@mui/icons-material/Category';
import PhoneIcon from '@mui/icons-material/Phone';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import FindInPageIcon from '@mui/icons-material/FindInPage';
import HandshakeIcon from '@mui/icons-material/Handshake';
import AddIcon from '@mui/icons-material/Add';
import FilterListIcon from '@mui/icons-material/FilterList';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import GavelIcon from '@mui/icons-material/Gavel';

import { useLostFound } from '@/hooks/useLostFound';
import {
    ReportItemDialog, ItemDetailDialog, SubmitClaimDialog,
    MatchesDialog, ClaimDetailDialog,
} from '@/components/lostfound';
import type { LostItemResponse, FoundItemResponse } from '@/features/lostfound/types';

const MotionBox = motion.create(Box);
const MotionCard = motion.create(Card);

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

export default function StudentLostFoundPage() {
    const theme = useTheme();
    const {
        lostItems, foundItems, selectedLostItem, selectedFoundItem,
        totalLostItems, totalFoundItems,
        matches, myClaims, categories,
        isLostLoading, isFoundLoading, isSubmitting, isMatchLoading, isClaimLoading,
        error, successMessage,
        loadCategories, searchLostItems, searchFoundItems,
        loadLostItemById, loadFoundItemById,
        reportLostItem, reportFoundItem,
        findLostMatches, findFoundMatches,
        submitClaim, loadMyClaims,
        clearError, clearSuccess,
        resetSelectedLost, resetSelectedFound, resetMatches,
    } = useLostFound();

    // Main tab: 0=Lost, 1=Found, 2=My Claims
    const [mainTab, setMainTab] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

    // Dialogs
    const [reportDialogOpen, setReportDialogOpen] = useState(false);
    const [reportType, setReportType] = useState<'LOST' | 'FOUND'>('LOST');
    const [detailOpen, setDetailOpen] = useState(false);
    const [detailType, setDetailType] = useState<'LOST' | 'FOUND'>('LOST');
    const [matchesOpen, setMatchesOpen] = useState(false);
    const [matchItemTitle, setMatchItemTitle] = useState('');
    const [claimOpen, setClaimOpen] = useState(false);
    const [claimLostId, setClaimLostId] = useState<number | null>(null);
    const [claimFoundId, setClaimFoundId] = useState<number | null>(null);
    const [claimDetailOpen, setClaimDetailOpen] = useState(false);
    const [selectedClaimForView, setSelectedClaimForView] = useState<typeof myClaims[0] | null>(null);

    // Initial load
    useEffect(() => {
        loadCategories();
        searchLostItems({ page: 0, size: 12, sortBy: 'createdAt', sortDir: 'DESC' });
    }, [loadCategories, searchLostItems]);

    // Error / Success
    useEffect(() => {
        if (error) { setSnackbar({ open: true, message: error, severity: 'error' }); clearError(); }
        if (successMessage) { setSnackbar({ open: true, message: successMessage, severity: 'success' }); clearSuccess(); }
    }, [error, successMessage, clearError, clearSuccess]);

    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setMainTab(newValue);
        setSearchQuery('');
        setCategoryFilter('');
        if (newValue === 0) searchLostItems({ page: 0, size: 12, sortBy: 'createdAt', sortDir: 'DESC' });
        else if (newValue === 1) searchFoundItems({ page: 0, size: 12, sortBy: 'createdAt', sortDir: 'DESC' });
        else loadMyClaims({ page: 0, size: 20 });
    };

    const handleSearch = useCallback(() => {
        const params = { keyword: searchQuery || undefined, category: categoryFilter || undefined, page: 0, size: 12, sortBy: 'createdAt' as const, sortDir: 'DESC' as const };
        if (mainTab === 0) searchLostItems(params);
        else if (mainTab === 1) searchFoundItems(params);
    }, [searchQuery, categoryFilter, mainTab, searchLostItems, searchFoundItems]);

    const handleRefresh = () => {
        setSearchQuery('');
        setCategoryFilter('');
        if (mainTab === 0) searchLostItems({ page: 0, size: 12, sortBy: 'createdAt', sortDir: 'DESC' });
        else if (mainTab === 1) searchFoundItems({ page: 0, size: 12, sortBy: 'createdAt', sortDir: 'DESC' });
        else loadMyClaims({ page: 0, size: 20 });
    };

    const handleViewLost = (item: LostItemResponse) => { loadLostItemById(item.id); setDetailType('LOST'); setDetailOpen(true); };
    const handleViewFound = (item: FoundItemResponse) => { loadFoundItemById(item.id); setDetailType('FOUND'); setDetailOpen(true); };

    const handleFindMatches = (item: LostItemResponse | FoundItemResponse, type: 'LOST' | 'FOUND') => {
        setMatchItemTitle(item.title);
        if (type === 'LOST') findLostMatches(item.id);
        else findFoundMatches(item.id);
        setMatchesOpen(true);
    };

    const handleOpenClaim = (lostId: number, foundId: number) => {
        setClaimLostId(lostId); setClaimFoundId(foundId); setClaimOpen(true);
    };

    const handleOpenReport = (type: 'LOST' | 'FOUND') => {
        setReportType(type); setReportDialogOpen(true);
    };

    const isLoading = mainTab === 0 ? isLostLoading : mainTab === 1 ? isFoundLoading : isClaimLoading;
    const items = mainTab === 0 ? lostItems : mainTab === 1 ? foundItems : [];

    const stats = [
        { label: 'Lost Items', value: totalLostItems, icon: ReportProblemIcon, color: '#EF4444' },
        { label: 'Found Items', value: totalFoundItems, icon: FindInPageIcon, color: '#10B981' },
        { label: 'Active Lost', value: lostItems.filter((i) => i.active).length, icon: SearchOffIcon, color: '#F59E0B' },
        { label: 'Active Found', value: foundItems.filter((i) => i.active).length, icon: CheckCircleIcon, color: '#3B82F6' },
    ];

    return (
        <MotionBox variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 1400, mx: 'auto' }}>
            {/* ══════════════  PAGE HEADER  ══════════════ */}
            <MotionBox variants={itemVariants} sx={{ mb: 4 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
                    <Box>
                        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ letterSpacing: '-0.02em' }}>Lost & Found</Typography>
                        <Typography variant="body2" color="text.secondary">Report lost items or browse found items on campus</Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                        <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => handleOpenReport('LOST')} sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600, bgcolor: '#EF4444', '&:hover': { bgcolor: '#DC2626' } }}>
                            Report Lost
                        </Button>
                        <Button variant="contained" size="small" startIcon={<AddIcon />} onClick={() => handleOpenReport('FOUND')} sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600, bgcolor: '#10B981', '&:hover': { bgcolor: '#059669' } }}>
                            Report Found
                        </Button>
                    </Stack>
                </Stack>
            </MotionBox>

            {/* ══════════════  STATS GRID  ══════════════ */}
            <Box sx={{ mb: 4 }}>
                <Grid container spacing={2}>
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <Grid size={{ xs: 6, sm: 3 }} key={index}>
                                <Card elevation={0} sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider', transition: 'all 0.2s', '&:hover': { borderColor: stat.color, boxShadow: `0 4px 16px ${alpha(stat.color, 0.15)}` } }}>
                                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                        <Stack direction="row" alignItems="center" spacing={1.5}>
                                            <Box sx={{ width: 44, height: 44, borderRadius: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(stat.color, 0.1), border: '1px solid', borderColor: alpha(stat.color, 0.15) }}>
                                                <Icon sx={{ color: stat.color, fontSize: 22 }} />
                                            </Box>
                                            <Box>
                                                <Typography variant="h5" fontWeight={700} sx={{ lineHeight: 1.1 }}>{stat.value}</Typography>
                                                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>{stat.label}</Typography>
                                            </Box>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            </Box>

            {/* ══════════════  TABS + SEARCH  ══════════════ */}
            <Card elevation={0} sx={{ mb: 4, borderRadius: 1, border: '1px solid', borderColor: 'divider', bgcolor: alpha(theme.palette.background.paper, 0.8), backdropFilter: 'blur(12px)' }}>
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
                        <TextField
                            placeholder="Search by title, description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            size="small"
                            sx={{ maxWidth: { sm: 320 }, '& .MuiOutlinedInput-root': { borderRadius: 1 } }}
                            slotProps={{
                                input: {
                                    startAdornment: <InputAdornment position="start"><IconButton size="small" onClick={handleSearch}><SearchIcon sx={{ fontSize: 20 }} /></IconButton></InputAdornment>,
                                    endAdornment: searchQuery ? <InputAdornment position="end"><IconButton size="small" onClick={() => { setSearchQuery(''); handleRefresh(); }}><CloseIcon fontSize="small" /></IconButton></InputAdornment> : undefined,
                                },
                            }}
                        />
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Tabs value={mainTab} onChange={handleTabChange} sx={{ minHeight: 36, '& .MuiTab-root': { minHeight: 36, textTransform: 'none', fontWeight: 600, fontSize: '0.8125rem', borderRadius: 1, px: 2 }, '& .MuiTabs-indicator': { borderRadius: 1, height: 2 } }}>
                                <Tab label="Lost Items" />
                                <Tab label="Found Items" />
                                <Tab label="My Claims" />
                            </Tabs>
                            <Tooltip title="Filter by Category">
                                <IconButton onClick={() => setShowFilters(!showFilters)} size="small" sx={{ border: '1px solid', borderColor: showFilters ? 'primary.main' : 'divider', borderRadius: 1, bgcolor: showFilters ? alpha(theme.palette.primary.main, 0.05) : 'transparent' }}>
                                    <FilterListIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Refresh">
                                <IconButton onClick={handleRefresh} size="small" sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                                    <RefreshIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </Stack>

                    <Collapse in={showFilters && mainTab < 2}>
                        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <FormControl size="small" sx={{ minWidth: 200 }}>
                                    <InputLabel>Category</InputLabel>
                                    <Select value={categoryFilter} label="Category" onChange={(e) => setCategoryFilter(e.target.value)}>
                                        <MenuItem value="">All Categories</MenuItem>
                                        {(categories.length > 0 ? categories : ['Electronics', 'Clothing', 'Accessories', 'Books', 'Keys', 'ID Cards', 'Bags', 'Other']).map((cat) => (
                                            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                                <Button variant="contained" size="small" onClick={handleSearch} sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600 }}>Apply</Button>
                                <Button variant="outlined" size="small" onClick={() => { setCategoryFilter(''); handleRefresh(); }} sx={{ borderRadius: 1, textTransform: 'none', borderColor: 'divider', color: 'text.secondary' }}>Clear</Button>
                            </Stack>
                        </Box>
                    </Collapse>
                </CardContent>
            </Card>

            {/* ══════════════  MY CLAIMS TAB  ══════════════ */}
            {mainTab === 2 ? (
                isClaimLoading ? (
                    <Grid container spacing={3}>
                        {[1, 2, 3].map((i) => (
                            <Grid size={{ xs: 12, md: 6 }} key={i}>
                                <Card elevation={0} sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                                    <CardContent><Stack spacing={1.5}><Skeleton variant="text" width="60%" height={28} /><Skeleton variant="text" width="90%" /><Skeleton variant="text" width="40%" /></Stack></CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : myClaims.length === 0 ? (
                    <Paper elevation={0} sx={{ p: 8, textAlign: 'center', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                        <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: alpha(theme.palette.primary.main, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2.5 }}>
                            <GavelIcon sx={{ fontSize: 40, color: alpha(theme.palette.primary.main, 0.4) }} />
                        </Box>
                        <Typography variant="h6" fontWeight={600} gutterBottom>No Claims Yet</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, mx: 'auto' }}>
                            When you submit a claim for a found item, it will appear here.
                        </Typography>
                    </Paper>
                ) : (
                    <Grid container spacing={3}>
                        {myClaims.map((claim, index) => {
                            const sc = { PENDING: { color: '#F59E0B', label: 'Pending' }, APPROVED: { color: '#10B981', label: 'Approved' }, REJECTED: { color: '#EF4444', label: 'Rejected' } }[claim.status];
                            return (
                                <Grid size={{ xs: 12, md: 6 }} key={claim.id}>
                                    <MotionCard
                                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.35, delay: index * 0.04 }}
                                        elevation={0}
                                        onClick={() => { setSelectedClaimForView(claim); setClaimDetailOpen(true); }}
                                        sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider', cursor: 'pointer', overflow: 'hidden', transition: 'all 0.25s ease', '&:hover': { borderColor: 'primary.main', transform: 'translateY(-2px)', boxShadow: `0 8px 24px ${alpha(theme.palette.primary.main, 0.1)}` } }}
                                    >
                                        <Box sx={{ height: 4, background: `linear-gradient(90deg, ${sc.color}, ${alpha(sc.color, 0.4)})` }} />
                                        <CardContent sx={{ p: 3 }}>
                                            <Stack spacing={1.5}>
                                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                    <Typography variant="subtitle1" fontWeight={700}>Claim #{claim.id}</Typography>
                                                    <Chip label={sc.label} size="small" sx={{ bgcolor: alpha(sc.color, 0.1), color: sc.color, fontWeight: 700, fontSize: '0.7rem' }} />
                                                </Stack>
                                                <Typography variant="body2" color="text.secondary">Lost: {claim.lostItemTitle}</Typography>
                                                <Typography variant="body2" color="text.secondary">Found: {claim.foundItemTitle}</Typography>
                                                <Typography variant="caption" color="text.disabled">{new Date(claim.createdAt).toLocaleDateString()}</Typography>
                                            </Stack>
                                        </CardContent>
                                    </MotionCard>
                                </Grid>
                            );
                        })}
                    </Grid>
                )
            ) : (
                /* ══════════════  LOST / FOUND ITEMS GRID  ══════════════ */
                isLoading ? (
                    <Grid container spacing={3}>
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <Grid size={{ xs: 12, md: 6 }} key={i}>
                                <Card elevation={0} sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                                    <Skeleton variant="rectangular" height={6} />
                                    <CardContent sx={{ p: 3 }}>
                                        <Stack spacing={2}>
                                            <Stack direction="row" justifyContent="space-between"><Skeleton variant="text" width="60%" height={28} /><Skeleton variant="rounded" width={80} height={24} /></Stack>
                                            <Skeleton variant="text" width="90%" /><Skeleton variant="text" width="70%" />
                                            <Stack direction="row" spacing={2}><Skeleton variant="circular" width={36} height={36} /><Box sx={{ flex: 1 }}><Skeleton variant="text" width="40%" /><Skeleton variant="text" width="25%" /></Box></Stack>
                                        </Stack>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                ) : items.length === 0 ? (
                    <Paper elevation={0} sx={{ p: 8, textAlign: 'center', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
                        <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: alpha(theme.palette.primary.main, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2.5 }}>
                            <SearchOffIcon sx={{ fontSize: 40, color: alpha(theme.palette.primary.main, 0.4) }} />
                        </Box>
                        <Typography variant="h6" fontWeight={600} gutterBottom>No Items Found</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, mx: 'auto' }}>
                            Try adjusting your search or filters, or check back later.
                        </Typography>
                    </Paper>
                ) : (
                    <AnimatePresence mode="popLayout">
                        <Grid container spacing={3}>
                            {items.map((item, index) => {
                                const isLost = mainTab === 0;
                                const accentColor = isLost ? '#EF4444' : '#10B981';
                                const dateValue = isLost ? (item as LostItemResponse).dateLost : (item as FoundItemResponse).dateFound;

                                return (
                                    <Grid size={{ xs: 12, md: 6 }} key={item.id}>
                                        <MotionCard
                                            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ duration: 0.35, delay: index * 0.04 }}
                                            elevation={0}
                                            sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider', overflow: 'hidden', transition: 'all 0.25s ease', '&:hover': { borderColor: 'primary.main', transform: 'translateY(-3px)', boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.15)}` } }}
                                        >
                                            {/* Accent bar */}
                                            <Box sx={{ height: 4, background: `linear-gradient(90deg, ${accentColor}, ${alpha(accentColor, 0.4)})` }} />

                                            {/* Cover image */}
                                            {item.imageUrls && item.imageUrls.length > 0 && (
                                                <Box
                                                    onClick={() => isLost ? handleViewLost(item as LostItemResponse) : handleViewFound(item as FoundItemResponse)}
                                                    sx={{ width: '100%', height: 150, backgroundImage: `url(${item.imageUrls[0]})`, backgroundSize: 'cover', backgroundPosition: 'center', cursor: 'pointer', position: 'relative' }}
                                                >
                                                    <Box sx={{ position: 'absolute', bottom: 8, right: 8 }}>
                                                        <Chip
                                                            label={item.active ? 'Active' : 'Resolved'}
                                                            size="small"
                                                            sx={{ bgcolor: item.active ? 'rgba(16,185,129,0.9)' : 'rgba(107,114,128,0.9)', color: '#fff', fontWeight: 600, fontSize: '0.7rem' }}
                                                        />
                                                    </Box>
                                                </Box>
                                            )}

                                            <CardContent sx={{ p: 3 }}>
                                                <Stack spacing={2}>
                                                    {/* Header */}
                                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                                                        <Box sx={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => isLost ? handleViewLost(item as LostItemResponse) : handleViewFound(item as FoundItemResponse)}>
                                                            <Typography variant="h6" fontWeight={700} noWrap sx={{ mb: 0.5 }}>{item.title}</Typography>
                                                            <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                                                                <Chip label={isLost ? 'Lost' : 'Found'} size="small" sx={{ bgcolor: alpha(accentColor, 0.1), color: accentColor, fontWeight: 700, fontSize: '0.75rem' }} />
                                                                <Chip icon={<CategoryIcon sx={{ fontSize: 14 }} />} label={item.category} size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: '0.7rem', '& .MuiChip-icon': { color: 'inherit' } }} />
                                                            </Stack>
                                                        </Box>
                                                        {!item.imageUrls?.length && (
                                                            <Chip label={item.active ? 'Active' : 'Resolved'} size="small" sx={{ bgcolor: alpha(item.active ? '#10B981' : '#6B7280', 0.1), color: item.active ? '#10B981' : '#6B7280', fontWeight: 600, fontSize: '0.7rem' }} />
                                                        )}
                                                    </Stack>

                                                    {/* Description */}
                                                    <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.6, cursor: 'pointer' }} onClick={() => isLost ? handleViewLost(item as LostItemResponse) : handleViewFound(item as FoundItemResponse)}>
                                                        {item.description || 'No description provided'}
                                                    </Typography>

                                                    {/* Meta Row */}
                                                    <Stack direction="row" spacing={2.5} flexWrap="wrap" useFlexGap>
                                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                                            <LocationOnIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                                                            <Typography variant="caption" color="text.secondary">{item.location}</Typography>
                                                        </Stack>
                                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                                            <CalendarTodayIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                                                            <Typography variant="caption" color="text.secondary">{dateValue ? new Date(dateValue).toLocaleDateString() : 'N/A'}</Typography>
                                                        </Stack>
                                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                                            <PhoneIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                                                            <Typography variant="caption" color="text.secondary">{item.contactNumber}</Typography>
                                                        </Stack>
                                                    </Stack>

                                                    <Divider />

                                                    {/* Footer */}
                                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                        <Stack direction="row" alignItems="center" spacing={1.5}>
                                                            <Avatar sx={{ width: 36, height: 36, bgcolor: alpha(accentColor, 0.15), color: accentColor, fontWeight: 700, fontSize: '0.8rem', border: '2px solid', borderColor: alpha(accentColor, 0.2) }}>
                                                                {item.reportedByName?.[0]?.toUpperCase() || '?'}
                                                            </Avatar>
                                                            <Box>
                                                                <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.2 }}>{item.reportedByName}</Typography>
                                                                <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>Reporter</Typography>
                                                            </Box>
                                                        </Stack>
                                                        <Stack direction="row" spacing={0.5}>
                                                            <Tooltip title="Find Matches">
                                                                <IconButton size="small" onClick={() => handleFindMatches(item, isLost ? 'LOST' : 'FOUND')} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                                                                    <CompareArrowsIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </Stack>
                                                    </Stack>
                                                </Stack>
                                            </CardContent>
                                        </MotionCard>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </AnimatePresence>
                )
            )}

            {/* ══════════════  DIALOGS  ══════════════ */}
            <ReportItemDialog
                open={reportDialogOpen} onClose={() => setReportDialogOpen(false)}
                type={reportType} categories={categories} isSubmitting={isSubmitting}
                onSubmitLost={(data) => { reportLostItem(data).then(() => { setReportDialogOpen(false); searchLostItems({ page: 0, size: 12, sortBy: 'createdAt', sortDir: 'DESC' }); }); }}
                onSubmitFound={(data) => { reportFoundItem(data).then(() => { setReportDialogOpen(false); searchFoundItems({ page: 0, size: 12, sortBy: 'createdAt', sortDir: 'DESC' }); }); }}
            />

            <ItemDetailDialog
                open={detailOpen}
                onClose={() => { setDetailOpen(false); resetSelectedLost(); resetSelectedFound(); }}
                lostItem={detailType === 'LOST' ? selectedLostItem : undefined}
                foundItem={detailType === 'FOUND' ? selectedFoundItem : undefined}
                isLoading={isLostLoading || isFoundLoading}
            />

            <MatchesDialog
                open={matchesOpen}
                onClose={() => { setMatchesOpen(false); resetMatches(); }}
                matches={matches} isLoading={isMatchLoading} itemTitle={matchItemTitle}
            />

            <SubmitClaimDialog
                open={claimOpen} onClose={() => setClaimOpen(false)}
                lostItemId={claimLostId} foundItemId={claimFoundId}
                isSubmitting={isSubmitting}
                onSubmit={(data) => { submitClaim(data).then(() => { setClaimOpen(false); loadMyClaims({ page: 0, size: 20 }); }); }}
            />

            <ClaimDetailDialog
                open={claimDetailOpen}
                onClose={() => { setClaimDetailOpen(false); setSelectedClaimForView(null); }}
                claim={selectedClaimForView}
            />

            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} variant="filled" sx={{ borderRadius: 1 }}>{snackbar.message}</Alert>
            </Snackbar>
        </MotionBox>
    );
}
