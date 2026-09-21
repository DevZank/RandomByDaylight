import killerData   from '../data/killers.json';
import survivorData  from '../data/survivors.json';
import perksData     from '../data/perks.json';
import items         from '../data/items.json';

// Export raw data for use in App.jsx and SettingsPanel
export const killers   = killerData;
export const survivors = survivorData;
export const perks     = perksData;

// ── Fisher-Yates shuffle (uniform distribution) ────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function getRandom(arr, count = 1) {
  if (!arr || arr.length === 0) return count === 1 ? undefined : [];
  const shuffled = shuffle(arr);
  return count === 1 ? shuffled[0] : shuffled.slice(0, count);
}

// ── Anti-repeat history (per role) ────────────────────────────────────────
const HISTORY_SIZE = 15;

const history = {
  killer:   [],
  survivor: [],
};

function getRandomCharacter(pool, role) {
  const hist = history[role];

  let available = pool.filter(c => !hist.includes(c.name));
  if (available.length === 0) {
    available = pool.filter(c => c.name !== hist[hist.length - 1]);
  }
  if (available.length === 0) available = pool;

  const picked = getRandom(available);

  hist.push(picked.name);
  if (hist.length > HISTORY_SIZE) hist.shift();

  return picked;
}

// ── Public API ─────────────────────────────────────────────────────────────
// Accepts pre-filtered pools directly from the caller (App.jsx filters via context).
// This avoids any context/Set passing issues.

/**
 * @param {object|null}  selectedKiller  - Pre-selected killer (or null for random)
 * @param {object[]}     killerPool      - Enabled killers to pick from
 * @param {object[]}     perkPool        - Enabled perks to pick from
 */
export function randomizeKiller(selectedKiller, killerPool, perkPool) {
  // Return null if no killers are available (caller shows error)
  if (!selectedKiller && (!killerPool || killerPool.length === 0)) return null;

  const killer = selectedKiller ?? getRandomCharacter(killerPool, 'killer');

  // Need at least 4 perks; fall back to all killer perks if pool is too small
  const allKillerPerks = perksData.filter(p => p.role === 'killer');
  const resolvedPerks  = (perkPool && perkPool.length >= 4) ? perkPool : allKillerPerks;
  const killerPerks    = getRandom(resolvedPerks, 4);

  const killerAddons = getRandom(killer.addons, Math.min(2, killer.addons.length));

  return {
    role: 'killer',
    character: killer,
    addons: killerAddons,
    perks: killerPerks,
    item: null,
  };
}

/**
 * @param {object|null}  selectedSurvivor - Pre-selected survivor (or null for random)
 * @param {object[]}     survivorPool     - Enabled survivors to pick from
 * @param {object[]}     perkPool         - Enabled perks to pick from
 */
export function randomizeSurvivor(selectedSurvivor, survivorPool, perkPool) {
  // Return null if no survivors are available (caller shows error)
  if (!selectedSurvivor && (!survivorPool || survivorPool.length === 0)) return null;

  const survivor = selectedSurvivor ?? getRandomCharacter(survivorPool, 'survivor');

  // Need at least 4 perks; fall back to all survivor perks if pool is too small
  const allSurvivorPerks = perksData.filter(p => p.role === 'survivor');
  const resolvedPerks    = (perkPool && perkPool.length >= 4) ? perkPool : allSurvivorPerks;
  const survivorPerks    = getRandom(resolvedPerks, 4);

  const item       = getRandom(items);
  const itemAddons = item?.addons?.length > 0
    ? getRandom(item.addons, Math.min(2, item.addons.length))
    : [];

  return {
    role: 'survivor',
    character: survivor,
    addons: itemAddons,
    perks: survivorPerks,
    item,
  };
}
