import React, { useEffect } from 'react';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchNotesBySessionAsync, selectKuppiNotesBySession, selectKuppiIsNoteLoading } from '@/features/kuppi/kuppiSlice';

type Props = {
    sessionId: number;
};

export default function SessionNotesList({ sessionId }: Props) {
    const dispatch = useAppDispatch();
    const notes = useAppSelector(selectKuppiNotesBySession(sessionId));
    const loading = useAppSelector(selectKuppiIsNoteLoading);

    useEffect(() => {
        dispatch(fetchNotesBySessionAsync(sessionId));
    }, [dispatch, sessionId]);

    if (loading) return <div>Loading notes...</div>;
    if (!notes || notes.length === 0) return <div>No notes for this session.</div>;

    return (
        <List>
            {notes.map((n) => (
                <ListItem key={n.id} divider>
                    <ListItemText primary={n.title} secondary={n.uploader.fullName} />
                </ListItem>
            ))}
        </List>
    );
}

