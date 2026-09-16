import { createContext, useContext, useEffect, useMemo, useState } from "react";

const PWAInstallContext = createContext(null);

function getPlatform() {
  if (typeof window === "undefined") return "unsupported";
  const isStandalone = window.matchMedia?.("(display-mode: standalone)").matches;
  const isIOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
  const isIOSStandalone = window.navigator.standalone === true;
  if (isStandalone || isIOSStandalone) return "installed";
  if (isIOS) return "ios";
  return "browser";
}

export default function PWAInstallProvider({ children }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [platform, setPlatform] = useState(getPlatform);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setDeferredPrompt(event);
      setPlatform("browser");
    };
    const handleAppInstalled = () => {
      setDeferredPrompt(null);
      setPlatform("installed");
      setIsOpen(false);
    };
    const handleDisplayModeChange = () => setPlatform(getPlatform());

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);
    const mediaQuery = window.matchMedia?.("(display-mode: standalone)");
    mediaQuery?.addEventListener("change", handleDisplayModeChange);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      mediaQuery?.removeEventListener("change", handleDisplayModeChange);
    };
  }, []);

  const value = useMemo(() => ({
    isOpen,
    platform,
    canInstall: Boolean(deferredPrompt),
    openInstall: () => setIsOpen(true),
    closeInstall: () => setIsOpen(false),
    install: async () => {
      if (!deferredPrompt) return;
      await deferredPrompt.prompt();
      setDeferredPrompt(null);
      setIsOpen(false);
    },
  }), [deferredPrompt, isOpen, platform]);

  return <PWAInstallContext.Provider value={value}>{children}</PWAInstallContext.Provider>;
}

export function usePWAInstall() {
  const context = useContext(PWAInstallContext);
  if (!context) throw new Error("usePWAInstall must be used inside PWAInstallProvider");
  return context;
}