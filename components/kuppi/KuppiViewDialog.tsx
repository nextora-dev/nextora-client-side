'use client';

import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, Avatar, Stack, Divider, CircularProgress, Box, Chip } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

import { KuppiApplicationResponse, KuppiSessionResponse, KuppiNoteResponse } from '@/features/kuppi';

interface Props {
    open: boolean;
    mode: 'application' | 'session' | 'note' | null;
    application?: KuppiApplicationResponse | null;
    session?: KuppiSessionResponse | null;
    note?: KuppiNoteResponse | null;
    isApplicationLoading?: boolean;
    isSessionLoading?: boolean;
    isNoteLoading?: boolean;
    onClose: () => void;
    onOpenSessionById?: (sessionId: number | string, prevNote?: KuppiNoteResponse | null) => void;
    renderFooter?: React.ReactNode;
}

export default function KuppiViewDialog({ open, mode, application, session, note, isApplicationLoading, isSessionLoading, isNoteLoading, onClose, onOpenSessionById, renderFooter }: Props) {
    const loading = (mode === 'application' && isApplicationLoading) || (mode === 'session' && isSessionLoading) || (mode === 'note' && isNoteLoading);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" fontWeight={600}>{mode === 'application' ? 'Application Details' : mode === 'session' ? 'Session Details' : mode === 'note' ? 'Note Details' : 'Details'}</Typography>
                    <Button onClick={onClose} size="small"><CloseIcon /></Button>
                </Stack>
            </DialogTitle>
            <DialogContent dividers>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
                ) : mode === 'application' && application ? (
                    <Stack spacing={3}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main' }}>{application.studentName?.[0]}</Avatar>
                            <Box>
                                <Typography variant="h6" fontWeight={600}>{application.studentName}</Typography>
                                <Typography variant="body2" color="text.secondary">{application.studentEmail}</Typography>
                            </Box>
                        </Stack>
                        <Divider />
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 2 }}>
                            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                                <Typography variant="caption" color="text.secondary">GPA</Typography>
                                <Typography variant="body1" fontWeight={600}>{(application.currentGpa ?? 0).toFixed(2)}</Typography>
                            </Box>
                            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                                <Typography variant="caption" color="text.secondary">Semester</Typography>
                                <Typography variant="body1">{application.currentSemester}</Typography>
                            </Box>
                            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                                <Typography variant="caption" color="text.secondary">Level</Typography>
                                <Typography variant="body1">{application.preferredExperienceLevel}</Typography>
                            </Box>
                            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                                <Typography variant="caption" color="text.secondary">Status</Typography>
                                <Chip label={application.statusDisplayName} size="small" />
                            </Box>
                        </Box>
                        <Box><Typography variant="caption" color="text.secondary">Subjects</Typography><Stack direction="row" spacing={0.5} flexWrap="wrap" sx={{ mt: 0.5, gap: 0.5 }}>{application.subjectsToTeach?.map((s, i) => <Chip key={i} label={s} size="small" />)}</Stack></Box>
                        <Box><Typography variant="caption" color="text.secondary">Motivation</Typography><Typography variant="body2">{application.motivation}</Typography></Box>
                        {application.relevantExperience && <Box><Typography variant="caption" color="text.secondary">Experience</Typography><Typography variant="body2">{application.relevantExperience}</Typography></Box>}
                        {application.academicResultsUrl && (
                            <Box>
                                <Typography variant="caption" color="text.secondary">Academic Results</Typography>
                                <Box sx={{ mt: 0.5 }}>
                                    <Button
                                        size="small"
                                        variant="outlined"
                                        href={application.academicResultsUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        sx={{ textTransform: 'none', borderRadius: 1 }}
                                    >
                                        {application.academicResultsFileName || 'View Document'}
                                    </Button>
                                </Box>
                            </Box>
                        )}
                    </Stack>
                ) : mode === 'session' && session ? (
                    <Stack spacing={3}>
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
                            <Box>
                                <Typography variant="h6" fontWeight={700}>{session.title}</Typography>
                                <Typography variant="body2" color="text.secondary">{session.subject} — Hosted by {session.host?.fullName ?? session.host?.name}</Typography>
                            </Box>
                        </Stack>
                        <Divider />
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 2 }}>
                            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                                <Typography variant="caption" color="text.secondary">Description</Typography>
                                <Typography variant="body2">{session.description ?? '—'}</Typography>
                            </Box>
                            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                                <Typography variant="caption" color="text.secondary">Platform / Link</Typography>
                                <Typography variant="body1">{session.meetingPlatform ?? session.sessionType ?? '—'}</Typography>
                                {session.liveLink && (
                                    <Typography variant="body2" color="primary" sx={{ cursor: 'pointer', textDecoration: 'underline' }} onClick={() => window.open(session.liveLink, '_blank')}>{session.liveLink}</Typography>
                                )}
                            </Box>
                            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
                                <Typography variant="caption" color="text.secondary">Scheduled Start</Typography>
                                <Typography variant="body1">{session.scheduledStartTime ? new Date(session.scheduledStartTime).toLocaleString() : '—'}</Typography>
                            </Box>
                            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
                                <Typography variant="caption" color="text.secondary">Scheduled End</Typography>
                                <Typography variant="body1">{session.scheduledEndTime ? new Date(session.scheduledEndTime).toLocaleString() : '—'}</Typography>
                            </Box>
                            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 4' } }}>
                                <Typography variant="caption" color="text.secondary">Duration</Typography>
                                <Typography variant="body1">{session.scheduledStartTime && session.scheduledEndTime ? `${Math.round((new Date(session.scheduledEndTime).getTime() - new Date(session.scheduledStartTime).getTime())/60000)} mins` : '—'}</Typography>
                            </Box>
                            <Box sx={{ gridColumn: { xs: 'span 6', md: 'span 3' } }}>
                                <Typography variant="caption" color="text.secondary">Views</Typography>
                                <Typography variant="body1">{session.viewCount ?? 0}</Typography>
                            </Box>
                            <Box sx={{ gridColumn: { xs: 'span 6', md: 'span 3' } }}>
                                <Typography variant="caption" color="text.secondary">Notes</Typography>
                                <Typography variant="body1">{session.notes ? session.notes.length : '—'}</Typography>
                            </Box>
                        </Box>
                    </Stack>
                ) : mode === 'note' && note ? (
                    <Stack spacing={3}>
                        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" justifyContent="space-between">
                            <Box>
                                <Typography variant="h6" fontWeight={700}>{note.title}</Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {note.sessionId ? (
                                        <span style={{ cursor: 'pointer', color: 'blue' }} onClick={() => onOpenSessionById?.(note.sessionId as any, note)}>{note.sessionTitle ?? note.sessionId}</span>
                                    ) : (
                                        (note.sessionTitle ? `${note.sessionTitle} • Note` : 'Note details')
                                    )}
                                </Typography>
                            </Box>
                        </Stack>
                        <Divider />
                        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 2 }}>
                            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                                <Typography variant="caption" color="text.secondary">Description</Typography>
                                <Typography variant="body2" sx={{ mb: 1 }}>{note.description ?? '—'}</Typography>

                                <Typography variant="caption" color="text.secondary">File</Typography>
                                <Box sx={{ mt: 0.5 }}>
                                    <Typography variant="body2" fontWeight={600}>{note.fileName ?? '—'}</Typography>
                                    {note.fileUrl && (
                                        <Typography variant="caption" color="primary" sx={{ display: 'block' }}><a href={note.fileUrl} target="_blank" rel="noreferrer">Open file URL</a></Typography>
                                    )}
                                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{note.fileType ?? ''}{note.formattedFileSize ? ` • ${note.formattedFileSize}` : note.fileSize ? ` • ${note.fileSize} bytes` : ''}</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ gridColumn: { xs: 'span 12', md: 'span 6' } }}>
                                <Typography variant="caption" color="text.secondary">Uploaded By</Typography>
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5 }}>
                                    <Box>
                                        <Typography variant="body1" fontWeight={600}>{(note as any).uploader?.fullName ?? (note as any).uploaderName ?? ''}</Typography>
                                        <Typography variant="caption" color="text.secondary">{(note as any).uploader?.email ?? ''}</Typography>
                                    </Box>
                                </Stack>
                            </Box>
                            <Box sx={{ gridColumn: { xs: 'span 6', md: 'span 3' } }}>
                                <Typography variant="caption" color="text.secondary">Downloads</Typography>
                                <Typography variant="body1">{note.downloadCount ?? 0}</Typography>
                            </Box>
                            <Box sx={{ gridColumn: { xs: 'span 6', md: 'span 3' } }}>
                                <Typography variant="caption" color="text.secondary">Views</Typography>
                                <Typography variant="body1">{note.viewCount ?? 0}</Typography>
                            </Box>
                            <Box sx={{ gridColumn: { xs: 'span 6', md: 'span 3' } }}>
                                <Typography variant="caption" color="text.secondary">Note ID</Typography>
                                <Typography variant="body1">{note.id}</Typography>
                            </Box>
                            <Box sx={{ gridColumn: { xs: 'span 6', md: 'span 3' } }}>
                                <Typography variant="caption" color="text.secondary">Created</Typography>
                                <Typography variant="body1">{note.createdAt ? new Date(note.createdAt).toLocaleString() : '—'}</Typography>
                            </Box>
                        </Box>
                    </Stack>
                ) : (
                    <Box sx={{ textAlign: 'center', py: 6 }}><Typography color="text.secondary">Details not available</Typography></Box>
                )}
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose}>Close</Button>
                {renderFooter}
            </DialogActions>
        </Dialog>
    );
}
