'use client';

import { useState, useRef, useCallback, useId } from 'react';

const CLOSE_DELAY_MS = 150;

export function useNavDropdown() {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLLIElement>(null);
  const menuId = useId();
  const closeTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const openMenu = useCallback(() => {
    clearTimeout(closeTimeout.current);
    setOpen(true);
  }, []);

  const scheduleClose = useCallback(() => {
    closeTimeout.current = setTimeout(() => setOpen(false), CLOSE_DELAY_MS);
  }, []);

  const handleBlur = useCallback((e: React.FocusEvent) => {
    if (
      wrapperRef.current &&
      e.relatedTarget instanceof Node &&
      !wrapperRef.current.contains(e.relatedTarget)
    ) {
      setOpen(false);
    }
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setOpen(false);
      const trigger = wrapperRef.current?.querySelector<HTMLElement>('[aria-haspopup]');
      trigger?.focus();
    }
  }, []);

  return { open, setOpen, wrapperRef, menuId, openMenu, scheduleClose, handleBlur, handleKeyDown };
}
