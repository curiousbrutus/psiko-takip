import {
  youngSchemaOptions,
  youngSchemaQuestions,
} from '@/lib/young-schema-questions';

describe('Young Schema Questions', () => {
  it('should have 36 questions', () => {
    expect(youngSchemaQuestions).toHaveLength(36);
  });

  it('should have consistent ids and structure', () => {
    youngSchemaQuestions.forEach((question, index) => {
      expect(question.id).toBe(index + 1);
      expect(typeof question.schema).toBe('string');
      expect(question.schema.length).toBeGreaterThan(0);
      expect(typeof question.statement).toBe('string');
      expect(question.statement.length).toBeGreaterThan(0);
      expect(question.options).toHaveLength(6);
    });
  });

  it('should use 1-6 option scoring', () => {
    youngSchemaOptions.forEach((option, index) => {
      expect(option.score).toBe(index + 1);
      expect(typeof option.text).toBe('string');
      expect(option.text.trim()).not.toBe('');
    });
  });

  it('should contain 18 schema groups with 2 items each', () => {
    const map = new Map<string, number>();

    youngSchemaQuestions.forEach(question => {
      map.set(question.schema, (map.get(question.schema) ?? 0) + 1);
    });

    expect(map.size).toBe(18);
    Array.from(map.values()).forEach(count => {
      expect(count).toBe(2);
    });
  });
});
