'use client';

import React, { useState } from 'react';
import {
    TextField,
    InputAdornment,
    IconButton,
    Stack,
    alpha,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';

interface ClubSearchPanelProps {
    placeholder?: string;
    onSearch: (query: string) => void;
    onClear: () => void;
}

export function ClubSearchPanel({
    placeholder = 'Search clubs by name, faculty, or description... (Press Enter)',
    onSearch,
    onClear,
}: ClubSearchPanelProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearch = () => {
        if (searchQuery.trim()) {
            onSearch(searchQuery.trim());
        }
    };

    const handleClear = () => {
        setSearchQuery('');
        onClear();
    };

    return (
        <Stack spacing={2}>
            <TextField
                placeholder={placeholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                size="small"
                fullWidth
                sx={{
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
        </Stack>
    );
}

