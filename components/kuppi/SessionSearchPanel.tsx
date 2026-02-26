import React, { useState } from 'react';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { useAppDispatch } from '@/store';
import { searchSessionsBySubjectAsync, searchSessionsByHostAsync, searchSessionsByDateRangeAsync, fetchSessions } from '@/features/kuppi/kuppiSlice';

type Props = {
    onResults?: (results: any[]) => void;
};

export default function SessionSearchPanel({ onResults }: Props) {
    const dispatch = useAppDispatch();
    // unified search input (searches both subject and host)
    const [searchQuery, setSearchQuery] = useState('');
    // date range inputs
    const [from, setFrom] = useState('');
    const [to, setTo] = useState('');

    const unwrapResults = (res: any): any[] => {
        const payload = res?.payload ?? res;
        if (!payload) return [];
        if (Array.isArray(payload)) return payload;
        if (payload?.data?.content) return payload.data.content;
        if (payload?.data && Array.isArray(payload.data)) return payload.data;
        if (payload?.content && Array.isArray(payload.content)) return payload.content;
        return [];
    };

    const handleSearch = async () => {
        if (!searchQuery || searchQuery.trim() === '') return;
        const q = searchQuery.trim();
        // run both searches in parallel
        const [subjRes, hostRes] = await Promise.allSettled([
            dispatch(searchSessionsBySubjectAsync({ subject: q } as any)),
            dispatch(searchSessionsByHostAsync({ hostName: q } as any)),
        ]);

        const subj = subjRes.status === 'fulfilled' ? unwrapResults(subjRes.value) : [];
        const host = hostRes.status === 'fulfilled' ? unwrapResults(hostRes.value) : [];

        const combined = [...subj, ...host];
        const seen = new Set<string | number>();
        const unique = combined.filter((item) => {
            const id = item?.id ?? item?.sessionId ?? JSON.stringify(item);
            if (seen.has(id)) return false;
            seen.add(id);
            return true;
        });

        if (onResults) onResults(unique);
    };

    const handleClear = async () => {
        setSearchQuery('');
        const res: any = await dispatch(fetchSessions({ page: 0, size: 10 } as any));
        const payload = res?.payload ?? res;
        const data = payload?.data?.content || payload?.data || [];
        if (onResults) onResults(Array.isArray(data) ? data : []);
    };

    const handleDateSearch = async () => {
        if (!from || !to) return;
        const res: any = await dispatch(searchSessionsByDateRangeAsync({ startDate: new Date(from).toISOString(), endDate: new Date(to).toISOString() } as any));
        const payload = res?.payload ?? res;
        const data = payload?.data?.content || payload?.data || [];
        if (onResults) onResults(Array.isArray(data) ? data : []);
    };

    return (
        <Stack spacing={2}>
            {/* Search by Subject/Host */}
            <TextField
                placeholder="Search by subject or host name... (Press Enter to search)"
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
                                <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
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

            {/* Date range search */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
                <TextField
                    label="From Date"
                    type="date"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleDateSearch()}
                    size="small"
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={{ flexGrow: 1 }}
                />
                <TextField
                    label="To Date"
                    type="date"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleDateSearch()}
                    size="small"
                    slotProps={{ inputLabel: { shrink: true } }}
                    sx={{ flexGrow: 1 }}
                />
                <Button
                    variant="outlined"
                    onClick={handleDateSearch}
                    disabled={!from || !to}
                    sx={{ minWidth: 100 }}
                >
                    Search Date
                </Button>
            </Stack>
        </Stack>
    );
}
