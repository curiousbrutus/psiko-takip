export const getXpToNextLevel = (level: number): number => {
  // A simple formula for increasing XP requirements per level
  return 100 + (level - 1) * 50;
};

export const getCompanionVisual = (
  companion: { type: 'plant' | 'animal' },
  level: number
): string => {
  if (companion.type === 'plant') {
    if (level >= 10) return '🌸'; // Flowering Plant
    if (level >= 5) return '🌳'; // Tree
    return '🌱'; // Sprout
  }
  if (companion.type === 'animal') {
    if (level >= 10) return '🦊'; // Fox
    if (level >= 5) return '🐾'; // Hatched
    return '🥚'; // Egg
  }
  return '❓';
};
