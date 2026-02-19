import { log, warn, error as logError } from '../logger';

export interface AccuracyMetrics {
  platform: string;
  total_detections: number;
  successful_detections: number;
  accuracy_percentage: number;
  common_failures: string[];
  last_updated: Date;
}

export interface DetectionAttempt {
  platform: string;
  url: string;
  detected_title: string | null;
  detected_chapter: number | null;
  detected_scroll: number;
  confidence: number;
  success: boolean;
  failure_reason?: string;
  timestamp: number;
}

export interface AccuracyReport {
  generated_at: Date;
  platforms: AccuracyMetrics[];
  overall_accuracy: number;
  total_detections: number;
  total_successes: number;
}

const MAX_ATTEMPTS = 500;
const ACCURACY_THRESHOLD = 95;

const detectionAttempts: DetectionAttempt[] = [];
const metricsMap = new Map<string, AccuracyMetrics>();

export function recordDetectionAttempt(attempt: DetectionAttempt): void {
  detectionAttempts.push(attempt);

  if (detectionAttempts.length > MAX_ATTEMPTS) {
    detectionAttempts.splice(0, detectionAttempts.length - MAX_ATTEMPTS);
  }

  updateMetrics(attempt);

  if (!attempt.success) {
    warn('accuracyLogger:detection-failure', {
      platform: attempt.platform,
      url: attempt.url,
      reason: attempt.failure_reason,
      timestamp: attempt.timestamp,
    });
  } else {
    log('accuracyLogger:detection-success', {
      platform: attempt.platform,
      title: attempt.detected_title,
      chapter: attempt.detected_chapter,
    });
  }
}

function updateMetrics(attempt: DetectionAttempt): void {
  const existing = metricsMap.get(attempt.platform);

  if (existing) {
    existing.total_detections += 1;
    if (attempt.success) {
      existing.successful_detections += 1;
    } else if (attempt.failure_reason) {
      if (!existing.common_failures.includes(attempt.failure_reason)) {
        existing.common_failures.push(attempt.failure_reason);
        if (existing.common_failures.length > 10) {
          existing.common_failures.shift();
        }
      }
    }
    existing.accuracy_percentage = calculateAccuracy(
      existing.successful_detections,
      existing.total_detections
    );
    existing.last_updated = new Date();
  } else {
    const metrics: AccuracyMetrics = {
      platform: attempt.platform,
      total_detections: 1,
      successful_detections: attempt.success ? 1 : 0,
      accuracy_percentage: attempt.success ? 100 : 0,
      common_failures: attempt.failure_reason ? [attempt.failure_reason] : [],
      last_updated: new Date(),
    };
    metricsMap.set(attempt.platform, metrics);
  }

  const platformMetrics = metricsMap.get(attempt.platform)!;
  if (
    platformMetrics.total_detections >= 10 &&
    platformMetrics.accuracy_percentage < ACCURACY_THRESHOLD
  ) {
    warn('accuracyLogger:accuracy-below-threshold', {
      platform: attempt.platform,
      accuracy: platformMetrics.accuracy_percentage,
      threshold: ACCURACY_THRESHOLD,
      total: platformMetrics.total_detections,
    });
  }
}

export function calculateAccuracy(successes: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((successes / total) * 100 * 10) / 10;
}

export function getMetrics(platform: string): AccuracyMetrics | null {
  return metricsMap.get(platform) ?? null;
}

export function getAllMetrics(): AccuracyMetrics[] {
  return Array.from(metricsMap.values());
}

export function generateReport(): AccuracyReport {
  const platforms = getAllMetrics();
  const totalDetections = platforms.reduce((sum, m) => sum + m.total_detections, 0);
  const totalSuccesses = platforms.reduce((sum, m) => sum + m.successful_detections, 0);
  const overallAccuracy = calculateAccuracy(totalSuccesses, totalDetections);

  const report: AccuracyReport = {
    generated_at: new Date(),
    platforms,
    overall_accuracy: overallAccuracy,
    total_detections: totalDetections,
    total_successes: totalSuccesses,
  };

  log('accuracyLogger:report-generated', {
    overall_accuracy: overallAccuracy,
    platforms: platforms.length,
    total: totalDetections,
  });

  return report;
}

export function getDetectionAttempts(): DetectionAttempt[] {
  return [...detectionAttempts];
}

export function getFailedAttempts(platform?: string): DetectionAttempt[] {
  return detectionAttempts.filter(
    (a) => !a.success && (platform === undefined || a.platform === platform)
  );
}

export function resetMetrics(): void {
  detectionAttempts.splice(0, detectionAttempts.length);
  metricsMap.clear();
  log('accuracyLogger:reset');
}

export function isAboveThreshold(platform: string): boolean {
  const metrics = metricsMap.get(platform);
  if (!metrics || metrics.total_detections === 0) return true;
  return metrics.accuracy_percentage >= ACCURACY_THRESHOLD;
}

export function logEdgeCase(
  platform: string,
  url: string,
  edgeCaseType: string,
  details?: unknown
): void {
  try {
    warn('accuracyLogger:edge-case', {
      platform,
      url,
      edgeCaseType,
      details,
      timestamp: Date.now(),
    });
  } catch (err) {
    logError('accuracyLogger:logEdgeCase:error', err);
  }
}
