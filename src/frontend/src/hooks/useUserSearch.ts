import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { UserProfile } from '../backend';

export function useGetAllUserProfiles() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile[]>({
    queryKey: ['allUserProfiles'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      // Since backend doesn't have a getAllProfiles method, we'll return empty
      // In a real app, this would need backend support
      return [];
    },
    enabled: !!actor && !actorFetching,
  });
}
