import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { UserDirectoryProfile } from '../backend';

export function useSearchUserProfiles(searchText: string) {
  const { actor, isFetching: actorFetching } = useActor();
  const trimmedSearchText = searchText.trim();

  const query = useQuery<UserDirectoryProfile[]>({
    queryKey: ['userSearch', trimmedSearchText],
    queryFn: async () => {
      if (!actor) return [];
      return actor.searchUserProfiles(trimmedSearchText);
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}
