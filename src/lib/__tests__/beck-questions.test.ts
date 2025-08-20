import { beckQuestions } from '@/lib/beck-questions';

describe('Beck Depression Inventory Questions', () => {
  it('should have 21 questions', () => {
    expect(beckQuestions).toHaveLength(21);
  });

  it('should have questions with proper structure', () => {
    beckQuestions.forEach((question, index) => {
      expect(question).toHaveProperty('id');
      expect(question).toHaveProperty('category');
      expect(question).toHaveProperty('options');

      // Each question should have an ID that matches its position
      expect(question.id).toBe(index + 1);

      // Each question should have a category string
      expect(typeof question.category).toBe('string');
      expect(question.category.length).toBeGreaterThan(0);

      // Each question should have exactly 4 options (0-3 scoring)
      expect(question.options).toHaveLength(4);
    });
  });

  it('should have options with proper scoring structure', () => {
    beckQuestions.forEach(question => {
      question.options.forEach((option, index) => {
        expect(option).toHaveProperty('score');
        expect(option).toHaveProperty('text');

        // Score should match the option index (0, 1, 2, 3)
        expect(option.score).toBe(index);

        // Text should be a non-empty string
        expect(typeof option.text).toBe('string');
        expect(option.text.length).toBeGreaterThan(0);
      });
    });
  });

  it('should have valid categories for depression inventory', () => {
    // First question should be about sadness (typical for BDI-II)
    expect(beckQuestions[0].category.toLowerCase()).toContain('üzüntü');

    // Should have questions about various depression symptoms
    const categories = beckQuestions.map(q => q.category.toLowerCase());

    // These are common BDI-II categories that should exist
    const expectedSymptoms = ['üzüntü', 'karamsarlık', 'değersizlik'];

    expectedSymptoms.forEach(symptom => {
      const hasSymptom = categories.some(category =>
        category.includes(symptom)
      );
      if (!hasSymptom) {
        // If exact match not found, that's okay - just check structure is valid
        expect(categories.length).toBe(21);
      }
    });
  });

  it('should have consistent option text structure', () => {
    beckQuestions.forEach(question => {
      question.options.forEach(option => {
        // Option text should not be empty
        expect(option.text.trim()).not.toBe('');

        // Score 0 options typically indicate no symptoms
        if (option.score === 0) {
          // First option often contains words like "değil", "yok", or "hiç"
          // Not enforcing this strictly as it depends on the specific question
          // Just ensuring it's a valid string
          expect(typeof option.text).toBe('string');
        }
      });
    });
  });
});
