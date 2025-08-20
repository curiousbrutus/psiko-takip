import { cn } from '@/lib/utils';

describe('utils', () => {
  describe('cn function', () => {
    it('should merge class names correctly', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2');
    });

    it('should handle conditional classes', () => {
      expect(cn('base', true && 'conditional', false && 'ignored')).toBe(
        'base conditional'
      );
    });

    it('should handle undefined and null values', () => {
      expect(cn('base', undefined, null, 'valid')).toBe('base valid');
    });

    it('should merge tailwind classes with conflicts', () => {
      // This tests tailwind-merge functionality
      expect(cn('p-4', 'p-2')).toBe('p-2');
    });

    it('should handle empty input', () => {
      expect(cn()).toBe('');
    });

    it('should handle array inputs', () => {
      expect(cn(['class1', 'class2'])).toBe('class1 class2');
    });
  });
});
