'use client';

import { PlaceholderPage } from '@/components/common';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

export default function AcademicCalendarPage() {
    return (
        <PlaceholderPage
            title="Academic Calendar"
            description="View important academic dates, exam schedules, holidays, and university events."
            icon={<CalendarMonthIcon sx={{ fontSize: 40, color: '#6366F1' }} />}
            color="#6366F1"
        />
    );
}

