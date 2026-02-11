'use client';

import React, { useState } from 'react';
import {
    Box,
    TextField,
    InputAdornment,
    Tabs,
    Tab,
    alpha,
    useTheme,
    Chip,
    Stack,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    IconButton,
    Collapse,
    Button,
    Badge,
    Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ListAltIcon from '@mui/icons-material/ListAlt';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import UpcomingIcon from '@mui/icons-material/Upcoming';
import TuneIcon from '@mui/icons-material/Tune';
import CloseIcon from '@mui/icons-material/Close';
import VideocamIcon from '@mui/icons-material/Videocam';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SchoolIcon from '@mui/icons-material/School';
import SignalCellularAltIcon from '@mui/icons-material/SignalCellularAlt';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import { KUPPI_SUBJECTS } from '@/lib/constants/kuppi.constants';

interface SessionFiltersProps {
    searchQuery: string;
    onSearchChange: (value: string) => void;
    activeTab: 'all' | 'saved' | 'upcoming';
    onTabChange: (tab: 'all' | 'saved' | 'upcoming') => void;
    savedCount: number;
    subjectFilter?: string;
    onSubjectChange?: (subject: string) => void;
    difficultyFilter?: string;
    onDifficultyChange?: (difficulty: string) => void;
    modeFilter?: 'all' | 'online' | 'offline';
    onModeChange?: (mode: 'all' | 'online' | 'offline') => void;
}

const DIFFICULTY_OPTIONS = [
    { value: 'all', label: 'All Levels', color: '#6B7280' },
    { value: 'beginner', label: 'Beginner', color: '#10B981' },
    { value: 'intermediate', label: 'Intermediate', color: '#F59E0B' },
    { value: 'advanced', label: 'Advanced', color: '#EF4444' },
];

export const SessionFilters: React.FC<SessionFiltersProps> = ({
    searchQuery,
    onSearchChange,
    activeTab,
    onTabChange,
    savedCount,
    subjectFilter = 'All Subjects',
    onSubjectChange,
    difficultyFilter = 'all',
    onDifficultyChange,
    modeFilter = 'all',
    onModeChange,
}) => {
    const theme = useTheme();
    const [showFilters, setShowFilters] = useState(false);

    const handleTabChange = (_: React.SyntheticEvent, newValue: string) => {
        onTabChange(newValue as 'all' | 'saved' | 'upcoming');
    };

    // Count active filters
    const activeFilterCount = [
        subjectFilter !== 'All Subjects',
        difficultyFilter !== 'all',
        modeFilter !== 'all',
    ].filter(Boolean).length;

    // Reset all filters
    const handleResetFilters = () => {
        onSubjectChange?.('All Subjects');
        onDifficultyChange?.('all');
        onModeChange?.('all');
        onSearchChange('');
    };

    const getDifficultyColor = (value: string) => {
        return DIFFICULTY_OPTIONS.find(d => d.value === value)?.color || '#6B7280';
    };

    return (
        <Box sx={{ mb: 4 }}>
            {/* Search Bar with Filter Toggle */}
            <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                <TextField
                    fullWidth
                    placeholder="Search sessions, subjects, or hosts..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    slotProps={{
                        input: {
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon sx={{ color: 'text.secondary' }} />
                                </InputAdornment>
                            ),
                            endAdornment: searchQuery && (
                                <InputAdornment position="end">
                                    <IconButton size="small" onClick={() => onSearchChange('')}>
                                        <CloseIcon sx={{ fontSize: 18 }} />
                                    </IconButton>
                                </InputAdornment>
                            ),
                        },
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 1,
                            bgcolor: 'background.paper',
                            '& fieldset': { borderColor: 'divider' },
                            '&:hover fieldset': { borderColor: 'primary.main' },
                            '&.Mui-focused fieldset': { borderColor: 'primary.main', borderWidth: 2 },
                        },
                    }}
                />
                <Badge badgeContent={activeFilterCount} color="primary">
                    <Button
                        variant={showFilters ? 'contained' : 'outlined'}
                        startIcon={<TuneIcon />}
                        onClick={() => setShowFilters(!showFilters)}
                        sx={{
                            borderRadius: 1,
                            textTransform: 'none',
                            fontWeight: 600,
                            minWidth: 120,
                            borderColor: showFilters ? 'primary.main' : 'divider',
                        }}
                    >
                        Filters
                    </Button>
                </Badge>
            </Stack>

            {/* Expandable Filter Panel */}
            <Collapse in={showFilters}>
                <Box
                    sx={{
                        p: 2.5,
                        mb: 2,
                        borderRadius: 1,
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                    }}
                >
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <TuneIcon sx={{ color: 'primary.main', fontSize: 20 }} />
                            <Typography variant="subtitle2" fontWeight={600}>Filter Options</Typography>
                        </Stack>
                        {activeFilterCount > 0 && (
                            <Button
                                size="small"
                                startIcon={<RestartAltIcon />}
                                onClick={handleResetFilters}
                                sx={{ textTransform: 'none', color: 'text.secondary' }}
                            >
                                Reset All
                            </Button>
                        )}
                    </Stack>

                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        {/* Subject Filter */}
                        <FormControl size="small" sx={{ minWidth: 200, flex: 1 }}>
                            <InputLabel>
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <SchoolIcon sx={{ fontSize: 16 }} />
                                    <span>Subject</span>
                                </Stack>
                            </InputLabel>
                            <Select
                                value={subjectFilter}
                                label="Subject"
                                onChange={(e) => onSubjectChange?.(e.target.value)}
                                sx={{ borderRadius: 1 }}
                            >
                                {KUPPI_SUBJECTS.map((subject) => (
                                    <MenuItem key={subject} value={subject}>
                                        {subject}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Difficulty Filter */}
                        <FormControl size="small" sx={{ minWidth: 180, flex: 1 }}>
                            <InputLabel>
                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                    <SignalCellularAltIcon sx={{ fontSize: 16 }} />
                                    <span>Difficulty</span>
                                </Stack>
                            </InputLabel>
                            <Select
                                value={difficultyFilter}
                                label="Difficulty"
                                onChange={(e) => onDifficultyChange?.(e.target.value)}
                                sx={{ borderRadius: 1 }}
                            >
                                {DIFFICULTY_OPTIONS.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        <Stack direction="row" alignItems="center" spacing={1}>
                                            <Box
                                                sx={{
                                                    width: 8,
                                                    height: 8,
                                                    borderRadius: 1,
                                                    bgcolor: option.color,
                                                }}
                                            />
                                            <span>{option.label}</span>
                                        </Stack>
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        {/* Mode Filter (Online/Offline) */}
                        <Box sx={{ flex: 1 }}>
                            <Stack direction="row" spacing={1}>
                                {[
                                    { value: 'all', label: 'All Modes', icon: null },
                                    { value: 'online', label: 'Online', icon: <VideocamIcon sx={{ fontSize: 16 }} /> },
                                    { value: 'offline', label: 'In-Person', icon: <LocationOnIcon sx={{ fontSize: 16 }} /> },
                                ].map((mode) => (
                                    <Chip
                                        key={mode.value}
                                        label={mode.label}
                                        icon={mode.icon || undefined}
                                        onClick={() => onModeChange?.(mode.value as 'all' | 'online' | 'offline')}
                                        variant={modeFilter === mode.value ? 'filled' : 'outlined'}
                                        sx={{
                                            flex: 1,
                                            borderRadius: 1,
                                            fontWeight: 600,
                                            bgcolor: modeFilter === mode.value ? alpha(theme.palette.primary.main, 0.15) : 'transparent',
                                            color: modeFilter === mode.value ? 'primary.main' : 'text.secondary',
                                            borderColor: modeFilter === mode.value ? 'primary.main' : 'divider',
                                            '&:hover': {
                                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                            },
                                            '& .MuiChip-icon': {
                                                color: modeFilter === mode.value ? 'primary.main' : 'text.secondary',
                                            },
                                        }}
                                    />
                                ))}
                            </Stack>
                        </Box>
                    </Stack>

                    {/* Active Filters Display */}
                    {activeFilterCount > 0 && (
                        <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
                                Active:
                            </Typography>
                            {subjectFilter !== 'All Subjects' && (
                                <Chip
                                    size="small"
                                    label={subjectFilter}
                                    onDelete={() => onSubjectChange?.('All Subjects')}
                                    sx={{
                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                        color: 'primary.main',
                                        '& .MuiChip-deleteIcon': { color: 'primary.main' },
                                    }}
                                />
                            )}
                            {difficultyFilter !== 'all' && (
                                <Chip
                                    size="small"
                                    label={DIFFICULTY_OPTIONS.find(d => d.value === difficultyFilter)?.label}
                                    onDelete={() => onDifficultyChange?.('all')}
                                    sx={{
                                        bgcolor: alpha(getDifficultyColor(difficultyFilter), 0.15),
                                        color: getDifficultyColor(difficultyFilter),
                                        '& .MuiChip-deleteIcon': { color: getDifficultyColor(difficultyFilter) },
                                    }}
                                />
                            )}
                            {modeFilter !== 'all' && (
                                <Chip
                                    size="small"
                                    label={modeFilter === 'online' ? 'Online' : 'In-Person'}
                                    icon={modeFilter === 'online' ? <VideocamIcon sx={{ fontSize: 14 }} /> : <LocationOnIcon sx={{ fontSize: 14 }} />}
                                    onDelete={() => onModeChange?.('all')}
                                    sx={{
                                        bgcolor: alpha(theme.palette.info.main, 0.1),
                                        color: 'info.main',
                                        '& .MuiChip-deleteIcon': { color: 'info.main' },
                                        '& .MuiChip-icon': { color: 'info.main' },
                                    }}
                                />
                            )}
                        </Stack>
                    )}
                </Box>
            </Collapse>

            {/* Quick Filter Tabs */}
            <Box
                sx={{
                    borderRadius: 1,
                    bgcolor: alpha(theme.palette.background.paper, 0.5),
                    border: '1px solid',
                    borderColor: 'divider',
                    p: 0.5,
                    display: 'inline-flex',
                }}
            >
                <Tabs
                    value={activeTab}
                    onChange={handleTabChange}
                    sx={{
                        minHeight: 40,
                        '& .MuiTabs-indicator': { display: 'none' },
                        '& .MuiTab-root': {
                            minHeight: 40,
                            minWidth: 'auto',
                            px: 2.5,
                            py: 1,
                            borderRadius: 1,
                            textTransform: 'none',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            color: 'text.secondary',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                color: 'text.primary',
                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                            },
                            '&.Mui-selected': {
                                color: 'primary.main',
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                            },
                        },
                    }}
                >
                    <Tab value="all" icon={<ListAltIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="All Sessions" />
                    <Tab value="saved" icon={<BookmarkIcon sx={{ fontSize: 18 }} />} iconPosition="start" label={`Saved (${savedCount})`} />
                    <Tab value="upcoming" icon={<UpcomingIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Upcoming" />
                </Tabs>
            </Box>
        </Box>
    );
};
