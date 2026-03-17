'use client';

/**
 * @fileoverview Student Intranet Page
 * @description Displays all intranet content sections with tabs and sub-tabs in table format
 */

import { useEffect, useState, useCallback } from 'react';
import {
    Box,
    Typography,
    Tabs,
    Tab,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Skeleton,
    Alert,
    Link,
    IconButton,
    Tooltip,
    Button,
    Stack,
    Card,
    CardContent,
    Divider,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { motion } from 'framer-motion';
import ReportProblemIcon from '@mui/icons-material/ReportProblem';
import EventNoteIcon from '@mui/icons-material/EventNote';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import SchoolIcon from '@mui/icons-material/School';
import WorkspacePremiumIcon from '@mui/icons-material/WorkspacePremium';
import FoundationIcon from '@mui/icons-material/Foundation';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import PolicyIcon from '@mui/icons-material/Policy';
import DescriptionIcon from '@mui/icons-material/Description';
import PeopleIcon from '@mui/icons-material/People';
import InfoIcon from '@mui/icons-material/Info';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import RefreshIcon from '@mui/icons-material/Refresh';
import { PageHeader } from '@/components/common';
import { useIntranet } from '@/hooks';
import type { IntranetSection } from '@/features/intranet';

// ============================================================================
// Animation
// ============================================================================

const MotionBox = motion.create(Box);

// ============================================================================
// Tab + Sub-Tab Configuration
// ============================================================================

interface SubTabConfig {
    id: string;
    label: string;
    slug?: string;
}

interface TabConfig {
    id: IntranetSection;
    label: string;
    icon: React.ReactElement;
    color: string;
    subTabs?: SubTabConfig[];
}

const TABS: TabConfig[] = [
    {
        id: 'schedules', label: 'Schedules', icon: <EventNoteIcon />, color: '#0EA5E9',
        subTabs: [
            { id: 'orientation', label: 'Orientation', slug: 'orientation' },
            { id: 'temporary', label: 'Temporary', slug: 'temporary' },
            { id: 'assessments', label: 'Assessments', slug: 'assessments' },
            { id: 'annual-events', label: 'Annual Events', slug: 'annual-events' },
        ],
    },
    {
        id: 'student-complaints', label: 'Complaints', icon: <ReportProblemIcon />, color: '#EF4444',
        subTabs: [
            { id: 'academic-course-delivery', label: 'Academic Course Delivery', slug: 'academic-course-delivery' },
            { id: 'facility-and-support-system', label: 'Facility and Support System', slug: 'facility-and-support-system' },
        ],
    },
    {
        id: 'academic-calendars', label: 'Calendars', icon: <CalendarMonthIcon />, color: '#3B82F6',
        subTabs: [
            { id: 'uow', label: 'UoW', slug: 'uow' },
            { id: 'rgu', label: 'RGU', slug: 'rgu' },
        ],
    },
    {
        id: 'undergraduate', label: 'Undergraduate', icon: <SchoolIcon />, color: '#10B981',
        subTabs: [
            { id: 'bsc-ai-ds', label: 'BSc AI & DS', slug: 'bsc-ai-ds' },
            { id: 'bsc-cs', label: 'BSc CS', slug: 'bsc-cs' },
            { id: 'beng-se', label: 'BEng SE', slug: 'beng-se' },
            { id: 'bsc-bda', label: 'BSc BDA', slug: 'bsc-bda' },
            { id: 'bsc-bis', label: 'BSc BIS', slug: 'bsc-bis' },
            { id: 'ba-bm', label: 'BA BM', slug: 'ba-bm' },
            { id: 'bsc-bc', label: 'BSc BC', slug: 'bsc-bc' },
        ],
    },
    {
        id: 'postgraduate', label: 'Postgraduate', icon: <WorkspacePremiumIcon />, color: '#8B5CF6',
        subTabs: [
            { id: 'msc-ase', label: 'MSc ASE', slug: 'msc-ase' },
            { id: 'msc-cs-f', label: 'MSc CS & F', slug: 'msc-cs-f' },
            { id: 'msc-it', label: 'MSc IT', slug: 'msc-it' },
            { id: 'msc-bda', label: 'MSc BDA', slug: 'msc-bda' },
            { id: 'msc-ba', label: 'MSc BA', slug: 'msc-ba' },
            { id: 'msc-fbm', label: 'MSc FBM', slug: 'msc-fbm' },
        ],
    },
    {
        id: 'foundation-program', label: 'Foundation', icon: <FoundationIcon />, color: '#F59E0B',
        subTabs: [
            { id: 'academic-calendar', label: 'Academic Calendar', slug: 'academic-calendar' },
            { id: 'program-specification', label: 'Program Specification', slug: 'program-specification' },
            { id: 'important-contact-details', label: 'Important Contact Details', slug: 'important-contact-details' },
            { id: 'time-table', label: 'Time Table', slug: 'time-table' },
            { id: 'assessment-schedule', label: 'Assessment Schedule', slug: 'assessment-schedule' },
            { id: 'lms-login-details', label: 'LMS Login Details', slug: 'lms-login-details' },
            { id: 'mitigating-circumstances-form', label: 'Mitigating Circumstances Form', slug: 'mitigating-circumstances-form' },
        ],
    },
    {
        id: 'students-relations-unit', label: 'SRU', icon: <SupportAgentIcon />, color: '#06B6D4',
        subTabs: [
            { id: 'help-desk-video-series', label: 'Help Desk Video Series', slug: 'help-desk-video-series' },
        ],
    },
    {
        id: 'student-policies', label: 'Policies', icon: <PolicyIcon />, color: '#EC4899',
        subTabs: [
            { id: 'participation-at-conferences', label: 'Participation at Conferences', slug: 'participation-at-conferences' },
            { id: 'participation-at-competitions', label: 'Participation at Competitions', slug: 'participation-at-competitions' },
            { id: 'code-of-conduct', label: 'Code of Conduct', slug: 'code-of-conduct' },
            { id: 'club-policy', label: 'Club Policy', slug: 'club-policy' },
            { id: 'it-policy', label: 'IT Policy', slug: 'it-policy' },
        ],
    },
    {
        id: 'mitigation-forms', label: 'Mitigation', icon: <DescriptionIcon />, color: '#F97316',
        subTabs: [
            { id: 'uow-late-mitigation-circumstances-form', label: 'UoW - Late Mitigation', slug: 'uow-late-mitigation-circumstances-form' },
            { id: 'uow-mitigating-circumstances-form', label: 'UoW - Mitigating Circumstances', slug: 'uow-mitigating-circumstances-form' },
            { id: 'uow-self-certification-claim-form', label: 'UoW - Self Certification', slug: 'uow-self-certification-claim-form' },
            { id: 'rgu-coursework-extension-form-self-certification', label: 'RGU - Coursework Extension', slug: 'rgu-coursework-extension-form-self-certification' },
            { id: 'rgu-deferral-request-form-self-certification', label: 'RGU - Deferral Request', slug: 'rgu-deferral-request-form-self-certification' },
        ],
    },
    {
        id: 'staff', label: 'Staff', icon: <PeopleIcon />, color: '#6366F1',
        subTabs: [
            { id: 'soc', label: 'SOC', slug: 'soc' },
            { id: 'common-info', label: 'Common Info', slug: 'common-info' },
            { id: 'mail-groups', label: 'Mail Groups', slug: 'mail-groups' },
            { id: 'doc-arch', label: 'Doc Arch', slug: 'doc-arch' },
            { id: 'contacts', label: 'Contacts', slug: 'contacts' },
        ],
    },
    {
        id: 'info', label: 'Info', icon: <InfoIcon />, color: '#14B8A6',
        subTabs: [
            { id: 'course-details', label: 'Course Details', slug: 'course-details' },
            { id: 'houses', label: 'Houses', slug: 'houses' },
            { id: 'students-union', label: "Students' Union", slug: 'students-union' },
            { id: 'clubs-and-societies', label: 'Clubs and Societies', slug: 'clubs-and-societies' },
        ],
    },
];

// ============================================================================
// Table Skeleton
// ============================================================================

function TableSkeleton({ cols = 4, rows = 5 }: { cols?: number; rows?: number }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    if (isMobile) {
        return (
            <Stack spacing={1.5}>
                {Array.from({ length: Math.min(rows, 3) }).map((_, i) => (
                    <Card key={i} variant="outlined" sx={{ borderRadius: 2 }}>
                        <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                            {Array.from({ length: Math.min(cols, 4) }).map((_, j) => (
                                <Skeleton key={j} width={j === 0 ? '40%' : '80%'} height={24} sx={{ mb: 0.5 }} />
                            ))}
                        </CardContent>
                    </Card>
                ))}
            </Stack>
        );
    }

    return (
        <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        {Array.from({ length: cols }).map((_, i) => (
                            <TableCell key={i}><Skeleton width={100} /></TableCell>
                        ))}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {Array.from({ length: rows }).map((_, r) => (
                        <TableRow key={r}>
                            {Array.from({ length: cols }).map((_, c) => (
                                <TableCell key={c}><Skeleton /></TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}

// ============================================================================
// Styled Table Container
// ============================================================================

function StyledTableContainer({ children, title, subtitle }: { children: React.ReactNode; title?: string; subtitle?: string }) {
    return (
        <Box sx={{ mb: { xs: 2, sm: 3 } }}>
            {title && <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5, fontSize: { xs: '0.9rem', sm: '1rem' } }}>{title}</Typography>}
            {subtitle && <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{subtitle}</Typography>}
            <Box sx={{ position: 'relative', '&::after': { content: '""', position: 'absolute', top: 0, right: 0, bottom: 0, width: { xs: 24, sm: 0 }, background: (theme) => `linear-gradient(to right, transparent, ${theme.palette.background.paper})`, pointerEvents: 'none', borderRadius: '0 8px 8px 0', zIndex: 1 } }}>
                <TableContainer
                    component={Paper}
                    elevation={0}
                    sx={{
                        border: '1px solid', borderColor: 'divider', borderRadius: 2, overflow: 'auto',
                        WebkitOverflowScrolling: 'touch',
                        '& .MuiTableHead-root .MuiTableCell-root': {
                            bgcolor: 'action.hover', fontWeight: 600,
                            fontSize: { xs: '0.7rem', sm: '0.8rem' },
                            textTransform: 'uppercase', letterSpacing: '0.05em', color: 'text.secondary', whiteSpace: 'nowrap',
                            px: { xs: 1, sm: 2 }, py: { xs: 0.75, sm: 1 },
                        },
                        '& .MuiTableBody-root .MuiTableCell-root': {
                            fontSize: { xs: '0.75rem', sm: '0.875rem' },
                            px: { xs: 1, sm: 2 }, py: { xs: 0.75, sm: 1 },
                        },
                        '& .MuiTableBody-root .MuiTableRow-root:hover': { bgcolor: 'action.hover' },
                    }}
                >
                    {children}
                </TableContainer>
            </Box>
        </Box>
    );
}

// ============================================================================
// Key-Value Detail Table
// ============================================================================

function KeyValueTable({ title, subtitle, rows }: { title: string; subtitle?: string; rows: { label: string; value: React.ReactNode }[] }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    if (isMobile) {
        return (
            <Box sx={{ mb: 2 }}>
                {title && <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.9rem' }}>{title}</Typography>}
                {subtitle && <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: '0.75rem' }}>{subtitle}</Typography>}
                <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent sx={{ py: 1.5, px: 2, '&:last-child': { pb: 1.5 } }}>
                        <Stack spacing={1.5} divider={<Divider flexItem />}>
                            {rows.map((r, i) => (
                                <Box key={i}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.65rem', display: 'block', mb: 0.25 }}>
                                        {r.label}
                                    </Typography>
                                    <Typography variant="body2" component="div" sx={{ fontSize: '0.8rem', wordBreak: 'break-word' }}>
                                        {r.value || '—'}
                                    </Typography>
                                </Box>
                            ))}
                        </Stack>
                    </CardContent>
                </Card>
            </Box>
        );
    }

    return (
        <StyledTableContainer title={title} subtitle={subtitle}>
            <Table size="small">
                <TableHead><TableRow><TableCell sx={{ width: 250 }}>Field</TableCell><TableCell>Details</TableCell></TableRow></TableHead>
                <TableBody>
                    {rows.map((r, i) => (
                        <TableRow key={i}><TableCell sx={{ fontWeight: 500 }}>{r.label}</TableCell><TableCell>{r.value}</TableCell></TableRow>
                    ))}
                </TableBody>
            </Table>
        </StyledTableContainer>
    );
}

function formatDate(d: string | null | undefined) {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

const ExtLink = ({ href, children }: { href: string; children?: React.ReactNode }) => (
    <Link href={href} target="_blank" underline="hover" sx={{ wordBreak: 'break-all', fontSize: { xs: '0.75rem', sm: 'inherit' } }}>{children || href} <OpenInNewIcon sx={{ fontSize: { xs: 12, sm: 14 }, ml: 0.5, verticalAlign: 'text-top' }} /></Link>
);

// ============================================================================
// Schedule Detail View
// ============================================================================

function ScheduleDetailView({ data }: { data: any }) {
    if (!data) return <TableSkeleton cols={5} rows={6} />;
    return (
        <Box>
            <KeyValueTable
                title={data.categoryName}
                subtitle={data.description}
                rows={[
                    { label: 'Last Updated', value: formatDate(data.lastUpdated) },
                ]}
            />
            {data.events?.length > 0 && (
                <StyledTableContainer title="Events">
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>#</TableCell>
                                <TableCell>Event</TableCell>
                                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Description</TableCell>
                                <TableCell>Start</TableCell>
                                <TableCell>End</TableCell>
                                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Venue</TableCell>
                                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Type</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {data.events.map((e: any, i: number) => (
                                <TableRow key={e.id || i}>
                                    <TableCell>{i + 1}</TableCell>
                                    <TableCell sx={{ fontWeight: 500 }}>{e.eventName}</TableCell>
                                    <TableCell sx={{ maxWidth: 300, display: { xs: 'none', md: 'table-cell' } }}>{e.description}</TableCell>
                                    <TableCell>{formatDate(e.startDate)}</TableCell>
                                    <TableCell>{formatDate(e.endDate)}</TableCell>
                                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{e.venue || '—'}</TableCell>
                                    <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{e.eventType ? <Chip label={e.eventType} size="small" variant="outlined" /> : '—'}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </StyledTableContainer>
            )}
        </Box>
    );
}

// ============================================================================
// DETAIL sub-tab views
// ============================================================================

function ComplaintDetailView({ data }: { data: any }) {
    if (!data) return <TableSkeleton cols={2} rows={6} />;
    return <KeyValueTable title={data.categoryName} subtitle={data.description} rows={[
        { label: 'Contact Email', value: <Link href={`mailto:${data.contactEmail}`} underline="hover">{data.contactEmail}</Link> },
        { label: 'Contact Phone', value: data.contactPhone },
        { label: 'Form URL', value: <ExtLink href={data.formUrl}>{data.formUrl}</ExtLink> },
        { label: 'Instructions', value: data.instructions },
        { label: 'Response Time', value: `${data.responseTimeBusinessDays} business days` },
        { label: 'Status', value: <Chip label={data.isActive ? 'Active' : 'Inactive'} size="small" color={data.isActive ? 'success' : 'default'} /> },
        { label: 'Last Updated', value: formatDate(data.lastUpdated) },
    ]} />;
}

function CalendarDetailView({ data }: { data: any }) {
    if (!data) return <TableSkeleton cols={4} rows={5} />;
    return (
        <Box>
            <KeyValueTable title={data.universityName} subtitle={`Academic Year: ${data.academicYear}`} rows={[
                { label: 'Calendar File', value: <ExtLink href={data.calendarFileUrl}>Download PDF</ExtLink> },
                { label: 'Last Updated', value: formatDate(data.lastUpdated) },
            ]} />
            {data.events?.length > 0 && (
                <StyledTableContainer title="Events">
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>#</TableCell>
                                <TableCell>Event</TableCell>
                                <TableCell>Start</TableCell>
                                <TableCell>End</TableCell>
                                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Type</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>{data.events.map((e: any, i: number) => (
                            <TableRow key={i}>
                                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{i + 1}</TableCell>
                                <TableCell sx={{ fontWeight: 500 }}>{e.eventName}</TableCell>
                                <TableCell>{formatDate(e.startDate)}</TableCell>
                                <TableCell>{formatDate(e.endDate)}</TableCell>
                                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}><Chip label={e.eventType} size="small" variant="outlined" /></TableCell>
                            </TableRow>
                        ))}</TableBody>
                    </Table>
                </StyledTableContainer>
            )}
        </Box>
    );
}

function ProgramDetailView({ data }: { data: any }) {
    if (!data) return <TableSkeleton cols={2} rows={8} />;
    return (
        <Box>
            <KeyValueTable title={data.programName} subtitle={data.description} rows={[
                { label: 'Code', value: <Chip label={data.programCode} size="small" variant="outlined" /> },
                { label: 'University', value: data.awardingUniversity },
                { label: 'Duration', value: data.duration },
                { label: 'Total Credits', value: data.totalCredits },
                { label: 'Entry Requirements', value: data.entryRequirements },
                { label: 'Career Prospects', value: data.careerProspects?.join(', ') },
                { label: 'Program Spec', value: <ExtLink href={data.programSpecificationUrl}>Download</ExtLink> },
                { label: 'Handbook', value: <ExtLink href={data.handbookUrl}>Download</ExtLink> },
                { label: 'Status', value: <Chip label={data.isActive ? 'Active' : 'Inactive'} size="small" color={data.isActive ? 'success' : 'default'} /> },
                { label: 'Last Updated', value: formatDate(data.lastUpdated) },
            ]} />
            {data.modules?.length > 0 && (
                <StyledTableContainer title="Modules">
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>#</TableCell>
                                {data.modules[0]?.year !== undefined && <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Year</TableCell>}
                                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Sem</TableCell>
                                <TableCell>Code</TableCell>
                                <TableCell>Module</TableCell>
                                <TableCell>Credits</TableCell>
                                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Core</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>{data.modules.map((m: any, i: number) => (
                            <TableRow key={i}>
                                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{i + 1}</TableCell>
                                {m.year !== undefined && <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{m.year}</TableCell>}
                                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{m.semester}</TableCell>
                                <TableCell><Chip label={m.moduleCode} size="small" variant="outlined" /></TableCell>
                                <TableCell sx={{ fontWeight: 500 }}>{m.moduleName}</TableCell>
                                <TableCell>{m.credits}</TableCell>
                                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}><Chip label={m.isCore ? 'Core' : 'Elective'} size="small" color={m.isCore ? 'primary' : 'default'} /></TableCell>
                            </TableRow>
                        ))}</TableBody>
                    </Table>
                </StyledTableContainer>
            )}
        </Box>
    );
}

function PolicyDetailView({ data }: { data: any }) {
    if (!data) return <TableSkeleton cols={2} rows={6} />;
    return (
        <Box>
            <KeyValueTable title={data.policyName} subtitle={data.description} rows={[
                { label: 'Version', value: data.version },
                { label: 'Effective Date', value: formatDate(data.effectiveDate) },
                { label: 'Content', value: data.policyContent },
                { label: 'Policy File', value: <ExtLink href={data.policyFileUrl}>Download PDF</ExtLink> },
                { label: 'Contact', value: `${data.contactPerson?.name} — ${data.contactPerson?.role} (${data.contactPerson?.email})` },
                { label: 'Last Updated', value: formatDate(data.lastUpdated) },
            ]} />
            {data.keyPoints?.length > 0 && (
                <StyledTableContainer title="Key Points">
                    <Table size="small"><TableHead><TableRow><TableCell>#</TableCell><TableCell>Point</TableCell></TableRow></TableHead>
                        <TableBody>{data.keyPoints.map((p: string, i: number) => (<TableRow key={i}><TableCell>{i + 1}</TableCell><TableCell>{p}</TableCell></TableRow>))}</TableBody></Table>
                </StyledTableContainer>
            )}
            {data.disciplinaryProcess?.length > 0 && (
                <StyledTableContainer title="Disciplinary Process">
                    <Table size="small"><TableHead><TableRow><TableCell>#</TableCell><TableCell>Step</TableCell></TableRow></TableHead>
                        <TableBody>{data.disciplinaryProcess.map((s: string, i: number) => (<TableRow key={i}><TableCell>{i + 1}</TableCell><TableCell>{s}</TableCell></TableRow>))}</TableBody></Table>
                </StyledTableContainer>
            )}
        </Box>
    );
}

function MitigationDetailView({ data }: { data: any }) {
    if (!data) return <TableSkeleton cols={2} rows={7} />;
    return (
        <Box>
            <KeyValueTable title={data.formName} subtitle={data.description} rows={[
                { label: 'University', value: data.university },
                { label: 'Form File', value: <ExtLink href={data.formFileUrl}>Download PDF</ExtLink> },
                { label: 'Submission Email', value: <Link href={`mailto:${data.submissionEmail}`} underline="hover">{data.submissionEmail}</Link> },
                { label: 'Deadline', value: data.submissionDeadline },
                { label: 'Processing Time', value: `${data.processingTimeBusinessDays} business days` },
                ...(data.extensionDuration ? [{ label: 'Extension Duration', value: data.extensionDuration }] : []),
                ...(data.deferralDetails ? [{ label: 'Deferral Details', value: data.deferralDetails }] : []),
                { label: 'Contact', value: `${data.contactPerson?.name} (${data.contactPerson?.email})` },
                { label: 'Last Updated', value: formatDate(data.lastUpdated) },
            ]} />
            {data.eligibleCircumstances?.length > 0 && (
                <StyledTableContainer title="Eligible Circumstances"><Table size="small"><TableHead><TableRow><TableCell>#</TableCell><TableCell>Circumstance</TableCell></TableRow></TableHead><TableBody>{data.eligibleCircumstances.map((c: string, i: number) => (<TableRow key={i}><TableCell>{i + 1}</TableCell><TableCell>{c}</TableCell></TableRow>))}</TableBody></Table></StyledTableContainer>
            )}
            {data.requiredDocuments?.length > 0 && (
                <StyledTableContainer title="Required Documents"><Table size="small"><TableHead><TableRow><TableCell>#</TableCell><TableCell>Document</TableCell></TableRow></TableHead><TableBody>{data.requiredDocuments.map((d: string, i: number) => (<TableRow key={i}><TableCell>{i + 1}</TableCell><TableCell>{d}</TableCell></TableRow>))}</TableBody></Table></StyledTableContainer>
            )}
            {data.limitations?.length > 0 && (
                <StyledTableContainer title="Limitations"><Table size="small"><TableHead><TableRow><TableCell>#</TableCell><TableCell>Limitation</TableCell></TableRow></TableHead><TableBody>{data.limitations.map((l: string, i: number) => (<TableRow key={i}><TableCell>{i + 1}</TableCell><TableCell>{l}</TableCell></TableRow>))}</TableBody></Table></StyledTableContainer>
            )}
            {data.possibleOutcomes?.length > 0 && (
                <StyledTableContainer title="Possible Outcomes"><Table size="small"><TableHead><TableRow><TableCell>#</TableCell><TableCell>Outcome</TableCell></TableRow></TableHead><TableBody>{data.possibleOutcomes.map((o: string, i: number) => (<TableRow key={i}><TableCell>{i + 1}</TableCell><TableCell>{o}</TableCell></TableRow>))}</TableBody></Table></StyledTableContainer>
            )}
        </Box>
    );
}

function HelpDeskVideoSeriesView({ data }: { data: any }) {
    if (!data) return <TableSkeleton cols={5} rows={5} />;
    return (
        <StyledTableContainer title={data.categoryName} subtitle={data.description}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>#</TableCell>
                        <TableCell>Title</TableCell>
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Description</TableCell>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Duration</TableCell>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Published</TableCell>
                        <TableCell>Watch</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>{data.videos?.map((v: any, i: number) => (
                    <TableRow key={v.id}>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{i + 1}</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{v.title}</TableCell>
                        <TableCell sx={{ maxWidth: 300, display: { xs: 'none', md: 'table-cell' } }}>{v.description}</TableCell>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{v.duration}</TableCell>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{formatDate(v.publishedDate)}</TableCell>
                        <TableCell><Tooltip title="Watch"><IconButton size="small" href={v.videoUrl} target="_blank" rel="noopener"><OpenInNewIcon fontSize="small" /></IconButton></Tooltip></TableCell>
                    </TableRow>
                ))}</TableBody>
            </Table>
        </StyledTableContainer>
    );
}

/* ---- Staff Sub-tabs ---- */
function StaffSocView({ data }: { data: any }) {
    if (!data) return <TableSkeleton cols={6} rows={5} />;
    return (
        <StyledTableContainer title={`${data.departmentFullName} (${data.categoryName})`}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>#</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Designation</TableCell>
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Specialization</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Phone</TableCell>
                        <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>Office</TableCell>
                        <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>Hours</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>{data.staffMembers?.map((s: any, i: number) => (
                    <TableRow key={s.id}>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{i + 1}</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{s.name}</TableCell>
                        <TableCell>{s.designation}</TableCell>
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{s.specialization}</TableCell>
                        <TableCell><Link href={`mailto:${s.email}`} underline="hover" sx={{ fontSize: { xs: '0.7rem', sm: 'inherit' } }}>{s.email}</Link></TableCell>
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{s.phone}</TableCell>
                        <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>{s.office}</TableCell>
                        <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>{s.officeHours}</TableCell>
                    </TableRow>
                ))}</TableBody>
            </Table>
        </StyledTableContainer>
    );
}

function StaffCommonInfoView({ data }: { data: any }) {
    if (!data) return <TableSkeleton cols={2} rows={6} />;
    const gi = data.generalInfo;
    return (
        <Box>
            <KeyValueTable title="Institution Information" rows={[
                { label: 'Name', value: gi?.institutionName }, { label: 'Address', value: gi?.mainAddress },
                { label: 'Phone', value: gi?.mainPhone }, { label: 'Email', value: <Link href={`mailto:${gi?.mainEmail}`} underline="hover">{gi?.mainEmail}</Link> },
                { label: 'Website', value: <ExtLink href={gi?.website}>{gi?.website}</ExtLink> }, { label: 'Working Hours', value: gi?.workingHours }, { label: 'Academic Year', value: gi?.academicYear },
            ]} />
            {data.departments?.length > 0 && (
                <StyledTableContainer title="Departments"><Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>#</TableCell>
                            <TableCell>Department</TableCell>
                            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Head</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Phone</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>{data.departments.map((d: any, i: number) => (
                        <TableRow key={i}>
                            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{i + 1}</TableCell>
                            <TableCell sx={{ fontWeight: 500 }}>{d.departmentName}</TableCell>
                            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{d.headOfDepartment}</TableCell>
                            <TableCell><Link href={`mailto:${d.email}`} underline="hover" sx={{ fontSize: { xs: '0.7rem', sm: 'inherit' } }}>{d.email}</Link></TableCell>
                            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{d.phone}</TableCell>
                        </TableRow>
                    ))}</TableBody>
                </Table></StyledTableContainer>
            )}
        </Box>
    );
}

function StaffMailGroupsView({ data }: { data: any }) {
    if (!data) return <TableSkeleton cols={4} rows={5} />;
    return (
        <StyledTableContainer title={data.categoryName} subtitle={data.description}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>#</TableCell>
                        <TableCell>Group</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Description</TableCell>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Access</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>{data.mailGroups?.map((g: any, i: number) => (
                    <TableRow key={i}>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{i + 1}</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{g.groupName}</TableCell>
                        <TableCell><Link href={`mailto:${g.email}`} underline="hover" sx={{ fontSize: { xs: '0.7rem', sm: 'inherit' } }}>{g.email}</Link></TableCell>
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{g.description}</TableCell>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}><Chip label={g.accessLevel} size="small" variant="outlined" /></TableCell>
                    </TableRow>
                ))}</TableBody>
            </Table>
        </StyledTableContainer>
    );
}

function StaffDocArchiveView({ data }: { data: any }) {
    if (!data) return <TableSkeleton cols={5} rows={5} />;
    return (
        <StyledTableContainer title={data.categoryName} subtitle={data.description}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>#</TableCell>
                        <TableCell>Document</TableCell>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Category</TableCell>
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Type</TableCell>
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Size</TableCell>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Uploaded</TableCell>
                        <TableCell>Download</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>{data.documents?.map((d: any, i: number) => (
                    <TableRow key={d.id}>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{i + 1}</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{d.documentName}</TableCell>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{d.category}</TableCell>
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}><Chip label={d.fileType} size="small" variant="outlined" /></TableCell>
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{d.fileSizeKb} KB</TableCell>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{formatDate(d.uploadedDate)}</TableCell>
                        <TableCell><Tooltip title="Download"><IconButton size="small" href={d.fileUrl} target="_blank" rel="noopener"><OpenInNewIcon fontSize="small" /></IconButton></Tooltip></TableCell>
                    </TableRow>
                ))}</TableBody>
            </Table>
        </StyledTableContainer>
    );
}

function StaffContactsView({ data }: { data: any }) {
    if (!data) return <TableSkeleton cols={5} rows={8} />;
    return (
        <Box>
            {data.departments?.map((dept: any, di: number) => (
                <StyledTableContainer key={di} title={dept.departmentName}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>#</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Designation</TableCell>
                                <TableCell>Email</TableCell>
                                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Phone</TableCell>
                                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Ext</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>{dept.contacts?.map((c: any, i: number) => (
                            <TableRow key={i}>
                                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{i + 1}</TableCell>
                                <TableCell sx={{ fontWeight: 500 }}>{c.name}</TableCell>
                                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{c.designation}</TableCell>
                                <TableCell><Link href={`mailto:${c.email}`} underline="hover" sx={{ fontSize: { xs: '0.7rem', sm: 'inherit' } }}>{c.email}</Link></TableCell>
                                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{c.phone}</TableCell>
                                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{c.extension}</TableCell>
                            </TableRow>
                        ))}</TableBody>
                    </Table>
                </StyledTableContainer>
            ))}
            {data.emergencyContacts && <KeyValueTable title="Emergency Contacts" rows={
                Object.entries(data.emergencyContacts).map(([label, value]) => ({ label, value: value as string }))
            } />}
        </Box>
    );
}

/* ---- Info Sub-tabs ---- */
function CourseDetailsView({ data }: { data: any }) {
    if (!data) return <TableSkeleton cols={5} rows={8} />;
    return (
        <Box>
            {data.programmeCategories?.map((cat: any, ci: number) => (
                <StyledTableContainer key={ci} title={cat.category}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>#</TableCell>
                                <TableCell>Programme</TableCell>
                                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Duration</TableCell>
                                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Awarding Body</TableCell>
                                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Intake</TableCell>
                                <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>Fee</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>{cat.programmes?.map((p: any, i: number) => (
                            <TableRow key={i}>
                                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{i + 1}</TableCell>
                                <TableCell sx={{ fontWeight: 500 }}>{p.programName}</TableCell>
                                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{p.duration}</TableCell>
                                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{p.awardingBody}</TableCell>
                                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{p.intake}</TableCell>
                                <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>{p.fee}</TableCell>
                            </TableRow>
                        ))}</TableBody>
                    </Table>
                </StyledTableContainer>
            ))}
            {data.admissionsContact && <KeyValueTable title="Admissions Contact" rows={[
                { label: 'Email', value: <Link href={`mailto:${data.admissionsContact.email}`} underline="hover">{data.admissionsContact.email}</Link> },
                { label: 'Phone', value: data.admissionsContact.phone }, { label: 'WhatsApp', value: data.admissionsContact.whatsapp },
            ]} />}
        </Box>
    );
}

function HousesView({ data }: { data: any }) {
    if (!data) return <TableSkeleton cols={7} rows={4} />;
    return (
        <StyledTableContainer title={data.categoryName} subtitle={data.description}>
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell>Rank</TableCell>
                        <TableCell>House</TableCell>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Motto</TableCell>
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Color</TableCell>
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Housemaster</TableCell>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Captain</TableCell>
                        <TableCell>Points</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>{[...(data.houses || [])].sort((a: any, b: any) => a.rank - b.rank).map((h: any) => (
                    <TableRow key={h.id}>
                        <TableCell sx={{ fontWeight: 600 }}>#{h.rank}</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{h.houseName}</TableCell>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{h.motto}</TableCell>
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}><Chip label={h.color} size="small" sx={{ bgcolor: h.color, color: '#fff' }} /></TableCell>
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{h.housemaster}</TableCell>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{h.captainName}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{h.totalPoints}</TableCell>
                    </TableRow>
                ))}</TableBody>
            </Table>
        </StyledTableContainer>
    );
}

function StudentsUnionView({ data }: { data: any }) {
    if (!data) return <TableSkeleton cols={2} rows={6} />;
    return (
        <Box>
            <KeyValueTable title="Students' Union" subtitle={data.description} rows={[
                { label: 'Office', value: data.office }, { label: 'Email', value: <Link href={`mailto:${data.email}`} underline="hover">{data.email}</Link> },
                { label: 'Phone', value: data.phone }, { label: 'Facebook', value: <ExtLink href={data.socialMedia?.facebook}>{data.socialMedia?.facebook}</ExtLink> },
                { label: 'Instagram', value: <ExtLink href={data.socialMedia?.instagram}>{data.socialMedia?.instagram}</ExtLink> },
            ]} />
            {data.currentOffice?.officeBearers?.length > 0 && (
                <StyledTableContainer title={`Office Bearers (${data.currentOffice.academicYear})`}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>#</TableCell>
                                <TableCell>Position</TableCell>
                                <TableCell>Name</TableCell>
                                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Email</TableCell>
                                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Programme</TableCell>
                                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Year</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>{data.currentOffice.officeBearers.map((ob: any, i: number) => (
                            <TableRow key={i}>
                                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{i + 1}</TableCell>
                                <TableCell sx={{ fontWeight: 500 }}>{ob.position}</TableCell>
                                <TableCell>{ob.name}</TableCell>
                                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}><Link href={`mailto:${ob.email}`} underline="hover">{ob.email}</Link></TableCell>
                                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{ob.programme}</TableCell>
                                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{ob.year}</TableCell>
                            </TableRow>
                        ))}</TableBody>
                    </Table>
                </StyledTableContainer>
            )}
            {data.upcomingEvents?.length > 0 && (
                <StyledTableContainer title="Upcoming Events">
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>#</TableCell>
                                <TableCell>Event</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Venue</TableCell>
                                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Description</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>{data.upcomingEvents.map((e: any, i: number) => (
                            <TableRow key={i}>
                                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{i + 1}</TableCell>
                                <TableCell sx={{ fontWeight: 500 }}>{e.eventName}</TableCell>
                                <TableCell>{formatDate(e.date)}</TableCell>
                                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{e.venue}</TableCell>
                                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{e.description}</TableCell>
                            </TableRow>
                        ))}</TableBody>
                    </Table>
                </StyledTableContainer>
            )}
        </Box>
    );
}

function ClubsView({ data }: { data: any }) {
    if (!data) return <TableSkeleton cols={7} rows={6} />;
    return (
        <Box>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{data.description}</Typography>
            <StyledTableContainer title={`${data.categoryName} (${data.totalClubs} clubs)`}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>#</TableCell>
                            <TableCell>Club</TableCell>
                            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Code</TableCell>
                            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Category</TableCell>
                            <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>President</TableCell>
                            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Members</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Email</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>{data.clubs?.map((c: any, i: number) => (
                        <TableRow key={c.id}>
                            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{i + 1}</TableCell>
                            <TableCell sx={{ fontWeight: 500 }}>{c.clubName}</TableCell>
                            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}><Chip label={c.clubCode} size="small" variant="outlined" /></TableCell>
                            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{c.category}</TableCell>
                            <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>{c.president}</TableCell>
                            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{c.memberCount}</TableCell>
                            <TableCell><Chip label={c.isOpenForRegistration ? 'Open' : 'Closed'} size="small" color={c.isOpenForRegistration ? 'success' : 'default'} /></TableCell>
                            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}><Link href={`mailto:${c.email}`} underline="hover" sx={{ fontSize: { xs: '0.7rem', sm: 'inherit' } }}>{c.email}</Link></TableCell>
                        </TableRow>
                    ))}</TableBody>
                </Table>
            </StyledTableContainer>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{data.joinInstructions}</Typography>
        </Box>
    );
}

/* ---- Foundation Sub-tabs ---- */
function FoundationCalendarView({ data }: { data: any }) {
    if (!data) return <TableSkeleton cols={4} rows={5} />;
    return (
        <Box>
            <KeyValueTable title="Foundation Academic Calendar" subtitle={`Academic Year: ${data.academicYear}`} rows={[
                { label: 'Calendar File', value: <ExtLink href={data.calendarFileUrl}>Download PDF</ExtLink> }, { label: 'Last Updated', value: formatDate(data.lastUpdated) },
            ]} />
            {data.events?.length > 0 && (
                <StyledTableContainer title="Events"><Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>#</TableCell>
                            <TableCell>Event</TableCell>
                            <TableCell>Start</TableCell>
                            <TableCell>End</TableCell>
                            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Type</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>{data.events.map((e: any, i: number) => (
                        <TableRow key={i}>
                            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{i + 1}</TableCell>
                            <TableCell sx={{ fontWeight: 500 }}>{e.eventName}</TableCell>
                            <TableCell>{formatDate(e.startDate)}</TableCell>
                            <TableCell>{formatDate(e.endDate)}</TableCell>
                            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}><Chip label={e.eventType} size="small" variant="outlined" /></TableCell>
                        </TableRow>
                    ))}</TableBody>
                </Table></StyledTableContainer>
            )}
        </Box>
    );
}

function FoundationProgramSpecView({ data }: { data: any }) {
    if (!data) return <TableSkeleton cols={2} rows={6} />;
    return (
        <Box>
            <KeyValueTable title={data.programName} subtitle={data.description} rows={[
                { label: 'Duration', value: data.duration }, { label: 'Total Credits', value: data.totalCredits },
                { label: 'Spec File', value: <ExtLink href={data.specificationFileUrl}>Download</ExtLink> }, { label: 'Last Updated', value: formatDate(data.lastUpdated) },
            ]} />
            {data.modules?.length > 0 && (
                <StyledTableContainer title="Modules"><Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>#</TableCell>
                            <TableCell>Code</TableCell>
                            <TableCell>Module</TableCell>
                            <TableCell>Credits</TableCell>
                            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Semester</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>{data.modules.map((m: any, i: number) => (
                        <TableRow key={i}>
                            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{i + 1}</TableCell>
                            <TableCell><Chip label={m.moduleCode} size="small" variant="outlined" /></TableCell>
                            <TableCell sx={{ fontWeight: 500 }}>{m.moduleName}</TableCell>
                            <TableCell>{m.credits}</TableCell>
                            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{m.semester}</TableCell>
                        </TableRow>
                    ))}</TableBody>
                </Table></StyledTableContainer>
            )}
        </Box>
    );
}

function FoundationContactsView({ data }: { data: any }) {
    if (!data) return <TableSkeleton cols={6} rows={5} />;
    return (
        <StyledTableContainer title="Important Contact Details">
            <Table size="small">
                <TableHead>
                    <TableRow>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>#</TableCell>
                        <TableCell>Role</TableCell>
                        <TableCell>Name</TableCell>
                        <TableCell>Email</TableCell>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Phone</TableCell>
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Office</TableCell>
                        <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>Hours</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>{data.contacts?.map((c: any, i: number) => (
                    <TableRow key={i}>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{i + 1}</TableCell>
                        <TableCell sx={{ fontWeight: 500 }}>{c.role}</TableCell>
                        <TableCell>{c.name}</TableCell>
                        <TableCell><Link href={`mailto:${c.email}`} underline="hover" sx={{ fontSize: { xs: '0.7rem', sm: 'inherit' } }}>{c.email}</Link></TableCell>
                        <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{c.phone}</TableCell>
                        <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{c.office}</TableCell>
                        <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>{c.officeHours}</TableCell>
                    </TableRow>
                ))}</TableBody>
            </Table>
        </StyledTableContainer>
    );
}

function FoundationTimeTableView({ data }: { data: any }) {
    if (!data) return <TableSkeleton cols={5} rows={8} />;
    return (
        <Box>
            <KeyValueTable title="Foundation Time Table" subtitle={`${data.semester} — ${data.academicYear}`} rows={[
                { label: 'Effective From', value: formatDate(data.effectiveFrom) },
                { label: 'Timetable File', value: <ExtLink href={data.timetableFileUrl}>Download PDF</ExtLink> },
            ]} />
            {data.schedule?.map((day: any, di: number) => (
                <StyledTableContainer key={di} title={day.day}>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Time</TableCell>
                                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Code</TableCell>
                                <TableCell>Module</TableCell>
                                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Lecturer</TableCell>
                                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Venue</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>{day.slots?.map((s: any, si: number) => (
                            <TableRow key={si}>
                                <TableCell sx={{ whiteSpace: 'nowrap' }}>{s.startTime} – {s.endTime}</TableCell>
                                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}><Chip label={s.moduleCode} size="small" variant="outlined" /></TableCell>
                                <TableCell sx={{ fontWeight: 500 }}>{s.moduleName}</TableCell>
                                <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{s.lecturer}</TableCell>
                                <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{s.venue}</TableCell>
                            </TableRow>
                        ))}</TableBody>
                    </Table>
                </StyledTableContainer>
            ))}
        </Box>
    );
}

function FoundationAssessmentView({ data }: { data: any }) {
    if (!data) return <TableSkeleton cols={7} rows={6} />;
    return (
        <Box>
            <KeyValueTable title="Assessment Schedule" subtitle={`${data.semester} — ${data.academicYear}`} rows={[
                { label: 'Schedule File', value: <ExtLink href={data.scheduleFileUrl}>Download PDF</ExtLink> },
            ]} />
            <StyledTableContainer title="Assessments">
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>#</TableCell>
                            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Code</TableCell>
                            <TableCell>Module</TableCell>
                            <TableCell>Type</TableCell>
                            <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>Description</TableCell>
                            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Weight</TableCell>
                            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Release</TableCell>
                            <TableCell>Deadline</TableCell>
                            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>Feedback</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>{data.assessments?.map((a: any, i: number) => (
                        <TableRow key={i}>
                            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{i + 1}</TableCell>
                            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}><Chip label={a.moduleCode} size="small" variant="outlined" /></TableCell>
                            <TableCell sx={{ fontWeight: 500 }}>{a.moduleName}</TableCell>
                            <TableCell>{a.assessmentType}</TableCell>
                            <TableCell sx={{ display: { xs: 'none', lg: 'table-cell' } }}>{a.description}</TableCell>
                            <TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>{a.weightPercentage}%</TableCell>
                            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{formatDate(a.releaseDate)}</TableCell>
                            <TableCell>{formatDate(a.submissionDeadline)}</TableCell>
                            <TableCell sx={{ display: { xs: 'none', md: 'table-cell' } }}>{formatDate(a.feedbackDate)}</TableCell>
                        </TableRow>
                    ))}</TableBody>
                </Table>
            </StyledTableContainer>
        </Box>
    );
}

function FoundationLmsView({ data }: { data: any }) {
    if (!data) return <TableSkeleton cols={2} rows={6} />;
    return <KeyValueTable title="LMS Login Details" rows={[
        { label: 'LMS Name', value: data.lmsName }, { label: 'LMS URL', value: <ExtLink href={data.lmsUrl}>{data.lmsUrl}</ExtLink> },
        { label: 'Username Format', value: data.usernameFormat }, { label: 'Login Instructions', value: data.loginInstructions },
        { label: 'Default Password Info', value: data.defaultPasswordInfo }, { label: 'Password Reset', value: <ExtLink href={data.passwordResetUrl}>{data.passwordResetUrl}</ExtLink> },
        { label: 'Browser Requirements', value: data.browserRequirements?.join(', ') }, { label: 'Notes', value: data.additionalNotes },
        { label: 'Support', value: `${data.supportContact?.name} — ${data.supportContact?.email} — ${data.supportContact?.phone}` },
    ]} />;
}

function FoundationMitigationView({ data }: { data: any }) {
    if (!data) return <TableSkeleton cols={2} rows={6} />;
    return (
        <Box>
            <KeyValueTable title={data.formName} subtitle={data.description} rows={[
                { label: 'Form File', value: <ExtLink href={data.formFileUrl}>Download PDF</ExtLink> },
                { label: 'Submission Email', value: <Link href={`mailto:${data.submissionEmail}`} underline="hover">{data.submissionEmail}</Link> },
                { label: 'Deadline', value: data.submissionDeadline },
                { label: 'Contact', value: `${data.contactPerson?.name} — ${data.contactPerson?.role} (${data.contactPerson?.email})` },
            ]} />
            {data.eligibleCircumstances?.length > 0 && (
                <StyledTableContainer title="Eligible Circumstances"><Table size="small"><TableHead><TableRow><TableCell>#</TableCell><TableCell>Circumstance</TableCell></TableRow></TableHead>
                    <TableBody>{data.eligibleCircumstances.map((c: string, i: number) => (<TableRow key={i}><TableCell>{i + 1}</TableCell><TableCell>{c}</TableCell></TableRow>))}</TableBody></Table></StyledTableContainer>
            )}
            {data.requiredEvidence?.length > 0 && (
                <StyledTableContainer title="Required Evidence"><Table size="small"><TableHead><TableRow><TableCell>#</TableCell><TableCell>Evidence</TableCell></TableRow></TableHead>
                    <TableBody>{data.requiredEvidence.map((e: string, i: number) => (<TableRow key={i}><TableCell>{i + 1}</TableCell><TableCell>{e}</TableCell></TableRow>))}</TableBody></Table></StyledTableContainer>
            )}
        </Box>
    );
}

// ============================================================================
// Main Component
// ============================================================================

export default function IntranetPage() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [activeTab, setActiveTab] = useState(0);
    const [activeSubTab, setActiveSubTab] = useState(0);

    const {
        isLoading, isDetailLoading, error, clearError, fetchAllSections,
        scheduleDetails, complaintDetails, calendarDetails, undergraduateDetails, postgraduateDetails,
        policyDetails, mitigationFormDetails,
        fetchScheduleBySlug, fetchComplaintBySlug, fetchCalendarBySlug, fetchUndergradBySlug, fetchPostgradBySlug,
        fetchPolicyBySlug, fetchMitigationBySlug,
        staffSoc, staffCommonInfo, staffMailGroups, staffDocArchive, staffContacts, fetchAllStaffDetails,
        courseDetails, housesInfo, studentsUnionInfo, clubsAndSocieties, fetchAllInfoDetails,
        helpDeskVideoSeries, fetchSruDetails,
        foundationAcademicCalendar, foundationProgramSpec, foundationContactDetails,
        foundationTimeTable, foundationAssessmentSchedule, foundationLmsDetails,
        foundationMitigationForm, fetchAllFoundationDetails,
    } = useIntranet();

    const currentTab = TABS[activeTab];
    const subTabs = currentTab.subTabs || [];
    const currentSubTab = activeSubTab >= 0 && activeSubTab < subTabs.length ? subTabs[activeSubTab] : null;

    useEffect(() => { fetchAllSections(); }, [fetchAllSections]);

    const handleMainTabChange = useCallback((_: any, val: number) => { setActiveTab(val); setActiveSubTab(0); }, []);

    // Fetch detail when sub-tab is selected
    useEffect(() => {
        if (!currentSubTab?.slug) return;
        const slug = currentSubTab.slug;
        switch (currentTab.id) {
            case 'schedules': if (!scheduleDetails[slug]) fetchScheduleBySlug(slug); break;
            case 'student-complaints': if (!complaintDetails[slug]) fetchComplaintBySlug(slug); break;
            case 'academic-calendars': if (!calendarDetails[slug]) fetchCalendarBySlug(slug); break;
            case 'undergraduate': if (!undergraduateDetails[slug]) fetchUndergradBySlug(slug); break;
            case 'postgraduate': if (!postgraduateDetails[slug]) fetchPostgradBySlug(slug); break;
            case 'student-policies': if (!policyDetails[slug]) fetchPolicyBySlug(slug); break;
            case 'mitigation-forms': if (!mitigationFormDetails[slug]) fetchMitigationBySlug(slug); break;
            case 'staff':
                if (slug === 'soc' && !staffSoc) fetchAllStaffDetails();
                else if (slug === 'common-info' && !staffCommonInfo) fetchAllStaffDetails();
                else if (slug === 'mail-groups' && !staffMailGroups) fetchAllStaffDetails();
                else if (slug === 'doc-arch' && !staffDocArchive) fetchAllStaffDetails();
                else if (slug === 'contacts' && !staffContacts) fetchAllStaffDetails();
                break;
            case 'info':
                if (slug === 'course-details' && !courseDetails) fetchAllInfoDetails();
                else if (slug === 'houses' && !housesInfo) fetchAllInfoDetails();
                else if (slug === 'students-union' && !studentsUnionInfo) fetchAllInfoDetails();
                else if (slug === 'clubs-and-societies' && !clubsAndSocieties) fetchAllInfoDetails();
                break;
            case 'students-relations-unit':
                if (slug === 'help-desk-video-series' && !helpDeskVideoSeries) fetchSruDetails();
                break;
            case 'foundation-program':
                if (slug === 'academic-calendar' && !foundationAcademicCalendar) fetchAllFoundationDetails();
                else if (slug === 'program-specification' && !foundationProgramSpec) fetchAllFoundationDetails();
                else if (slug === 'important-contact-details' && !foundationContactDetails) fetchAllFoundationDetails();
                else if (slug === 'time-table' && !foundationTimeTable) fetchAllFoundationDetails();
                else if (slug === 'assessment-schedule' && !foundationAssessmentSchedule) fetchAllFoundationDetails();
                else if (slug === 'lms-login-details' && !foundationLmsDetails) fetchAllFoundationDetails();
                else if (slug === 'mitigating-circumstances-form' && !foundationMitigationForm) fetchAllFoundationDetails();
                break;
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeSubTab, activeTab]);

    const handleRefresh = () => {
        if (!currentSubTab?.slug) return;
        const slug = currentSubTab.slug;
        switch (currentTab.id) {
            case 'schedules': fetchScheduleBySlug(slug); break;
            case 'student-complaints': fetchComplaintBySlug(slug); break;
            case 'academic-calendars': fetchCalendarBySlug(slug); break;
            case 'undergraduate': fetchUndergradBySlug(slug); break;
            case 'postgraduate': fetchPostgradBySlug(slug); break;
            case 'student-policies': fetchPolicyBySlug(slug); break;
            case 'mitigation-forms': fetchMitigationBySlug(slug); break;
            case 'staff': fetchAllStaffDetails(); break;
            case 'info': fetchAllInfoDetails(); break;
            case 'students-relations-unit': fetchSruDetails(); break;
            case 'foundation-program': fetchAllFoundationDetails(); break;
        }
    };

    const renderSubTabContent = () => {
        if (!currentSubTab) return null;
        const slug = currentSubTab.slug!;
        const loading = isDetailLoading;
        switch (currentTab.id) {
            case 'schedules': return loading && !scheduleDetails[slug] ? <TableSkeleton cols={5} rows={6} /> : <ScheduleDetailView data={scheduleDetails[slug]} />;
            case 'student-complaints': return loading && !complaintDetails[slug] ? <TableSkeleton cols={2} rows={6} /> : <ComplaintDetailView data={complaintDetails[slug]} />;
            case 'academic-calendars': return loading && !calendarDetails[slug] ? <TableSkeleton cols={4} rows={5} /> : <CalendarDetailView data={calendarDetails[slug]} />;
            case 'undergraduate': return loading && !undergraduateDetails[slug] ? <TableSkeleton cols={2} rows={8} /> : <ProgramDetailView data={undergraduateDetails[slug]} />;
            case 'postgraduate': return loading && !postgraduateDetails[slug] ? <TableSkeleton cols={2} rows={8} /> : <ProgramDetailView data={postgraduateDetails[slug]} />;
            case 'student-policies': return loading && !policyDetails[slug] ? <TableSkeleton cols={2} rows={6} /> : <PolicyDetailView data={policyDetails[slug]} />;
            case 'mitigation-forms': return loading && !mitigationFormDetails[slug] ? <TableSkeleton cols={2} rows={7} /> : <MitigationDetailView data={mitigationFormDetails[slug]} />;
            case 'students-relations-unit': return slug === 'help-desk-video-series' ? <HelpDeskVideoSeriesView data={helpDeskVideoSeries} /> : null;
            case 'staff':
                if (slug === 'soc') return <StaffSocView data={staffSoc} />;
                if (slug === 'common-info') return <StaffCommonInfoView data={staffCommonInfo} />;
                if (slug === 'mail-groups') return <StaffMailGroupsView data={staffMailGroups} />;
                if (slug === 'doc-arch') return <StaffDocArchiveView data={staffDocArchive} />;
                if (slug === 'contacts') return <StaffContactsView data={staffContacts} />;
                return null;
            case 'info':
                if (slug === 'course-details') return <CourseDetailsView data={courseDetails} />;
                if (slug === 'houses') return <HousesView data={housesInfo} />;
                if (slug === 'students-union') return <StudentsUnionView data={studentsUnionInfo} />;
                if (slug === 'clubs-and-societies') return <ClubsView data={clubsAndSocieties} />;
                return null;
            case 'foundation-program':
                if (slug === 'academic-calendar') return <FoundationCalendarView data={foundationAcademicCalendar} />;
                if (slug === 'program-specification') return <FoundationProgramSpecView data={foundationProgramSpec} />;
                if (slug === 'important-contact-details') return <FoundationContactsView data={foundationContactDetails} />;
                if (slug === 'time-table') return <FoundationTimeTableView data={foundationTimeTable} />;
                if (slug === 'assessment-schedule') return <FoundationAssessmentView data={foundationAssessmentSchedule} />;
                if (slug === 'lms-login-details') return <FoundationLmsView data={foundationLmsDetails} />;
                if (slug === 'mitigating-circumstances-form') return <FoundationMitigationView data={foundationMitigationForm} />;
                return null;
            default: return null;
        }
    };

    return (
        <MotionBox initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} sx={{ maxWidth: 1400, mx: 'auto', px: { xs: 0.5, sm: 1, md: 2, lg: 0 } }}>
            <PageHeader
                title="Student Intranet"
                subtitle={isMobile ? undefined : 'Access university information, policies, programs, and resources'}
                backHref="/student"
                showBackButton={false}
                action={
                    <Button variant="outlined" size="small" startIcon={<RefreshIcon />} onClick={handleRefresh} disabled={isLoading || isDetailLoading} sx={{ textTransform: 'none', borderRadius: 2, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        {isMobile ? '' : 'Refresh'}
                    </Button>
                }
            />

            {error && <Alert severity="error" onClose={clearError} sx={{ mb: 2, borderRadius: 2, fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>{error}</Alert>}

            {/* Main Tabs */}
            <Paper elevation={0} sx={{ mb: { xs: 1, sm: 2 }, borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                <Tabs value={activeTab} onChange={handleMainTabChange} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile
                    sx={{
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            minHeight: { xs: 44, sm: 56 },
                            fontWeight: 500,
                            fontSize: { xs: '0.7rem', sm: '0.85rem' },
                            minWidth: { xs: 'auto', sm: 90 },
                            px: { xs: 1, sm: 2 },
                        },
                        '& .Mui-selected': { fontWeight: 600 },
                        '& .MuiTabs-scrollButtons': { width: { xs: 28, sm: 40 } },
                    }}>
                    {TABS.map((tab) => (
                        <Tab
                            key={tab.id}
                            icon={tab.icon}
                            label={isMobile ? undefined : tab.label}
                            iconPosition="start"
                            sx={{
                                '&.Mui-selected': { color: tab.color },
                                '& .MuiSvgIcon-root': { fontSize: { xs: '1.1rem', sm: '1.25rem' }, mr: { xs: 0, sm: 0.5 } },
                            }}
                        />
                    ))}
                </Tabs>
            </Paper>

            {/* Sub Tabs */}
            {subTabs.length > 0 && (
                <Paper elevation={0} sx={{ mb: { xs: 1.5, sm: 3 }, borderRadius: 2, border: '1px solid', borderColor: 'divider', overflow: 'hidden' }}>
                    <Tabs value={activeSubTab} onChange={(_, val) => setActiveSubTab(val)} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile
                        sx={{
                            minHeight: { xs: 36, sm: 42 },
                            '& .MuiTab-root': {
                                textTransform: 'none',
                                minHeight: { xs: 36, sm: 42 },
                                fontWeight: 500,
                                fontSize: { xs: '0.7rem', sm: '0.8rem' },
                                py: 0.5,
                                px: { xs: 1, sm: 1.5 },
                                minWidth: { xs: 'auto', sm: 80 },
                            },
                            '& .Mui-selected': { fontWeight: 600, color: currentTab.color },
                            '& .MuiTabs-indicator': { backgroundColor: currentTab.color },
                            '& .MuiTabs-scrollButtons': { width: { xs: 28, sm: 40 } },
                        }}>
                        {subTabs.map((st, idx) => (<Tab key={st.id} label={st.label} value={idx} />))}
                    </Tabs>
                </Paper>
            )}

            {/* Content */}
            <MotionBox key={`${currentTab.id}-${activeSubTab}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
                {renderSubTabContent()}
            </MotionBox>
        </MotionBox>
    );
}

