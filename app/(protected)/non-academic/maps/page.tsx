'use client';
import { Box, Typography, Card, CardContent } from '@mui/material';
import { motion } from 'framer-motion';
import { PageHeader } from '@/components/common';
const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1 } };
export default function NonAcademicMapsPage() {
    return (
        <Box component={motion.div} variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 1600, mx: 'auto' }}>
            <PageHeader title="Campus Map" subtitle="Navigate the university campus" showBackButton={false} />
            <Card sx={{ borderRadius: 3 }}><CardContent sx={{ minHeight: 400, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Typography color="text.secondary">Interactive Campus Map - Coming Soon</Typography></CardContent></Card>
        </Box>
    );
}

