'use client';

import { Box, Typography, Card, CardContent, Grid, Stack, Chip, Button, TextField, InputAdornment } from '@mui/material';
import { motion } from 'framer-motion';
import SchoolIcon from '@mui/icons-material/School';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import PeopleIcon from '@mui/icons-material/People';
import { PageHeader } from '@/components/common';

const MotionCard = motion.create(Card);

const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
};

const COURSES = [
    { id: 1, code: 'CS101', name: 'Introduction to Programming', department: 'Computing', students: 120, status: 'Active' },
    { id: 2, code: 'CS201', name: 'Data Structures & Algorithms', department: 'Computing', students: 95, status: 'Active' },
    { id: 3, code: 'CS301', name: 'Software Engineering', department: 'Computing', students: 78, status: 'Active' },
    { id: 4, code: 'CS401', name: 'Machine Learning', department: 'Computing', students: 65, status: 'Active' },
    { id: 5, code: 'ENG101', name: 'Engineering Mathematics', department: 'Engineering', students: 150, status: 'Active' },
    { id: 6, code: 'BUS201', name: 'Business Management', department: 'Business', students: 88, status: 'Inactive' },
];

export default function AdminCoursesPage() {
    return (
        <Box
            component={motion.div}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            sx={{ maxWidth: 1600, mx: 'auto' }}
        >
            <PageHeader
                title="Course Management"
                subtitle="Manage academic courses and curricula"
                showBackButton={false}
                action={
                    <Button variant="contained" startIcon={<AddIcon />} sx={{ borderRadius: 2 }}>
                        Add Course
                    </Button>
                }
            />

            {/* Search and Filters */}
            <Card sx={{ mb: 3, borderRadius: 3 }}>
                <CardContent>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center">
                        <TextField
                            placeholder="Search courses..."
                            size="small"
                            sx={{ flex: 1 }}
                            slotProps={{
                                input: {
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <SearchIcon color="action" />
                                        </InputAdornment>
                                    ),
                                },
                            }}
                        />
                        <Stack direction="row" spacing={1}>
                            <Chip label="All" color="primary" />
                            <Chip label="Active" variant="outlined" />
                            <Chip label="Inactive" variant="outlined" />
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>

            {/* Courses Grid */}
            <Grid container spacing={3}>
                {COURSES.map((course) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={course.id}>
                        <MotionCard
                            variants={itemVariants}
                            whileHover={{ y: -4 }}
                            sx={{ borderRadius: 3, height: '100%' }}
                        >
                            <CardContent>
                                <Stack spacing={2}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                        <Box
                                            sx={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: 2,
                                                bgcolor: 'primary.main',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <SchoolIcon sx={{ color: 'white' }} />
                                        </Box>
                                        <Chip
                                            label={course.status}
                                            size="small"
                                            color={course.status === 'Active' ? 'success' : 'default'}
                                        />
                                    </Stack>
                                    <Box>
                                        <Typography variant="caption" color="text.secondary">
                                            {course.code}
                                        </Typography>
                                        <Typography variant="h6" fontWeight={600}>
                                            {course.name}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                            {course.department}
                                        </Typography>
                                    </Box>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <PeopleIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                                        <Typography variant="body2" color="text.secondary">
                                            {course.students} students enrolled
                                        </Typography>
                                    </Stack>
                                    <Button variant="outlined" size="small" fullWidth>
                                        View Details
                                    </Button>
                                </Stack>
                            </CardContent>
                        </MotionCard>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}

