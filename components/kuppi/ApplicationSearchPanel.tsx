'use client';

import React, { useState, useCallback } from 'react';
import {
    Stack,
    TextField,
    InputAdornment,
    IconButton,
    Typography,
    alpha,
    useTheme,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { useAppDispatch } from '@/store';
import {
    adminSearchApplicationsAsync,
    adminFetchApplications,
    KuppiApplicationResponse,
    ApplicationStatus,
} from '@/features/kuppi';

interface Props {
    /** Current page size for pagination */
    pageSize?: number;
    /** Current status filter — used when clearing search to restore filtered view */
    statusFilter?: ApplicationStatus | '';
    /** Optional callback with search results (for local override) */
    onResults?: (results: KuppiApplicationResponse[], total: number) => void;
    /** Optional callback when search is cleared */
    onClear?: () => void;
}

export default function ApplicationSearchPanel({
    pageSize = 10,
    statusFilter = '',
    onResults,
    onClear,
}: Props) {
    const theme = useTheme();
    const dispatch = useAppDispatch();
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = useCallback(async () => {
        const keyword = searchQuery.trim();
        if (!keyword) return;

        try {
            const result = await dispatch(
                adminSearchApplicationsAsync({ keyword, page: 0, size: pageSize })
            ).unwrap();

            if (onResults) {
                onResults(result.data.content, result.data.totalElements);
            }
        } catch {
            // Error is handled by Redux slice
        }
    }, [dispatch, searchQuery, pageSize, onResults]);

    const handleClear = useCallback(() => {
        setSearchQuery('');
        if (onClear) {
            onClear();
        } else {
            // Restore the original list
            dispatch(
                adminFetchApplications({
                    page: 0,
                    size: pageSize,
                    status: statusFilter || undefined,
                })
            );
        }
    }, [dispatch, pageSize, statusFilter, onClear]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <Stack spacing={1}>
            <TextField
                placeholder="Search by student name, email, or student ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                size="small"
                fullWidth
                sx={{
                    '& .MuiOutlinedInput-root': {
                        borderRadius: 1,
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'primary.main',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderWidth: 1,
                        },
                    },
                }}
                slotProps={{
                    input: {
                        startAdornment: (
                            <InputAdornment position="start">
                                <IconButton size="small" onClick={handleSearch}>
                                    <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                                </IconButton>
                            </InputAdornment>
                        ),
                        endAdornment: searchQuery ? (
                            <InputAdornment position="end">
                                <IconButton size="small" onClick={handleClear} edge="end">
                                    <CloseIcon fontSize="small" />
                                </IconButton>
                            </InputAdornment>
                        ) : undefined,
                    },
                }}
            />
            {searchQuery.trim() && (
                <Typography variant="caption" color="text.secondary">
                    Press Enter to search by name, email, or student ID
                </Typography>
            )}
        </Stack>
    );
}

