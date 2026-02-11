/**
 * @fileoverview Kuppi Session Types
 * @description Type definitions for Kuppi (peer-led study sessions) feature
 */

export type KuppiViewType = 'list' | 'host' | 'detail';
export type KuppiSessionStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
export type KuppiDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface KuppiHost {
    id: string;
    name: string;
    avatar?: string;
    department: string;
    gpa: number;
    rating: number;
    sessionsHosted: number;
    expertise: string[];
}

export interface KuppiSession {
    id: string;
    title: string;
    subject: string;
    description: string;
    host: KuppiHost;
    date: string;
    time: string;
    duration: number; // in minutes
    venue: string;
    maxParticipants: number;
    currentParticipants: number;
    status: KuppiSessionStatus;
    difficulty: KuppiDifficulty;
    topics: string[];
    materials?: string[];
    isOnline: boolean;
    meetingLink?: string;
    createdAt?: string;
}

export interface KuppiFilters {
    search: string;
    subject: string;
    difficulty: KuppiDifficulty | 'all';
    status: KuppiSessionStatus | 'all';
    isOnline: boolean | null;
}

export interface HostApplicationData {
    subject: string;
    topics: string[];
    description: string;
    preferredTime: string;
    gpa: string;
    experience: string;
}

export interface KuppiMessage {
    id: string;
    senderId: string;
    senderName: string;
    senderAvatar?: string;
    receiverId: string;
    receiverName: string;
    content: string;
    timestamp: string;
    isRead: boolean;
    sessionId?: string;
}

export interface KuppiConversation {
    id: string;
    hostId: string;
    hostName: string;
    hostAvatar?: string;
    hostDepartment: string;
    lastMessage: string;
    lastMessageTime: string;
    unreadCount: number;
    messages: KuppiMessage[];
}
