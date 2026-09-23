import React from 'react';
import { useSettings } from '../context/SettingsContext';
import { translations } from '../utils/translations';
import { bgKiller, bgSurvivor } from '../utils/rarityConfig';
import './CharacterSelector.css';

export default function CharacterSelector({ role, characters, selectedChar, onSelect, onClose }) {
  const { language } = useSettings();
  const t = translations[language] || translations.pt;
  const isKiller = role === 'killer';
  const charBg = isKiller ? bgKiller : bgSurvivor;

  return (
    <div className="char-modal-overlay" onClick={onClose}>
      <div className="char-modal" onClick={e => e.stopPropagation()}>
        <div className="char-modal__header">
          <div>
            <h2 className="char-selector__title">
              {isKiller ? t.chooseKiller : t.chooseSurvivor}
            </h2>
            <p className="char-selector__subtitle">
              {t.selectToPin} <strong>{t.random} (?)</strong>
            </p>
          </div>
          <button className="char-modal__close-btn" onClick={onClose} title={t.closeModal}>✕</button>
        </div>

        <div className="char-selector__grid">
          {/* Aleatório Option (?) */}
          <button
            className={`char-selector__item ${isKiller ? 'char-selector__item--killer' : 'char-selector__item--survivor'} ${!selectedChar ? 'char-selector__item--active' : ''}`}
            onClick={() => onSelect(null)}
            id="btn-char-random"
          >
            <div
              className="char-selector__img-wrap"
              style={{
                backgroundImage: `url(${charBg})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: '2.2rem', fontWeight: 'bold', color: '#f0e6d3' }}>?</span>
            </div>
            <span className="char-selector__name">{t.random}</span>
          </button>

          {/* List of Characters */}
          {characters.map(char => {
            const isSelected = selectedChar && selectedChar.id === char.id;
            return (
              <button
                key={char.id}
                className={`char-selector__item ${isKiller ? 'char-selector__item--killer' : 'char-selector__item--survivor'} ${isSelected ? 'char-selector__item--active' : ''}`}
                onClick={() => onSelect(char)}
                id={`btn-char-${char.id}`}
              >
                <div
                  className="char-selector__img-wrap"
                  style={{
                    backgroundImage: `url(${charBg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {char.image ? (
                    <img src={char.image} alt={char.name} className="char-selector__img" />
                  ) : (
                    <div className="char-selector__placeholder">
                      <span>{char.name.charAt(0)}</span>
                    </div>
                  )}
                </div>
                <span className="char-selector__name">{char.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

