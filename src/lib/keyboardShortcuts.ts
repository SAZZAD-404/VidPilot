// Keyboard Shortcuts Manager
import { useEffect } from 'react';

export interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
}

export const useKeyboardShortcuts = (shortcuts: ShortcutConfig[]) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      shortcuts.forEach((shortcut) => {
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          event.preventDefault();
          shortcut.action();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
};

// Common shortcuts
export const SHORTCUTS = {
  GENERATE: { key: 'g', ctrl: true, description: 'Generate captions' },
  COPY: { key: 'c', ctrl: true, shift: true, description: 'Copy caption' },
  SAVE: { key: 's', ctrl: true, description: 'Save caption' },
  EXPORT: { key: 'e', ctrl: true, description: 'Export captions' },
  SEARCH: { key: 'k', ctrl: true, description: 'Search' },
  NEW: { key: 'n', ctrl: true, description: 'New caption' },
};
