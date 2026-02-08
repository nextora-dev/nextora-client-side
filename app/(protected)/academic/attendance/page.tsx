'use client';

import { Box, Typography, Card, CardContent, Grid, Stack, Chip, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import { motion } from 'framer-motion';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import DownloadIcon from '@mui/icons-material/Download';
import { PageHeader } from '@/components/common';

const MotionCard = motion.create(Card);
const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const ATTENDANCE_STATS = [
    { label: 'Total Classes', value: '24', color: '#2563EB' },
    { label: 'Avg Attendance', value: '89%', color: '#059669' },
    { label: 'Below 75%', value: '5', color: '#DC2626' },
];

const ATTENDANCE_DATA = [
    { id: 1, name: 'John Smith', present: 22, absent: 2, percentage: '92%', status: 'Good' },
    { id: 2, name: 'Sarah Johnson', present: 20, absent: 4, percentage: '83%', status: 'Good' },
    { id: 3, name: 'Michael Brown', present: 21, absent: 3, percentage: '88%', status: 'Good' },
    { id: 4, name: 'Emily Davis', present: 23, absent: 1, percentage: '96%', status: 'Excellent' },
    { id: 5, name: 'David Wilson', present: 17, absent: 7, percentage: '71%', status: 'At Risk' },
];

export default function AcademicAttendancePage() {
    return (
        <Box component={motion.div} variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 1600, mx: 'auto' }}>
            <PageHeader
                title="Attendance"
                subtitle="Track and manage student attendance"
                showBackButton={false}
                action={<Button variant="contained" startIcon={<DownloadIcon />}>Export Report</Button>}
            />

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {ATTENDANCE_STATS.map((stat) => (
                    <Grid size={{ xs: 12, sm: 4 }} key={stat.label}>
                        <MotionCard variants={itemVariants} sx={{ borderRadius: 3 }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <Typography variant="h3" fontWeight={700} sx={{ color: stat.color }}>{stat.value}</Typography>
                                <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
                            </CardContent>
                        </MotionCard>
                    </Grid>
                ))}
            </Grid>

            <MotionCard variants={itemVariants} sx={{ borderRadius: 3 }}>
                <CardContent>
                    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
                        <Typography variant="h6" fontWeight={600}>Attendance Records</Typography>
                        <Stack direction="row" spacing={2}>
                            <FormControl size="small" sx={{ minWidth: 150 }}>
                                <InputLabel>Course</InputLabel>
                                <Select defaultValue="CS201" label="Course">
                                    <MenuItem value="CS201">CS201</MenuItem>
                                    <MenuItem value="CS301">CS301</MenuItem>
                                    <MenuItem value="CS202">CS202</MenuItem>
                                </Select>
                            </FormControl>
                            <Button variant="outlined">Mark Attendance</Button>
                        </Stack>
                    </Stack>

                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Student Name</TableCell>
                                    <TableCell align="center">Present</TableCell>
                                    <TableCell align="center">Absent</TableCell>
                                    <TableCell align="center">Percentage</TableCell>
                                    <TableCell align="center">Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {ATTENDANCE_DATA.map((row) => (
                                    <TableRow key={row.id} hover>
                                        <TableCell><Typography fontWeight={500}>{row.name}</Typography></TableCell>
                                        <TableCell align="center">
                                            <Chip icon={<CheckCircleIcon />} label={row.present} size="small" color="success" variant="outlined" />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Chip icon={<CancelIcon />} label={row.absent} size="small" color="error" variant="outlined" />
                                        </TableCell>
                                        <TableCell align="center"><Typography fontWeight={600}>{row.percentage}</Typography></TableCell>
                                        <TableCell align="center">
                                            <Chip label={row.status} size="small" color={row.status === 'Excellent' ? 'success' : row.status === 'Good' ? 'primary' : 'warning'} />
                                        </TableCell>
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

