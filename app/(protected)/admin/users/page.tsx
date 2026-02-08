'use client';
import { PlaceholderPage } from '@/components/common';
import PeopleIcon from '@mui/icons-material/People';
export default function AdminUsersPage() {
    return <PlaceholderPage title="User Management" description="Manage user accounts and permissions." icon={<PeopleIcon sx={{ fontSize: 40, color: '#2563EB' }} />} color="#2563EB" />;
}

