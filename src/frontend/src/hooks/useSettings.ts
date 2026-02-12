import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { UserSettings } from '../backend';

export function useGetCallerSettings() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserSettings | null>({
    queryKey: ['currentUserSettings'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerSettings();
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

export function useSaveCallerSettings() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: UserSettings) => {
      if (!actor) throw new Error('Actor not available');
      await actor.saveCallerSettings(settings);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserSettings'] });
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}
