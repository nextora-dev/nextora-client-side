'use client';

import React from 'react';
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    Avatar,
    Stack,
    Chip,
    IconButton,
    Typography,
    CircularProgress,
    Paper,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import StarIcon from '@mui/icons-material/Star';
import { KuppiApplicationResponse, ApplicationStatus } from '@/features/kuppi';

interface Props {
    applications: KuppiApplicationResponse[];
    total: number;
    page: number;
    rowsPerPage: number;
    isLoading?: boolean;
    isTablet?: boolean;
    onOpenMenu: (e: React.MouseEvent<HTMLElement>, app: KuppiApplicationResponse) => void;
    onChangePage: (newPage: number) => void;
    onChangeRowsPerPage: (newSize: number) => void;
}

const APPLICATION_STATUS_COLORS: Record<ApplicationStatus, string> = {
    PENDING: '#F59E0B',
    UNDER_REVIEW: '#3B82F6',
    APPROVED: '#10B981',
    REJECTED: '#EF4444',
    CANCELLED: '#6B7280',
    EXPIRED: '#9CA3AF',
};

export default function ApplicationsTable({ applications, total, page, rowsPerPage, isLoading, isTablet, onOpenMenu, onChangePage, onChangeRowsPerPage }: Props) {
    if (isLoading) return (<Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>);
    if (!applications || applications.length === 0) return (
        <Box sx={{ textAlign: 'center', py: 6 }}>
            <Typography color="text.secondary">No applications found</Typography>
        </Box>
    );

    return (
        <Paper>
            <TableContainer>
                <Table size={isTablet ? 'small' : 'medium'}>
                    <TableHead>
                        <TableRow sx={{ bgcolor: (theme) => theme.palette.primary.main + '14' }}>
                            <TableCell sx={{ fontWeight: 600 }}>Student</TableCell>
                            <TableCell sx={{ fontWeight: 600, display: { xs: 'none', md: 'table-cell' } }}>Subjects</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>GPA</TableCell>
                            <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {applications.map((app) => {
                            const appColor = APPLICATION_STATUS_COLORS[(app.status as ApplicationStatus)] ?? '#6B7280';
                            return (
                                <TableRow key={app.id} hover>
                                    <TableCell>
                                        <Stack direction="row" alignItems="center" spacing={1.5}>
                                            <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>{app.studentName?.[0]}</Avatar>
                                            <Box>
                                                <Typography variant="body2" fontWeight={600}>{app.studentName}</Typography>
                                                <Typography variant="caption" color="text.secondary">{app.studentEmail}</Typography>
                                            </Box>
                                        </Stack>
                                    </TableCell>
                                    <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>
                                        <Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ gap: 0.5 }}>
                                            {app.subjectsToTeach?.slice(0, 2).map((s, i) => <Chip key={i} label={s} size="small" />)}
                                            {app.subjectsToTeach && app.subjectsToTeach.length > 2 && <Chip label={`+${app.subjectsToTeach.length - 2}`} size="small" />}
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <Stack direction="row" alignItems="center" spacing={0.5}>
                                            <StarIcon sx={{ fontSize: 16, color: '#F59E0B' }} />
                                            <Typography variant="body2" fontWeight={600}>{(app.currentGpa ?? 0).toFixed(2)}</Typography>
                                        </Stack>
                                    </TableCell>
                                    <TableCell>
                                        <Chip label={app.statusDisplayName} size="small" sx={{ bgcolor: appColor + '14', color: appColor }} />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton size="small" onClick={(e) => onOpenMenu(e, app)}><MoreVertIcon /></IconButton>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination component="div" count={total} page={page} onPageChange={(_, p) => onChangePage(p)} rowsPerPage={rowsPerPage} onRowsPerPageChange={(e) => onChangeRowsPerPage(parseInt((e.target as HTMLInputElement).value, 10))} rowsPerPageOptions={[5, 10, 25]} />
        </Paper>
    );
}

