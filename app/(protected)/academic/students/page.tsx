'use client';

import { Box, Typography, Card, CardContent, Stack, Chip, TextField, InputAdornment, Avatar, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EmailIcon from '@mui/icons-material/Email';
import { PageHeader } from '@/components/common';

const MotionCard = motion.create(Card);
const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const STUDENTS = [
    { id: 1, name: 'John Smith', email: 'john.smith@uni.edu', course: 'CS201', gpa: 3.8, attendance: '95%', status: 'Active' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah.j@uni.edu', course: 'CS201', gpa: 3.5, attendance: '88%', status: 'Active' },
    { id: 3, name: 'Michael Brown', email: 'michael.b@uni.edu', course: 'CS301', gpa: 3.2, attendance: '92%', status: 'Active' },
    { id: 4, name: 'Emily Davis', email: 'emily.d@uni.edu', course: 'CS202', gpa: 3.9, attendance: '98%', status: 'Active' },
    { id: 5, name: 'David Wilson', email: 'david.w@uni.edu', course: 'CS401', gpa: 3.1, attendance: '78%', status: 'At Risk' },
];

export default function AcademicStudentsPage() {
    return (
        <Box component={motion.div} variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 1600, mx: 'auto' }}>
            <PageHeader title="My Students" subtitle="View and manage enrolled students" showBackButton={false} />

            <MotionCard variants={itemVariants} sx={{ borderRadius: 3 }}>
                <CardContent>
                    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" sx={{ mb: 3 }}>
                        <TextField
                            placeholder="Search students..."
                            size="small"
                            sx={{ width: { xs: '100%', sm: 300 } }}
                            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> } }}
                        />
                        <Stack direction="row" spacing={1} sx={{ mt: { xs: 2, sm: 0 } }}>
                            <Chip label="All Courses" color="primary" />
                            <Chip label="CS201" variant="outlined" />
                            <Chip label="CS301" variant="outlined" />
                        </Stack>
                    </Stack>

                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Student</TableCell>
                                    <TableCell>Course</TableCell>
                                    <TableCell>GPA</TableCell>
                                    <TableCell>Attendance</TableCell>
                                    <TableCell>Status</TableCell>
                                    <TableCell align="right">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {STUDENTS.map((student) => (
                                    <TableRow key={student.id} hover>
                                        <TableCell>
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Avatar sx={{ width: 36, height: 36 }}>{student.name[0]}</Avatar>
                                                <Box>
                                                    <Typography fontWeight={500}>{student.name}</Typography>
                                                    <Typography variant="caption" color="text.secondary">{student.email}</Typography>
                                                </Box>
                                            </Stack>
                                        </TableCell>
                                        <TableCell>{student.course}</TableCell>
                                        <TableCell><Typography fontWeight={600}>{student.gpa}</Typography></TableCell>
                                        <TableCell>{student.attendance}</TableCell>
                                        <TableCell>
                                            <Chip label={student.status} size="small" color={student.status === 'Active' ? 'success' : 'warning'} />
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton size="small"><EmailIcon /></IconButton>
                                            <IconButton size="small"><MoreVertIcon /></IconButton>
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

