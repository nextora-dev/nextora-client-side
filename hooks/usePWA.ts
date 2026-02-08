"use client";

import { useEffect, useState, useCallback } from "react";

/**
 * PWA Installation State
 */
interface PWAInstallState {
  /** Whether the app is installable */
  isInstallable: boolean;
  /** Whether the app is already installed */
  isInstalled: boolean;
  /** Whether the app is running in standalone mode */
  isStandalone: boolean;
  /** Whether currently online */
  isOnline: boolean;
  /** Service worker registration state */
  swRegistration: ServiceWorkerRegistration | null;
  /** Whether a new version is available */
  hasUpdate: boolean;
}

/**
 * PWA Actions
 */
interface PWAActions {
  /** Prompt user to install the PWA */
  promptInstall: () => Promise<boolean>;
  /** Update the service worker to latest version */
  updateServiceWorker: () => void;
  /** Check for service worker updates */
  checkForUpdates: () => Promise<void>;
}

type UsePWAReturn = PWAInstallState & PWAActions;

// Store the deferred prompt globally so it persists across renders
let deferredPrompt: BeforeInstallPromptEvent | null = null;

/**
 * BeforeInstallPromptEvent interface
 * - Fired when browser determines app can be installed
 */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

/**
 * Custom hook for PWA functionality
 * - Manages installation prompt
 * - Tracks online/offline status
 * - Handles service worker updates
 */
export function usePWA(): UsePWAReturn {
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [hasUpdate, setHasUpdate] = useState(false);

  // Check if running in standalone mode (installed PWA)
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check standalone display mode
    const navigatorWithStandalone = window.navigator as Navigator & { standalone?: boolean };
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      Boolean(navigatorWithStandalone.standalone);

    setIsStandalone(isStandaloneMode);
    setIsInstalled(isStandaloneMode);

    // Listen for display mode changes
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    const handleChange = (e: MediaQueryListEvent) => {
      setIsStandalone(e.matches);
      setIsInstalled(e.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Handle online/offline status
  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Handle beforeinstallprompt event
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing
      e.preventDefault();
      // Store the event for later use
      deferredPrompt = e as BeforeInstallPromptEvent;
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      // Clear the deferred prompt
      deferredPrompt = null;
      setIsInstallable(false);
      setIsInstalled(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, []);

  // Register and track service worker
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.ready;
        setSwRegistration(registration);

        // Check for updates on registration
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                // New update available
                setHasUpdate(true);
              }
            });
          }
        });
      } catch (error) {
        console.error("Service worker registration failed:", error);
      }
    };

    registerSW();
  }, []);

  // Prompt installation
  const promptInstall = useCallback(async (): Promise<boolean> => {
    if (!deferredPrompt) {
      console.log("Installation prompt not available");
      return false;
    }

    try {
      // Show the install prompt
      await deferredPrompt.prompt();

      // Wait for user response
      const { outcome } = await deferredPrompt.userChoice;

      // Clear the deferred prompt regardless of outcome
      deferredPrompt = null;
      setIsInstallable(false);

      return outcome === "accepted";
    } catch (error) {
      console.error("Error prompting installation:", error);
      return false;
    }
  }, []);

  // Update service worker
  const updateServiceWorker = useCallback(() => {
    if (swRegistration?.waiting) {
      // Tell the waiting service worker to skip waiting and become active
      swRegistration.waiting.postMessage({ type: "SKIP_WAITING" });
      // Reload the page to load the new version
      window.location.reload();
    }
  }, [swRegistration]);

  // Check for updates
  const checkForUpdates = useCallback(async (): Promise<void> => {
    if (swRegistration) {
      try {
        await swRegistration.update();
      } catch (error) {
        console.error("Error checking for updates:", error);
      }
    }
  }, [swRegistration]);

  return {
    isInstallable,
    isInstalled,
    isStandalone,
    isOnline,
    swRegistration,
    hasUpdate,
    promptInstall,
    updateServiceWorker,
    checkForUpdates,
  };
}

export default usePWA;

