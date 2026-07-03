export type CompanionType = 'plant' | 'animal';

// The backend levels up every 100 XP (level = floor(totalXp / 100) + 1).
// Keep this in sync with GamificationRepository.updateXp on the API side.
export const XP_PER_LEVEL = 100;

export interface LevelProgress {
  level: number;
  xpIntoLevel: number;
  xpForLevel: number;
  progressPct: number;
}

/** Within-level progress derived from cumulative XP, consistent with the API. */
export const getLevelProgress = (
  totalXp: number,
  level?: number
): LevelProgress => {
  const lvl = level ?? Math.floor(totalXp / XP_PER_LEVEL) + 1;
  const xpIntoLevel = Math.max(
    0,
    Math.min(XP_PER_LEVEL, totalXp - (lvl - 1) * XP_PER_LEVEL)
  );
  return {
    level: lvl,
    xpIntoLevel,
    xpForLevel: XP_PER_LEVEL,
    progressPct: (xpIntoLevel / XP_PER_LEVEL) * 100,
  };
};

export const getCompanionVisual = (
  companion: { type: CompanionType },
  level: number
): string => {
  if (companion.type === 'plant') {
    if (level >= 10) return '🌸'; // Flowering
    if (level >= 7) return '🌳'; // Tree
    if (level >= 4) return '🌿'; // Sapling
    return '🌱'; // Sprout
  }
  if (companion.type === 'animal') {
    if (level >= 10) return '🦊'; // Fox
    if (level >= 7) return '🐤'; // Chick
    if (level >= 4) return '🐣'; // Hatching
    return '🥚'; // Egg
  }
  return '❓';
};

export const getCompanionStageName = (
  type: CompanionType,
  level: number
): string => {
  if (type === 'plant') {
    if (level >= 10) return 'Çiçek Açmış';
    if (level >= 7) return 'Ağaç';
    if (level >= 4) return 'Fidan';
    return 'Filiz';
  }
  if (level >= 10) return 'Tilki';
  if (level >= 7) return 'Civciv';
  if (level >= 4) return 'Yavru';
  return 'Yumurta';
};

// The level at which the companion reaches its next growth stage.
export const getNextStageLevel = (level: number): number | null => {
  if (level < 4) return 4;
  if (level < 7) return 7;
  if (level < 10) return 10;
  return null; // fully grown
};

export const getDefaultCompanionName = (type: CompanionType): string =>
  type === 'plant' ? 'Filiz' : 'Töz';
