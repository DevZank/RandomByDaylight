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
  const [language, setLanguage]                 = useState(() => localStorage.getItem('dbd-language') || 'pt');

  const { disabledKillers, disabledSurvivors, disabledPerks, theme, toggleTheme } = useSettings();
  const { history, addEntry, clearHistory } = useRollHistory();

  useEffect(() => {
    localStorage.setItem('dbd-language', language);
  }, [language]);

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
              className="lang-toggle-btn"
              onClick={() => setLanguage(l => l === 'en' ? 'pt' : 'en')}
              title={language === 'en' ? 'Mudar para Português' : 'Switch to English'}
              aria-label="Alternar Idioma"
            >
              {language.toUpperCase()}
            </button>
            <button
              className="theme-toggle-btn"
              onClick={toggleTheme}
              id="btn-toggle-theme"
              title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
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
              title="Abrir Menu de Configurações"
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
                  title="Escolher Assassino fixo ou Aleatório (?)"
                >
                  {selectedKiller ? (
                    <div
                      className="selection-card__square-portrait"
                      style={{ backgroundImage: `url(${bgKiller})` }}
                    >
                      <img src={selectedKiller.image} alt={selectedKiller.name} className="selection-card__portrait-img" />
                      <span className="selection-card__badge" title={`Fixado: ${selectedKiller.name}`}>Fixo</span>
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
                    <span className="selection-card__label desktop-text">KILLER</span>
                    <span className="selection-card__label mobile-text">SORTEAR KILLER</span>
                    <span className="selection-card__sublabel desktop-text">
                      {selectedKiller ? `Fixado: ${selectedKiller.name}` : 'Randomizar assassino'}
                    </span>
                    <span className="selection-card__sublabel mobile-text">
                      {selectedKiller ? `Fixado: ${selectedKiller.name}` : 'Aleatório'}
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
                title="Desabilitar / Habilitar Killers e Perks"
              >
                Desabilitar Killers / Perks
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
                  title="Escolher Sobrevivente fixo ou Aleatório (?)"
                >
                  {selectedSurvivor ? (
                    <div
                      className="selection-card__square-portrait"
                      style={{ backgroundImage: `url(${bgSurvivor})` }}
                    >
                      <img src={selectedSurvivor.image} alt={selectedSurvivor.name} className="selection-card__portrait-img" />
                      <span className="selection-card__badge" title={`Fixado: ${selectedSurvivor.name}`}>Fixo</span>
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
                    <span className="selection-card__label desktop-text">SURVIVOR</span>
                    <span className="selection-card__label mobile-text">SORTEAR SURV</span>
                    <span className="selection-card__sublabel desktop-text">
                      {selectedSurvivor ? `Fixado: ${selectedSurvivor.name}` : 'Randomizar sobrevivente'}
                    </span>
                    <span className="selection-card__sublabel mobile-text">
                      {selectedSurvivor ? `Fixado: ${selectedSurvivor.name}` : 'Aleatório'}
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
                title="Desabilitar / Habilitar Sobreviventes e Perks"
              >
                Desabilitar Survivors / Perks
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

