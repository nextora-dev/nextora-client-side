'use client';

import { Box, Typography, Card, CardContent, Stack, Chip, TextField, InputAdornment, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import { motion } from 'framer-motion';
import HistoryIcon from '@mui/icons-material/History';
import SearchIcon from '@mui/icons-material/Search';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import SecurityIcon from '@mui/icons-material/Security';
import StorageIcon from '@mui/icons-material/Storage';
import { PageHeader } from '@/components/common';

const MotionCard = motion.create(Card);
const containerVariants = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

const AUDIT_LOGS = [
    { id: 1, action: 'User role changed', admin: 'System Admin', target: 'john.doe@uni.edu', category: 'User', timestamp: '2026-02-08 10:30', ip: '192.168.1.100' },
    { id: 2, action: 'System config updated', admin: 'Super Admin', target: 'Email Settings', category: 'Settings', timestamp: '2026-02-08 09:15', ip: '192.168.1.101' },
    { id: 3, action: 'New admin created', admin: 'Super Admin', target: 'jane.smith@uni.edu', category: 'User', timestamp: '2026-02-07 16:45', ip: '192.168.1.101' },
    { id: 4, action: 'Backup completed', admin: 'System', target: 'Database', category: 'System', timestamp: '2026-02-07 06:00', ip: 'localhost' },
];

const getCategoryIcon = (cat: string) => {
    switch (cat) {
        case 'User': return <PersonIcon sx={{ fontSize: 18 }} />;
        case 'Settings': return <SettingsIcon sx={{ fontSize: 18 }} />;
        case 'Security': return <SecurityIcon sx={{ fontSize: 18 }} />;
        case 'System': return <StorageIcon sx={{ fontSize: 18 }} />;
        default: return <HistoryIcon sx={{ fontSize: 18 }} />;
    }
};

export default function SuperAdminAuditPage() {
    return (
        <Box component={motion.div} variants={containerVariants} initial="hidden" animate="show" sx={{ maxWidth: 1600, mx: 'auto' }}>
            <PageHeader title="Audit Logs" subtitle="Track all system activities" showBackButton={false} />
            <MotionCard variants={itemVariants} sx={{ borderRadius: 3 }}>
                <CardContent>
                    <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" sx={{ mb: 3 }}>
                        <TextField placeholder="Search logs..." size="small" sx={{ width: { xs: '100%', sm: 300 } }} slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment> } }} />
                        <Stack direction="row" spacing={1} sx={{ mt: { xs: 2, sm: 0 } }}>
                            <Chip label="All" color="primary" />
                            <Chip label="User" variant="outlined" />
                            <Chip label="Security" variant="outlined" />
                        </Stack>
                    </Stack>
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Action</TableCell>
                                    <TableCell>Admin</TableCell>
                                    <TableCell>Target</TableCell>
                                    <TableCell>Category</TableCell>
                                    <TableCell>Timestamp</TableCell>
                                    <TableCell>IP</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {AUDIT_LOGS.map((log) => (
                                    <TableRow key={log.id} hover>
                                        <TableCell><Typography fontWeight={500}>{log.action}</Typography></TableCell>
                                        <TableCell>{log.admin}</TableCell>
                                        <TableCell><Typography variant="body2" color="text.secondary">{log.target}</Typography></TableCell>
                                        <TableCell><Chip icon={getCategoryIcon(log.category)} label={log.category} size="small" variant="outlined" /></TableCell>
                                        <TableCell><Typography variant="body2">{log.timestamp}</Typography></TableCell>
                                        <TableCell><Typography variant="body2" color="text.secondary">{log.ip}</Typography></TableCell>
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

