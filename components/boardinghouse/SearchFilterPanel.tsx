import React from 'react';
import {
    Card, CardContent, Stack, TextField, FormControl, InputLabel, Select, MenuItem,
    Button, InputAdornment, alpha, useTheme, Grid,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import type { GenderPreference } from '@/features/boardinghouse/types';

type Props = {
    searchQuery: string;
    onSearchChange: (q: string) => void;
    city: string;
    onCityChange: (c: string) => void;
    district: string;
    onDistrictChange: (d: string) => void;
    genderPreference: GenderPreference | '';
    onGenderChange: (g: GenderPreference | '') => void;
    minPrice: string;
    onMinPriceChange: (p: string) => void;
    maxPrice: string;
    onMaxPriceChange: (p: string) => void;
    onFilter: () => void;
    onClear: () => void;
    showAdvanced?: boolean;
};

export default function SearchFilterPanel({
    searchQuery, onSearchChange,
    city, onCityChange,
    district, onDistrictChange,
    genderPreference, onGenderChange,
    minPrice, onMinPriceChange,
    maxPrice, onMaxPriceChange,
    onFilter, onClear,
    showAdvanced = true,
}: Props) {
    const theme = useTheme();

    return (
        <Card elevation={0} sx={{ mb: 3, borderRadius: 1, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <CardContent sx={{ p: 2 }}>
                <Stack spacing={2}>
                    <TextField
                        fullWidth
                        size="small"
                        placeholder="Search by title, description, or city..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        InputProps={{
                            startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 20, color: 'text.secondary' }} /></InputAdornment>,
                        }}
                    />
                    {showAdvanced && (
                        <Grid container spacing={2}>
                            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                                <TextField size="small" fullWidth label="City" value={city} onChange={(e) => onCityChange(e.target.value)} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                                <TextField size="small" fullWidth label="District" value={district} onChange={(e) => onDistrictChange(e.target.value)} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
                                <FormControl size="small" fullWidth>
                                    <InputLabel>Gender</InputLabel>
                                    <Select value={genderPreference} label="Gender" onChange={(e) => onGenderChange(e.target.value as GenderPreference | '')}>
                                        <MenuItem value="">All</MenuItem>
                                        <MenuItem value="ANY">Any Gender</MenuItem>
                                        <MenuItem value="MALE">Male Only</MenuItem>
                                        <MenuItem value="FEMALE">Female Only</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3, md: 1.5 }}>
                                <TextField size="small" fullWidth label="Min Price" type="number" value={minPrice} onChange={(e) => onMinPriceChange(e.target.value)} />
                            </Grid>
                            <Grid size={{ xs: 6, sm: 3, md: 1.5 }}>
                                <TextField size="small" fullWidth label="Max Price" type="number" value={maxPrice} onChange={(e) => onMaxPriceChange(e.target.value)} />
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                                <Stack direction="row" spacing={1}>
                                    <Button variant="contained" size="small" startIcon={<FilterListIcon />} onClick={onFilter}>Filter</Button>
                                    <Button variant="outlined" size="small" startIcon={<ClearIcon />} onClick={onClear}>Clear</Button>
                                </Stack>
                            </Grid>
                        </Grid>
                    )}
                </Stack>
            </CardContent>
        </Card>
    );
}
