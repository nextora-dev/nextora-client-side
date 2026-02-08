'use client';

import { Box, Typography, Card, CardContent, Grid, Stack, Chip, Button, LinearProgress, Avatar } from '@mui/material';
import { motion } from 'framer-motion';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import AddIcon from '@mui/icons-material/Add';
import { PageHeader } from '@/components/common';

const MotionCard = motion.create(Card);
const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const COURSES = [
    { id: 1, code: 'CS201', name: 'Data Structures & Algorithms', students: 45, progress: 65, semester: 'Fall 2026', status: 'Active' },
    { id: 2, code: 'CS301', name: 'Software Engineering', students: 38, progress: 45, semester: 'Fall 2026', status: 'Active' },
    { id: 3, code: 'CS202', name: 'Database Management Systems', students: 42, progress: 70, semester: 'Fall 2026', status: 'Active' },
    { id: 4, code: 'CS401', name: 'Machine Learning', students: 31, progress: 30, semester: 'Fall 2026', status: 'Active' },
];

export default function AcademicCoursesPage() {
    return (
        <Box component={motion.div} variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 1600, mx: 'auto' }}>
            <PageHeader
                title="My Courses"
                subtitle="Manage your assigned courses"
                showBackButton={false}
                action={<Button variant="contained" startIcon={<AddIcon />}>Create Course</Button>}
            />

            <Grid container spacing={3}>
                {COURSES.map((course) => (
                    <Grid size={{ xs: 12, md: 6 }} key={course.id}>
                        <MotionCard variants={itemVariants} sx={{ borderRadius: 3, height: '100%' }}>
                            <CardContent>
                                <Stack spacing={2}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                        <Stack direction="row" spacing={2} alignItems="center">
                                            <Avatar sx={{ width: 56, height: 56, bgcolor: 'primary.main' }}>
                                                <SchoolIcon />
                                            </Avatar>
                                            <Box>
                                                <Typography variant="h6" fontWeight={600}>{course.name}</Typography>
                                                <Typography variant="body2" color="text.secondary">{course.code} • {course.semester}</Typography>
                                            </Box>
                                        </Stack>
                                        <Chip label={course.status} size="small" color="success" />
                                    </Stack>

                                    <Stack direction="row" spacing={3}>
                                        <Stack direction="row" spacing={1} alignItems="center">
                                            <PeopleIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                                            <Typography variant="body2">{course.students} Students</Typography>
                                        </Stack>
                                    </Stack>

                                    <Box>
                                        <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                                            <Typography variant="body2" color="text.secondary">Course Progress</Typography>
                                            <Typography variant="body2" fontWeight={600}>{course.progress}%</Typography>
                                        </Stack>
                                        <LinearProgress variant="determinate" value={course.progress} sx={{ borderRadius: 1, height: 8 }} />
                                    </Box>

                                    <Stack direction="row" spacing={1}>
                                        <Button size="small" variant="outlined">View Details</Button>
                                        <Button size="small" variant="outlined">Manage Students</Button>
                                        <Button size="small" variant="contained">Grade Book</Button>
                                    </Stack>
                                </Stack>
                            </CardContent>
                        </MotionCard>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

