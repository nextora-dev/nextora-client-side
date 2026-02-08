'use client';

import { Box, Typography, Card, CardContent, Grid, Stack, Chip, Button, IconButton } from '@mui/material';
import { motion } from 'framer-motion';
import DescriptionIcon from '@mui/icons-material/Description';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import LinkIcon from '@mui/icons-material/Link';
import DownloadIcon from '@mui/icons-material/Download';
import AddIcon from '@mui/icons-material/Add';
import { PageHeader } from '@/components/common';

const MotionCard = motion.create(Card);
const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const RESOURCES = [
    { id: 1, name: 'CS201 Lecture Notes', type: 'Document', course: 'CS201', size: '2.5 MB', date: 'Feb 5, 2026' },
    { id: 2, name: 'Algorithm Tutorial Video', type: 'Video', course: 'CS201', size: '150 MB', date: 'Feb 3, 2026' },
    { id: 3, name: 'Database Design Guide', type: 'Document', course: 'CS202', size: '1.8 MB', date: 'Feb 1, 2026' },
    { id: 4, name: 'Online IDE Link', type: 'Link', course: 'CS301', size: '-', date: 'Jan 28, 2026' },
];

const getIcon = (type: string) => {
    switch (type) {
        case 'Document': return <DescriptionIcon />;
        case 'Video': return <VideoLibraryIcon />;
        case 'Link': return <LinkIcon />;
        default: return <DescriptionIcon />;
    }
};

const getColor = (type: string) => {
    switch (type) {
        case 'Document': return '#2563EB';
        case 'Video': return '#DC2626';
        case 'Link': return '#059669';
        default: return '#6B7280';
    }
};

export default function AcademicResourcesPage() {
    return (
        <Box component={motion.div} variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 1600, mx: 'auto' }}>
            <PageHeader
                title="Resources"
                subtitle="Manage course materials and resources"
                showBackButton={false}
                action={<Button variant="contained" startIcon={<AddIcon />}>Upload Resource</Button>}
            />

            <Grid container spacing={3}>
                {RESOURCES.map((resource) => (
                    <Grid size={{ xs: 12, sm: 6, md: 4 }} key={resource.id}>
                        <MotionCard variants={itemVariants} sx={{ borderRadius: 3, height: '100%' }}>
                            <CardContent>
                                <Stack spacing={2}>
                                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                                        <Box sx={{ width: 48, height: 48, borderRadius: 2, bgcolor: `${getColor(resource.type)}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: getColor(resource.type) }}>
                                            {getIcon(resource.type)}
                                        </Box>
                                        <Chip label={resource.type} size="small" variant="outlined" />
                                    </Stack>

                                    <Box>
                                        <Typography fontWeight={600}>{resource.name}</Typography>
                                        <Typography variant="body2" color="text.secondary">{resource.course}</Typography>
                                    </Box>

                                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                                        <Typography variant="caption" color="text.secondary">{resource.size} • {resource.date}</Typography>
                                        <IconButton size="small" color="primary">
                                            <DownloadIcon />
                                        </IconButton>
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

