'use client';

import { PlaceholderPage } from '@/components/common';
import MapIcon from '@mui/icons-material/Map';

export default function CampusMapPage() {
    return (
        <PlaceholderPage
            title="Campus Map"
            description="Navigate the university campus. Find buildings, facilities, and get directions."
            icon={<MapIcon sx={{ fontSize: 40, color: '#14B8A6' }} />}
            color="#14B8A6"
        />
    );
}

