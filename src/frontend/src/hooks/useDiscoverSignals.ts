import { useActor } from './useActor';

/**
 * Hook for recording discover signals (search queries and profile views).
 * All operations are fire-and-forget and fail silently to protect the UI.
 */
export function useDiscoverSignals() {
  const { actor } = useActor();

  const recordSearch = async (searchTerm: string) => {
    if (!actor || !searchTerm.trim()) return;
    
    try {
      // Fire-and-forget: no await, no error propagation
      // Backend will store search signals for personalization
      // Note: Backend implementation pending
      console.log('[Discover Signal] Search:', searchTerm.trim());
    } catch (error) {
      // Silently fail - never block UI
      console.debug('[Discover Signal] Failed to record search:', error);
    }
  };

  const recordProfileView = async (profileId: string) => {
    if (!actor || !profileId) return;
    
    try {
      // Fire-and-forget: no await, no error propagation
      // Backend will store profile view signals for personalization
      // Note: Backend implementation pending
      console.log('[Discover Signal] Profile view:', profileId);
    } catch (error) {
      // Silently fail - never block UI
      console.debug('[Discover Signal] Failed to record profile view:', error);
    }
  };

  return {
    recordSearch,
    recordProfileView,
  };
}
