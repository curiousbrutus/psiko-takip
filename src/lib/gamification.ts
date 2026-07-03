export type CompanionType = 'plant' | 'animal';

export const getXpToNextLevel = (level: number): number => {
  // A simple formula for increasing XP requirements per level
  return 100 + (level - 1) * 50;
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
