'use client';

import { Box, Typography, Card, CardContent, Grid, Stack, Chip, Avatar, TextField, InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { PageHeader } from '@/components/common';

const MotionCard = motion.create(Card);
const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const USER_STATS = [
    { label: 'Total Users', value: '15,847', color: '#2563EB' },
    { label: 'Students', value: '12,456', color: '#7C3AED' },
    { label: 'Staff', value: '2,891', color: '#059669' },
    { label: 'Admins', value: '24', color: '#DC2626' },
];

const USERS = [
    { id: 1, name: 'Alice Johnson', email: 'alice.j@uni.edu', role: 'Student', department: 'Computing', status: 'Active' },
    { id: 2, name: 'Bob Williams', email: 'bob.w@uni.edu', role: 'Academic Staff', department: 'Engineering', status: 'Active' },
    { id: 3, name: 'Carol Davis', email: 'carol.d@uni.edu', role: 'Student', department: 'Business', status: 'Active' },
    { id: 4, name: 'David Miller', email: 'david.m@uni.edu', role: 'Non-Academic Staff', department: 'Admin', status: 'Inactive' },
];

export default function SuperAdminUsersPage() {
    return (
        <Box component={motion.div} variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 1600, mx: 'auto' }}>
            <PageHeader title="All Users" subtitle="View and manage all system users" showBackButton={false} />

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {USER_STATS.map((stat) => (
                    <Grid size={{ xs: 6, md: 3 }} key={stat.label}>
                        <MotionCard variants={itemVariants} sx={{ borderRadius: 3 }}>
                            <CardContent>
                                <Typography variant="h4" fontWeight={700} sx={{ color: stat.color }}>{stat.value}</Typography>
                                <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
                            </CardContent>
                        </MotionCard>
                    </Grid>
                ))}
            </Grid>

            <MotionCard variants={itemVariants} sx={{ borderRadius: 3 }}>
                <CardContent>
                    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" sx={{ mb: 3 }}>
                        <TextField placeholder="Search users..." size="small" sx={{ width: { xs: '100%', sm: 300 } }} slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> } }} />
                    </Stack>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>User</TableCell>
                                    <TableCell>Role</TableCell>
                                    <TableCell>Department</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {USERS.map((user) => (
                                    <TableRow key={user.id} hover>
                                        <TableCell>
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Avatar sx={{ width: 36, height: 36 }}>{user.name[0]}</Avatar>
                                                <Box>
                                                    <Typography fontWeight={500}>{user.name}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{user.email}</Typography>
                                                </Box>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>{user.role}</TableCell>
                                        <TableCell>{user.department}</TableCell>
                                        <TableCell><Chip label={user.status} size="small" color={user.status === 'Active' ? 'success' : 'default'} /></TableCell>
                                        <TableCell align="right"><IconButton size="small"><MoreVertIcon /></IconButton></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </CardContent>
            </MotionCard>
        </Box>
    );
}

