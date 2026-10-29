import { useSyncExternalStore } from 'react';
import { getAdEligibility, subscribeToAdEligibility, type AdEligibility } from '@/lib/subscription';

export function useAdEligibility(): AdEligibility {
  return useSyncExternalStore(subscribeToAdEligibility, getAdEligibility, () => 'unknown');
}
