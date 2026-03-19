'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
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
    Divider,
} from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import CloseIcon from '@mui/icons-material/Close';
import ApartmentIcon from '@mui/icons-material/Apartment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import VisibilityIcon from '@mui/icons-material/Visibility';
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import PeopleIcon from '@mui/icons-material/People';
import HomeIcon from '@mui/icons-material/Home';
import PhoneIcon from '@mui/icons-material/Phone';
import BlockIcon from '@mui/icons-material/Block';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import WifiIcon from '@mui/icons-material/Wifi';
import { FormControl, InputLabel, Select, MenuItem, Button, Collapse } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

import { useBoardingHouse } from '@/hooks/useBoardingHouse';
import { ListingDetailDialog } from '@/components/boardinghouse';
import type { BoardingHouseResponse, GenderPreference } from '@/features/boardinghouse/types';

const MotionBox = motion.create(Box);
const MotionCard = motion.create(Card);

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.06 } }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.35 } }
};

// ── Gender Config ─────────────────────────────────────
const GENDER_CONFIG: Record<GenderPreference, { color: string; icon: React.ReactElement; label: string }> = {
    MALE: { color: '#3B82F6', icon: <MaleIcon sx={{ fontSize: 14 }} />, label: 'Male Only' },
    FEMALE: { color: '#EC4899', icon: <FemaleIcon sx={{ fontSize: 14 }} />, label: 'Female Only' },
    ANY: { color: '#10B981', icon: <PeopleIcon sx={{ fontSize: 14 }} />, label: 'Any Gender' },
};

const getGenderConfig = (pref: GenderPreference | undefined | null) => {
    if (!pref || !(pref in GENDER_CONFIG)) return GENDER_CONFIG.ANY;
    return GENDER_CONFIG[pref];
};

export default function StudentBoardingPage() {
    const theme = useTheme();
    const {
        listings, totalListings, selectedListing,
        isListingLoading, error, successMessage,
        loadListings, loadListingById, searchListings, filterAdvanced,
        clearError, clearSuccess, resetSelectedListing,
    } = useBoardingHouse();

    // Local state
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState(0);
    const [page, setPage] = useState(0);
    const [detailOpen, setDetailOpen] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
    const [showFilters, setShowFilters] = useState(false);

    // Filter state
    const [city, setCity] = useState('');
    const [district, setDistrict] = useState('');
    const [genderPref, setGenderPref] = useState<GenderPreference | ''>('');
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');

    // Fetch on mount
    useEffect(() => {
        loadListings({ page: 0, size: 12, sortBy: 'createdAt', sortDirection: 'DESC' });
    }, [loadListings]);

    // Handle tab change
    const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
        setPage(0);
        setSearchQuery('');
        if (newValue === 0) {
            loadListings({ page: 0, size: 12, sortBy: 'createdAt', sortDirection: 'DESC' });
        } else if (newValue === 1) {
            loadListings({ page: 0, size: 12, sortBy: 'price', sortDirection: 'ASC' });
        }
    };

    // Handle search
    const handleSearch = useCallback(() => {
        if (searchQuery.trim()) {
            searchListings({ keyword: searchQuery, page: 0, size: 12 });
        } else {
            loadListings({ page: 0, size: 12, sortBy: 'createdAt', sortDirection: 'DESC' });
        }
    }, [searchListings, loadListings, searchQuery]);

    // Handle refresh
    const handleRefresh = () => {
        setSearchQuery('');
        setCity('');
        setDistrict('');
        setGenderPref('');
        setMinPrice('');
        setMaxPrice('');
        loadListings({ page: 0, size: 12, sortBy: 'createdAt', sortDirection: 'DESC' });
    };

    // Handle filter
    const handleFilter = useCallback(() => {
        filterAdvanced({
            city: city || undefined,
            district: district || undefined,
            genderPreference: genderPref || undefined,
            minPrice: minPrice ? parseFloat(minPrice) : undefined,
            maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
            page: 0,
            size: 12,
            sortBy: 'price',
            sortDirection: 'ASC',
        });
        setPage(0);
    }, [city, district, genderPref, minPrice, maxPrice, filterAdvanced]);

    const handleClearFilter = () => {
        setCity('');
        setDistrict('');
        setGenderPref('');
        setMinPrice('');
        setMaxPrice('');
        loadListings({ page: 0, size: 12, sortBy: 'createdAt', sortDirection: 'DESC' });
    };

    // Handle view
    const handleView = useCallback((listing: BoardingHouseResponse) => {
        loadListingById(listing.id);
        setDetailOpen(true);
    }, [loadListingById]);

    // Error/Success
    useEffect(() => {
        if (error) {
            setSnackbar({ open: true, message: error, severity: 'error' });
            clearError();
        }
        if (successMessage) {
            setSnackbar({ open: true, message: successMessage, severity: 'success' });
            clearSuccess();
        }
    }, [error, successMessage, clearError, clearSuccess]);

    // Stats
    const stats = [
        { label: 'Total Listings', value: totalListings, icon: ApartmentIcon, color: '#3B82F6' },
        { label: 'Available', value: listings.filter(l => l.isAvailable).length, icon: CheckCircleIcon, color: '#10B981' },
        { label: 'Male Only', value: listings.filter(l => l.genderPreference === 'MALE').length, icon: MaleIcon, color: '#3B82F6' },
        { label: 'Female Only', value: listings.filter(l => l.genderPreference === 'FEMALE').length, icon: FemaleIcon, color: '#EC4899' },
    ];

    return (
        <MotionBox variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 1400, mx: 'auto' }}>
            {/* ══════════════  PAGE HEADER  ══════════════ */}
            <MotionBox variants={itemVariants} sx={{ mb: 4 }}>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} spacing={2}>
                    <Box>
                        <Typography variant="h4" fontWeight={700} gutterBottom sx={{ letterSpacing: '-0.02em' }}>
                            Boarding Houses
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Find the perfect boarding house near your campus
                        </Typography>
                    </Box>
                </Stack>
            </MotionBox>

            {/* ══════════════  STATS GRID  ══════════════ */}
            <Box sx={{ mb: 4 }}>
                <Grid container spacing={2}>
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <Grid size={{ xs: 6, sm: 3 }} key={index}>
                                <Card
                                    elevation={0}
                                    sx={{
                                        borderRadius: 1,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        transition: 'all 0.2s',
                                        '&:hover': { borderColor: stat.color, boxShadow: `0 4px 16px ${alpha(stat.color, 0.15)}` },
                                    }}
                                >
                                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                        <Stack direction="row" alignItems="center" spacing={1.5}>
                                            <Box
                                                sx={{
                                                    width: 44,
                                                    height: 44,
                                                    borderRadius: 1,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    bgcolor: alpha(stat.color, 0.1),
                                                    border: '1px solid',
                                                    borderColor: alpha(stat.color, 0.15),
                                                }}
                                            >
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

            {/* ══════════════  FILTERS  ══════════════ */}
            <Card
                elevation={0}
                sx={{
                    mb: 4,
                    borderRadius: 1,
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: alpha(theme.palette.background.paper, 0.8),
                    backdropFilter: 'blur(12px)',
                }}
            >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ sm: 'center' }} justifyContent="space-between">
                        <TextField
                            placeholder="Search by title, city, or description..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                            size="small"
                            sx={{
                                maxWidth: { sm: 360 },
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 1,
                                    '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: 'primary.main' },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderWidth: 1 },
                                },
                            }}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <IconButton size="small" onClick={handleSearch} disabled={isListingLoading}>
                                                <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                    endAdornment: searchQuery && (
                                        <InputAdornment position="end">
                                            <IconButton size="small" onClick={() => { setSearchQuery(''); loadListings({ page: 0, size: 12, sortBy: 'createdAt', sortDirection: 'DESC' }); }}>
                                                <CloseIcon fontSize="small" />
                                            </IconButton>
                                        </InputAdornment>
                                    )
                                }
                            }}
                        />
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Tabs
                                value={activeTab}
                                onChange={handleTabChange}
                                sx={{
                                    minHeight: 36,
                                    '& .MuiTab-root': {
                                        minHeight: 36,
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        fontSize: '0.8125rem',
                                        borderRadius: 1,
                                        px: 2,
                                    },
                                    '& .MuiTabs-indicator': { borderRadius: 1, height: 2 },
                                }}
                            >
                                <Tab label="Latest" />
                                <Tab label="Cheapest" />
                            </Tabs>
                            <Tooltip title="Advanced Filter">
                                <IconButton
                                    onClick={() => setShowFilters(!showFilters)}
                                    size="small"
                                    sx={{
                                        border: '1px solid',
                                        borderColor: showFilters ? 'primary.main' : 'divider',
                                        borderRadius: 1,
                                        bgcolor: showFilters ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                                        '&:hover': { borderColor: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.05) },
                                    }}
                                >
                                    <FilterListIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                            <Tooltip title="Refresh">
                                <IconButton
                                    onClick={handleRefresh}
                                    disabled={isListingLoading}
                                    size="small"
                                    sx={{
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 1,
                                        '&:hover': { borderColor: 'primary.main', bgcolor: alpha(theme.palette.primary.main, 0.05) },
                                    }}
                                >
                                    <RefreshIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </Stack>
                    </Stack>

                    {/* Advanced Filters */}
                    <Collapse in={showFilters}>
                        <Box sx={{ mt: 2, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                            <Grid container spacing={2} alignItems="center">
                                <Grid size={{ xs: 6, sm: 2 }}>
                                    <TextField size="small" fullWidth label="City" value={city} onChange={(e) => setCity(e.target.value)} />
                                </Grid>
                                <Grid size={{ xs: 6, sm: 2 }}>
                                    <TextField size="small" fullWidth label="District" value={district} onChange={(e) => setDistrict(e.target.value)} />
                                </Grid>
                                <Grid size={{ xs: 6, sm: 2 }}>
                                    <FormControl size="small" fullWidth>
                                        <InputLabel>Gender</InputLabel>
                                        <Select value={genderPref} label="Gender" onChange={(e) => setGenderPref(e.target.value as GenderPreference | '')}>
                                            <MenuItem value="">All</MenuItem>
                                            <MenuItem value="ANY">Any Gender</MenuItem>
                                            <MenuItem value="MALE">Male Only</MenuItem>
                                            <MenuItem value="FEMALE">Female Only</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid size={{ xs: 6, sm: 1.5 }}>
                                    <TextField size="small" fullWidth label="Min Price" type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                                </Grid>
                                <Grid size={{ xs: 6, sm: 1.5 }}>
                                    <TextField size="small" fullWidth label="Max Price" type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 3 }}>
                                    <Stack direction="row" spacing={1}>
                                        <Button variant="contained" size="small" onClick={handleFilter} sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600 }}>
                                            Apply
                                        </Button>
                                        <Button variant="outlined" size="small" onClick={handleClearFilter} sx={{ borderRadius: 1, textTransform: 'none', fontWeight: 600, borderColor: 'divider', color: 'text.secondary' }}>
                                            Clear
                                        </Button>
                                    </Stack>
                                </Grid>
                            </Grid>
                        </Box>
                    </Collapse>
                </CardContent>
            </Card>

            {/* ══════════════  LISTINGS GRID  ══════════════ */}
            {isListingLoading ? (
                <Grid container spacing={3}>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Grid size={{ xs: 12, md: 6 }} key={i}>
                            <Card elevation={0} sx={{ borderRadius: 1, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                                <Skeleton variant="rectangular" height={6} />
                                <CardContent sx={{ p: 3 }}>
                                    <Stack spacing={2}>
                                        <Stack direction="row" justifyContent="space-between">
                                            <Skeleton variant="text" width="60%" height={28} />
                                            <Skeleton variant="rounded" width={80} height={24} sx={{ borderRadius: 1 }} />
                                        </Stack>
                                        <Skeleton variant="text" width="90%" />
                                        <Skeleton variant="text" width="70%" />
                                        <Stack direction="row" spacing={2}>
                                            <Skeleton variant="circular" width={36} height={36} />
                                            <Box sx={{ flex: 1 }}>
                                                <Skeleton variant="text" width="40%" />
                                                <Skeleton variant="text" width="25%" />
                                            </Box>
                                        </Stack>
                                    </Stack>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : listings.length === 0 ? (
                <Paper
                    elevation={0}
                    sx={{ p: 8, textAlign: 'center', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}
                >
                    <Box sx={{ width: 80, height: 80, borderRadius: '50%', bgcolor: alpha(theme.palette.primary.main, 0.08), display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', mb: 2.5 }}>
                        <ApartmentIcon sx={{ fontSize: 40, color: alpha(theme.palette.primary.main, 0.4) }} />
                    </Box>
                    <Typography variant="h6" fontWeight={600} gutterBottom>No Listings Found</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 360, mx: 'auto' }}>
                        Try adjusting your search or filters, or check back later for new listings.
                    </Typography>
                </Paper>
            ) : (
                <AnimatePresence mode="popLayout">
                    <Grid container spacing={3}>
                        {listings.map((listing, index) => {
                            const gc = getGenderConfig(listing.genderPreference);

                            return (
                                <Grid size={{ xs: 12, md: 6 }} key={listing.id}>
                                    <MotionCard
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.35, delay: index * 0.04 }}
                                        elevation={0}
                                        onClick={() => handleView(listing)}
                                        sx={{
                                            borderRadius: 1,
                                            border: '1px solid',
                                            borderColor: 'divider',
                                            cursor: 'pointer',
                                            overflow: 'hidden',
                                            transition: 'all 0.25s ease',
                                            '&:hover': {
                                                borderColor: 'primary.main',
                                                transform: 'translateY(-3px)',
                                                boxShadow: `0 12px 32px ${alpha(theme.palette.primary.main, 0.15)}`,
                                            },
                                        }}
                                    >
                                        {/* Accent bar */}
                                        <Box sx={{ height: 4, background: `linear-gradient(90deg, ${gc.color}, ${alpha(gc.color, 0.4)})` }} />

                                        {/* Cover image */}
                                        {listing.primaryImageUrl && (
                                            <Box
                                                sx={{
                                                    width: '100%',
                                                    height: 160,
                                                    backgroundImage: `url(${listing.primaryImageUrl})`,
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center',
                                                    position: 'relative',
                                                }}
                                            >
                                                <Box sx={{ position: 'absolute', bottom: 8, right: 8 }}>
                                                    <Chip
                                                        label={listing.isAvailable ? 'Available' : 'Unavailable'}
                                                        size="small"
                                                        icon={listing.isAvailable ? <CheckCircleIcon sx={{ fontSize: 14 }} /> : <BlockIcon sx={{ fontSize: 14 }} />}
                                                        sx={{
                                                            bgcolor: listing.isAvailable ? 'rgba(16,185,129,0.9)' : 'rgba(107,114,128,0.9)',
                                                            color: '#fff',
                                                            fontWeight: 600,
                                                            fontSize: '0.7rem',
                                                            '& .MuiChip-icon': { color: '#fff' },
                                                        }}
                                                    />
                                                </Box>
                                            </Box>
                                        )}

                                        <CardContent sx={{ p: 3 }}>
                                            <Stack spacing={2}>
                                                {/* ── Header ── */}
                                                <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                                        <Typography variant="h6" fontWeight={700} noWrap sx={{ mb: 0.5 }}>
                                                            {listing.title}
                                                        </Typography>
                                                        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                                                            <Chip
                                                                label={`Rs. ${listing.price.toLocaleString()}/mo`}
                                                                size="small"
                                                                sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: 'primary.main', fontWeight: 700, fontSize: '0.75rem' }}
                                                            />
                                                            <Chip
                                                                icon={gc.icon}
                                                                label={gc.label}
                                                                size="small"
                                                                sx={{
                                                                    bgcolor: alpha(gc.color, 0.1),
                                                                    color: gc.color,
                                                                    fontWeight: 600,
                                                                    fontSize: '0.7rem',
                                                                    '& .MuiChip-icon': { color: 'inherit' },
                                                                }}
                                                            />
                                                        </Stack>
                                                    </Box>
                                                    {!listing.primaryImageUrl && (
                                                        <Chip
                                                            label={listing.isAvailable ? 'Available' : 'Unavailable'}
                                                            size="small"
                                                            sx={{
                                                                bgcolor: alpha(listing.isAvailable ? '#10B981' : '#6B7280', 0.1),
                                                                color: listing.isAvailable ? '#10B981' : '#6B7280',
                                                                fontWeight: 600,
                                                                fontSize: '0.7rem',
                                                            }}
                                                        />
                                                    )}
                                                </Stack>

                                                {/* ── Description ── */}
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.6 }}
                                                >
                                                    {listing.description || 'No description provided'}
                                                </Typography>

                                                {/* ── Meta Row ── */}
                                                <Stack direction="row" spacing={2.5} flexWrap="wrap" useFlexGap>
                                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                                        <LocationOnIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                                                        <Typography variant="caption" color="text.secondary">{listing.city}, {listing.district}</Typography>
                                                    </Stack>
                                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                                        <HomeIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                                                        <Typography variant="caption" color="text.secondary">
                                                            {listing.availableRooms ?? 0}/{listing.totalRooms ?? 0} rooms
                                                        </Typography>
                                                    </Stack>
                                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                                        <PhoneIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                                                        <Typography variant="caption" color="text.secondary">{listing.contactPhone}</Typography>
                                                    </Stack>
                                                </Stack>

                                                {/* ── Amenities (up to 4) ── */}
                                                {listing.amenities && listing.amenities.length > 0 && (
                                                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                                                        {listing.amenities.slice(0, 4).map((amenity, i) => (
                                                            <Chip
                                                                key={i}
                                                                label={amenity}
                                                                size="small"
                                                                variant="outlined"
                                                                sx={{ fontSize: '0.65rem', height: 22, borderColor: 'divider' }}
                                                            />
                                                        ))}
                                                        {listing.amenities.length > 4 && (
                                                            <Chip
                                                                label={`+${listing.amenities.length - 4} more`}
                                                                size="small"
                                                                variant="outlined"
                                                                sx={{ fontSize: '0.65rem', height: 22, borderColor: 'divider', color: 'text.secondary' }}
                                                            />
                                                        )}
                                                    </Stack>
                                                )}

                                                <Divider />

                                                {/* ── Footer: Contact + Views ── */}
                                                <Stack direction="row" justifyContent="space-between" alignItems="center">
                                                    <Stack direction="row" alignItems="center" spacing={1.5}>
                                                        <Avatar
                                                            sx={{
                                                                width: 36,
                                                                height: 36,
                                                                bgcolor: alpha(theme.palette.primary.main, 0.15),
                                                                color: 'primary.main',
                                                                fontWeight: 700,
                                                                fontSize: '0.8rem',
                                                                border: '2px solid',
                                                                borderColor: alpha(theme.palette.primary.main, 0.2),
                                                            }}
                                                        >
                                                            {listing.contactName?.[0]?.toUpperCase() || 'H'}
                                                        </Avatar>
                                                        <Box>
                                                            <Typography variant="body2" fontWeight={600} sx={{ lineHeight: 1.2 }}>{listing.contactName}</Typography>
                                                            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>Contact</Typography>
                                                        </Box>
                                                    </Stack>
                                                    <Stack direction="row" spacing={1.5} alignItems="center">
                                                        {listing.viewCount > 0 && (
                                                            <Stack direction="row" spacing={0.25} alignItems="center">
                                                                <VisibilityIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                                                                <Typography variant="caption" color="text.secondary">{listing.viewCount}</Typography>
                                                            </Stack>
                                                        )}
                                                        {listing.images && listing.images.length > 0 && (
                                                            <Chip
                                                                label={`${listing.images.length} photo${listing.images.length > 1 ? 's' : ''}`}
                                                                size="small"
                                                                variant="outlined"
                                                                sx={{ fontSize: '0.65rem', height: 22, borderColor: 'divider' }}
                                                            />
                                                        )}
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
            )}

            {/* Detail Dialog */}
            <ListingDetailDialog
                open={detailOpen}
                onClose={() => { setDetailOpen(false); resetSelectedListing(); }}
                listing={selectedListing}
                isLoading={isListingLoading}
            />

            {/* Snackbar */}
            <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar({ ...snackbar, open: false })} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })} variant="filled" sx={{ borderRadius: 1 }}>{snackbar.message}</Alert>
            </Snackbar>
        </MotionBox>
    );
}
