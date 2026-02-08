'use client';

import { PlaceholderPage } from '@/components/common';
import PersonIcon from '@mui/icons-material/Person';

export default function MeetLecturersPage() {
    return (
        <PlaceholderPage
            title="Meet Lecturers"
            description="Book appointments with lecturers. Schedule meetings for academic guidance and support."
            icon={<PersonIcon sx={{ fontSize: 40, color: '#F97316' }} />}
            color="#F97316"
        />
    );
}

