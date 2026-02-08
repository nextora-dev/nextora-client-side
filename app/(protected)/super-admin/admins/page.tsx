'use client';

import { Box, Typography, Card, CardContent, Grid, Stack, Chip, Button, Avatar, TextField, InputAdornment } from '@mui/material';
import { motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import { PageHeader } from '@/components/common';

const MotionCard = motion.create(Card);
const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const ADMINS = [
    { id: 1, name: 'John Smith', email: 'john.smith@uni.edu', department: 'Computing', status: 'Active', lastActive: '2 hours ago' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah.j@uni.edu', department: 'Engineering', status: 'Active', lastActive: '5 mins ago' },
    { id: 3, name: 'Michael Brown', email: 'michael.b@uni.edu', department: 'Business', status: 'Active', lastActive: '1 day ago' },
    { id: 4, name: 'Emily Davis', email: 'emily.d@uni.edu', department: 'Sciences', status: 'Inactive', lastActive: '1 week ago' },
];

export default function SuperAdminAdminsPage() {
    return (
        <Box component={motion.div} variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 1600, mx: 'auto' }}>
            <PageHeader
                title="Admin Management"
                subtitle="Manage administrator accounts"
                showBackButton={false}
                action={<Button variant="contained" startIcon={<AddIcon />}>Add Admin</Button>}
            />

            <Card sx={{ mb: 3, borderRadius: 3 }}>
                <CardContent>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                        <TextField placeholder="Search admins..." size="small" sx={{ flex: 1 }} slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> } }} />
                        <Stack direction="row" spacing={1}>
                            <Chip label="All" color="primary" />
                            <Chip label="Active" variant="outlined" />
                            <Chip label="Inactive" variant="outlined" />
                        </Stack>
                    </Stack>
                </CardContent>
            </Card>

            <Grid container spacing={3}>
                {ADMINS.map((admin) => (
                    <Grid size={{ xs: 12, sm: 6, lg: 3 }} key={admin.id}>
                        <MotionCard variants={itemVariants} whileHover={{ y: -4 }} sx={{ borderRadius: 3 }}>
                            <CardContent>
                                <Stack spacing={2} alignItems="center" textAlign="center">
                                    <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: '1.5rem' }}>
                                        {admin.name.split(' ').map(n => n[0]).join('')}
                                    </Avatar>
                                    <Box>
                                        <Typography variant="h6" fontWeight={600}>{admin.name}</Typography>
                                        <Typography variant="body2" color="text.secondary">{admin.email}</Typography>
                                    </Box>
                                    <Chip label={admin.status} size="small" color={admin.status === 'Active' ? 'success' : 'default'} />
                                    <Typography variant="caption" color="text.secondary">{admin.department} • {admin.lastActive}</Typography>
                                    <Stack direction="row" spacing={1} sx={{ width: '100%' }}>
                                        <Button size="small" variant="outlined" startIcon={<EditIcon />} fullWidth>Edit</Button>
                                        <Button size="small" variant="outlined" color="error" startIcon={<BlockIcon />} fullWidth>Disable</Button>
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

