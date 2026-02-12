import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Post } from '../backend';

export function useGetTimeline() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Post[]>({
    queryKey: ['timeline'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getTimeline();
    },
    enabled: !!actor && !actorFetching,
  });
}
