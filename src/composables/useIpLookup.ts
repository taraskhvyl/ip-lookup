import { ref } from 'vue';
import { lookupIp } from '../api/geoClient';
import { validateIp } from '../utils/ip';

export type LookupStatus = 'idle' | 'loading' | 'success' | 'error';

export interface LookupResult {
  country: string;
  countryCode: string;
  timezone: string;
}

export function useIpLookup(ip: () => string, onUpdate: (updates: { status: LookupStatus; errorMessage?: string; result?: LookupResult }) => void) {
  const abortController = ref<AbortController | null>(null);

  /**
   * Validates and performs IP lookup.
   * Aborts previous request if still in-flight.
   */
  async function runLookup() {
    const value = ip();
    const validation = validateIp(value);
    if (!validation.valid) {
      onUpdate({ status: 'error', errorMessage: validation.error, result: undefined });
      return;
    }

    if (abortController.value) {
      abortController.value.abort();
    }
    abortController.value = new AbortController();
    const signal = abortController.value.signal;

    onUpdate({ status: 'loading', errorMessage: undefined, result: undefined });

    try {
      const result = await lookupIp(value, signal);
      if (signal.aborted) return;
      onUpdate({ status: 'success', result, errorMessage: undefined });
    } catch (err) {
      if (signal.aborted) return;
      const message = err instanceof Error ? err.message : 'Couldn\'t look up this IP. Please try again.';
      onUpdate({ status: 'error', errorMessage: message, result: undefined });
    }
  }

  return { runLookup };
}
