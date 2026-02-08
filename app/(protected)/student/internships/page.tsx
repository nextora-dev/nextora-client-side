'use client';

import { PlaceholderPage } from '@/components/common';
import WorkIcon from '@mui/icons-material/Work';

export default function InternshipsPage() {
    return (
        <PlaceholderPage
            title="Internships"
            description="Explore internship opportunities. Find career placements and apply for positions."
            icon={<WorkIcon sx={{ fontSize: 40, color: '#F59E0B' }} />}
            color="#F59E0B"
        />
    );
}

