import React, { useState, useEffect } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import { useAppDispatch } from '@/store';
import { rescheduleSessionAsync } from '@/features/kuppi/kuppiSlice';
import { KuppiSessionResponse } from '@/features/kuppi/types';

type Props = {
    open: boolean;
    session: KuppiSessionResponse | null;
    onClose: () => void;
    onSuccess?: (updated: KuppiSessionResponse) => void;
};

export default function RescheduleSessionModal({ open, session, onClose, onSuccess }: Props) {
    const dispatch = useAppDispatch();
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (session) {
            // convert ISO to datetime-local-friendly value
            const toLocal = (iso: string) => iso ? iso.replace(/:\d{2}Z$/, '').replace('Z','') : '';
            setStart(session.scheduledStartTime ? session.scheduledStartTime.replace('Z','') : '');
            setEnd(session.scheduledEndTime ? session.scheduledEndTime.replace('Z','') : '');
        } else {
            setStart('');
            setEnd('');
        }
    }, [session]);

    const handleSubmit = async () => {
        if (!session) return;
        setLoading(true);
        try {
            const resp: any = await dispatch(rescheduleSessionAsync({ id: session.id, newStartTime: new Date(start).toISOString(), newEndTime: new Date(end).toISOString() } as any));
            // payload may be nested; try to extract updated session
            const payload = (resp && resp.payload) ? resp.payload : resp;
            const updated = payload?.data || payload?.data?.data || payload;
            if (onSuccess && updated) onSuccess(updated);
            onClose();
        } catch (e) {
            // ignore - errors will be handled by global state
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Reschedule Session</DialogTitle>
            <DialogContent>
                <Stack spacing={2} sx={{ mt: 1 }}>
                    <TextField
                        label="Start Time"
                        type="datetime-local"
                        value={start}
                        onChange={(e) => setStart(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                    />
                    <TextField
                        label="End Time"
                        type="datetime-local"
                        value={end}
                        onChange={(e) => setEnd(e.target.value)}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                    />
                </Stack>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>Cancel</Button>
                <Button variant="contained" onClick={handleSubmit} disabled={loading || !start || !end}>Reschedule</Button>
            </DialogActions>
        </Dialog>
    );
}

