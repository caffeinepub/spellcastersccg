import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import { FollowStats } from '../backend';
import { Principal } from '@dfinity/principal';

export function useGetFollowStats(user: Principal | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<FollowStats>({
    queryKey: ['followStats', user?.toString()],
    queryFn: async () => {
      if (!actor || !user) throw new Error('Actor or user not available');
      return actor.getFollowStats(user);
    },
    enabled: !!actor && !actorFetching && !!user,
    retry: false,
    // Return default values on error to prevent breaking profile rendering
    placeholderData: { followers: BigInt(0), following: BigInt(0) },
  });
}
