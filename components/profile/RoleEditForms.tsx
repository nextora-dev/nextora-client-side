/**
 * @fileoverview Role-based Profile Edit Components
 * @description Reusable form components for editing role-specific profile data
 */

'use client';

import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    TextField,
    Stack,
    Chip,
    Paper,
    Switch,
    FormControlLabel,
    alpha,
    useTheme,
    Divider,
    InputAdornment,
} from '@mui/material';
import { motion } from 'framer-motion';
import SchoolIcon from '@mui/icons-material/School';
import BadgeIcon from '@mui/icons-material/Badge';
import WorkIcon from '@mui/icons-material/Work';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SecurityIcon from '@mui/icons-material/Security';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';

import {
    UserProfile,
    isStudentProfile,
    isAcademicStaffProfile,
    isNonAcademicStaffProfile,
    isAdminProfile,
    isSuperAdminProfile,
} from '@/features';

import {
    StudentRoleSpecificData,
    AcademicStaffRoleSpecificData,
    NonAcademicStaffRoleSpecificData,
    AdminRoleSpecificData,
    SuperAdminRoleSpecificData,
} from '@/types/user';

const MotionCard = motion.create(Card);

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// ============================================================================
// Student Edit Form
// ============================================================================

interface StudentEditFormProps {
    data: StudentRoleSpecificData;
    onChange: (field: string, value: string) => void;
    errors?: Record<string, string>;
    formValues?: Record<string, string | boolean>;  // Current form values from parent
}

export function StudentEditForm({ data, onChange, errors = {}, formValues = {} }: StudentEditFormProps) {
    const theme = useTheme();

    // Helper to get current value (prefer formValues over data)
    const getValue = (field: keyof StudentRoleSpecificData) => {
        if (formValues && field in formValues) {
            return formValues[field] as string || '';
        }
        return data[field] as string || '';
    };

    return (
        <Stack spacing={3}>
            {/* Basic Student Info */}
            <MotionCard variants={itemVariants} elevation={0} sx={{ borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                <CardContent sx={{ p: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                        <Box sx={{ width: 40, height: 40, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.primary.main, 0.1) }}>
                            <SchoolIcon sx={{ color: 'primary.main' }} />
                        </Box>
                        <Typography variant="h6" fontWeight={700}>Student Information</Typography>
                    </Stack>

                    <Grid container spacing={2.5}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Student ID"
                                value={data.studentId || ''}
                                disabled
                                fullWidth
                                helperText="Cannot be changed"
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><BadgeIcon sx={{ color: 'text.secondary' }} /></InputAdornment>,
                                }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Faculty"
                                value={data.faculty || ''}
                                disabled
                                fullWidth
                                helperText="Cannot be changed"
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><BusinessIcon sx={{ color: 'text.secondary' }} /></InputAdornment>,
                                }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Program"
                                value={data.program || ''}
                                disabled
                                fullWidth
                                helperText="Contact admin to change"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Batch"
                                value={data.batch || ''}
                                disabled
                                fullWidth
                                helperText="Cannot be changed"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Date of Birth"
                                type="date"
                                value={getValue('dateOfBirth')}
                                onChange={(e) => onChange('dateOfBirth', e.target.value)}
                                fullWidth
                                InputLabelProps={{ shrink: true }}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><CalendarTodayIcon sx={{ color: 'text.secondary' }} /></InputAdornment>,
                                }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Address"
                                value={getValue('address')}
                                onChange={(e) => onChange('address', e.target.value)}
                                fullWidth
                                error={!!errors.address}
                                helperText={errors.address}
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><LocationOnIcon sx={{ color: 'text.secondary' }} /></InputAdornment>,
                                }}
                            />
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>Guardian Information</Typography>
                    <Grid container spacing={2.5}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Guardian Name"
                                value={getValue('guardianName')}
                                onChange={(e) => onChange('guardianName', e.target.value)}
                                fullWidth
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><PersonIcon sx={{ color: 'text.secondary' }} /></InputAdornment>,
                                }}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <TextField
                                label="Guardian Phone"
                                value={getValue('guardianPhone')}
                                onChange={(e) => onChange('guardianPhone', e.target.value)}
                                fullWidth
                                InputProps={{
                                    startAdornment: <InputAdornment position="start"><PhoneIcon sx={{ color: 'text.secondary' }} /></InputAdornment>,
                                }}
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </MotionCard>

            {/* Student Sub-Roles (Read-only display) */}
            {data.studentRoleTypes && data.studentRoleTypes.length > 0 && (
                <MotionCard variants={itemVariants} elevation={0} sx={{ borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                    <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                            <Box sx={{ width: 40, height: 40, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.secondary.main, 0.1) }}>
                                <EmojiEventsIcon sx={{ color: 'secondary.main' }} />
                            </Box>
                            <Typography variant="h6" fontWeight={700}>Student Roles</Typography>
                            <Chip label="Read-only" size="small" variant="outlined" />
                        </Stack>

                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
                            {data.studentRoleTypes.map((role) => (
                                <Chip
                                    key={role}
                                    label={role}
                                    color={role === data.primaryRoleType ? 'primary' : 'default'}
                                    variant={role === data.primaryRoleType ? 'filled' : 'outlined'}
                                />
                            ))}
                        </Stack>

                        <Typography variant="body2" color="text.secondary">
                            Contact admin to modify your student roles.
                        </Typography>
                    </CardContent>
                </MotionCard>
            )}
        </Stack>
    );
}

// ============================================================================
// Academic Staff Edit Form
// ============================================================================

interface AcademicStaffEditFormProps {
    data: AcademicStaffRoleSpecificData;
    onChange: (field: string, value: string | boolean) => void;
    errors?: Record<string, string>;
}

export function AcademicStaffEditForm({ data, onChange, errors = {} }: AcademicStaffEditFormProps) {
    const theme = useTheme();

    return (
        <MotionCard variants={itemVariants} elevation={0} sx={{ borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.info.main, 0.1) }}>
                        <MenuBookIcon sx={{ color: 'info.main' }} />
                    </Box>
                    <Typography variant="h6" fontWeight={700}>Academic Staff Information</Typography>
                </Stack>

                <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField label="Employee ID" value={data.employeeId || ''} disabled fullWidth helperText="Cannot be changed" />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField label="Position" value={data.position || ''} disabled fullWidth />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField label="Designation" value={data.designation || ''} disabled fullWidth />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField label="Department" value={data.department || ''} disabled fullWidth />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                            label="Faculty"
                            value={data.faculty || ''}
                            disabled
                            helperText="Cannot be changed"
                            select
                            fullWidth
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField
                            label="Office Location"
                            value={data.officeLocation || ''}
                            disabled
                            helperText="Cannot be changed"
                            fullWidth
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            label="Specialization"
                            value={data.specialization || ''}
                            disabled
                            helperText="Cannot be changed"
                            fullWidth
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={data.availableForMeetings || false}
                                    onChange={(e) => onChange('availableForMeetings', e.target.checked)}
                                />
                            }
                            label="Available for Meetings"
                        />
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <TextField
                            label="Bio"
                            value={data.bio || ''}
                            onChange={(e) => onChange('bio', e.target.value)}
                            fullWidth
                            multiline
                            rows={3}
                        />
                    </Grid>
                </Grid>
            </CardContent>
        </MotionCard>
    );
}

// ============================================================================
// Non-Academic Staff Edit Form
// ============================================================================

interface NonAcademicStaffEditFormProps {
    data: NonAcademicStaffRoleSpecificData;
    onChange: (field: string, value: string) => void;
    errors?: Record<string, string>;
}

export function NonAcademicStaffEditForm({ data, onChange, errors = {} }: NonAcademicStaffEditFormProps) {
    const theme = useTheme();

    return (
        <MotionCard variants={itemVariants} elevation={0} sx={{ borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.warning.main, 0.1) }}>
                        <WorkIcon sx={{ color: 'warning.main' }} />
                    </Box>
                    <Typography variant="h6" fontWeight={700}>Staff Information</Typography>
                </Stack>

                <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField label="Employee ID" value={data.employeeId || ''} disabled fullWidth />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField label="Position" value={data.position || ''} disabled fullWidth />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <TextField label="Department" value={data.department || ''} disabled fullWidth />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            label="Work Location"
                            value={data.workLocation || ''}
                            disabled
                            helperText="Cannot be changed"
                            fullWidth
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField label="Shift" value={data.shift || ''} disabled fullWidth />
                    </Grid>
                </Grid>
            </CardContent>
        </MotionCard>
    );
}

// ============================================================================
// Admin Edit Form
// ============================================================================

interface AdminEditFormProps {
    data: AdminRoleSpecificData;
    onChange: (field: string, value: string) => void;
    errors?: Record<string, string>;
}

export function AdminEditForm({ data, onChange, errors = {} }: AdminEditFormProps) {
    const theme = useTheme();

    return (
        <MotionCard variants={itemVariants} elevation={0} sx={{ borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.error.main, 0.1) }}>
                        <AdminPanelSettingsIcon sx={{ color: 'error.main' }} />
                    </Box>
                    <Typography variant="h6" fontWeight={700}>Admin Information</Typography>
                    <Chip label="Limited Editing" size="small" color="warning" variant="outlined" />
                </Stack>

                <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField label="Admin ID" value={data.adminId || ''} disabled fullWidth />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField label="Department" value={data.department || ''} disabled fullWidth />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField label="Assigned Date" value={data.assignedDate || ''} disabled fullWidth />
                    </Grid>
                </Grid>
            </CardContent>
        </MotionCard>
    );
}

// ============================================================================
// Super Admin Edit Form
// ============================================================================

interface SuperAdminEditFormProps {
    data: SuperAdminRoleSpecificData;
    onChange: (field: string, value: string) => void;
    errors?: Record<string, string>;
}

export function SuperAdminEditForm({ data, onChange, errors = {} }: SuperAdminEditFormProps) {
    const theme = useTheme();

    return (
        <MotionCard variants={itemVariants} elevation={0} sx={{ borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.secondary.main, 0.1) }}>
                        <SecurityIcon sx={{ color: 'secondary.main' }} />
                    </Box>
                    <Typography variant="h6" fontWeight={700}>Super Admin Information</Typography>
                    <Chip label="Read-only" size="small" variant="outlined" />
                </Stack>

                <Grid container spacing={2.5}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField label="Super Admin ID" value={data.superAdminId || ''} disabled fullWidth />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField label="Access Level" value={data.accessLevel || ''} disabled fullWidth />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField label="Assigned Date" value={data.assignedDate || ''} disabled fullWidth />
                    </Grid>
                </Grid>
            </CardContent>
        </MotionCard>
    );
}

// ============================================================================
// Dynamic Role Edit Form (Main Export)
// ============================================================================

interface RoleEditFormProps {
    profile: UserProfile | null | undefined;
    onRoleDataChange: (field: string, value: string | boolean) => void;
    errors?: Record<string, string>;
    formValues?: Record<string, string | boolean>;  // Current form values
}

export function RoleEditForm({ profile, onRoleDataChange, errors = {}, formValues = {} }: RoleEditFormProps) {
    // Handle null/undefined profile
    if (!profile || !profile.roleSpecificData) {
        return (
            <Paper elevation={0} sx={{ p: 3, textAlign: 'center' }}>
                <Typography color="text.secondary">Loading role-specific data...</Typography>
            </Paper>
        );
    }

    if (isStudentProfile(profile)) {
        return <StudentEditForm data={profile.roleSpecificData} onChange={onRoleDataChange} errors={errors} formValues={formValues} />;
    }

    if (isAcademicStaffProfile(profile)) {
        return <AcademicStaffEditForm data={profile.roleSpecificData} onChange={onRoleDataChange} errors={errors} />;
    }

    if (isNonAcademicStaffProfile(profile)) {
        return <NonAcademicStaffEditForm data={profile.roleSpecificData} onChange={onRoleDataChange} errors={errors} />;
    }

    if (isAdminProfile(profile)) {
        return <AdminEditForm data={profile.roleSpecificData} onChange={onRoleDataChange} errors={errors} />;
    }

    if (isSuperAdminProfile(profile)) {
        return <SuperAdminEditForm data={profile.roleSpecificData} onChange={onRoleDataChange} errors={errors} />;
    }

    return (
        <Paper elevation={0} sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">No role-specific edit form available for role: {profile.role}</Typography>
        </Paper>
    );
}

