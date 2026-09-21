import React, { useState } from 'react';
import { bgKiller, bgSurvivor, killerIcon, survivorIcon } from '../utils/rarityConfig';
import './RollHistory.css';

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (diff < 60)       return 'Agora mesmo';
  if (diff < 3600)     return `${Math.floor(diff / 60)}min atrás`;
  if (diff < 86400)    return `${Math.floor(diff / 3600)}h atrás`;
  return               `${Math.floor(diff / 86400)}d atrás`;
}

export default function RollHistory({ history, onClear }) {
  const MAX_VISIBLE = 5;
  const hasHistory = history && history.length > 0;
  const visible = history ? history.slice(0, MAX_VISIBLE) : [];

  return (
    <section className="roll-history" aria-label="Histórico de roletagens">
      <div className="roll-history__header">
        <h3 className="roll-history__title">

          Histórico
        </h3>
        {hasHistory && (
          <button
            className="roll-history__clear-btn"
            onClick={onClear}
            id="btn-history-clear"
            title="Limpar histórico"
          >
            ✕ Limpar
          </button>
        )}
      </div>

      {!hasHistory ? (
        <div className="roll-history__empty">
          <p>Nenhuma roletagem recente</p>
          <span className="roll-history__empty-hint">Suas últimas roletagens aparecerão aqui.</span>
        </div>
      ) : (
        <ul className="roll-history__list">
          {visible.map((entry, i) => {
            const isKiller = entry.role === 'killer';
            const charBg = isKiller ? bgKiller : bgSurvivor;

            return (
              <li
                key={entry.id}
                className={`roll-history__item roll-history__item--${entry.role}`}
                style={{ animationDelay: `${i * 0.04}s` }}
              >
                {/* Avatar (Square icon box with bgKiller / bgSurvivor, no rounding) */}
                <div
                  className="roll-history__avatar"
                  style={{
                    backgroundImage: `url(${charBg})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                  }}
                >
                  {entry.character.image
                    ? <img src={entry.character.image} alt={entry.character.name} className="roll-history__avatar-img" />
                    : <span className="roll-history__avatar-placeholder">{entry.character.name.charAt(0)}</span>
                  }
                  <span className="roll-history__role-badge">
                    <img src={isKiller ? killerIcon : survivorIcon} alt={entry.role} className="history-badge-icon" />
                  </span>
                </div>

                {/* Info */}
                <div className="roll-history__info">
                  <div className="roll-history__name-row">
                    <span className="roll-history__char-name">{entry.character.name}</span>
                    <span className="roll-history__time">{timeAgo(entry.timestamp)}</span>
                  </div>
                  {/* Perk mini-icons */}
                  {entry.perks.length > 0 && (
                    <div className="roll-history__perks">
                      {entry.perks.map((perk, pi) => (
                        perk.image
                          ? <img
                              key={pi}
                              src={perk.image}
                              alt={perk.name}
                              className="roll-history__perk-icon"
                              title={perk.name}
                            />
                          : <span key={pi} className="roll-history__perk-dot" title={perk.name} />
                      ))}
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

