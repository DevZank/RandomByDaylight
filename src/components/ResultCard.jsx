import React from 'react';
import SmallCard from './SmallCard';
import { bgKiller, bgSurvivor, killerIcon, survivorIcon } from '../utils/rarityConfig';
import './ResultCard.css';

/**
 * @param {object}   result   - Roll result object
 * @param {function} onReroll - Called when user wants to reroll this card
 * @param {boolean}  compact  - Reduced layout for multi-card display
 * @param {number}   index    - Card index (used for animation delay in multi-mode)
 * @param {string}   language - Language setting ('en' or 'pt')
 */
export default function ResultCard({ result, onReroll, compact = false, index = 0, language = 'pt' }) {
  if (!result) return null;
  const { role, character, perks, addons, item } = result;
  const isKiller = role === 'killer';
  const charBg = isKiller ? bgKiller : bgSurvivor;

  return (
    <div
      className={[
        'result-card',
        isKiller ? 'result-card--killer' : 'result-card--survivor',
        compact ? 'result-card--compact' : '',
      ].join(' ')}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Header: Character */}
      <div className="result-card__header">
        <div
          className="result-card__avatar"
          style={{
            backgroundImage: `url(${charBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {character.image ? (
            <img src={character.image} alt={character.name} className="result-card__avatar-img" />
          ) : (
            <div className="result-card__avatar-placeholder">
              <span>{character.name.charAt(0)}</span>
            </div>
          )}
          <div className="result-card__role-badge">
            <img src={isKiller ? killerIcon : survivorIcon} alt={role} className="role-badge-icon" />
          </div>
        </div>
        <div className="result-card__char-info">
          <p className="result-card__role-label">{isKiller ? 'Killer' : 'Survivor'}</p>
          <h2 className="result-card__char-name">{character.name}</h2>
        </div>
      </div>

      <div className="result-card__divider" />

      {/* Item (Survivor only) */}
      {!isKiller && item && (
        <section className="result-card__section">
          <h3 className="result-card__section-title">Item</h3>
          <SmallCard item={item} showType language={language} />
        </section>
      )}

      {/* Add-ons */}
      {addons && addons.length > 0 && (
        <section className="result-card__section">
          <h3 className="result-card__section-title">
            Add-ons
          </h3>
          <div className="result-card__grid">
            {addons.map((addon, i) => (
              <SmallCard key={i} item={addon} language={language} />
            ))}
          </div>
        </section>
      )}

      {/* Perks */}
      {perks && perks.length > 0 && (
        <section className="result-card__section">
          <h3 className="result-card__section-title">Perks</h3>
          <div className="result-card__grid">
            {perks.map((perk, i) => (
              <SmallCard key={i} item={perk} isPerk language={language} />
            ))}
          </div>
        </section>
      )}

      {/* Reroll: in compact mode each card has its own button */}
      {compact ? (
        <button
          className="result-card__reroll-btn result-card__reroll-btn--individual"
          onClick={onReroll}
          id={`btn-reroll-${index}`}
        >
          <img src="https://img.icons8.com/?size=100&id=4U6yNPWMSZg5&format=png&color=FFFFFF" alt="Re-Roll" className="reroll-btn-icon" />
          Re-Roll
        </button>
      ) : (
        <button className="result-card__reroll-btn" onClick={onReroll} id="btn-reroll">
          <img src="https://img.icons8.com/?size=100&id=4U6yNPWMSZg5&format=png&color=FFFFFF" alt="Re-Roll" className="reroll-btn-icon" />
          Re-Roll
        </button>
      )}
    </div>
  );
}
