'use client';

import { PlaceholderPage } from '@/components/common';
import HowToVoteIcon from '@mui/icons-material/HowToVote';

export default function ElectionsPage() {
    return (
        <PlaceholderPage
            title="Elections"
            description="Participate in university elections. Vote for student representatives and club leadership."
            icon={<HowToVoteIcon sx={{ fontSize: 40, color: '#0EA5E9' }} />}
            color="#0EA5E9"
        />
    );
}

