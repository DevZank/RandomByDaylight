// Addon background images — imported so Vite handles hashing & bundling
import bgCommon     from '../assets/backgrounds/addons/common.png';
import bgUncommon   from '../assets/backgrounds/addons/uncommon.png';
import bgRare       from '../assets/backgrounds/addons/rare.png';
import bgVeryRare   from '../assets/backgrounds/addons/very-rare.png';
import bgIridescent from '../assets/backgrounds/addons/irisdecent.png';

// Perk background image — single universal background
import bgPerk from '../assets/backgrounds/perks/background-perk.png';

// Character background images — Killer (red) and Survivor (blue)
import bgKiller   from '../assets/backgrounds/killers/background-killers.png';
import bgSurvivor from '../assets/backgrounds/survs/background-survs.png';

// Role Icons
import killerIcon   from '../assets/Killer-Icon.png';
import survivorIcon from '../assets/Survivor-Icon.png';

export { bgPerk, bgKiller, bgSurvivor, killerIcon, survivorIcon };

const RARITY_CONFIG = {
  common:      { label: 'Common',     color: '#b0b0b0', glow: 'rgba(176,176,176,0.4)', addonBg: bgCommon     },
  uncommon:    { label: 'Uncommon',   color: '#5dc95d', glow: 'rgba(93,201,93,0.4)',   addonBg: bgUncommon   },
  rare:        { label: 'Rare',       color: '#4a9eff', glow: 'rgba(74,158,255,0.4)',  addonBg: bgRare       },
  very_rare:   { label: 'Very Rare',  color: '#c86bff', glow: 'rgba(200,107,255,0.4)', addonBg: bgVeryRare   },
  ultra_rare:  { label: 'Ultra Rare', color: '#ff6b35', glow: 'rgba(255,107,53,0.5)',  addonBg: bgVeryRare   },
  iridescent:  { label: 'Iridescent', color: '#ff4d4d', glow: 'rgba(255,77,77,0.5)',   addonBg: bgIridescent },
  irisdecent:  { label: 'Iridescent', color: '#ff4d4d', glow: 'rgba(255,77,77,0.5)',   addonBg: bgIridescent },
};

/** Universal perk background (no rarity variation) */
export const PERK_BG = bgPerk;

export default RARITY_CONFIG;

