import { useEffect, useRef } from 'react';
import { resourceApi } from '../api/resourceApi';

const POLL_INTERVAL_MS = 60_000; // check for due reminders once a minute

/**
 * Polls the backend for reminders that have come due and fires a native
 * Chrome notification for each one, while the tab is open.
 *
 * LIMITATION: this only works while the app is open in a tab, because it's
 * a plain setInterval + the Notification API. For true background delivery
 * (tab/browser closed) swap this for a Service Worker + Web Push (VAPID)
 * subscription — the backend polling query (`getDueResources`) stays the same,
 * only the delivery mechanism changes.
 */
export function useNotificationScheduler(onDue?: (count: number) => void) {
  const notifiedIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const checkDue = async () => {
      try {
        const due = await resourceApi.due();
        const fresh = due.filter((r) => !notifiedIds.current.has(r.id));
        if (fresh.length === 0) return;

        fresh.forEach((r) => {
          notifiedIds.current.add(r.id);
          if (Notification.permission === 'granted') {
            const n = new Notification('SourceSea — time to revisit', {
              body: r.title,
              tag: r.id, // prevents duplicate OS-level notifications for the same item
            });
            n.onclick = () => window.open(r.url, '_blank');
          }
        });

        onDue?.(fresh.length);
      } catch {
        // Silently skip a failed poll; it'll retry on the next tick.
      }
    };

    checkDue();
    const interval = setInterval(checkDue, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [onDue]);
}
