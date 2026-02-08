'use client';

import { PlaceholderPage } from '@/components/common';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';

export default function KuppiSessionsPage() {
    return (
        <PlaceholderPage
            title="Kuppi Sessions"
            description="Join or host study sessions. Learn together with fellow students and share knowledge."
            icon={<AutoStoriesIcon sx={{ fontSize: 40, color: '#EC4899' }} />}
            color="#EC4899"
        />
    );
}

