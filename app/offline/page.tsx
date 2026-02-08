"use client";

import { Box, Button, Container, Typography } from "@mui/material";
import WifiOffIcon from "@mui/icons-material/WifiOff";
import RefreshIcon from "@mui/icons-material/Refresh";

/**
 * Offline Fallback Page
 * - Displayed when user navigates to a page while offline
 * - Provides clear feedback and retry option
 */
export default function OfflinePage() {
  const handleRetry = () => {
    window.location.reload();
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          textAlign: "center",
          gap: 3,
        }}
      >
        <WifiOffIcon sx={{ fontSize: 80, color: "text.secondary" }} />

        <Typography variant="h4" component="h1" fontWeight="bold">
          You&apos;re Offline
        </Typography>

        <Typography variant="body1" color="text.secondary" maxWidth={400}>
          It looks like you&apos;ve lost your internet connection.
          Please check your connection and try again.
        </Typography>

        <Button
          variant="contained"
          size="large"
          startIcon={<RefreshIcon />}
          onClick={handleRetry}
          sx={{ mt: 2 }}
        >
          Retry Connection
        </Button>

        <Typography variant="caption" color="text.secondary" sx={{ mt: 4 }}>
          Some features may be available offline.
          Navigate back to access cached content.
        </Typography>
      </Box>
    </Container>
  );
}

