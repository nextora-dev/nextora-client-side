'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    Box,
    Typography,
    Stack,
    Avatar,
    IconButton,
    TextField,
    Button,
    Chip,
    Divider,
    alpha,
    useTheme,
    useMediaQuery,
    InputAdornment,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import SchoolIcon from '@mui/icons-material/School';
import StarIcon from '@mui/icons-material/Star';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';
import CheckIcon from '@mui/icons-material/Check';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import { KuppiHost, KuppiMessage, KuppiSession } from '@/types/kuppi';
import { getTutorInitials } from './kuppi.utils';

interface MessageHostModalProps {
    host: KuppiHost | null;
    session?: KuppiSession | null;
    open: boolean;
    onClose: () => void;
}

const MotionBox = motion.create(Box);

// Sample messages for demo
const generateSampleMessages = (hostId: string, hostName: string): KuppiMessage[] => [
    {
        id: 'msg-1',
        senderId: hostId,
        senderName: hostName,
        receiverId: 'current-user',
        receiverName: 'You',
        content: 'Hi! Thanks for reaching out. How can I help you?',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        isRead: true,
    },
];

export const MessageHostModal: React.FC<MessageHostModalProps> = ({
    host,
    session,
    open,
    onClose,
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [newMessage, setNewMessage] = useState('');
    const [messages, setMessages] = useState<KuppiMessage[]>([]);
    const [isSending, setIsSending] = useState(false);

    // Initialize messages when modal opens
    useEffect(() => {
        if (open && host) {
            setMessages(generateSampleMessages(host.id, host.name));
        }
    }, [open, host]);

    // Scroll to bottom when new message added
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (!host) return null;

    const handleSendMessage = async () => {
        if (!newMessage.trim()) return;

        setIsSending(true);

        // Create new message
        const message: KuppiMessage = {
            id: `msg-${Date.now()}`,
            senderId: 'current-user',
            senderName: 'You',
            receiverId: host.id,
            receiverName: host.name,
            content: newMessage.trim(),
            timestamp: new Date().toISOString(),
            isRead: false,
            sessionId: session?.id,
        };

        // Add message to list
        setMessages((prev) => [...prev, message]);
        setNewMessage('');

        // Simulate sending delay
        await new Promise((resolve) => setTimeout(resolve, 500));
        setIsSending(false);

        // Simulate host reply after 2 seconds
        setTimeout(() => {
            const replyMessage: KuppiMessage = {
                id: `msg-${Date.now()}`,
                senderId: host.id,
                senderName: host.name,
                receiverId: 'current-user',
                receiverName: 'You',
                content: getAutoReply(newMessage),
                timestamp: new Date().toISOString(),
                isRead: true,
            };
            setMessages((prev) => [...prev, replyMessage]);
        }, 2000);
    };

    const getAutoReply = (userMessage: string): string => {
        const lowerMessage = userMessage.toLowerCase();
        if (lowerMessage.includes('help') || lowerMessage.includes('question')) {
            return "Sure, I'd be happy to help! What specific topic would you like to discuss?";
        }
        if (lowerMessage.includes('session') || lowerMessage.includes('kuppi')) {
            return "Great question about the session! Feel free to join and we can discuss more during the session.";
        }
        if (lowerMessage.includes('thank')) {
            return "You're welcome! Feel free to reach out anytime. See you at the session! 😊";
        }
        return "Thanks for your message! I'll get back to you as soon as possible. Looking forward to helping you!";
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <Dialog
                    open={open}
                    onClose={onClose}
                    maxWidth="sm"
                    fullWidth
                    fullScreen={isMobile}
                    slotProps={{
                        paper: {
                            sx: {
                                borderRadius: isMobile ? 0 : 3,
                                bgcolor: 'background.paper',
                                backgroundImage: 'none',
                                height: isMobile ? '100%' : 600,
                                maxHeight: isMobile ? '100%' : '80vh',
                                display: 'flex',
                                flexDirection: 'column',
                            },
                        },
                    }}
                >
                    {/* Header */}
                    <Box
                        sx={{
                            p: 2,
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            bgcolor: alpha(theme.palette.primary.main, 0.02),
                        }}
                    >
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <Avatar
                                    sx={{
                                        width: 48,
                                        height: 48,
                                        bgcolor: alpha(theme.palette.primary.main, 0.15),
                                        color: 'primary.main',
                                        fontWeight: 700,
                                    }}
                                >
                                    {getTutorInitials(host.name)}
                                </Avatar>
                                <Box>
                                    <Typography variant="subtitle1" fontWeight={600}>
                                        {host.name}
                                    </Typography>
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <Chip
                                            icon={<SchoolIcon sx={{ fontSize: 12 }} />}
                                            label={host.department}
                                            size="small"
                                            sx={{
                                                height: 20,
                                                fontSize: '0.7rem',
                                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                color: 'primary.main',
                                                '& .MuiChip-icon': { color: 'primary.main' },
                                            }}
                                        />
                                        <Stack direction="row" alignItems="center" spacing={0.25}>
                                            <StarIcon sx={{ fontSize: 12, color: 'warning.main' }} />
                                            <Typography variant="caption" color="text.secondary">
                                                {host.rating}
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                </Box>
                            </Stack>
                            <IconButton onClick={onClose} size="small">
                                <CloseIcon />
                            </IconButton>
                        </Stack>

                        {/* Session context if provided */}
                        {session && (
                            <Box
                                sx={{
                                    mt: 1.5,
                                    p: 1.5,
                                    borderRadius: 2,
                                    bgcolor: alpha(theme.palette.info.main, 0.08),
                                    border: '1px solid',
                                    borderColor: alpha(theme.palette.info.main, 0.2),
                                }}
                            >
                                <Typography variant="caption" color="info.main" fontWeight={600}>
                                    Regarding: {session.title}
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    {/* Messages Area */}
                    <DialogContent
                        sx={{
                            flex: 1,
                            p: 2,
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                            bgcolor: alpha(theme.palette.background.default, 0.5),
                        }}
                    >
                        {/* Welcome message */}
                        <Box sx={{ textAlign: 'center', py: 2 }}>
                            <Typography variant="caption" color="text.secondary">
                                Start a conversation with {host.name}
                            </Typography>
                        </Box>

                        {/* Messages */}
                        <AnimatePresence>
                            {messages.map((message) => {
                                const isOwnMessage = message.senderId === 'current-user';
                                return (
                                    <MotionBox
                                        key={message.id}
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        sx={{
                                            display: 'flex',
                                            justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                maxWidth: '75%',
                                                p: 1.5,
                                                borderRadius: 2,
                                                borderBottomRightRadius: isOwnMessage ? 0.5 : 2,
                                                borderBottomLeftRadius: isOwnMessage ? 2 : 0.5,
                                                bgcolor: isOwnMessage
                                                    ? 'primary.main'
                                                    : 'background.paper',
                                                color: isOwnMessage ? 'white' : 'text.primary',
                                                boxShadow: isOwnMessage
                                                    ? `0 2px 8px ${alpha(theme.palette.primary.main, 0.3)}`
                                                    : '0 1px 3px rgba(0,0,0,0.1)',
                                                border: isOwnMessage ? 'none' : '1px solid',
                                                borderColor: 'divider',
                                            }}
                                        >
                                            <Typography variant="body2" sx={{ wordBreak: 'break-word' }}>
                                                {message.content}
                                            </Typography>
                                            <Stack
                                                direction="row"
                                                justifyContent="flex-end"
                                                alignItems="center"
                                                spacing={0.5}
                                                sx={{ mt: 0.5 }}
                                            >
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        opacity: 0.7,
                                                        color: isOwnMessage ? 'inherit' : 'text.secondary',
                                                    }}
                                                >
                                                    {formatTime(message.timestamp)}
                                                </Typography>
                                                {isOwnMessage && (
                                                    message.isRead ? (
                                                        <DoneAllIcon sx={{ fontSize: 14, opacity: 0.7 }} />
                                                    ) : (
                                                        <CheckIcon sx={{ fontSize: 14, opacity: 0.7 }} />
                                                    )
                                                )}
                                            </Stack>
                                        </Box>
                                    </MotionBox>
                                );
                            })}
                        </AnimatePresence>
                        <div ref={messagesEndRef} />
                    </DialogContent>

                    {/* Message Input */}
                    <Box
                        sx={{
                            p: 2,
                            borderTop: '1px solid',
                            borderColor: 'divider',
                            bgcolor: 'background.paper',
                        }}
                    >
                        <Stack direction="row" spacing={1} alignItems="flex-end">
                            <TextField
                                fullWidth
                                multiline
                                maxRows={4}
                                placeholder="Type your message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                onKeyPress={handleKeyPress}
                                disabled={isSending}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: 3,
                                        bgcolor: alpha(theme.palette.background.default, 0.5),
                                        '& fieldset': { borderColor: 'divider' },
                                        '&:hover fieldset': { borderColor: 'primary.main' },
                                        '&.Mui-focused fieldset': { borderColor: 'primary.main' },
                                    },
                                }}
                                slotProps={{
                                    input: {
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <Stack direction="row" spacing={0.5}>
                                                    <IconButton size="small" sx={{ color: 'text.secondary' }}>
                                                        <EmojiEmotionsIcon fontSize="small" />
                                                    </IconButton>
                                                    <IconButton size="small" sx={{ color: 'text.secondary' }}>
                                                        <AttachFileIcon fontSize="small" />
                                                    </IconButton>
                                                </Stack>
                                            </InputAdornment>
                                        ),
                                    },
                                }}
                            />
                            <IconButton
                                onClick={handleSendMessage}
                                disabled={!newMessage.trim() || isSending}
                                sx={{
                                    bgcolor: 'primary.main',
                                    color: 'white',
                                    width: 48,
                                    height: 48,
                                    '&:hover': {
                                        bgcolor: 'primary.dark',
                                    },
                                    '&.Mui-disabled': {
                                        bgcolor: 'action.disabledBackground',
                                        color: 'action.disabled',
                                    },
                                }}
                            >
                                <SendIcon />
                            </IconButton>
                        </Stack>
                    </Box>
                </Dialog>
            )}
        </AnimatePresence>
    );
};

