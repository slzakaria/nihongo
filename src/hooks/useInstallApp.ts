'use client';

import { useEffect, useState } from 'react';

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

export interface InstallAppState {
  /** Already launched from the home screen / installed shell */
  isStandalone: boolean;
  /** iOS Safari, which has no native install prompt and needs manual steps */
  isIos: boolean;
  /** Chrome/Edge/Android style native prompt, captured via beforeinstallprompt */
  canPromptInstall: boolean;
  promptInstall: () => Promise<void>;
}

function detectStandalone() {
  if (typeof window === 'undefined') return false;
  const navigatorStandalone = (window.navigator as Navigator & { standalone?: boolean })
    .standalone;
  return window.matchMedia('(display-mode: standalone)').matches || navigatorStandalone === true;
}

function detectIos() {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  const iosDevice = /iphone|ipad|ipod/i.test(ua);
  // iPadOS 13+ reports as "Mac" but still has touch support, unlike real desktop Macs
  const iosIpad = /macintosh/i.test(ua) && window.navigator.maxTouchPoints > 1;
  return iosDevice || iosIpad;
}

// Detects whether the app is already installed and which install path (native prompt
// vs. iOS manual "Add to Home Screen") applies to the current browser.
export function useInstallApp(): InstallAppState {
  const [isStandalone, setIsStandalone] = useState(detectStandalone);
  const [isIos] = useState(detectIos);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(
    null,
  );

  useEffect(() => {
    const standaloneQuery = window.matchMedia('(display-mode: standalone)');

    function onStandaloneChange(e: MediaQueryListEvent) {
      setIsStandalone(e.matches);
    }
    standaloneQuery.addEventListener('change', onStandaloneChange);

    function onBeforeInstallPrompt(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }
    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt);

    function onAppInstalled() {
      setDeferredPrompt(null);
      setIsStandalone(true);
    }
    window.addEventListener('appinstalled', onAppInstalled);

    return () => {
      standaloneQuery.removeEventListener('change', onStandaloneChange);
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt);
      window.removeEventListener('appinstalled', onAppInstalled);
    };
  }, []);

  async function promptInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
  }

  return {
    isStandalone,
    isIos,
    canPromptInstall: deferredPrompt !== null,
    promptInstall,
  };
}
