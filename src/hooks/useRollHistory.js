import { useState, useCallback, useRef } from 'react';

const LS_KEY      = 'dbd-roll-history';
const MAX_ENTRIES = 5;

function loadHistory() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(entries) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(entries));
  } catch { /* quota or private mode */ }
}

/**
 * Manages the last MAX_ENTRIES randomization results.
 * Each entry: { id, role, character: { name, image }, perks: [{name,image}], timestamp }
 */
export function useRollHistory() {
  const [history, setHistory] = useState(() => loadHistory());
  const histRef = useRef(history);

  const addEntry = useCallback((result) => {
    const entry = {
      ...result,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: Date.now(),
    };

    const next = [entry, ...histRef.current].slice(0, MAX_ENTRIES);
    histRef.current = next;
    setHistory(next);
    saveHistory(next);
  }, []);

  const clearHistory = useCallback(() => {
    histRef.current = [];
    setHistory([]);
    saveHistory([]);
  }, []);

  return { history, addEntry, clearHistory };
}
