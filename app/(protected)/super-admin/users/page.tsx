'use client';

import { redirect } from 'next/navigation';
import { useEffect } from 'react';

// Redirect to the new comprehensive user management page
export default function SuperAdminUsersPage() {
    useEffect(() => {
        redirect('/super-admin/user-management');
    }, []);

    return null;
}

