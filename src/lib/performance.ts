/**
 * Performance monitoring utilities for the application
 */

import React from 'react';

export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export class PerformanceMonitor {
  private static metrics: PerformanceMetric[] = [];
  private static timers = new Map<string, number>();

  /**
   * Start timing an operation
   */
  static startTimer(name: string): void {
    this.timers.set(name, performance.now());
  }

  /**
   * End timing an operation and record the metric
   */
  static endTimer(name: string, metadata?: Record<string, unknown>): number {
    const startTime = this.timers.get(name);
    if (!startTime) {
      console.warn(`No timer found for: ${name}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(name);

    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: Date.now(),
      metadata,
    };

    this.metrics.push(metric);
    
    // Log slow operations (> 100ms)
    if (duration > 100) {
      console.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
    }

    return duration;
  }

  /**
   * Measure the execution time of a function
   */
  static async measure<T>(
    name: string,
    fn: () => Promise<T> | T,
    metadata?: Record<string, unknown>
  ): Promise<T> {
    this.startTimer(name);
    try {
      const result = await fn();
      this.endTimer(name, metadata);
      return result;
    } catch (error) {
      this.endTimer(name, { ...metadata, error: true });
      throw error;
    }
  }

  /**
   * Get all recorded metrics
   */
  static getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Get metrics for a specific operation
   */
  static getMetricsFor(name: string): PerformanceMetric[] {
    return this.metrics.filter(metric => metric.name === name);
  }

  /**
   * Get average duration for an operation
   */
  static getAverageDuration(name: string): number {
    const metrics = this.getMetricsFor(name);
    if (metrics.length === 0) return 0;
    
    const totalDuration = metrics.reduce((sum, metric) => sum + metric.duration, 0);
    return totalDuration / metrics.length;
  }

  /**
   * Clear all metrics
   */
  static clearMetrics(): void {
    this.metrics = [];
    this.timers.clear();
  }

  /**
   * Generate a performance report
   */
  static generateReport(): string {
    const operations = new Set(this.metrics.map(m => m.name));
    const report = ['Performance Report:', '==================='];

    for (const operation of operations) {
      const metrics = this.getMetricsFor(operation);
      const avgDuration = this.getAverageDuration(operation);
      const minDuration = Math.min(...metrics.map(m => m.duration));
      const maxDuration = Math.max(...metrics.map(m => m.duration));

      report.push(
        `${operation}:`,
        `  Count: ${metrics.length}`,
        `  Average: ${avgDuration.toFixed(2)}ms`,
        `  Min: ${minDuration.toFixed(2)}ms`,
        `  Max: ${maxDuration.toFixed(2)}ms`,
        ''
      );
    }

    return report.join('\n');
  }
}

/**
 * Measure component render time
 */
export function measureComponentRender(componentName: string) {
  return function <T extends React.ComponentType<any>>(Component: T): T {
    const MeasuredComponent = (props: any) => {
      const startTime = performance.now();
      
      React.useEffect(() => {
        const duration = performance.now() - startTime;
        PerformanceMonitor.endTimer(`${componentName}-render`, {
          component: componentName,
        });
      });

      PerformanceMonitor.startTimer(`${componentName}-render`);
      return React.createElement(Component, props);
    };

    MeasuredComponent.displayName = `Measured(${Component.displayName || Component.name})`;
    return MeasuredComponent as T;
  };
}

/**
 * Simple React hook for measuring render performance
 */
export function usePerformanceMetric(name: string, dependencies: React.DependencyList = []) {
  React.useEffect(() => {
    const timer = `${name}-${Date.now()}`;
    PerformanceMonitor.startTimer(timer);
    
    return () => {
      PerformanceMonitor.endTimer(timer);
    };
  }, dependencies);
}