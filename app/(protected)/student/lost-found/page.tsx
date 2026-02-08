'use client';

import { PlaceholderPage } from '@/components/common';
import SearchIcon from '@mui/icons-material/Search';

export default function LostFoundPage() {
    return (
        <PlaceholderPage
            title="Lost & Found"
            description="Report lost items or browse found items on campus. Help reunite belongings with their owners."
            icon={<SearchIcon sx={{ fontSize: 40, color: '#8B5CF6' }} />}
            color="#8B5CF6"
        />
    );
}

