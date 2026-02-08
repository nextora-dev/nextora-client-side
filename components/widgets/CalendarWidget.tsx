'use client';

import React, { useState } from 'react';
import { Box, Typography, IconButton, Skeleton, Chip } from '@mui/material';
import { motion } from 'framer-motion';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';

interface CalendarEvent {
    date: Date;
    title: string;
    color: string;
    type: string;
}

interface CalendarWidgetProps {
    events?: CalendarEvent[];
    onDateSelect?: (date: Date) => void;
    isLoading?: boolean;
}

const MotionBox = motion.create(Box);

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const CalendarWidget: React.FC<CalendarWidgetProps> = ({
    events = [],
    onDateSelect,
    isLoading = false,
}) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const handlePrevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    const handleNextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

    const handleDateClick = (day: number) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        setSelectedDate(date);
        onDateSelect?.(date);
    };

    const getEventsForDate = (day: number) => {
        return events.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.getDate() === day && eventDate.getMonth() === currentDate.getMonth() && eventDate.getFullYear() === currentDate.getFullYear();
        });
    };

    const isToday = (day: number) => {
        const today = new Date();
        return day === today.getDate() && currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear();
    };

    const isSelected = (day: number) => {
        if (!selectedDate) return false;
        return day === selectedDate.getDate() && currentDate.getMonth() === selectedDate.getMonth() && currentDate.getFullYear() === selectedDate.getFullYear();
    };

    const daysInMonth = getDaysInMonth(currentDate);
    const firstDayOfMonth = getFirstDayOfMonth(currentDate);
    const days = [...Array(firstDayOfMonth).fill(null), ...Array(daysInMonth).fill(0).map((_, i) => i + 1)];

    if (isLoading) {
        return (
            <Box sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'grey.100' }}>
                <Skeleton width={160} height={28} sx={{ mb: 3 }} />
                <Skeleton variant="rounded" height={280} sx={{ borderRadius: 2 }} />
            </Box>
        );
    }

    return (
        <MotionBox
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.35 }}
            sx={{ p: 3, borderRadius: 3, bgcolor: 'background.paper', border: '1px solid', borderColor: 'grey.100' }}
        >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: '-0.01em' }}>
                    {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5 }}>
                    <IconButton size="small" onClick={handlePrevMonth} sx={{ bgcolor: 'grey.50', '&:hover': { bgcolor: 'grey.100' } }}>
                        <ChevronLeftIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                    <IconButton size="small" onClick={handleNextMonth} sx={{ bgcolor: 'grey.50', '&:hover': { bgcolor: 'grey.100' } }}>
                        <ChevronRightIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                </Box>
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5, mb: 1 }}>
                {DAYS.map(day => (
                    <Typography key={day} variant="caption" sx={{ textAlign: 'center', fontWeight: 600, color: 'text.secondary', py: 1 }}>
                        {day}
                    </Typography>
                ))}
            </Box>

            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 0.5 }}>
                {days.map((day, index) => {
                    if (day === null) return <Box key={`empty-${index}`} />;
                    const dayEvents = getEventsForDate(day);
                    const today = isToday(day);
                    const selected = isSelected(day);

                    return (
                        <Box
                            key={day}
                            onClick={() => handleDateClick(day)}
                            sx={{
                                aspectRatio: '1',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 2,
                                cursor: 'pointer',
                                position: 'relative',
                                bgcolor: selected ? 'primary.main' : today ? 'primary.50' : 'transparent',
                                color: selected ? 'white' : today ? 'primary.main' : 'text.primary',
                                transition: 'all 0.2s ease',
                                '&:hover': { bgcolor: selected ? 'primary.dark' : 'grey.100' },
                            }}
                        >
                            <Typography variant="body2" sx={{ fontWeight: today || selected ? 600 : 400, fontSize: '0.875rem' }}>
                                {day}
                            </Typography>
                            {dayEvents.length > 0 && (
                                <Box sx={{ display: 'flex', gap: 0.25, position: 'absolute', bottom: 4 }}>
                                    {dayEvents.slice(0, 3).map((event, i) => (
                                        <FiberManualRecordIcon key={i} sx={{ fontSize: 6, color: selected ? 'white' : event.color }} />
                                    ))}
                                </Box>
                            )}
                        </Box>
                    );
                })}
            </Box>

            {selectedDate && getEventsForDate(selectedDate.getDate()).length > 0 && (
                <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'grey.100' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1.5 }}>Events on {selectedDate.getDate()} {MONTHS[selectedDate.getMonth()]}</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        {getEventsForDate(selectedDate.getDate()).map((event, i) => (
                            <Chip key={i} label={event.title} size="small" sx={{ bgcolor: `${event.color}15`, color: event.color, fontWeight: 500, justifyContent: 'flex-start' }} />
                        ))}
                    </Box>
                </Box>
            )}
        </MotionBox>
    );
};

export default CalendarWidget;
