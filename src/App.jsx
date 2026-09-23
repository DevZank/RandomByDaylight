import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  randomizeKiller,
  randomizeSurvivor,
  killers,
  survivors,
  perks,
} from './hooks/useRandomizer';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { useRollHistory } from './hooks/useRollHistory';
import { bgKiller, bgSurvivor, killerIcon, survivorIcon } from './utils/rarityConfig';
import CharacterSelector from './components/CharacterSelector';
import ResultCard from './components/ResultCard';
import SettingsPanel from './components/SettingsPanel';
import RollHistory from './components/RollHistory';
import { translations } from './utils/translations';
import './App.css';

function AppInner() {
  const [selectedKiller, setSelectedKiller]     = useState(null);   // null = random (?), or specific killer object
  const [selectedSurvivor, setSelectedSurvivor] = useState(null); // null = random (?), or specific survivor object
  const [activeRole, setActiveRole]             = useState('killer'); // 'killer' | 'survivor'
  const [result, setResult]                     = useState(null);
  const [settingsOpen, setSettingsOpen]         = useState(false);
  const [settingsTab, setSettingsTab]           = useState('Killers');
  const [charModalRole, setCharModalRole]       = useState(null);   // null | 'killer' | 'survivor'
  const [hasInteracted, setHasInteracted]       = useState(false);

  const { disabledKillers, disabledSurvivors, disabledPerks, theme, toggleTheme, language, toggleLanguage } = useSettings();
  const { history, addEntry, clearHistory } = useRollHistory();
  const t = translations[language];

  const openSettings = (tab = 'Killers') => {
    setSettingsTab(tab);
    setSettingsOpen(true);
  };

  // Active pools based on disabled settings
  const activeKillers   = useMemo(() => killers.filter(k => !disabledKillers.has(k.id)),   [disabledKillers]);
  const activeSurvivors = useMemo(() => survivors.filter(s => !disabledSurvivors.has(s.id)), [disabledSurvivors]);

  const activeKillerPerks   = useMemo(() => perks.filter(p => p.role === 'killer'   && !disabledPerks.has(p.id)), [disabledPerks]);
  const activeSurvivorPerks = useMemo(() => perks.filter(p => p.role === 'survivor' && !disabledPerks.has(p.id)), [disabledPerks]);

  // Roll handlers
  const handleRollKiller = useCallback(() => {
    setHasInteracted(true);
    const res = randomizeKiller(selectedKiller, activeKillers, activeKillerPerks);
    if (!res) return;
    setActiveRole('killer');
    setResult(res);
    addEntry(res);
  }, [selectedKiller, activeKillers, activeKillerPerks, addEntry]);

  const handleRollSurvivor = useCallback(() => {
    setHasInteracted(true);
    const res = randomizeSurvivor(selectedSurvivor, activeSurvivors, activeSurvivorPerks);
    if (!res) return;
    setActiveRole('survivor');
    setResult(res);
    addEntry(res);
  }, [selectedSurvivor, activeSurvivors, activeSurvivorPerks, addEntry]);

  const handleReroll = useCallback(() => {
    if (activeRole === 'killer') {
      handleRollKiller();
    } else {
      handleRollSurvivor();
    }
  }, [activeRole, handleRollKiller, handleRollSurvivor]);

  const handleRestoreHistoryItem = useCallback((entry) => {
    setResult(entry);
    setActiveRole(entry.role);
    setHasInteracted(true);
  }, []);

  // Perform initial default roll on mount if no result exists yet
  useEffect(() => {
    if (!result && activeKillers.length > 0 && activeKillerPerks.length >= 4) {
      const initialRes = randomizeKiller(null, activeKillers, activeKillerPerks);
      if (initialRes) {
        setResult(initialRes);
      }
    }
  }, []);

  const handleSelectCharacter = (char) => {
    if (charModalRole === 'killer') {
      setSelectedKiller(char);
    } else if (charModalRole === 'survivor') {
      setSelectedSurvivor(char);
    }
    setCharModalRole(null);
  };

  return (
    <div className="app">
      {/* Background Blobs */}
      <div className="app__bg">
        <div className="app__blob app__blob--1" />
        <div className="app__blob app__blob--2" />
        <div className="app__blob app__blob--3" />
      </div>

      <div className="app__content">
        {/* Header Bar */}
        <header className="app__header">
          <div className="app__logo">
            <img src="/LogoMark.png" alt="RamdomByDaylight" className="app__logo-img" />
          </div>
          <div className="app__header-actions">
            <button
              className={`lang-toggle-btn lang-${language}`}
              onClick={toggleLanguage}
              title={t.switchLanguage}
              aria-label="Alternar Idioma"
            >
              <div className="lang-toggle-thumb">
                <img 
                  src={language === 'en' 
                    ? "https://thumb.wikimedia.org/wikipedia/commons/thumb/8/83/Flag_of_the_United_Kingdom_%283-5%29.svg/3840px-Flag_of_the_United_Kingdom_%283-5%29.svg.png" 
                    : language === 'pt'
                      ? "https://thumb.wikimedia.org/wikipedia/commons/thumb/0/05/Flag_of_Brazil.svg/3840px-Flag_of_Brazil.svg.png"
                      : "https://upload.wikimedia.org/wikipedia/commons/9/9a/Flag_of_Spain.svg"
                  } 
                  alt={language.toUpperCase()} 
                  className="lang-flag-img" 
                />
              </div>
            </button>
            <button
              className="theme-toggle-btn"
              onClick={toggleTheme}
              id="btn-toggle-theme"
              title={theme === 'dark' ? t.toggleThemeLight : t.toggleThemeDark}
              aria-label="Alternar Tema"
            >
              <img
                src={theme === 'dark'
                  ? 'https://img.icons8.com/?size=100&id=GIywaBFJCJiI&format=png&color=FFFFFF'
                  : 'https://img.icons8.com/?size=100&id=54382&format=png&color=000000'
                }
                alt={theme === 'dark' ? 'Sol' : 'Lua'}
                className="theme-toggle-icon"
              />
            </button>
            <button
              className="hamburger-menu-btn"
              onClick={() => openSettings('Killers')}
              id="btn-open-settings"
              title={t.openSettings}
              aria-label="Menu"
            >
              <span className="hamburger-bar"></span>
              <span className="hamburger-bar"></span>
              <span className="hamburger-bar"></span>
            </button>
          </div>
        </header>

        {/* ── Main Dashboard Layout (3 columns matching wireframe) ── */}
        <main className="dashboard-grid">
          
          {/* ── Left Column: Selection Cards (Killer & Survivor) ── */}
          <section className="dashboard-col dashboard-col--left">
            
            {/* KILLER Card Container */}
            <div className="selection-card-wrap">
              <div className="selection-card selection-card--killer">
                {/* Left '?' button square (clicks open character picker for Killer) */}
                <button
                  className="selection-card__question-btn"
                  onClick={() => setCharModalRole('killer')}
                  id="btn-killer-char-picker"
                  title={t.chooseKillerFix}
                >
                  {selectedKiller ? (
                    <div
                      className="selection-card__square-portrait"
                      style={{ backgroundImage: `url(${bgKiller})` }}
                    >
                      <img src={selectedKiller.image} alt={selectedKiller.name} className="selection-card__portrait-img" />
                      <span className="selection-card__badge" title={`${t.pinned}: ${selectedKiller.name}`}>{t.pinned}</span>
                    </div>
                  ) : (
                    <div className="selection-card__square-portrait" style={{ backgroundImage: `url(${bgKiller})` }}>
                      <span className="selection-card__question-mark">?</span>
                    </div>
                  )}
                  <div className="selection-card__edit-badge">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                    </svg>
                  </div>
                </button>

                {/* Middle text (clicks execute roll for killer) */}
                <button
                  className="selection-card__body-btn"
                  onClick={handleRollKiller}
                  id="btn-roll-killer"
                >
                  <div className="selection-card__text-group">
                    <span className="selection-card__label desktop-text">{t.killer}</span>
                    <span className="selection-card__label mobile-text">{t.rollKillerMobile}</span>
                    <span className="selection-card__sublabel desktop-text">
                      {selectedKiller ? `${t.pinned}: ${selectedKiller.name}` : t.rollKillerDesktop}
                    </span>
                    <span className="selection-card__sublabel mobile-text">
                      {selectedKiller ? `${t.pinned}: ${selectedKiller.name}` : t.random}
                    </span>
                  </div>
                </button>

                {/* Right icon */}
                <div
                  className="selection-card__icon-wrap"
                  onClick={handleRollKiller}
                  title="Randomizar Killer"
                >
                  <img src={killerIcon} alt="Killer Icon" className="selection-card__icon-img" />
                </div>
              </div>

              {/* Direct button to open Settings & disable Killers / Perks */}
              <button
                className="disable-btn disable-btn--killer"
                onClick={() => openSettings('Killers')}
                id="btn-disable-killers"
                title={t.disableKillers}
              >
                {t.disableKillers}
              </button>
            </div>

            {/* SURVIVOR Card Container */}
            <div className="selection-card-wrap">
              <div className="selection-card selection-card--survivor">
                {/* Left '?' button square (clicks open character picker for Surv) */}
                <button
                  className="selection-card__question-btn"
                  onClick={() => setCharModalRole('survivor')}
                  id="btn-survivor-char-picker"
                  title={t.chooseSurvivorFix}
                >
                  {selectedSurvivor ? (
                    <div
                      className="selection-card__square-portrait"
                      style={{ backgroundImage: `url(${bgSurvivor})` }}
                    >
                      <img src={selectedSurvivor.image} alt={selectedSurvivor.name} className="selection-card__portrait-img" />
                      <span className="selection-card__badge" title={`${t.pinned}: ${selectedSurvivor.name}`}>{t.pinned}</span>
                    </div>
                  ) : (
                    <div className="selection-card__square-portrait" style={{ backgroundImage: `url(${bgSurvivor})` }}>
                      <span className="selection-card__question-mark">?</span>
                    </div>
                  )}
                  <div className="selection-card__edit-badge">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
                    </svg>
                  </div>
                </button>

                {/* Middle text (clicks execute roll for survivor) */}
                <button
                  className="selection-card__body-btn"
                  onClick={handleRollSurvivor}
                  id="btn-roll-survivor"
                >
                  <div className="selection-card__text-group">
                    <span className="selection-card__label desktop-text">{t.survivor}</span>
                    <span className="selection-card__label mobile-text">{t.rollSurvivorMobile}</span>
                    <span className="selection-card__sublabel desktop-text">
                      {selectedSurvivor ? `${t.pinned}: ${selectedSurvivor.name}` : t.rollSurvivorDesktop}
                    </span>
                    <span className="selection-card__sublabel mobile-text">
                      {selectedSurvivor ? `${t.pinned}: ${selectedSurvivor.name}` : t.random}
                    </span>
                  </div>
                </button>

                {/* Right icon */}
                <div
                  className="selection-card__icon-wrap"
                  onClick={handleRollSurvivor}
                  title="Randomizar Sobrevivente"
                >
                  <img src={survivorIcon} alt="Survivor Icon" className="selection-card__icon-img" />
                </div>
              </div>

              {/* Direct button to open Settings & disable Survivors / Perks */}
              <button
                className="disable-btn disable-btn--survivor"
                onClick={() => openSettings('Survivors')}
                id="btn-disable-survivors"
                title={t.disableSurvivors}
              >
                {t.disableSurvivors}
              </button>
            </div>

          </section>

          {/* ── Center Column: Result Display Card & Re-roll ── */}
          <section className={`dashboard-col dashboard-col--center ${!hasInteracted ? 'hide-result-mobile' : ''}`}>
            {result && (
              <ResultCard
                key={result.id}
                result={result}
                onReroll={handleReroll}
                language={language}
              />
            )}
          </section>

          {/* ── Right Column: History Sidebar ── */}
          <section className="dashboard-col dashboard-col--right">
            <RollHistory history={history} onClear={clearHistory} onSelectEntry={handleRestoreHistoryItem} />
          </section>

        </main>
      </div>

      {/* ── Character Selection Modal (Triggered by clicking '?') ── */}
      {charModalRole && (
        <CharacterSelector
          role={charModalRole}
          characters={charModalRole === 'killer' ? activeKillers : activeSurvivors}
          selectedChar={charModalRole === 'killer' ? selectedKiller : selectedSurvivor}
          onSelect={handleSelectCharacter}
          onClose={() => setCharModalRole(null)}
        />
      )}

      {/* ── Settings Panel Modal ── */}
      {settingsOpen && (
        <SettingsPanel initialTab={settingsTab} onClose={() => setSettingsOpen(false)} />
      )}
    </div>
  );
}

export default function App() {
  return (
    <SettingsProvider>
      <AppInner />
    </SettingsProvider>
  );
}

