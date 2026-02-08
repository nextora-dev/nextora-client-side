'use client';

import { Box, Typography, Card, CardContent, Grid, Stack, Chip, Button, TextField, InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import WarningIcon from '@mui/icons-material/Warning';
import { PageHeader } from '@/components/common';

const MotionCard = motion.create(Card);
const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const INVENTORY_STATS = [
    { label: 'Total Items', value: '1,245', color: '#2563EB' },
    { label: 'Low Stock', value: '15', color: '#F59E0B' },
    { label: 'Out of Stock', value: '3', color: '#DC2626' },
];

const INVENTORY_ITEMS = [
    { id: 1, name: 'Whiteboard Markers', category: 'Stationery', quantity: 45, minStock: 20, location: 'Store A', status: 'In Stock' },
    { id: 2, name: 'Printer Paper (A4)', category: 'Stationery', quantity: 12, minStock: 50, location: 'Store A', status: 'Low Stock' },
    { id: 3, name: 'Cleaning Supplies', category: 'Maintenance', quantity: 0, minStock: 10, location: 'Store B', status: 'Out of Stock' },
    { id: 4, name: 'Light Bulbs', category: 'Electrical', quantity: 25, minStock: 15, location: 'Store C', status: 'In Stock' },
    { id: 5, name: 'Desk Chairs', category: 'Furniture', quantity: 8, minStock: 5, location: 'Warehouse', status: 'In Stock' },
];

export default function NonAcademicInventoryPage() {
    return (
        <Box component={motion.div} variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 1600, mx: 'auto' }}>
            <PageHeader
                title="Inventory"
                subtitle="Manage supplies and equipment"
                showBackButton={false}
                action={<Button variant="contained" startIcon={<AddIcon />}>Add Item</Button>}
            />

            <Grid container spacing={3} sx={{ mb: 4 }}>
                {INVENTORY_STATS.map((stat) => (
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
                    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" sx={{ mb: 3 }}>
                        <TextField
                            placeholder="Search inventory..."
                            size="small"
                            sx={{ width: { xs: '100%', sm: 300 } }}
                            slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> } }}
                        />
                        <Stack direction="row" spacing={1} sx={{ mt: { xs: 2, sm: 0 } }}>
                            <Chip label="All" color="primary" />
                            <Chip label="Low Stock" variant="outlined" icon={<WarningIcon />} />
                        </Stack>
                    </Stack>

                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Item Name</TableCell>
                                    <TableCell>Category</TableCell>
                                    <TableCell align="center">Quantity</TableCell>
                                    <TableCell>Location</TableCell>
                                    <TableCell>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {INVENTORY_ITEMS.map((item) => (
                                    <TableRow key={item.id} hover>
                                        <TableCell><Typography fontWeight={500}>{item.name}</Typography></TableCell>
                                        <TableCell>{item.category}</TableCell>
                                        <TableCell align="center">
                                            <Typography fontWeight={600} color={item.quantity < item.minStock ? 'error.main' : 'inherit'}>
                                                {item.quantity}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{item.location}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={item.status}
                                                size="small"
                                                color={item.status === 'In Stock' ? 'success' : item.status === 'Low Stock' ? 'warning' : 'error'}
                                            />
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

