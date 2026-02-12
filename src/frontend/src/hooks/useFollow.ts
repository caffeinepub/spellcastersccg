import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Principal } from '@dfinity/principal';

export function useIsFollowing(target: Principal | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isFollowing', target?.toString()],
    queryFn: async () => {
      if (!actor || !target) throw new Error('Actor or target not available');
      return actor.isFollowing(target);
    },
    enabled: !!actor && !actorFetching && !!target,
    retry: false,
  });
}

export function useFollowUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (target: Principal) => {
      if (!actor) throw new Error('Actor not available');
      await actor.followUser(target);
    },
    onSuccess: (_, target) => {
      // Invalidate follow state for this target
      queryClient.invalidateQueries({ queryKey: ['isFollowing', target.toString()] });
      // Invalidate follow stats for the target user
      queryClient.invalidateQueries({ queryKey: ['followStats', target.toString()] });
      // Invalidate follow stats for all users (in case we're showing our own stats)
      queryClient.invalidateQueries({ queryKey: ['followStats'] });
    },
  });
}

export function useUnfollowUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (target: Principal) => {
      if (!actor) throw new Error('Actor not available');
      await actor.unfollowUser(target);
    },
    onSuccess: (_, target) => {
      // Invalidate follow state for this target
      queryClient.invalidateQueries({ queryKey: ['isFollowing', target.toString()] });
      // Invalidate follow stats for the target user
      queryClient.invalidateQueries({ queryKey: ['followStats', target.toString()] });
      // Invalidate follow stats for all users (in case we're showing our own stats)
      queryClient.invalidateQueries({ queryKey: ['followStats'] });
    },
  });
}
