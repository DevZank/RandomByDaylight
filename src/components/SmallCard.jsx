import React from 'react';
import RARITY_CONFIG, { PERK_BG } from '../utils/rarityConfig';
import { translations } from '../utils/translations';
import './SmallCard.css';

export default function SmallCard({ item, showType = false, language = 'pt' }) {
  if (!item) return null;
  const rarity = item.rarity ? RARITY_CONFIG[item.rarity] : null;
  const t = translations[language];

  // Background: perks use a universal bg; addons use rarity-specific bg
  const isPerk  = Boolean(item.role);
  const imgBg   = isPerk ? PERK_BG : (rarity?.addonBg ?? null);

  return (
    <div
      className="small-card"
      style={{
        '--rarity-color': rarity ? rarity.color : '#8a7f74',
        '--rarity-glow':  rarity ? rarity.glow  : 'rgba(138, 127, 116, 0.25)',
      }}
    >
      <div
        className={`small-card__image-wrap${isPerk ? ' small-card__image-wrap--perk' : ''}`}
        style={imgBg ? {
          backgroundImage: `url(${imgBg})`,
          backgroundSize:  'cover',
          backgroundPosition: 'center',
        } : undefined}
      >
        {item.image ? (
          <img src={item.image} alt={item.name} className="small-card__img" />
        ) : (
          <div className="small-card__placeholder">
            <span>{item.name.charAt(0)}</span>
          </div>
        )}
      </div>
      <div className="small-card__info">
        <h4 
          className="small-card__name" 
          title={language === 'es' && item.name_es ? item.name_es : (language === 'pt' && item.name_pt ? item.name_pt : item.name)}
        >
          {language === 'es' && item.name_es ? item.name_es : (language === 'pt' && item.name_pt ? item.name_pt : item.name)}
        </h4>
        {showType && item.type && (
          <p className="small-card__type">{item.type}</p>
        )}
        {item.owner && (
          <p className="small-card__owner">{item.owner}</p>
        )}
        {rarity && (
          <span className="small-card__rarity">{t.rarity[item.rarity] || rarity.label}</span>
        )}
      </div>
    </div>
  );
}

