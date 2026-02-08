'use client';

import { PlaceholderPage } from '@/components/common';
import MessageIcon from '@mui/icons-material/Message';

export default function ContactSRUPage() {
    return (
        <PlaceholderPage
            title="Contact SRU"
            description="Get in touch with Student Representative Union. Submit queries and get support."
            icon={<MessageIcon sx={{ fontSize: 40, color: '#06B6D4' }} />}
            color="#06B6D4"
        />
    );
}

