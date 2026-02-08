'use client';

import { Box, Typography, Card, CardContent, Grid, Stack, Chip, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, LinearProgress, Tabs, Tab } from '@mui/material';
import { useState } from 'react';
import { motion } from 'framer-motion';
import AssessmentIcon from '@mui/icons-material/Assessment';
import UploadIcon from '@mui/icons-material/Upload';
import { PageHeader } from '@/components/common';

const MotionCard = motion.create(Card);
const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const PENDING_GRADES = [
    { id: 1, assessment: 'Midterm Exam', course: 'CS201', submissions: 45, graded: 30, deadline: 'Feb 10, 2026' },
    { id: 2, assessment: 'Assignment 3', course: 'CS301', submissions: 38, graded: 15, deadline: 'Feb 12, 2026' },
    { id: 3, assessment: 'Lab Report 5', course: 'CS202', submissions: 42, graded: 42, deadline: 'Feb 8, 2026' },
];

const GRADE_DISTRIBUTION = [
    { grade: 'A+', count: 12, percentage: 15 },
    { grade: 'A', count: 18, percentage: 22 },
    { grade: 'B+', count: 15, percentage: 18 },
    { grade: 'B', count: 20, percentage: 24 },
    { grade: 'C+', count: 10, percentage: 12 },
    { grade: 'C', count: 7, percentage: 9 },
];

export default function AcademicGradesPage() {
    const [tab, setTab] = useState(0);

    return (
        <Box component={motion.div} variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 1600, mx: 'auto' }}>
            <PageHeader
                title="Grades & Results"
                subtitle="Manage assessments and student grades"
                showBackButton={false}
                action={<Button variant="contained" startIcon={<UploadIcon />}>Upload Grades</Button>}
            />

            <Card sx={{ mb: 3, borderRadius: 3 }}>
                <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ px: 2 }}>
                    <Tab label="Pending Grades (12)" />
                    <Tab label="Grade Distribution" />
                    <Tab label="Published Results" />
                </Tabs>
            </Card>

            {tab === 0 && (
                <Stack spacing={3}>
                    {PENDING_GRADES.map((item) => (
                        <MotionCard key={item.id} variants={itemVariants} sx={{ borderRadius: 3 }}>
                            <CardContent>
                                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'flex-start', md: 'center' }} spacing={2}>
                                    <Stack direction="row" spacing={2} alignItems="center">
                                        <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: 'primary.lighter', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            <AssessmentIcon color="primary" />
                                        </Box>
                                        <Box>
                                            <Typography fontWeight={600}>{item.assessment}</Typography>
                                            <Typography variant="body2" color="text.secondary">{item.course} • Due: {item.deadline}</Typography>
                                        </Box>
                                    </Stack>
                                    <Stack direction="row" spacing={3} alignItems="center">
                                        <Box sx={{ width: 200 }}>
                                            <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                                                <Typography variant="caption">Progress</Typography>
                                                <Typography variant="caption" fontWeight={600}>{item.graded}/{item.submissions}</Typography>
                                            </Stack>
                                            <LinearProgress variant="determinate" value={(item.graded / item.submissions) * 100} sx={{ borderRadius: 1 }} />
                                        </Box>
                                        <Button variant="contained" size="small">Grade Now</Button>
                                    </Stack>
                                </Stack>
                            </CardContent>
                        </MotionCard>
                    ))}
                </Stack>
            )}

            {tab === 1 && (
                <MotionCard variants={itemVariants} sx={{ borderRadius: 3 }}>
                    <CardContent>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>Grade Distribution - CS201</Typography>
                        <Grid container spacing={2}>
                            {GRADE_DISTRIBUTION.map((item) => (
                                <Grid size={{ xs: 6, sm: 4, md: 2 }} key={item.grade}>
                                    <Card variant="outlined" sx={{ borderRadius: 2, textAlign: 'center', p: 2 }}>
                                        <Typography variant="h4" fontWeight={700} color="primary">{item.grade}</Typography>
                                        <Typography variant="h6">{item.count} students</Typography>
                                        <Typography variant="body2" color="text.secondary">{item.percentage}%</Typography>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </CardContent>
                </MotionCard>
            )}

            {tab === 2 && (
                <MotionCard variants={itemVariants} sx={{ borderRadius: 3 }}>
                    <CardContent>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 3 }}>Published Results</Typography>
                        <Typography color="text.secondary">No results published yet for this semester.</Typography>
                    </CardContent>
                </MotionCard>
            )}
        </Box>
    );
}

