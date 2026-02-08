"use client";

import { useState } from "react";
import {
  Alert,
  AlertTitle,
  Button,
  IconButton,
  Snackbar,
  Box,
} from "@mui/material";
import InstallMobileIcon from "@mui/icons-material/InstallMobile";
import CloseIcon from "@mui/icons-material/Close";
import SystemUpdateIcon from "@mui/icons-material/SystemUpdate";
import { usePWA } from "@/hooks/usePWA";

/**
 * PWA Install Prompt Banner
 * - Shows when app is installable
 * - Persists user's dismissal preference
 */
export function PWAInstallBanner() {
  const { isInstallable, promptInstall } = usePWA();
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("pwa-install-dismissed") === "true";
  });

  const handleInstall = async () => {
    const installed = await promptInstall();
    if (!installed) {
      // User declined, don't show again for this session
      setDismissed(true);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem("pwa-install-dismissed", "true");
  };

  if (!isInstallable || dismissed) return null;

  return (
    <Alert
      severity="info"
      icon={<InstallMobileIcon />}
      sx={{
        position: "fixed",
        bottom: 16,
        left: 16,
        right: 16,
        zIndex: 1300,
        maxWidth: 500,
        mx: "auto",
        boxShadow: 3,
      }}
      action={
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            color="inherit"
            size="small"
            onClick={handleInstall}
          >
            Install
          </Button>
          <IconButton
            color="inherit"
            size="small"
            onClick={handleDismiss}
            aria-label="close"
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      }
    >
      <AlertTitle>Install Nextora LMS</AlertTitle>
      Install this app for a better experience with offline access.
    </Alert>
  );
}

/**
 * PWA Update Available Snackbar
 * - Shows when a new version is available
 * - Allows user to update immediately
 */
export function PWAUpdateNotification() {
  const { hasUpdate, updateServiceWorker } = usePWA();
  const [open, setOpen] = useState(true);

  if (!hasUpdate) return null;

  return (
    <Snackbar
      open={open}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert
        severity="success"
        icon={<SystemUpdateIcon />}
        sx={{ width: "100%" }}
        action={
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              color="inherit"
              size="small"
              onClick={updateServiceWorker}
            >
              Update Now
            </Button>
            <IconButton
              color="inherit"
              size="small"
              onClick={() => setOpen(false)}
              aria-label="close"
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
        }
      >
        <AlertTitle>Update Available</AlertTitle>
        A new version of Nextora LMS is available.
      </Alert>
    </Snackbar>
  );
}

/**
 * Offline Status Indicator
 * - Shows when user goes offline
 */
export function OfflineIndicator() {
  const { isOnline } = usePWA();

  if (isOnline) return null;

  return (
    <Alert
      severity="warning"
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1400,
        borderRadius: 0,
      }}
    >
      You are currently offline. Some features may not be available.
    </Alert>
  );
}

export default PWAInstallBanner;

