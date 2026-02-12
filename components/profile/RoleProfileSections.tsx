/**
 * @fileoverview Role-based Profile Components
 * @description Reusable components for displaying role-specific profile data
 */

'use client';

import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    Stack,
    Chip,
    Paper,
    alpha,
    useTheme,
    Divider,
} from '@mui/material';
import { motion } from 'framer-motion';
import SchoolIcon from '@mui/icons-material/School';
import BadgeIcon from '@mui/icons-material/Badge';
import WorkIcon from '@mui/icons-material/Work';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SecurityIcon from '@mui/icons-material/Security';
import GroupsIcon from '@mui/icons-material/Groups';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import StarIcon from '@mui/icons-material/Star';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';

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
    ClubMemberData,
    BatchRepData,
    SeniorKuppiData,
} from '@/types/user';

const MotionCard = motion.create(Card);

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

// ============================================================================
// Info Item Component
// ============================================================================

interface InfoItemProps {
    label: string;
    value: string | number | null | undefined;
    icon?: React.ElementType;
    color?: string;
}

export function InfoItem({ label, value, icon: Icon, color }: InfoItemProps) {
    const theme = useTheme();
    return (
        <Stack direction="row" spacing={2} alignItems="center">
            {Icon && (
                <Box
                    sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: alpha(color || theme.palette.primary.main, 0.1),
                    }}
                >
                    <Icon sx={{ color: color || 'primary.main', fontSize: 20 }} />
                </Box>
            )}
            <Box>
                <Typography variant="caption" color="text.secondary">{label}</Typography>
                <Typography variant="body2" fontWeight={600}>{value || 'N/A'}</Typography>
            </Box>
        </Stack>
    );
}

// ============================================================================
// Role Badge Component
// ============================================================================

interface RoleBadgeProps {
    role: string;
    subRoles?: string[];
}

export function RoleBadge({ role, subRoles }: RoleBadgeProps) {
    const theme = useTheme();

    const getRoleConfig = (role: string) => {
        switch (role) {
            case 'ROLE_STUDENT':
                return { label: 'Student', color: theme.palette.primary.main, icon: SchoolIcon };
            case 'ROLE_ACADEMIC_STAFF':
                return { label: 'Academic Staff', color: theme.palette.info.main, icon: MenuBookIcon };
            case 'ROLE_NON_ACADEMIC_STAFF':
                return { label: 'Non-Academic Staff', color: theme.palette.warning.main, icon: WorkIcon };
            case 'ROLE_ADMIN':
                return { label: 'Admin', color: theme.palette.error.main, icon: AdminPanelSettingsIcon };
            case 'ROLE_SUPER_ADMIN':
                return { label: 'Super Admin', color: theme.palette.secondary.main, icon: SecurityIcon };
            default:
                return { label: role, color: theme.palette.grey[500], icon: PersonIcon };
        }
    };

    const config = getRoleConfig(role);
    const Icon = config.icon;

    return (
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            <Chip
                icon={<Icon sx={{ fontSize: 18 }} />}
                label={config.label}
                sx={{
                    bgcolor: alpha(config.color, 0.1),
                    color: config.color,
                    fontWeight: 600,
                    '& .MuiChip-icon': { color: config.color },
                }}
            />
            {subRoles?.map((subRole) => (
                <Chip
                    key={subRole}
                    label={subRole}
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 500 }}
                />
            ))}
        </Stack>
    );
}

// ============================================================================
// Student Profile Section
// ============================================================================

interface StudentProfileSectionProps {
    data: StudentRoleSpecificData;
}

export function StudentProfileSection({ data }: StudentProfileSectionProps) {
    const theme = useTheme();

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

                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <InfoItem icon={BadgeIcon} label="Student ID" value={data.studentId} color={theme.palette.primary.main} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <InfoItem icon={SchoolIcon} label="Program" value={data.program} color={theme.palette.secondary.main} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <InfoItem icon={BusinessIcon} label="Faculty" value={data.faculty} color={theme.palette.info.main} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <InfoItem icon={CalendarTodayIcon} label="Batch" value={data.batch} color={theme.palette.warning.main} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <InfoItem icon={CalendarTodayIcon} label="Date of Birth" value={data.dateOfBirth} color={theme.palette.success.main} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                            <InfoItem icon={LocationOnIcon} label="Address" value={data.address} color={theme.palette.error.main} />
                        </Grid>
                    </Grid>

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>Guardian Information</Typography>
                    <Grid container spacing={3}>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <InfoItem icon={PersonIcon} label="Guardian Name" value={data.guardianName} />
                        </Grid>
                        <Grid size={{ xs: 12, sm: 6 }}>
                            <InfoItem icon={PersonIcon} label="Guardian Phone" value={data.guardianPhone} />
                        </Grid>
                    </Grid>
                </CardContent>
            </MotionCard>

            {/* Student Sub-Roles */}
            {data.studentRoleTypes && data.studentRoleTypes.length > 0 && (
                <MotionCard variants={itemVariants} elevation={0} sx={{ borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                    <CardContent sx={{ p: 3 }}>
                        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                            <Box sx={{ width: 40, height: 40, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.secondary.main, 0.1) }}>
                                <EmojiEventsIcon sx={{ color: 'secondary.main' }} />
                            </Box>
                            <Typography variant="h6" fontWeight={700}>Student Roles</Typography>
                        </Stack>

                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 3 }}>
                            {data.studentRoleTypes.map((role) => (
                                <Chip
                                    key={role}
                                    label={role}
                                    color={role === data.primaryRoleType ? 'primary' : 'default'}
                                    variant={role === data.primaryRoleType ? 'filled' : 'outlined'}
                                />
                            ))}
                        </Stack>

                        {/* Club Member Data */}
                        {data.clubMemberData && (
                            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.info.main, 0.04), border: `1px solid ${alpha(theme.palette.info.main, 0.1)}`, mb: 2 }}>
                                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                                    <GroupsIcon sx={{ color: 'info.main' }} />
                                    <Typography fontWeight={600} color="info.main">Club Member</Typography>
                                </Stack>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 6, sm: 3 }}>
                                        <Typography variant="caption" color="text.secondary">Club Name</Typography>
                                        <Typography variant="body2" fontWeight={600}>{data.clubMemberData.clubName}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 6, sm: 3 }}>
                                        <Typography variant="caption" color="text.secondary">Position</Typography>
                                        <Typography variant="body2" fontWeight={600}>{data.clubMemberData.clubPosition}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 6, sm: 3 }}>
                                        <Typography variant="caption" color="text.secondary">Member ID</Typography>
                                        <Typography variant="body2" fontWeight={600}>{data.clubMemberData.clubMembershipId}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 6, sm: 3 }}>
                                        <Typography variant="caption" color="text.secondary">Join Date</Typography>
                                        <Typography variant="body2" fontWeight={600}>{data.clubMemberData.clubJoinDate}</Typography>
                                    </Grid>
                                </Grid>
                            </Paper>
                        )}

                        {/* Batch Rep Data */}
                        {data.batchRepData && (
                            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.warning.main, 0.04), border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`, mb: 2 }}>
                                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                                    <EmojiEventsIcon sx={{ color: 'warning.main' }} />
                                    <Typography fontWeight={600} color="warning.main">Batch Representative</Typography>
                                </Stack>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 6, sm: 3 }}>
                                        <Typography variant="caption" color="text.secondary">Year</Typography>
                                        <Typography variant="body2" fontWeight={600}>{data.batchRepData.batchRepYear}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 6, sm: 3 }}>
                                        <Typography variant="caption" color="text.secondary">Semester</Typography>
                                        <Typography variant="body2" fontWeight={600}>{data.batchRepData.batchRepSemester}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 6, sm: 3 }}>
                                        <Typography variant="caption" color="text.secondary">Elected Date</Typography>
                                        <Typography variant="body2" fontWeight={600}>{data.batchRepData.batchRepElectedDate}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12, sm: 3 }}>
                                        <Typography variant="caption" color="text.secondary">Responsibilities</Typography>
                                        <Typography variant="body2" fontWeight={600}>{data.batchRepData.batchRepResponsibilities}</Typography>
                                    </Grid>
                                </Grid>
                            </Paper>
                        )}

                        {/* Senior Kuppi Data */}
                        {data.seniorKuppiData && (
                            <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.04), border: `1px solid ${alpha(theme.palette.success.main, 0.1)}` }}>
                                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                                    <MenuBookIcon sx={{ color: 'success.main' }} />
                                    <Typography fontWeight={600} color="success.main">Senior Kuppi Mentor</Typography>
                                </Stack>
                                <Grid container spacing={2}>
                                    <Grid size={{ xs: 6, sm: 3 }}>
                                        <Typography variant="caption" color="text.secondary">Experience</Typography>
                                        <Typography variant="body2" fontWeight={600}>{data.seniorKuppiData.kuppiExperienceLevel}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 6, sm: 3 }}>
                                        <Typography variant="caption" color="text.secondary">Sessions</Typography>
                                        <Typography variant="body2" fontWeight={600}>{data.seniorKuppiData.kuppiSessionsCompleted}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 6, sm: 3 }}>
                                        <Stack direction="row" alignItems="center" spacing={0.5}>
                                            <Typography variant="caption" color="text.secondary">Rating</Typography>
                                        </Stack>
                                        <Stack direction="row" alignItems="center" spacing={0.5}>
                                            <StarIcon sx={{ color: 'warning.main', fontSize: 18 }} />
                                            <Typography variant="body2" fontWeight={600}>{data.seniorKuppiData.kuppiRating}/5</Typography>
                                        </Stack>
                                    </Grid>
                                    <Grid size={{ xs: 6, sm: 3 }}>
                                        <Typography variant="caption" color="text.secondary">Availability</Typography>
                                        <Typography variant="body2" fontWeight={600}>{data.seniorKuppiData.kuppiAvailability}</Typography>
                                    </Grid>
                                    <Grid size={{ xs: 12 }}>
                                        <Typography variant="caption" color="text.secondary">Subjects</Typography>
                                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mt: 0.5 }}>
                                            {data.seniorKuppiData.kuppiSubjects?.map((subject) => (
                                                <Chip key={subject} label={subject} size="small" variant="outlined" />
                                            ))}
                                        </Stack>
                                    </Grid>
                                </Grid>
                            </Paper>
                        )}
                    </CardContent>
                </MotionCard>
            )}
        </Stack>
    );
}

// ============================================================================
// Academic Staff Profile Section
// ============================================================================

interface AcademicStaffProfileSectionProps {
    data: AcademicStaffRoleSpecificData;
}

export function AcademicStaffProfileSection({ data }: AcademicStaffProfileSectionProps) {
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

                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <InfoItem icon={BadgeIcon} label="Employee ID" value={data.employeeId} color={theme.palette.primary.main} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <InfoItem icon={WorkIcon} label="Position" value={data.position} color={theme.palette.info.main} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <InfoItem icon={WorkIcon} label="Designation" value={data.designation} color={theme.palette.secondary.main} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <InfoItem icon={BusinessIcon} label="Department" value={data.department} color={theme.palette.warning.main} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <InfoItem icon={BusinessIcon} label="Faculty" value={data.faculty} color={theme.palette.success.main} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <InfoItem icon={CalendarTodayIcon} label="Join Date" value={data.joinDate} color={theme.palette.error.main} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <InfoItem icon={LocationOnIcon} label="Office Location" value={data.officeLocation} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <InfoItem icon={SchoolIcon} label="Specialization" value={data.specialization} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <InfoItem icon={PersonIcon} label="Available for Meetings" value={data.availableForMeetings ? 'Yes' : 'No'} />
                    </Grid>
                </Grid>

                {data.qualifications && data.qualifications.length > 0 && (
                    <>
                        <Divider sx={{ my: 3 }} />
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>Qualifications</Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {data.qualifications.map((qual, idx) => (
                                <Chip key={idx} label={qual} variant="outlined" />
                            ))}
                        </Stack>
                    </>
                )}

                {data.bio && (
                    <>
                        <Divider sx={{ my: 3 }} />
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>Bio</Typography>
                        <Typography variant="body2">{data.bio}</Typography>
                    </>
                )}
            </CardContent>
        </MotionCard>
    );
}

// ============================================================================
// Non-Academic Staff Profile Section
// ============================================================================

interface NonAcademicStaffProfileSectionProps {
    data: NonAcademicStaffRoleSpecificData;
}

export function NonAcademicStaffProfileSection({ data }: NonAcademicStaffProfileSectionProps) {
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

                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <InfoItem icon={BadgeIcon} label="Employee ID" value={data.employeeId} color={theme.palette.primary.main} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <InfoItem icon={WorkIcon} label="Position" value={data.position} color={theme.palette.info.main} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <InfoItem icon={BusinessIcon} label="Department" value={data.department} color={theme.palette.secondary.main} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <InfoItem icon={LocationOnIcon} label="Work Location" value={data.workLocation} color={theme.palette.warning.main} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <InfoItem icon={CalendarTodayIcon} label="Join Date" value={data.joinDate} color={theme.palette.success.main} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <InfoItem icon={CalendarTodayIcon} label="Shift" value={data.shift} color={theme.palette.error.main} />
                    </Grid>
                </Grid>
            </CardContent>
        </MotionCard>
    );
}

// ============================================================================
// Admin Profile Section
// ============================================================================

interface AdminProfileSectionProps {
    data: AdminRoleSpecificData;
}

export function AdminProfileSection({ data }: AdminProfileSectionProps) {
    const theme = useTheme();

    return (
        <MotionCard variants={itemVariants} elevation={0} sx={{ borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.error.main, 0.1) }}>
                        <AdminPanelSettingsIcon sx={{ color: 'error.main' }} />
                    </Box>
                    <Typography variant="h6" fontWeight={700}>Admin Information</Typography>
                </Stack>

                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <InfoItem icon={BadgeIcon} label="Admin ID" value={data.adminId} color={theme.palette.primary.main} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <InfoItem icon={BusinessIcon} label="Department" value={data.department} color={theme.palette.info.main} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <InfoItem icon={CalendarTodayIcon} label="Assigned Date" value={data.assignedDate} color={theme.palette.success.main} />
                    </Grid>
                </Grid>

                {data.permissions && data.permissions.length > 0 && (
                    <>
                        <Divider sx={{ my: 3 }} />
                        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>Permissions</Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                            {data.permissions.map((perm, idx) => (
                                <Chip key={idx} label={perm} size="small" color="error" variant="outlined" />
                            ))}
                        </Stack>
                    </>
                )}
            </CardContent>
        </MotionCard>
    );
}

// ============================================================================
// Super Admin Profile Section
// ============================================================================

interface SuperAdminProfileSectionProps {
    data: SuperAdminRoleSpecificData;
}

export function SuperAdminProfileSection({ data }: SuperAdminProfileSectionProps) {
    const theme = useTheme();

    return (
        <MotionCard variants={itemVariants} elevation={0} sx={{ borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <CardContent sx={{ p: 3 }}>
                <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 3 }}>
                    <Box sx={{ width: 40, height: 40, borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: alpha(theme.palette.secondary.main, 0.1) }}>
                        <SecurityIcon sx={{ color: 'secondary.main' }} />
                    </Box>
                    <Typography variant="h6" fontWeight={700}>Super Admin Information</Typography>
                </Stack>

                <Grid container spacing={3}>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <InfoItem icon={BadgeIcon} label="Super Admin ID" value={data.superAdminId} color={theme.palette.primary.main} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <InfoItem icon={SecurityIcon} label="Access Level" value={data.accessLevel} color={theme.palette.secondary.main} />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6, md: 4 }}>
                        <InfoItem icon={CalendarTodayIcon} label="Assigned Date" value={data.assignedDate} color={theme.palette.success.main} />
                    </Grid>
                </Grid>
            </CardContent>
        </MotionCard>
    );
}

// ============================================================================
// Dynamic Role Profile Section (Main Export)
// ============================================================================

interface RoleProfileSectionProps {
    profile: UserProfile | null | undefined;
}

export function RoleProfileSection({ profile }: RoleProfileSectionProps) {
    const theme = useTheme();

    // Handle null/undefined profile
    if (!profile) {
        return (
            <Paper elevation={0} sx={{ p: 3, textAlign: 'center', borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                <Typography color="text.secondary">Loading profile data...</Typography>
            </Paper>
        );
    }

    // Handle missing roleSpecificData
    if (!profile.roleSpecificData) {
        return (
            <Paper elevation={0} sx={{ p: 3, textAlign: 'center', borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                <Typography color="text.secondary">No role-specific data available for this profile.</Typography>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    Role: {profile.role || 'Unknown'}
                </Typography>
            </Paper>
        );
    }

    if (isStudentProfile(profile)) {
        return <StudentProfileSection data={profile.roleSpecificData} />;
    }

    if (isAcademicStaffProfile(profile)) {
        return <AcademicStaffProfileSection data={profile.roleSpecificData} />;
    }

    if (isNonAcademicStaffProfile(profile)) {
        return <NonAcademicStaffProfileSection data={profile.roleSpecificData} />;
    }

    if (isAdminProfile(profile)) {
        return <AdminProfileSection data={profile.roleSpecificData} />;
    }

    if (isSuperAdminProfile(profile)) {
        return <SuperAdminProfileSection data={profile.roleSpecificData} />;
    }

    // Fallback for unknown roles
    return (
        <Paper elevation={0} sx={{ p: 3, textAlign: 'center', borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
            <Typography color="text.secondary">
                Profile data available but role type not recognized: {profile.role}
            </Typography>
        </Paper>
    );
}

