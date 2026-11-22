"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useBusyStore } from "@/store/busy";

// Stops the overlay if a navigation never completes (e.g. a click on a link that fails to load)
const GIVE_UP_MS = 15000;

// Marks in-app navigations as busy so the loading overlay covers them until the new route renders
export function NavigationProgress() {
  const pathname = usePathname();
  const giveUpTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
        return;
      const anchor = (e.target as Element | null)?.closest?.("a[href]") as
        HTMLAnchorElement | null | undefined;
      if (
        !anchor ||
        anchor.target === "_blank" ||
        anchor.hasAttribute("download")
      )
        return;
      const url = new URL(anchor.href);
      if (
        url.origin !== window.location.origin ||
        url.pathname === window.location.pathname
      )
        return;

      clearTimeout(giveUpTimer.current);
      useBusyStore.getState().setNavigating(true);
      giveUpTimer.current = setTimeout(
        () => useBusyStore.getState().setNavigating(false),
        GIVE_UP_MS,
      );
    }

    // Capture phase runs before Next's Link handler, so the click is seen even though Link prevents the default
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  // Runs when the route changes: the pending navigation is finished, so cancel its timer and clear the overlay
  useEffect(() => {
    return () => {
      clearTimeout(giveUpTimer.current);
      useBusyStore.getState().setNavigating(false);
    };
  }, [pathname]);

  return null;
}
