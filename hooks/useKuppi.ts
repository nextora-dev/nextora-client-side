/**
 * @fileoverview Kuppi Custom Hooks
 * @description Reusable hooks for Kuppi session management
 */

import { useState, useMemo, useCallback } from 'react';
import { KuppiSession } from '@/types/kuppi';

/**
 * Hook for managing saved sessions
 */
export function useSavedSessions() {
    const [savedIds, setSavedIds] = useState<Set<string>>(new Set());

    const toggleSave = useCallback((sessionId: string) => {
        setSavedIds((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(sessionId)) {
                newSet.delete(sessionId);
            } else {
                newSet.add(sessionId);
            }
            return newSet;
        });
    }, []);

    const isSaved = useCallback((sessionId: string) => {
        return savedIds.has(sessionId);
    }, [savedIds]);

    const savedCount = savedIds.size;

    return { savedIds, toggleSave, isSaved, savedCount };
}

/**
 * Hook for filtering and searching sessions
 */
export function useSessionFilters(sessions: KuppiSession[], savedIds: Set<string>) {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'all' | 'saved' | 'upcoming'>('all');
    const [subjectFilter, setSubjectFilter] = useState<string>('All Subjects');
    const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
    const [modeFilter, setModeFilter] = useState<'all' | 'online' | 'offline'>('all');

    const filteredSessions = useMemo(() => {
        let result = [...sessions];

        // Filter by tab
        if (activeTab === 'saved') {
            result = result.filter((session) => savedIds.has(session.id));
        } else if (activeTab === 'upcoming') {
            result = result.filter((session) => session.status === 'upcoming');
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter((session) => {
                const title = session.title || '';
                const subject = session.subject || '';
                const hostName = session.host?.name || session.host?.fullName || '';
                const topicsText = (session.topics || []).join(' ').toLowerCase();
                return (
                    title.toLowerCase().includes(query) ||
                    subject.toLowerCase().includes(query) ||
                    hostName.toLowerCase().includes(query) ||
                    topicsText.includes(query)
                );
            });
        }

        // Filter by subject
        if (subjectFilter !== 'All Subjects') {
            result = result.filter((session) => session.subject === subjectFilter);
        }

        // Filter by difficulty
        if (difficultyFilter !== 'all') {
            result = result.filter((session) => session.difficulty === difficultyFilter);
        }

        // Filter by mode (online/offline)
        if (modeFilter !== 'all') {
            result = result.filter((session) =>
                modeFilter === 'online' ? session.isOnline : !session.isOnline
            );
        }

        return result;
    }, [sessions, searchQuery, activeTab, savedIds, subjectFilter, difficultyFilter, modeFilter]);

    return {
        searchQuery,
        setSearchQuery,
        activeTab,
        setActiveTab,
        subjectFilter,
        setSubjectFilter,
        difficultyFilter,
        setDifficultyFilter,
        modeFilter,
        setModeFilter,
        filteredSessions,
    };
}

/**
 * Hook for session booking management
 */
export function useSessionBooking() {
    const [isBooking, setIsBooking] = useState(false);
    const [bookedSessions, setBookedSessions] = useState<Set<string>>(new Set());

    const bookSession = useCallback(async (sessionId: string) => {
        setIsBooking(true);
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setBookedSessions((prev) => new Set([...prev, sessionId]));
            return { success: true };
        } catch {
            return { success: false, error: 'Failed to book session' };
        } finally {
            setIsBooking(false);
        }
    }, []);

    const cancelBooking = useCallback(async (sessionId: string) => {
        setIsBooking(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            setBookedSessions((prev) => {
                const newSet = new Set(prev);
                newSet.delete(sessionId);
                return newSet;
            });
            return { success: true };
        } catch {
            return { success: false, error: 'Failed to cancel booking' };
        } finally {
            setIsBooking(false);
        }
    }, []);

    const isBooked = useCallback((sessionId: string) => {
        return bookedSessions.has(sessionId);
    }, [bookedSessions]);

    return { isBooking, bookSession, cancelBooking, isBooked };
}

/**
 * Hook for host application form management
 */
export function useHostApplication() {
    const [activeStep, setActiveStep] = useState(0);
    const [resultFile, setResultFile] = useState<File | null>(null);
    const [formData, setFormData] = useState({
        gpa: '',
        subject: '',
        topic: '',
        experience: '',
        motivation: '',
        preferredExperienceLevel: 'BEGINNER' as 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED',
    });

    const updateField = useCallback((field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }, []);

    const nextStep = useCallback(() => {
        setActiveStep((prev) => Math.min(prev + 1, 2));
    }, []);

    const prevStep = useCallback(() => {
        setActiveStep((prev) => Math.max(prev - 1, 0));
    }, []);

    const isFormValid = useMemo(() => {
        const gpaNum = parseFloat(formData.gpa);
        return (
            !isNaN(gpaNum) &&
            gpaNum >= 3.0 &&
            gpaNum <= 4.0 &&
            formData.subject.trim() !== '' &&
            formData.topic.trim() !== '' &&
            resultFile !== null
        );
    }, [formData, resultFile]);

    const resetForm = useCallback(() => {
        setActiveStep(0);
        setResultFile(null);
        setFormData({
            gpa: '',
            subject: '',
            topic: '',
            experience: '',
            motivation: '',
            preferredExperienceLevel: 'BEGINNER',
        });
    }, []);

    return {
        formData,
        activeStep,
        resultFile,
        setResultFile,
        updateField,
        nextStep,
        prevStep,
        isFormValid,
        resetForm,
    };
}
