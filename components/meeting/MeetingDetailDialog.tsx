'use client';

import React from 'react';
import {
    Dialog, DialogTitle, DialogContent, DialogActions, Button,
    Typography, Stack, Chip, Box, alpha, useTheme, IconButton,
    Divider, CircularProgress, Rating,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import VideocamIcon from '@mui/icons-material/Videocam';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import NotesIcon from '@mui/icons-material/Notes';
import type { MeetingResponse } from '@/features/meeting/types';

interface MeetingDetailDialogProps {
    open: boolean;
    onClose: () => void;
    meeting: MeetingResponse | null;
    isLoading: boolean;
}

const STATUS_COLORS: Record<string, string> = {
    PENDING: '#F59E0B',
    ACCEPTED: '#3B82F6',
    REJECTED: '#EF4444',
    RESCHEDULED: '#8B5CF6',
    CANCELLED: '#6B7280',
    IN_PROGRESS: '#10B981',
    COMPLETED: '#059669',
    NO_SHOW: '#DC2626',
};

const formatDateTime = (value: string | null) =>
    value ? new Date(value).toLocaleString() : 'N/A';

export default function MeetingDetailDialog({ open, onClose, meeting, isLoading }: MeetingDetailDialogProps) {
    const theme = useTheme();

    if (!meeting && !isLoading) return null;

    const statusColor = meeting ? (STATUS_COLORS[meeting.status] || '#6B7280') : '#6B7280';

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2, overflow: 'hidden' } }}>
            <Box sx={{ height: 4, background: `linear-gradient(90deg, ${statusColor}, ${alpha(statusColor, 0.4)})` }} />
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
                <Stack direction="row" spacing={1} alignItems="center">
                    {meeting && (
                        <Chip
                            label={meeting.status.replace('_', ' ')}
                            size="small"
                            sx={{ bgcolor: alpha(statusColor, 0.1), color: statusColor, fontWeight: 700, fontSize: '0.7rem' }}
                        />
                    )}
                    <Typography variant="h6" component="span" fontWeight={700} noWrap sx={{ maxWidth: 300 }}>
                        {meeting?.subject}
                    </Typography>
                </Stack>
                <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
            </DialogTitle>
            <DialogContent dividers>
                {isLoading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
                ) : meeting ? (
                    <Stack spacing={2.5}>
                        {/* Meeting Type & Priority */}
                        <Stack direction="row" spacing={1}>
                            <Chip label={meeting.meetingType.replace(/_/g, ' ')} size="small" variant="outlined" sx={{ fontWeight: 600, fontSize: '0.7rem' }} />
                            <Chip
                                icon={<PriorityHighIcon sx={{ fontSize: 14 }} />}
                                label={`Priority ${meeting.priority}`}
                                size="small"
                                sx={{ fontWeight: 600, fontSize: '0.7rem', bgcolor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.dark }}
                            />
                            <Chip
                                label={meeting.isOnline ? 'Online' : 'In-Person'}
                                size="small"
                                sx={{ fontWeight: 600, fontSize: '0.7rem', bgcolor: alpha(meeting.isOnline ? '#3B82F6' : '#10B981', 0.1), color: meeting.isOnline ? '#3B82F6' : '#10B981' }}
                            />
                        </Stack>

                        {/* Description */}
                        {meeting.description && (
                            <Box>
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>Description</Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                                    {meeting.description}
                                </Typography>
                            </Box>
                        )}

                        <Divider />

                        {/* Participants */}
                        <Box>
                            <Typography variant="subtitle2" fontWeight={600} gutterBottom>Participants</Typography>
                            <Stack spacing={1.5}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <SchoolIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                                    <Typography variant="body2">
                                        <strong>Student:</strong> {meeting.studentName} ({meeting.studentEmail})
                                    </Typography>
                                </Stack>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <PersonIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                                    <Typography variant="body2">
                                        <strong>Lecturer:</strong> {meeting.lecturerName} ({meeting.lecturerEmail})
                                    </Typography>
                                </Stack>
                            </Stack>
                        </Box>

                        <Divider />

                        {/* Schedule */}
                        <Box>
                            <Typography variant="subtitle2" fontWeight={600} gutterBottom>Schedule</Typography>
                            <Stack spacing={1.5}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <CalendarTodayIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                                    <Typography variant="body2">
                                        <strong>Preferred:</strong> {formatDateTime(meeting.preferredDateTime)}
                                    </Typography>
                                </Stack>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <CalendarTodayIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                                    <Typography variant="body2">
                                        <strong>Scheduled Start:</strong> {formatDateTime(meeting.scheduledStartTime)}
                                    </Typography>
                                </Stack>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <CalendarTodayIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                                    <Typography variant="body2">
                                        <strong>Scheduled End:</strong> {formatDateTime(meeting.scheduledEndTime)}
                                    </Typography>
                                </Stack>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <CalendarTodayIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                                    <Typography variant="body2">
                                        <strong>Actual Start:</strong> {formatDateTime(meeting.actualStartTime)}
                                    </Typography>
                                </Stack>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <CalendarTodayIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                                    <Typography variant="body2">
                                        <strong>Actual End:</strong> {formatDateTime(meeting.actualEndTime)}
                                    </Typography>
                                </Stack>
                            </Stack>
                        </Box>

                        <Divider />

                        {/* Location / Online Details */}
                        <Box>
                            <Typography variant="subtitle2" fontWeight={600} gutterBottom>Meeting Details</Typography>
                            <Stack spacing={1.5}>
                                {meeting.isOnline ? (
                                    <>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <VideocamIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                                            <Typography variant="body2">
                                                <strong>Platform:</strong> {meeting.meetingPlatform || 'N/A'}
                                            </Typography>
                                        </Stack>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <VideocamIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                                            <Typography variant="body2">
                                                <strong>Link:</strong>{' '}
                                                {meeting.meetingLink ? (
                                                    <a href={meeting.meetingLink} target="_blank" rel="noopener noreferrer">{meeting.meetingLink}</a>
                                                ) : 'N/A'}
                                            </Typography>
                                        </Stack>
                                    </>
                                ) : (
                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <LocationOnIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
                                        <Typography variant="body2">
                                            <strong>Location:</strong> {meeting.location || 'N/A'}
                                        </Typography>
                                    </Stack>
                                )}
                            </Stack>
                        </Box>

                        {/* Response / Reasons */}
                        {(meeting.responseMessage || meeting.cancellationReason || meeting.rejectionReason) && (
                            <>
                                <Divider />
                                <Box>
                                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>Messages</Typography>
                                    <Stack spacing={1.5}>
                                        {meeting.responseMessage && (
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">Response Message</Typography>
                                                <Typography variant="body2">{meeting.responseMessage}</Typography>
                                            </Box>
                                        )}
                                        {meeting.cancellationReason && (
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">Cancellation Reason</Typography>
                                                <Typography variant="body2" color="error.main">{meeting.cancellationReason}</Typography>
                                            </Box>
                                        )}
                                        {meeting.rejectionReason && (
                                            <Box>
                                                <Typography variant="caption" color="text.secondary">Rejection Reason</Typography>
                                                <Typography variant="body2" color="error.main">{meeting.rejectionReason}</Typography>
                                            </Box>
                                        )}
                                    </Stack>
                                </Box>
                            </>
                        )}

                        {/* Notes & Follow-up */}
                        {(meeting.notes || meeting.followUpRequired) && (
                            <>
                                <Divider />
                                <Box>
                                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>Notes & Follow-up</Typography>
                                    <Stack spacing={1.5}>
                                        {meeting.notes && (
                                            <Stack direction="row" spacing={1} alignItems="flex-start">
                                                <NotesIcon sx={{ fontSize: 18, color: 'text.disabled', mt: 0.3 }} />
                                                <Typography variant="body2">{meeting.notes}</Typography>
                                            </Stack>
                                        )}
                                        {meeting.followUpRequired && (
                                            <Box>
                                                <Chip label="Follow-up Required" size="small" color="warning" sx={{ fontWeight: 600, fontSize: '0.7rem', mb: 0.5 }} />
                                                {meeting.followUpNotes && (
                                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                                                        {meeting.followUpNotes}
                                                    </Typography>
                                                )}
                                            </Box>
                                        )}
                                    </Stack>
                                </Box>
                            </>
                        )}

                        {/* Feedback & Rating */}
                        {(meeting.rating !== null || meeting.feedback) && (
                            <>
                                <Divider />
                                <Box>
                                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>Feedback</Typography>
                                    <Stack spacing={1}>
                                        {meeting.rating !== null && (
                                            <Stack direction="row" spacing={1} alignItems="center">
                                                <Rating value={meeting.rating} readOnly size="small" />
                                                <Typography variant="body2" color="text.secondary">({meeting.rating}/5)</Typography>
                                            </Stack>
                                        )}
                                        {meeting.feedback && (
                                            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
                                                {meeting.feedback}
                                            </Typography>
                                        )}
                                    </Stack>
                                </Box>
                            </>
                        )}

                        <Divider />

                        {/* Timestamps */}
                        <Stack direction="row" justifyContent="space-between">
                            <Typography variant="caption" color="text.secondary">
                                Created: {formatDateTime(meeting.createdAt)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Updated: {formatDateTime(meeting.updatedAt)}
                            </Typography>
                        </Stack>
                    </Stack>
                ) : null}
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
                <Button onClick={onClose} sx={{ borderRadius: 1, textTransform: 'none' }}>Close</Button>
            </DialogActions>
        </Dialog>
    );
}