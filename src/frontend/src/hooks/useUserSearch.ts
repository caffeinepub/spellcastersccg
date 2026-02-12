import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { UserDirectoryProfile } from '../backend';

export function useSearchUserProfiles(searchText: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserDirectoryProfile[]>({
    queryKey: ['userSearch', searchText],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.searchUserProfiles(searchText);
    },
    enabled: !!actor && !actorFetching,
  });
}
