/**
 * @fileoverview Kuppi Utility Functions
 */

/**
 * Get initials from tutor name
 */
export function getTutorInitials(name: string): string {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

/**
 * Calculate participation rate
 */
export function getParticipationRate(current: number, max: number): number {
    return Math.round((current / max) * 100);
}

/**
 * Get remaining spots
 */
export function getRemainingSpots(current: number, max: number): number {
    return Math.max(0, max - current);
}

/**
 * Format date for display
 */
export function formatSessionDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });
}

/**
 * Format time for display
 */
export function formatSessionTime(timeStr: string): string {
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

/**
 * Get difficulty color
 */
export function getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
        case 'beginner':
            return '#10B981';
        case 'intermediate':
            return '#F59E0B';
        case 'advanced':
            return '#EF4444';
        default:
            return '#6B7280';
    }
}

/**
 * Validate host GPA requirement
 */
export function isValidHostGpa(gpa: string): boolean {
    const gpaNum = parseFloat(gpa);
    return !isNaN(gpaNum) && gpaNum >= 3.0 && gpaNum <= 4.0;
}

/**
 * Get session status color
 */
export function getStatusColor(status: string): 'success' | 'warning' | 'error' | 'default' {
    switch (status) {
        case 'upcoming':
            return 'success';
        case 'ongoing':
            return 'warning';
        case 'completed':
            return 'default';
        case 'cancelled':
            return 'error';
        default:
            return 'default';
    }
}

