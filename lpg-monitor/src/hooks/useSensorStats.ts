import { useMemo } from 'react';
import type { SensorReading } from '../types/sensor';

export interface SensorStats {
  current: number | null;
  min: number | null;
  max: number | null;
  avg: number | null;
}

export function useSensorStats(history: SensorReading[]): SensorStats {
  return useMemo(() => {
    const len = history.length;
    if (len === 0) return { current: null, min: null, max: null, avg: null };

    // Single pass — avoid Math.min(...arr) spread which copies the array
    let min = Infinity;
    let max = -Infinity;
    let sum = 0;
    for (let i = 0; i < len; i++) {
      const w = history[i].weight;
      if (w < min) min = w;
      if (w > max) max = w;
      sum += w;
    }

    return {
      current: parseFloat(history[len - 1].weight.toFixed(2)),
      min:     parseFloat(min.toFixed(2)),
      max:     parseFloat(max.toFixed(2)),
      avg:     parseFloat((sum / len).toFixed(2)),
    };
  }, [history]);
}
