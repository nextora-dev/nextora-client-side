'use client';

import React from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    Typography, Stack, Chip, Box, alpha, useTheme, IconButton,
    CircularProgress, Avatar, Card, CardContent, LinearProgress,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CategoryIcon from '@mui/icons-material/Category';
import type { MatchResponse } from '@/features/lostfound/types';

interface MatchesDialogProps {
    open: boolean;
    onClose: () => void;
    matches: MatchResponse[];
    isLoading: boolean;
    itemTitle: string;
}

export default function MatchesDialog({ open, onClose, matches, isLoading, itemTitle }: MatchesDialogProps) {
    const theme = useTheme();

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Box>
                    <Typography variant="h6" component="span" fontWeight={700}>Potential Matches</Typography>
                    <Typography variant="caption" color="text.secondary">for &quot;{itemTitle}&quot;</Typography>
                </Box>
                <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent dividers>
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
                ) : matches.length === 0 ? (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                        <Typography variant="body2" color="text.secondary">No potential matches found yet.</Typography>
                    </Box>
                ) : (
                    <Stack spacing={2}>
                        {matches.map((match) => (
                            <Card key={match.id} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                    <Stack spacing={1.5}>
                                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                            <Typography variant="subtitle2" fontWeight={700}>{match.title}</Typography>
                                            <Chip
                                                label={`${Math.round(match.matchScore * 100)}% match`}
                                                size="small"
                                                sx={{
                                                    bgcolor: alpha(match.matchScore > 0.7 ? '#10B981' : match.matchScore > 0.4 ? '#F59E0B' : '#6B7280', 0.1),
                                                    color: match.matchScore > 0.7 ? '#10B981' : match.matchScore > 0.4 ? '#F59E0B' : '#6B7280',
                                                    fontWeight: 700, fontSize: '0.7rem',
                                                }}
                                            />
                                        </Stack>
                                        <LinearProgress
                                            variant="determinate" value={match.matchScore * 100}
                                            sx={{
                                                height: 4, borderRadius: 2,
                                                bgcolor: alpha(theme.palette.primary.main, 0.08),
                                                '& .MuiLinearProgress-bar': {
                                                    bgcolor: match.matchScore > 0.7 ? '#10B981' : match.matchScore > 0.4 ? '#F59E0B' : '#6B7280',
                                                },
                                            }}
                                        />
                                        <Typography variant="body2" color="text.secondary" sx={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {match.description}
                                        </Typography>
                                        <Stack direction="row" spacing={2}>
                                            <Stack direction="row" spacing={0.5} alignItems="center">
                                                <CategoryIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                                                <Typography variant="caption" color="text.secondary">{match.category}</Typography>
                                            </Stack>
                                            <Stack direction="row" spacing={0.5} alignItems="center">
                                                <LocationOnIcon sx={{ fontSize: 14, color: 'text.disabled' }} />
                                                <Typography variant="caption" color="text.secondary">{match.location}</Typography>
                                            </Stack>
                                        </Stack>
                                    </Stack>
                                </CardContent>
                            </Card>
                        ))}
                    </Stack>
                )}
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} sx={{ borderRadius: 1, textTransform: 'none' }}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}
