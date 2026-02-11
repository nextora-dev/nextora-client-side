'use client';

import React, { useState } from 'react';
import {
    Box, Typography, Card, CardContent, Chip, Button, TextField, InputAdornment,
    Tabs, Tab, Avatar, IconButton, LinearProgress, Divider, Grid,
} from '@mui/material';
import { motion } from 'framer-motion';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import DescriptionIcon from '@mui/icons-material/Description';
import FolderIcon from '@mui/icons-material/Folder';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PersonIcon from '@mui/icons-material/Person';
import VisibilityIcon from '@mui/icons-material/Visibility';
import StarIcon from '@mui/icons-material/Star';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';

const MotionCard = motion.create(Card);

interface Note {
    id: number;
    title: string;
    subject: string;
    subjectCode: string;
    description: string;
    author: string;
    authorGpa: number;
    uploadDate: string;
    fileType: 'pdf' | 'doc' | 'ppt' | 'image';
    fileSize: string;
    downloads: number;
    views: number;
    rating: number;
    color: string;
}

const notes: Note[] = [
    {
        id: 1,
        title: 'Complete SQL Cheat Sheet',
        subject: 'Database Management Systems',
        subjectCode: 'CS3023',
        description: 'Comprehensive SQL commands, joins, subqueries, and optimization techniques.',
        author: 'Sarah Johnson',
        authorGpa: 3.85,
        uploadDate: 'Jan 20, 2026',
        fileType: 'pdf',
        fileSize: '2.4 MB',
        downloads: 156,
        views: 423,
        rating: 4.8,
        color: '#60A5FA',
    },
    {
        id: 2,
        title: 'Data Structures Visualized',
        subject: 'Data Structures & Algorithms',
        subjectCode: 'CS2012',
        description: 'Visual explanations of trees, graphs, and sorting algorithms with examples.',
        author: 'Mike Chen',
        authorGpa: 3.92,
        uploadDate: 'Jan 18, 2026',
        fileType: 'pdf',
        fileSize: '5.1 MB',
        downloads: 234,
        views: 567,
        rating: 4.9,
        color: '#10B981',
    },
    {
        id: 3,
        title: 'React Hooks Summary',
        subject: 'Web Development',
        subjectCode: 'IT2045',
        description: 'Quick reference guide for all React hooks with code examples.',
        author: 'Emma Wilson',
        authorGpa: 3.78,
        uploadDate: 'Jan 15, 2026',
        fileType: 'pdf',
        fileSize: '1.8 MB',
        downloads: 189,
        views: 345,
        rating: 4.7,
        color: '#8B5CF6',
    },
    {
        id: 4,
        title: 'OOP Design Patterns',
        subject: 'Object Oriented Programming',
        subjectCode: 'CS2034',
        description: 'Common design patterns explained with Java code examples.',
        author: 'Alex Kumar',
        authorGpa: 3.72,
        uploadDate: 'Jan 12, 2026',
        fileType: 'doc',
        fileSize: '3.2 MB',
        downloads: 145,
        views: 289,
        rating: 4.6,
        color: '#F59E0B',
    },
    {
        id: 5,
        title: 'Calculus Formula Sheet',
        subject: 'Mathematics for Computing',
        subjectCode: 'MA1013',
        description: 'All important calculus formulas, derivatives, and integrals.',
        author: 'Prof. Williams',
        authorGpa: 3.95,
        uploadDate: 'Jan 10, 2026',
        fileType: 'pdf',
        fileSize: '1.2 MB',
        downloads: 312,
        views: 678,
        rating: 4.9,
        color: '#EC4899',
    },
    {
        id: 6,
        title: 'Network Protocols Overview',
        subject: 'Computer Networks',
        subjectCode: 'CS3045',
        description: 'TCP/IP, HTTP, DNS, and other networking protocols explained.',
        author: 'David Lee',
        authorGpa: 3.68,
        uploadDate: 'Jan 8, 2026',
        fileType: 'ppt',
        fileSize: '4.5 MB',
        downloads: 98,
        views: 234,
        rating: 4.5,
        color: '#06B6D4',
    },
];

const categories = ['All', 'CS3023', 'CS2012', 'IT2045', 'CS2034', 'MA1013', 'CS3045'];

export default function KuppiNotesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState(0);
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [savedNotes, setSavedNotes] = useState<number[]>([]);

    const toggleSave = (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        setSavedNotes(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
    };

    const filteredNotes = notes.filter(note => {
        const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
            note.subjectCode.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || note.subjectCode === selectedCategory;
        const matchesTab = activeTab === 0 || (activeTab === 1 && savedNotes.includes(note.id));
        return matchesSearch && matchesCategory && matchesTab;
    });

    const getFileIcon = (type: string) => {
        switch (type) {
            case 'pdf': return <PictureAsPdfIcon sx={{ color: '#EF4444' }} />;
            case 'doc': return <InsertDriveFileIcon sx={{ color: '#3B82F6' }} />;
            case 'ppt': return <InsertDriveFileIcon sx={{ color: '#F59E0B' }} />;
            case 'image': return <ImageIcon sx={{ color: '#10B981' }} />;
            default: return <DescriptionIcon />;
        }
    };

    return (
        <Box sx={{ maxWidth: 1400, mx: 'auto' }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>
                    Kuppi Notes
                </Typography>
                <Typography variant="body1" color="text.secondary">
                    Download study materials shared by top students
                </Typography>
            </Box>

            {/* Stats Row */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                {[
                    { label: 'Total Notes', value: notes.length, color: '#60A5FA', icon: DescriptionIcon },
                    { label: 'Total Downloads', value: notes.reduce((acc, n) => acc + n.downloads, 0), color: '#10B981', icon: DownloadIcon },
                    { label: 'Contributors', value: new Set(notes.map(n => n.author)).size, color: '#8B5CF6', icon: PersonIcon },
                    { label: 'Saved Notes', value: savedNotes.length, color: '#F59E0B', icon: BookmarkIcon },
                ].map((stat, i) => (
                    <Grid size={{ xs: 6, md: 3 }} key={i}>
                        <MotionCard
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            sx={{ p: 2.5, textAlign: 'center', borderLeft: 4, borderColor: stat.color }}
                        >
                            <stat.icon sx={{ fontSize: 28, color: stat.color, mb: 1 }} />
                            <Typography variant="h4" sx={{ fontWeight: 800, color: stat.color }}>{stat.value}</Typography>
                            <Typography variant="body2" color="text.secondary">{stat.label}</Typography>
                        </MotionCard>
                    </Grid>
                ))}
            </Grid>

            {/* Tabs */}
            <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3 }}>
                <Tab label="All Notes" icon={<DescriptionIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
                <Tab label={`Saved (${savedNotes.length})`} icon={<BookmarkIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
            </Tabs>

            {/* Search & Filters */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                <TextField
                    placeholder="Search notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ flex: 1, minWidth: 280 }}
                    slotProps={{
                        input: {
                            startAdornment: <InputAdornment position="start"><SearchIcon color="action" /></InputAdornment>
                        }
                    }}
                />
            </Box>

            {/* Category Chips */}
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 4 }}>
                {categories.map((cat) => (
                    <Chip
                        key={cat}
                        label={cat}
                        onClick={() => setSelectedCategory(cat)}
                        sx={{
                            fontWeight: 600,
                            px: 1,
                            bgcolor: selectedCategory === cat ? 'primary.main' : 'transparent',
                            color: selectedCategory === cat ? 'white' : 'text.primary',
                            border: selectedCategory === cat ? 'none' : '1px solid',
                            borderColor: 'divider',
                            '&:hover': { bgcolor: selectedCategory === cat ? 'primary.dark' : 'action.hover' }
                        }}
                    />
                ))}
            </Box>

            {/* Notes Grid */}
            <Grid container spacing={3}>
                {filteredNotes.map((note, i) => (
                    <Grid size={{ xs: 12, sm: 6, lg: 4 }} key={note.id}>
                        <MotionCard
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.1)' }}
                            sx={{ height: '100%', cursor: 'pointer' }}
                        >
                            {/* Header */}
                            <Box sx={{
                                p: 3,
                                background: `linear-gradient(135deg, ${note.color}15 0%, ${note.color}30 100%)`,
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                            }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                    <Box sx={{ p: 1.5, bgcolor: 'white', borderRadius: 2, boxShadow: 1 }}>
                                        {getFileIcon(note.fileType)}
                                    </Box>
                                    <Box>
                                        <Chip
                                            label={note.subjectCode}
                                            size="small"
                                            sx={{ bgcolor: note.color, color: 'white', fontWeight: 600, mb: 0.5 }}
                                        />
                                        <Typography variant="caption" display="block" color="text.secondary">
                                            {note.fileType.toUpperCase()} • {note.fileSize}
                                        </Typography>
                                    </Box>
                                </Box>
                                <IconButton onClick={(e) => toggleSave(note.id, e)} size="small">
                                    {savedNotes.includes(note.id) ?
                                        <BookmarkIcon sx={{ color: '#F59E0B' }} /> :
                                        <BookmarkBorderIcon sx={{ color: 'grey.400' }} />
                                    }
                                </IconButton>
                            </Box>

                            <CardContent sx={{ p: 3 }}>
                                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, lineHeight: 1.3 }}>
                                    {note.title}
                                </Typography>
                                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, minHeight: 40 }}>
                                    {note.description}
                                </Typography>

                                {/* Author */}
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2, p: 1.5, bgcolor: 'grey.50', borderRadius: 2 }}>
                                    <Avatar sx={{ bgcolor: note.color, width: 36, height: 36, fontSize: '0.875rem' }}>
                                        {note.author.split(' ').map(n => n[0]).join('')}
                                    </Avatar>
                                    <Box sx={{ flex: 1 }}>
                                        <Typography variant="body2" fontWeight={600}>{note.author}</Typography>
                                        <Typography variant="caption" color="text.secondary">GPA: {note.authorGpa}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <StarIcon sx={{ fontSize: 16, color: '#F59E0B' }} />
                                        <Typography variant="body2" fontWeight={600}>{note.rating}</Typography>
                                    </Box>
                                </Box>

                                {/* Stats */}
                                <Box sx={{ display: 'flex', gap: 3, mb: 2 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <DownloadIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                        <Typography variant="body2" color="text.secondary">{note.downloads}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <VisibilityIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                        <Typography variant="body2" color="text.secondary">{note.views}</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                        <CalendarTodayIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
                                        <Typography variant="body2" color="text.secondary">{note.uploadDate}</Typography>
                                    </Box>
                                </Box>

                                <Button
                                    fullWidth
                                    variant="contained"
                                    startIcon={<DownloadIcon />}
                                    sx={{
                                        bgcolor: note.color,
                                        borderRadius: 2,
                                        '&:hover': { bgcolor: note.color, filter: 'brightness(0.9)' }
                                    }}
                                >
                                    Download
                                </Button>
                            </CardContent>
                        </MotionCard>
                    </Grid>
                ))}
            </Grid>

            {filteredNotes.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 10 }}>
                    <FolderIcon sx={{ fontSize: 80, color: 'grey.300', mb: 2 }} />
                    <Typography variant="h6" color="text.secondary">No notes found</Typography>
                    <Typography variant="body2" color="text.secondary">Try adjusting your search or filters</Typography>
                </Box>
            )}
        </Box>
    );
}
