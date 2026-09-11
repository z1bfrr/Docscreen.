import { useState, useEffect, useRef } from 'react';

function formatRelative(diffSec: number): string {
  if (diffSec < 5)  return 'just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const mins = Math.floor(diffSec / 60);
  if (mins < 60)    return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  return `${hrs}h ago`;
}

/**
 * Returns a human-readable relative time string.
 * Updates every 10s (not every 1s) — sufficient UX, far less re-render pressure.
 * Returns '—' while no timestamp is available.
 */
export function useRelativeTime(isoString: string | null | undefined): string {
  const tsRef = useRef(isoString);
  tsRef.current = isoString;

  const compute = () =>
    tsRef.current
      ? formatRelative(Math.floor((Date.now() - new Date(tsRef.current).getTime()) / 1000))
      : '—';

  const [relative, setRelative] = useState(compute);

  useEffect(() => {
    setRelative(compute());
    // Only need 1-second updates for the first minute, then every 10s is fine
    const id = setInterval(() => setRelative(compute()), 10_000);
    return () => clearInterval(id);
  }, [isoString]);

  return relative;
}
