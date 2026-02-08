'use client';

import { PlaceholderPage } from '@/components/common';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';

export default function EventsTicketsPage() {
    return (
        <PlaceholderPage
            title="Events & Tickets"
            description="Browse upcoming university events, purchase tickets, and manage your bookings."
            icon={<ConfirmationNumberIcon sx={{ fontSize: 40, color: '#60A5FA' }} />}
            color="#60A5FA"
        />
    );
}

