import {
  retryWithBackoff,
  safeAsync,
  logError,
  createUserFriendlyError,
} from '@/lib/error-handling';

describe('Error Handling Utilities', () => {
  describe('safeAsync', () => {
    it('should return result when function succeeds', async () => {
      const successFn = async () => 'success';
      const result = await safeAsync(successFn);
      expect(result).toBe('success');
    });

    it('should return null when function fails', async () => {
      const failFn = async () => {
        throw new Error('test error');
      };
      const result = await safeAsync(failFn);
      expect(result).toBeNull();
    });

    it('should return fallback when provided', async () => {
      const failFn = async () => {
        throw new Error('test error');
      };
      const result = await safeAsync(failFn, 'fallback');
      expect(result).toBe('fallback');
    });
  });

  describe('createUserFriendlyError', () => {
    it('should return network error message for network errors', () => {
      const networkError = new Error('network timeout');
      const message = createUserFriendlyError(networkError);
      expect(message).toContain('Bağlantı sorunu');
    });

    it('should return auth error message for auth errors', () => {
      const authError = new Error('auth/invalid-credential');
      const message = createUserFriendlyError(authError);
      expect(message).toContain('Kimlik doğrulama');
    });

    it('should return permission error message for permission errors', () => {
      const permissionError = new Error('permission denied');
      const message = createUserFriendlyError(permissionError);
      expect(message).toContain('yetkiniz bulunmuyor');
    });

    it('should return generic error message for unknown errors', () => {
      const unknownError = new Error('something went wrong');
      const message = createUserFriendlyError(unknownError);
      expect(message).toContain('Beklenmeyen bir hata');
    });
  });

  describe('retryWithBackoff', () => {
    it('should succeed on first try', async () => {
      const successFn = jest.fn().mockResolvedValue('success');
      const result = await retryWithBackoff(successFn, 3, 10);

      expect(result).toBe('success');
      expect(successFn).toHaveBeenCalledTimes(1);
    });

    it('should retry and eventually succeed', async () => {
      const fn = jest
        .fn()
        .mockRejectedValueOnce(new Error('fail 1'))
        .mockRejectedValueOnce(new Error('fail 2'))
        .mockResolvedValueOnce('success');

      const result = await retryWithBackoff(fn, 3, 10);

      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should throw after max retries', async () => {
      const failFn = jest.fn().mockRejectedValue(new Error('always fail'));

      await expect(retryWithBackoff(failFn, 2, 10)).rejects.toThrow(
        'always fail'
      );
      expect(failFn).toHaveBeenCalledTimes(3); // initial + 2 retries
    });
  });

  describe('logError', () => {
    const originalConsoleError = console.error;
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
      consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    });

    afterEach(() => {
      console.error = originalConsoleError;
    });

    it('should log error with context', () => {
      const error = new Error('test error');
      logError(error, 'test context');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Application Error:',
        expect.objectContaining({
          context: 'test context',
          error: 'test error',
          timestamp: expect.any(String),
        })
      );
    });

    it('should handle non-Error objects', () => {
      logError('string error', 'test context');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Application Error:',
        expect.objectContaining({
          context: 'test context',
          error: 'Unknown error',
          timestamp: expect.any(String),
        })
      );
    });
  });
});
