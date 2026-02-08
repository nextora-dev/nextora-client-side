'use client';

import { PlaceholderPage } from '@/components/common';
import ApartmentIcon from '@mui/icons-material/Apartment';

export default function BoardingPage() {
    return (
        <PlaceholderPage
            title="Boarding Houses"
            description="Find and book student accommodation. Browse available rooms and housing options near campus."
            icon={<ApartmentIcon sx={{ fontSize: 40, color: '#10B981' }} />}
            color="#10B981"
        />
    );
}

