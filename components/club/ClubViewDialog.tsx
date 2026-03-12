'use client';

import React from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Avatar,
    Stack,
    Divider,
    CircularProgress,
    Box,
    Chip,
    alpha,
    useTheme,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CampaignIcon from '@mui/icons-material/Campaign';
import HowToVoteIcon from '@mui/icons-material/HowToVote';
import type { ClubResponse, MembershipResponse, AnnouncementResponse, ElectionResponse } from '@/features/club/types';

interface Props {
    open: boolean;
    mode: 'club' | 'membership' | 'announcement' | 'election' | null;
    club?: ClubResponse | null;
    membership?: MembershipResponse | null;
    announcement?: AnnouncementResponse | null;
    election?: ElectionResponse | null;
    isLoading?: boolean;
    onClose: () => void;
    renderFooter?: React.ReactNode;
}

const POSITION_COLORS: Record<string, string> = {
    PRESIDENT: '#F59E0B',
    VICE_PRESIDENT: '#8B5CF6',
    SECRETARY: '#3B82F6',
    TREASURER: '#10B981',
    TOP_BOARD_MEMBER: '#EC4899',
    COMMITTEE_MEMBER: '#6366F1',
    MEMBER: '#6B7280',
};

const STATUS_COLORS: Record<string, 'success' | 'warning' | 'error' | 'default' | 'info'> = {
    ACTIVE: 'success',
    PENDING: 'warning',
    SUSPENDED: 'error',
    REJECTED: 'error',
    LEFT: 'default',
};

export function ClubViewDialog({
    open,
    mode,
    club,
    membership,
    announcement,
    election,
    isLoading,
    onClose,
    renderFooter,
}: Props) {
    const theme = useTheme();

    const titleMap: Record<string, string> = {
        club: 'Club Details',
        membership: 'Membership Details',
        announcement: 'Announcement Details',
        election: 'Election Details',
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight={600}>
                        {mode ? titleMap[mode] : 'Details'}
                    </Typography>
                    <Button onClick={onClose} size="small">
                        <CloseIcon />
                    </Button>
                </Stack>
            </DialogTitle>
            <DialogContent dividers>
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : mode === 'club' && club ? (
                    <Stack spacing={3}>
                        {/* Club header */}
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar
                                src={club.logoUrl || undefined}
                                sx={{
                                    width: 64,
                                    height: 64,
                                    bgcolor: alpha(theme.palette.primary.main, 0.15),
                                    color: 'primary.main',
                                    fontSize: '1.5rem',
                                    fontWeight: 700,
                                }}
                            >
                                {club.name.charAt(0).toUpperCase()}
                            </Avatar>
                            <Box>
                                <Typography variant="h6" fontWeight={600}>
                                    {club.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {club.clubCode}
                                </Typography>
                            </Box>
                        </Stack>
                        <Divider />
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 2 }}>
                            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                                <Typography variant="caption" color="text.secondary">Faculty</Typography>
                                <Typography variant="body1" fontWeight={600}>{club.faculty}</Typography>
                            </Box>
                            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                                <Typography variant="caption" color="text.secondary">Members</Typography>
                                <Typography variant="body1" fontWeight={600}>{club.memberCount || 0}</Typography>
                            </Box>
                            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                                <Typography variant="caption" color="text.secondary">Registration</Typography>
                                <Chip
                                    label={club.registrationOpen ? 'Open' : 'Closed'}
                                    size="small"
                                    color={club.registrationOpen ? 'success' : 'default'}
                                    sx={{ mt: 0.5 }}
                                />
                            </Box>
                            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                                <Typography variant="caption" color="text.secondary">Created</Typography>
                                <Typography variant="body1">
                                    {new Date(club.createdAt).toLocaleDateString()}
                                </Typography>
                            </Box>
                        </Box>
                        {club.description && (
                            <Box>
                                <Typography variant="caption" color="text.secondary">Description</Typography>
                                <Typography variant="body2" sx={{ mt: 0.5, lineHeight: 1.6 }}>
                                    {club.description}
                                </Typography>
                            </Box>
                        )}
                    </Stack>
                ) : mode === 'membership' && membership ? (
                    <Stack spacing={3}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar
                                sx={{
                                    width: 64,
                                    height: 64,
                                    bgcolor: alpha((membership.position && POSITION_COLORS[membership.position]) || '#6B7280', 0.15),
                                    color: (membership.position && POSITION_COLORS[membership.position]) || '#6B7280',
                                    fontWeight: 700,
                                }}
                            >
                                {membership.memberName?.charAt(0) || membership.userName?.charAt(0) || 'U'}
                            </Avatar>
                            <Box>
                                <Typography variant="h6" fontWeight={600}>{membership.memberName || membership.userName}</Typography>
                                <Typography variant="body2" color="text.secondary">{membership.memberEmail || membership.userEmail}</Typography>
                            </Box>
                        </Stack>
                        <Divider />
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 2 }}>
                            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                                <Typography variant="caption" color="text.secondary">Club</Typography>
                                <Typography variant="body1" fontWeight={600}>{membership.clubName}</Typography>
                            </Box>
                            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                                <Typography variant="caption" color="text.secondary">Position</Typography>
                                <Chip
                                    label={membership.position?.replace(/_/g, ' ') || 'Member'}
                                    size="small"
                                    sx={{
                                        mt: 0.5,
                                        fontWeight: 600,
                                        bgcolor: alpha((membership.position && POSITION_COLORS[membership.position]) || '#6B7280', 0.1),
                                        color: (membership.position && POSITION_COLORS[membership.position]) || '#6B7280',
                                    }}
                                />
                            </Box>
                            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                                <Typography variant="caption" color="text.secondary">Status</Typography>
                                <Chip
                                    label={membership.status}
                                    size="small"
                                    color={STATUS_COLORS[membership.status] || 'default'}
                                    sx={{ mt: 0.5 }}
                                />
                            </Box>
                            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                                <Typography variant="caption" color="text.secondary">Joined</Typography>
                                <Typography variant="body1">
                                    {new Date(membership.joinDate || membership.joinedAt || membership.createdAt).toLocaleDateString()}
                                </Typography>
                            </Box>
                        </Box>
                        {membership.remarks && (
                            <Box>
                                <Typography variant="caption" color="text.secondary">Remarks</Typography>
                                <Typography variant="body2">{membership.remarks}</Typography>
                            </Box>
                        )}
                    </Stack>
                ) : mode === 'announcement' && announcement ? (
                    <Stack spacing={3}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Box
                                sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 2,
                                    bgcolor: alpha(theme.palette.info.main, 0.1),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <CampaignIcon sx={{ color: 'info.main', fontSize: 24 }} />
                            </Box>
                            <Box>
                                <Typography variant="h6" fontWeight={600}>{announcement.title}</Typography>
                                <Typography variant="body2" color="text.secondary">{announcement.clubName}</Typography>
                            </Box>
                        </Stack>
                        <Divider />
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 2 }}>
                            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                                <Typography variant="caption" color="text.secondary">Author</Typography>
                                <Typography variant="body1" fontWeight={600}>{announcement.authorName}</Typography>
                            </Box>
                            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                                <Typography variant="caption" color="text.secondary">Visibility</Typography>
                                <Chip
                                    label={announcement.isMembersOnly ? 'Members Only' : 'Public'}
                                    size="small"
                                    color={announcement.isMembersOnly ? 'info' : 'success'}
                                    sx={{ mt: 0.5 }}
                                />
                            </Box>
                            <Box sx={{ gridColumn: { xs: 'span 6', md: 'span 3' } }}>
                                <Typography variant="caption" color="text.secondary">Pinned</Typography>
                                <Chip
                                    label={announcement.isPinned ? 'Yes' : 'No'}
                                    size="small"
                                    color={announcement.isPinned ? 'warning' : 'default'}
                                    sx={{ mt: 0.5 }}
                                />
                            </Box>
                            <Box sx={{ gridColumn: { xs: 'span 6', md: 'span 3' } }}>
                                <Typography variant="caption" color="text.secondary">Created</Typography>
                                <Typography variant="body1">
                                    {new Date(announcement.createdAt).toLocaleString()}
                                </Typography>
                            </Box>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary">Content</Typography>
                            <Typography variant="body2" sx={{ mt: 0.5, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
                                {announcement.content}
                            </Typography>
                        </Box>
                        {(announcement.imageUrl || announcement.attachmentUrl) && (
                            <Box>
                                <Typography variant="caption" color="text.secondary">Attachment</Typography>
                                <Box
                                    component="img"
                                    src={announcement.imageUrl || announcement.attachmentUrl || ''}
                                    alt=""
                                    sx={{
                                        mt: 1,
                                        width: '100%',
                                        maxHeight: 300,
                                        objectFit: 'cover',
                                        borderRadius: 2,
                                        border: `1px solid ${theme.palette.divider}`,
                                    }}
                                />
                            </Box>
                        )}
                    </Stack>
                ) : mode === 'election' && election ? (
                    <Stack spacing={3}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Box
                                sx={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 2,
                                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <HowToVoteIcon sx={{ color: 'secondary.main', fontSize: 24 }} />
                            </Box>
                            <Box>
                                <Typography variant="h6" fontWeight={600}>{election.title}</Typography>
                                <Typography variant="body2" color="text.secondary">{election.clubName}</Typography>
                            </Box>
                        </Stack>
                        <Divider />
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 2 }}>
                            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                                <Typography variant="caption" color="text.secondary">Status</Typography>
                                <Chip label={(election.status || 'UNKNOWN').replace(/_/g, ' ')} size="small" sx={{ mt: 0.5 }} />
                            </Box>
                            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                                <Typography variant="caption" color="text.secondary">Position</Typography>
                                <Typography variant="body1" fontWeight={600}>
                                    {election.candidates?.[0]?.position?.replace(/_/g, ' ') || '—'}
                                </Typography>
                            </Box>
                            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                                <Typography variant="caption" color="text.secondary">Voting Start</Typography>
                                <Typography variant="body1">
                                    {new Date(election.votingStartDate).toLocaleString()}
                                </Typography>
                            </Box>
                            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                                <Typography variant="caption" color="text.secondary">Voting End</Typography>
                                <Typography variant="body1">
                                    {new Date(election.votingEndDate).toLocaleString()}
                                </Typography>
                            </Box>
                            {election.candidates && election.candidates.length > 0 && (
                                <Box sx={{ gridColumn: 'span 12' }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Candidates ({election.candidates.length})
                                    </Typography>
                                    <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 0.5, gap: 0.5 }}>
                                        {election.candidates.map((c) => (
                                            <Chip key={c.id} label={c.userName} size="small" />
                                        ))}
                                    </Stack>
                                </Box>
                            )}
                        </Box>
                        {election.description && (
                            <Box>
                                <Typography variant="caption" color="text.secondary">Description</Typography>
                                <Typography variant="body2" sx={{ mt: 0.5, lineHeight: 1.6 }}>
                                    {election.description}
                                </Typography>
                            </Box>
                        )}
                    </Stack>
                ) : (
                    <Box sx={{ textAlign: 'center', py: 6 }}>
                        <Typography color="text.secondary">Details not available</Typography>
                    </Box>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose}>Close</Button>
                {renderFooter}
            </DialogActions>
        </Dialog>
    );
}

