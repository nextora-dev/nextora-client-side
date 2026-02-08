'use client';

import { Box, Typography } from '@mui/material';
import { PageHeader } from '@/components/common';

export default function AdminEventsPage() {
    return (
        <Box sx={{ maxWidth: 1600, mx: 'auto', p: 3 }}>
            <PageHeader
                title="Events Management"
                subtitle="Create and manage campus events"
                showBackButton={false}
            />
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
                Events management functionality coming soon.
            </Typography>
        </Box>
    );
}

