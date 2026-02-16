import { PerformanceMonitor } from '@/lib/performance';

describe('PerformanceMonitor', () => {
  let performanceNowSpy: jest.SpyInstance;
  let currentTime = 0;

  beforeEach(() => {
    PerformanceMonitor.clearMetrics();
    currentTime = 0;
    performanceNowSpy = jest
      .spyOn(performance, 'now')
      .mockImplementation(() => currentTime);
  });

  afterEach(() => {
    performanceNowSpy.mockRestore();
    PerformanceMonitor.clearMetrics();
  });

  describe('startTimer and endTimer', () => {
    it('should record timing metrics correctly', () => {
      PerformanceMonitor.startTimer('test-operation');
      currentTime = 100; // Simulate 100ms elapsed

      const duration = PerformanceMonitor.endTimer('test-operation');

      expect(duration).toBe(100);

      const metrics = PerformanceMonitor.getMetrics();
      expect(metrics).toHaveLength(1);
      expect(metrics[0].name).toBe('test-operation');
      expect(metrics[0].duration).toBe(100);
    });

    it('should handle missing timer gracefully', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const duration = PerformanceMonitor.endTimer('non-existent');

      expect(duration).toBe(0);
      expect(consoleSpy).toHaveBeenCalledWith(
        'No timer found for: non-existent'
      );

      consoleSpy.mockRestore();
    });

    it('should warn about slow operations', () => {
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      PerformanceMonitor.startTimer('slow-operation');
      currentTime = 150; // Simulate 150ms elapsed (> 100ms threshold)

      PerformanceMonitor.endTimer('slow-operation');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Slow operation detected: slow-operation took 150.00ms'
      );

      consoleSpy.mockRestore();
    });
  });

  describe('measure', () => {
    it('should measure synchronous function execution', async () => {
      const syncFn = jest.fn().mockReturnValue('result');

      PerformanceMonitor.startTimer = jest.fn();
      PerformanceMonitor.endTimer = jest.fn();

      const result = await PerformanceMonitor.measure('sync-test', syncFn);

      expect(result).toBe('result');
      expect(PerformanceMonitor.startTimer).toHaveBeenCalledWith('sync-test');
      expect(PerformanceMonitor.endTimer).toHaveBeenCalledWith(
        'sync-test',
        undefined
      );
    });

    it('should measure asynchronous function execution', async () => {
      const asyncFn = jest.fn().mockResolvedValue('async-result');

      PerformanceMonitor.startTimer = jest.fn();
      PerformanceMonitor.endTimer = jest.fn();

      const result = await PerformanceMonitor.measure('async-test', asyncFn);

      expect(result).toBe('async-result');
      expect(PerformanceMonitor.startTimer).toHaveBeenCalledWith('async-test');
      expect(PerformanceMonitor.endTimer).toHaveBeenCalledWith(
        'async-test',
        undefined
      );
    });

    it('should handle errors and still record timing', async () => {
      const errorFn = jest.fn().mockRejectedValue(new Error('test error'));

      PerformanceMonitor.startTimer = jest.fn();
      PerformanceMonitor.endTimer = jest.fn();

      await expect(
        PerformanceMonitor.measure('error-test', errorFn)
      ).rejects.toThrow('test error');

      expect(PerformanceMonitor.startTimer).toHaveBeenCalledWith('error-test');
      expect(PerformanceMonitor.endTimer).toHaveBeenCalledWith('error-test', {
        error: true,
      });
    });
  });

  describe('metrics analysis', () => {
    beforeEach(() => {
      // Clear any existing metrics first
      PerformanceMonitor.clearMetrics();
      currentTime = 0;

      // Add some test metrics
      PerformanceMonitor.startTimer('operation-1');
      currentTime = 50;
      PerformanceMonitor.endTimer('operation-1');

      PerformanceMonitor.startTimer('operation-1');
      currentTime = 100;
      PerformanceMonitor.endTimer('operation-1');

      PerformanceMonitor.startTimer('operation-2');
      currentTime = 150;
      PerformanceMonitor.endTimer('operation-2');
    });

    it('should get metrics for specific operation', () => {
      const operation1Metrics = PerformanceMonitor.getMetricsFor('operation-1');
      expect(operation1Metrics).toHaveLength(2);
      expect(operation1Metrics.every(m => m.name === 'operation-1')).toBe(true);
    });

    it('should calculate average duration correctly', () => {
      const avgDuration = PerformanceMonitor.getAverageDuration('operation-1');
      expect(avgDuration).toBe(75); // (50 + 100) / 2
    });

    it('should return 0 for average of non-existent operation', () => {
      const avgDuration = PerformanceMonitor.getAverageDuration('non-existent');
      expect(avgDuration).toBe(0);
    });

    it('should generate performance report', () => {
      const report = PerformanceMonitor.generateReport();

      expect(report).toContain('Performance Report:');
      expect(report).toContain('operation-1:');
      expect(report).toContain('operation-2:');
      expect(report).toContain('Count: 2');
      expect(report).toContain('Count: 1');
    });
  });

  describe('clearMetrics', () => {
    it('should clear all metrics and timers', () => {
      PerformanceMonitor.startTimer('test');
      currentTime = 50;
      PerformanceMonitor.endTimer('test');

      expect(PerformanceMonitor.getMetrics()).toHaveLength(1);

      PerformanceMonitor.clearMetrics();

      expect(PerformanceMonitor.getMetrics()).toHaveLength(0);
    });
  });
});
