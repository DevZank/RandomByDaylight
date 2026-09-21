import React, { createContext, useContext, useState, useRef, useCallback, useEffect } from 'react';

// ── localStorage helpers ─────────────────────────────────────────────────────

const LS_KEY = 'dbd-randomizer-settings';
const LS_THEME_KEY = 'dbd-randomizer-theme';

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return {
      disabledKillers:   new Set(parsed.disabledKillers   ?? []),
      disabledSurvivors: new Set(parsed.disabledSurvivors ?? []),
      disabledPerks:     new Set(parsed.disabledPerks     ?? []),
    };
  } catch {
    return {};
  }
}

function getInitialTheme() {
  try {
    const saved = localStorage.getItem(LS_THEME_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {}
  return 'dark';
}

// ── Context ───────────────────────────────────────────────────────────────────

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const stored = loadFromStorage();

  const [disabledKillers,   setDisabledKillers]   = useState(() => stored.disabledKillers   ?? new Set());
  const [disabledSurvivors, setDisabledSurvivors] = useState(() => stored.disabledSurvivors ?? new Set());
  const [disabledPerks,     setDisabledPerks]     = useState(() => stored.disabledPerks     ?? new Set());
  const [theme,             setTheme]             = useState(getInitialTheme);

  // Sync theme data attribute on html element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem(LS_THEME_KEY, theme);
    } catch {}
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  // Refs so persist callback always has the latest values without stale closures
  const killersRef   = useRef(disabledKillers);
  const survivorsRef = useRef(disabledSurvivors);
  const perksRef     = useRef(disabledPerks);

  const persist = useCallback(() => {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify({
        disabledKillers:   [...killersRef.current],
        disabledSurvivors: [...survivorsRef.current],
        disabledPerks:     [...perksRef.current],
      }));
    } catch { /* storage full or private mode */ }
  }, []);

  // ── Toggle helpers ──────────────────────────────────────────────────────────

  const toggleKiller = useCallback((id) => {
    setDisabledKillers(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      killersRef.current = next;
      persist();
      return next;
    });
  }, [persist]);

  const toggleSurvivor = useCallback((id) => {
    setDisabledSurvivors(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      survivorsRef.current = next;
      persist();
      return next;
    });
  }, [persist]);

  const togglePerk = useCallback((id) => {
    setDisabledPerks(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      perksRef.current = next;
      persist();
      return next;
    });
  }, [persist]);

  // ── Bulk actions ────────────────────────────────────────────────────────────

  const setAllKillers = useCallback((ids, disabled) => {
    const next = disabled ? new Set(ids) : new Set();
    killersRef.current = next;
    setDisabledKillers(next);
    persist();
  }, [persist]);

  const setAllSurvivors = useCallback((ids, disabled) => {
    const next = disabled ? new Set(ids) : new Set();
    survivorsRef.current = next;
    setDisabledSurvivors(next);
    persist();
  }, [persist]);

  const setAllPerks = useCallback((ids, disabled) => {
    const next = disabled ? new Set(ids) : new Set();
    perksRef.current = next;
    setDisabledPerks(next);
    persist();
  }, [persist]);

  return (
    <SettingsContext.Provider value={{
      disabledKillers,
      disabledSurvivors,
      disabledPerks,
      theme,
      toggleTheme,
      toggleKiller,
      toggleSurvivor,
      togglePerk,
      setAllKillers,
      setAllSurvivors,
      setAllPerks,
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used inside <SettingsProvider>');
  return ctx;
}

