// AuthAlert - Reusable alert component for auth pages
'use client';

import { ReactNode } from 'react';
import { Alert, AlertProps, Typography, SxProps, Theme } from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SecurityIcon from '@mui/icons-material/Security';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

export interface AuthAlertProps {
    severity?: AlertProps['severity'];
    title?: string;
    message: string | ReactNode;
    icon?: ReactNode;
    sx?: SxProps<Theme>;
}

export function AuthAlert({
    severity = 'info',
    title,
    message,
    icon,
    sx,
}: AuthAlertProps) {
    const getDefaultIcon = () => {
        switch (severity) {
            case 'info':
                return <InfoOutlinedIcon />;
            case 'warning':
                return <WarningAmberIcon />;
            default:
                return undefined;
        }
    };

    return (
        <Alert
            severity={severity}
            icon={icon ?? getDefaultIcon()}
            sx={{ borderRadius: 3, ...sx }}
        >
            <Typography variant="caption">
                {title && <strong>{title}: </strong>}
                {message}
            </Typography>
        </Alert>
    );
}

// Pre-configured security alert
export function SecurityAlert({ message, sx }: { message?: string; sx?: SxProps<Theme> }) {
    return (
        <AuthAlert
            severity="info"
            title="Security Note"
            message={message ?? "For your protection, we'll only send password reset instructions to registered email addresses."}
            icon={<SecurityIcon />}
            sx={sx}
        />
    );
}

// Pre-configured warning alert
export function WarningAlert({ title, message, sx }: { title?: string; message: string; sx?: SxProps<Theme> }) {
    return (
        <AuthAlert
            severity="warning"
            title={title}
            message={message}
            sx={sx}
        />
    );
}

