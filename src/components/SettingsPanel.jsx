import React, { useState, useEffect, useCallback } from 'react';
import { useSettings } from '../context/SettingsContext';
import { killerIcon, survivorIcon, bgKiller, bgSurvivor, bgPerk } from '../utils/rarityConfig';
import killers from '../data/killers.json';
import survivors from '../data/survivors.json';
import perks from '../data/perks.json';
import './SettingsPanel.css';

const TABS = ['Killers', 'Survivors', 'Perks'];
const PERK_FILTERS = ['Todos', 'Killer', 'Survivor'];

export default function SettingsPanel({ onClose, initialTab = 'Killers' }) {
  const {
    disabledKillers, disabledSurvivors, disabledPerks,
    toggleKiller, toggleSurvivor, togglePerk,
    setAllKillers, setAllSurvivors, setAllPerks,
  } = useSettings();

  const [activeTab, setActiveTab]       = useState(initialTab);
  const [perkFilter, setPerkFilter]     = useState('Todos');
  const [searchQuery, setSearchQuery]   = useState('');

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // Filtered perk list
  const filteredPerks = perks
    .filter(p => {
      if (perkFilter === 'Killer')   return p.role === 'killer';
      if (perkFilter === 'Survivor') return p.role === 'survivor';
      return true;
    })
    .filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const filteredKillers   = killers.filter(k => !searchQuery || k.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredSurvivors = survivors.filter(s => !searchQuery || s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // Active counts
  const activeKillers       = killers.length   - disabledKillers.size;
  const activeSurvivors     = survivors.length - disabledSurvivors.size;
  const activePerks         = perks.length     - disabledPerks.size;

  // Per-role perk counts (for the minimum-4 warning)
  const killerPerkTotal   = perks.filter(p => p.role === 'killer').length;
  const survivorPerkTotal = perks.filter(p => p.role === 'survivor').length;
  const killerPerkActive  = perks.filter(p => p.role === 'killer'   && !disabledPerks.has(p.id)).length;
  const survivorPerkActive = perks.filter(p => p.role === 'survivor' && !disabledPerks.has(p.id)).length;

  const MIN_PERKS = 4;

  // Returns true if toggling this perk would leave its role with < MIN_PERKS enabled
  const wouldViolateMin = (perk) => {
    const isCurrentlyEnabled = !disabledPerks.has(perk.id);
    if (!isCurrentlyEnabled) return false; // re-enabling never violates
    const activeCount = perk.role === 'killer' ? killerPerkActive : survivorPerkActive;
    return activeCount <= MIN_PERKS; // disabling this one would go below minimum
  };


  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchQuery('');
  };

  return (
    <div className="settings-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="settings-panel">

        {/* Header */}
        <div className="settings-panel__header">
          <div className="settings-panel__title-group">

            <h2 className="settings-panel__title">Configurações</h2>
          </div>
          <button className="settings-panel__close" onClick={onClose} id="btn-settings-close">✕</button>
        </div>

        {/* Tabs */}
        <div className="settings-panel__tabs">
          {TABS.map(tab => (
            <button
              key={tab}
              className={`settings-tab ${activeTab === tab ? 'settings-tab--active' : ''}`}
              onClick={() => handleTabChange(tab)}
              id={`btn-settings-tab-${tab.toLowerCase()}`}
            >
              {tab === 'Killers'   && <img src={killerIcon} alt="" className="settings-tab-icon" />}
              {tab === 'Survivors' && <img src={survivorIcon} alt="" className="settings-tab-icon" />}
              {tab === 'Perks'     && <img src={bgPerk} alt="" className="settings-tab-icon settings-tab-icon--perk" />}
              {tab}
              <span className="settings-tab__count">
                {tab === 'Killers'   && `${activeKillers}/${killers.length}`}
                {tab === 'Survivors' && `${activeSurvivors}/${survivors.length}`}
                {tab === 'Perks'     && `${activePerks}/${perks.length}`}
              </span>
            </button>
          ))}
        </div>

        {/* Controls bar */}
        <div className="settings-panel__controls">
          <input
            className="settings-search"
            type="text"
            placeholder="Buscar..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            id="input-settings-search"
          />

          {activeTab === 'Perks' && (
            <div className="settings-perk-filters">
              {PERK_FILTERS.map(f => (
                <button
                  key={f}
                  className={`perk-filter-btn ${perkFilter === f ? 'perk-filter-btn--active' : ''}`}
                  onClick={() => setPerkFilter(f)}
                  id={`btn-perk-filter-${f.toLowerCase()}`}
                >
                  {f}
                </button>
              ))}
            </div>
          )}

          <div className="settings-bulk-actions">
            <button
              className="bulk-btn bulk-btn--enable"
              onClick={() => {
                if (activeTab === 'Killers')   setAllKillers(killers.map(k => k.id), false);
                if (activeTab === 'Survivors') setAllSurvivors(survivors.map(s => s.id), false);
                if (activeTab === 'Perks')     setAllPerks(perks.map(p => p.id), false);
              }}
              id="btn-settings-enable-all"
            >
              ✓ Habilitar Todos
            </button>
            <button
              className="bulk-btn bulk-btn--disable"
              onClick={() => {
                if (activeTab === 'Killers')   setAllKillers(killers.map(k => k.id), true);
                if (activeTab === 'Survivors') setAllSurvivors(survivors.map(s => s.id), true);
                if (activeTab === 'Perks')     setAllPerks(perks.map(p => p.id), true);
              }}
              id="btn-settings-disable-all"
            >
              ✕ Desabilitar Todos
            </button>
          </div>
        </div>

        {/* Grid */}
        <div className="settings-panel__grid-wrap">
          {activeTab === 'Killers' && (
            <div className="settings-grid">
              {filteredKillers.map(killer => {
                const disabled = disabledKillers.has(killer.id);
                return (
                  <button
                    key={killer.id}
                    className={`settings-card settings-card--killer ${disabled ? 'settings-card--disabled' : ''}`}
                    onClick={() => toggleKiller(killer.id)}
                    id={`btn-toggle-killer-${killer.id}`}
                    title={disabled ? `Habilitar ${killer.name}` : `Desabilitar ${killer.name}`}
                  >
                    <div
                      className="settings-card__img-wrap"
                      style={{
                        backgroundImage: `url(${bgKiller})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    >
                      {killer.image
                        ? <img src={killer.image} alt={killer.name} className="settings-card__img" />
                        : <div className="settings-card__placeholder">{killer.name.charAt(0)}</div>
                      }
                      {disabled && <div className="settings-card__overlay">✕</div>}
                    </div>
                    <span className="settings-card__name">{killer.name}</span>
                  </button>
                );
              })}
            </div>
          )}

          {activeTab === 'Survivors' && (
            <div className="settings-grid">
              {filteredSurvivors.map(survivor => {
                const disabled = disabledSurvivors.has(survivor.id);
                return (
                  <button
                    key={survivor.id}
                    className={`settings-card settings-card--survivor ${disabled ? 'settings-card--disabled' : ''}`}
                    onClick={() => toggleSurvivor(survivor.id)}
                    id={`btn-toggle-survivor-${survivor.id}`}
                    title={disabled ? `Habilitar ${survivor.name}` : `Desabilitar ${survivor.name}`}
                  >
                    <div
                      className="settings-card__img-wrap"
                      style={{
                        backgroundImage: `url(${bgSurvivor})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                      }}
                    >
                      {survivor.image
                        ? <img src={survivor.image} alt={survivor.name} className="settings-card__img" />
                        : <div className="settings-card__placeholder">{survivor.name.charAt(0)}</div>
                      }
                      {disabled && <div className="settings-card__overlay">✕</div>}
                    </div>
                    <span className="settings-card__name">{survivor.name}</span>
                  </button>
                );
              })}
            </div>
          )}

          {activeTab === 'Perks' && (
            <>
              {/* ── Perk minimum status bar ─────────────────────────── */}
              <div className="perk-status-bar">
                <div className={`perk-status-item ${
                  killerPerkActive < MIN_PERKS ? 'perk-status-item--danger' :
                  killerPerkActive === MIN_PERKS ? 'perk-status-item--warn' : ''
                }`}>
                  <span>Killer perks</span>
                  <strong>{killerPerkActive}/{killerPerkTotal}</strong>
                  {killerPerkActive < MIN_PERKS && (
                    <span className="perk-status-alert">mín. 4</span>
                  )}
                </div>
                <div className={`perk-status-item ${
                  survivorPerkActive < MIN_PERKS ? 'perk-status-item--danger' :
                  survivorPerkActive === MIN_PERKS ? 'perk-status-item--warn' : ''
                }`}>
                  <span>Survivor perks</span>
                  <strong>{survivorPerkActive}/{survivorPerkTotal}</strong>
                  {survivorPerkActive < MIN_PERKS && (
                    <span className="perk-status-alert">mín. 4</span>
                  )}
                </div>
              </div>

              <div className="settings-grid settings-grid--perks">
                {filteredPerks.map(perk => {
                  const disabled = disabledPerks.has(perk.id);
                  const blocked  = wouldViolateMin(perk); // can't disable this one
                  return (
                    <button
                      key={perk.id}
                      className={[
                        'settings-card settings-card--perk',
                        disabled  ? 'settings-card--disabled' : '',
                        blocked   ? 'settings-card--blocked'  : '',
                      ].join(' ')}
                      onClick={() => {
                        if (blocked) return; // silently block
                        togglePerk(perk.id);
                      }}
                      id={`btn-toggle-perk-${perk.id}`}
                      title={
                        blocked  ? `Mínimo de ${MIN_PERKS} perks de ${perk.role} ativo` :
                        disabled ? `Habilitar ${perk.name}` :
                                   `Desabilitar ${perk.name}`
                      }
                    >
                      <div className="settings-card__img-wrap settings-card__img-wrap--perk">
                        {perk.image
                          ? <img src={perk.image} alt={perk.name} className="settings-card__img" />
                          : <div className="settings-card__placeholder">{perk.name.charAt(0)}</div>
                        }
                        {disabled  && <div className="settings-card__overlay">✕</div>}
                        {blocked   && <div className="settings-card__overlay settings-card__overlay--lock">Bloq.</div>}
                      </div>
                      <span className="settings-card__name">{perk.name}</span>
                      {perk.owner && <span className="settings-card__owner">{perk.owner}</span>}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  );
}
