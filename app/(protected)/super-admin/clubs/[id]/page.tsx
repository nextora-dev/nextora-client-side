'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import ClubDetailView from '@/components/club/ClubDetailView';

export default function SuperAdminClubDetailPage() {
    const params = useParams();
    const clubId = Number(params.id);

    if (!clubId || isNaN(clubId)) {
        return null;
    }

    return (
        <ClubDetailView
            clubId={clubId}
            backPath="/super-admin/clubs"
            isAdmin
            isSuperAdmin
        />
    );
}

