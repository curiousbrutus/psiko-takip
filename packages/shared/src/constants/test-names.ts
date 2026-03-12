export const TEST_NAMES = {
  BECK_DEPRESSION_INVENTORY: 'beck-depression-inventory',
  BURNOUT_INVENTORY: 'burnout-inventory',
  GAD_7: 'gad-7',
  PHQ_9: 'phq-9',
} as const;

export type TestNameValue = (typeof TEST_NAMES)[keyof typeof TEST_NAMES];
