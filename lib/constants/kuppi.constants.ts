/**
 * @fileoverview Kuppi Constants
 * @description Sample data and configuration for Kuppi feature
 */

import { KuppiSession, KuppiHost } from '@/types/kuppi';

// Sample Hosts
export const SAMPLE_HOSTS: KuppiHost[] = [
    {
        id: 'host-1',
        name: 'Sarah Johnson',
        avatar: undefined,
        department: 'Computer Science',
        gpa: 3.85,
        rating: 4.9,
        sessionsHosted: 24,
        expertise: ['Data Structures', 'Algorithms', 'Python'],
    },
    {
        id: 'host-2',
        name: 'Michael Chen',
        avatar: undefined,
        department: 'Information Technology',
        gpa: 3.72,
        rating: 4.7,
        sessionsHosted: 18,
        expertise: ['Database Systems', 'SQL', 'MongoDB'],
    },
    {
        id: 'host-3',
        name: 'Emily Williams',
        avatar: undefined,
        department: 'Software Engineering',
        gpa: 3.90,
        rating: 4.8,
        sessionsHosted: 32,
        expertise: ['Web Development', 'React', 'Node.js'],
    },
    {
        id: 'host-4',
        name: 'David Kumar',
        avatar: undefined,
        department: 'Computer Science',
        gpa: 3.68,
        rating: 4.6,
        sessionsHosted: 15,
        expertise: ['Machine Learning', 'Python', 'TensorFlow'],
    },
];

// Sample Sessions
export const SAMPLE_SESSIONS: KuppiSession[] = [
    {
        id: 'session-1',
        title: 'Data Structures: Trees & Graphs',
        subject: 'Data Structures',
        description: 'Deep dive into tree traversals, graph algorithms, and their applications. Perfect for exam preparation.',
        host: SAMPLE_HOSTS[0],
        date: '2026-02-12',
        time: '14:00',
        duration: 90,
        venue: 'Study Room A - Library',
        maxParticipants: 15,
        currentParticipants: 12,
        status: 'upcoming',
        difficulty: 'intermediate',
        topics: ['Binary Trees', 'BST', 'Graph Traversals', 'Dijkstra Algorithm'],
        isOnline: false,
    },
    {
        id: 'session-2',
        title: 'SQL Mastery: Joins & Subqueries',
        subject: 'Database Management',
        description: 'Learn complex SQL queries, different types of joins, and optimization techniques.',
        host: SAMPLE_HOSTS[1],
        date: '2026-02-13',
        time: '16:00',
        duration: 60,
        venue: 'Online - Zoom',
        maxParticipants: 25,
        currentParticipants: 18,
        status: 'upcoming',
        difficulty: 'beginner',
        topics: ['INNER JOIN', 'LEFT/RIGHT JOIN', 'Subqueries', 'Query Optimization'],
        isOnline: true,
        meetingLink: 'https://zoom.us/j/123456789',
    },
    {
        id: 'session-3',
        title: 'React Hooks Deep Dive',
        subject: 'Web Development',
        description: 'Understanding useState, useEffect, custom hooks, and React best practices.',
        host: SAMPLE_HOSTS[2],
        date: '2026-02-14',
        time: '10:00',
        duration: 120,
        venue: 'Lab 3 - Engineering Building',
        maxParticipants: 20,
        currentParticipants: 20,
        status: 'upcoming',
        difficulty: 'advanced',
        topics: ['useState', 'useEffect', 'useContext', 'Custom Hooks'],
        isOnline: false,
    },
    {
        id: 'session-4',
        title: 'Machine Learning Basics',
        subject: 'AI & Machine Learning',
        description: 'Introduction to ML concepts, supervised vs unsupervised learning, and simple implementations.',
        host: SAMPLE_HOSTS[3],
        date: '2026-02-15',
        time: '15:00',
        duration: 90,
        venue: 'Online - Google Meet',
        maxParticipants: 30,
        currentParticipants: 22,
        status: 'upcoming',
        difficulty: 'beginner',
        topics: ['Supervised Learning', 'Regression', 'Classification', 'scikit-learn'],
        isOnline: true,
        meetingLink: 'https://meet.google.com/abc-defg-hij',
    },
    {
        id: 'session-5',
        title: 'Algorithm Problem Solving',
        subject: 'Algorithms',
        description: 'Practice competitive programming problems and learn problem-solving strategies.',
        host: SAMPLE_HOSTS[0],
        date: '2026-02-16',
        time: '11:00',
        duration: 120,
        venue: 'Computer Lab 2',
        maxParticipants: 15,
        currentParticipants: 8,
        status: 'upcoming',
        difficulty: 'advanced',
        topics: ['Dynamic Programming', 'Greedy Algorithms', 'Backtracking'],
        isOnline: false,
    },
    {
        id: 'session-6',
        title: 'Node.js API Development',
        subject: 'Backend Development',
        description: 'Build RESTful APIs with Express.js, middleware, and authentication.',
        host: SAMPLE_HOSTS[2],
        date: '2026-02-17',
        time: '14:00',
        duration: 90,
        venue: 'Online - Zoom',
        maxParticipants: 20,
        currentParticipants: 14,
        status: 'upcoming',
        difficulty: 'intermediate',
        topics: ['Express.js', 'REST APIs', 'JWT Auth', 'Middleware'],
        isOnline: true,
        meetingLink: 'https://zoom.us/j/987654321',
    },
];

// Subjects for filtering
export const KUPPI_SUBJECTS = [
    'All Subjects',
    'Data Structures',
    'Algorithms',
    'Database Management',
    'Web Development',
    'Backend Development',
    'AI & Machine Learning',
    'Computer Networks',
    'Operating Systems',
    'Software Engineering',
];

// Stats configuration
export const KUPPI_STATS = [
    { label: 'Active Sessions', value: 15, color: '#3B82F6' },
    { label: 'Total Hosts', value: 42, color: '#10B981' },
    { label: 'Sessions This Week', value: 8, color: '#8B5CF6' },
    { label: 'Avg. Rating', value: '4.8', color: '#F59E0B' },
];

// Host application steps
export const HOST_APPLICATION_STEPS = [
    'Academic Info',
    'Session Details',
    'Review & Submit',
];

// Minimum GPA requirement for hosts
export const MIN_HOST_GPA = 3.0;
