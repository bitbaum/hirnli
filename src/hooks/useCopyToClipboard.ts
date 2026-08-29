'use client';

/**
 * useCopyToClipboard — Single source for the copy-to-clipboard interaction.
 *
 * Replaces five hand-rolled `navigator.clipboard.writeText(...).then(setCopied(true)
 * + setTimeout(setCopied(false), 2000))` snippets, two of which hardcoded
 * `2000` instead of pulling from `UI_TIMINGS.copySuccess`.
 *
 * The hook returns `{ copied, copy }`; consumers render based on `copied` and
 * call `copy(text)` on the click handler. Optional `key` lets components
 * track which of several copy buttons was last clicked (e.g. the HubImage
 * generator's per-space copy buttons).
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { UI_TIMINGS } from '@/lib/config/ui-timings';

interface UseCopyToClipboardOptions {
  /** ms to keep `copied` true after a successful copy. Default: UI_TIMINGS.copySuccess */
  resetAfter?: number;
}

export function useCopyToClipboard(options: UseCopyToClipboardOptions = {}) {
  const { resetAfter = UI_TIMINGS.copySuccess } = options;
  const [copied, setCopied] = useState<string | true | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Ensure a pending reset-timer is cleared on unmount so setCopied isn't
  // called after the component is gone.
  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  const copy = useCallback(
    /**
     * @param text   Text to write to the clipboard.
     * @param key    Optional identifier — if multiple copy targets share the
     *               same hook instance, pass a distinct key per target and
     *               compare `copied === key` in the render to show the
     *               "copied" state on the right element.
     */
    async (text: string, key?: string) => {
      try {
        await navigator.clipboard.writeText(text);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        setCopied(key ?? true);
        timeoutRef.current = setTimeout(() => setCopied(null), resetAfter);
      } catch {
        // Clipboard rejection (e.g. permissions, iframe restriction) — no-op.
        // Browsers surface their own error UI; we don't want to swallow with
        // a console.error in production.
      }
    },
    [resetAfter],
  );

  return { copied, copy };
}
