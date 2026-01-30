/**
 * useDataSync Hook - Real-time data synchronization
 * 
 * Currently implements: Polling (auto-refresh every N seconds)
 * Future: Replace with WebSocket for instant updates
 * 
 * Usage:
 *   const { data, refresh, isStale } = useDataSync(fetchFunction, intervalMs);
 * 
 * To migrate to WebSocket later:
 *   1. Replace polling logic with WebSocket connection
 *   2. Keep the same API (data, refresh, isStale)
 *   3. Components won't need any changes
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// Default polling interval (15 seconds)
const DEFAULT_POLL_INTERVAL = 15000;

/**
 * Hook for automatic data synchronization
 * @param {Function} fetchFn - Async function to fetch data
 * @param {number} intervalMs - Polling interval in milliseconds
 * @param {boolean} enabled - Whether polling is enabled
 */
export function useDataSync(fetchFn, intervalMs = DEFAULT_POLL_INTERVAL, enabled = true) {
  const [isStale, setIsStale] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);
  const fetchFnRef = useRef(fetchFn);

  // Keep fetchFn ref updated
  useEffect(() => {
    fetchFnRef.current = fetchFn;
  }, [fetchFn]);

  const refresh = useCallback(async () => {
    try {
      await fetchFnRef.current();
      setLastUpdated(new Date());
      setIsStale(false);
    } catch (error) {
      console.error('Data sync refresh failed:', error);
      setIsStale(true);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    // Start polling
    intervalRef.current = setInterval(() => {
      refresh();
    }, intervalMs);

    // Cleanup on unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [intervalMs, enabled, refresh]);

  return { refresh, isStale, lastUpdated };
}

/**
 * Hook for polling multiple data sources
 * @param {Array<Function>} fetchFns - Array of async fetch functions
 * @param {number} intervalMs - Polling interval
 */
export function useMultiDataSync(fetchFns, intervalMs = DEFAULT_POLL_INTERVAL, enabled = true) {
  const [isStale, setIsStale] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const intervalRef = useRef(null);
  const fetchFnsRef = useRef(fetchFns);

  useEffect(() => {
    fetchFnsRef.current = fetchFns;
  }, [fetchFns]);

  const refresh = useCallback(async () => {
    try {
      await Promise.all(fetchFnsRef.current.map(fn => fn()));
      setLastUpdated(new Date());
      setIsStale(false);
    } catch (error) {
      console.error('Multi data sync refresh failed:', error);
      setIsStale(true);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    intervalRef.current = setInterval(() => {
      refresh();
    }, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [intervalMs, enabled, refresh]);

  return { refresh, isStale, lastUpdated };
}

// Polling interval constants (easy to configure)
export const POLL_INTERVALS = {
  FAST: 5000,      // 5 seconds - for critical real-time data
  NORMAL: 15000,   // 15 seconds - default
  SLOW: 30000,     // 30 seconds - for less critical data
};

export default useDataSync;
