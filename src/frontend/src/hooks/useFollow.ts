import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Principal } from '@dfinity/principal';

export function useIsFollowing(target: Principal | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<boolean>({
    queryKey: ['isFollowing', target?.toString()],
    queryFn: async () => {
      if (!actor || !target) return false;
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
      return actor.followUser(target);
    },
    onSuccess: (_, target) => {
      queryClient.invalidateQueries({ queryKey: ['isFollowing', target.toString()] });
      queryClient.invalidateQueries({ queryKey: ['followStats'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
    },
  });
}

export function useUnfollowUser() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (target: Principal) => {
      if (!actor) throw new Error('Actor not available');
      return actor.unfollowUser(target);
    },
    onSuccess: (_, target) => {
      queryClient.invalidateQueries({ queryKey: ['isFollowing', target.toString()] });
      queryClient.invalidateQueries({ queryKey: ['followStats'] });
      queryClient.invalidateQueries({ queryKey: ['following'] });
    },
  });
}

export function useGetFollowing() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<Principal[]>({
    queryKey: ['following'],
    queryFn: async () => {
      if (!actor) return [];
      
      try {
        const identity = await actor.getCallerUserProfile();
        if (!identity) return [];
        
        // Get all profiles and filter by those we're following
        const allProfiles = await actor.searchUserProfiles('');
        const followingChecks = await Promise.all(
          allProfiles.map(async (profile) => {
            try {
              const principal = Principal.fromText(profile.id);
              const isFollowing = await actor.isFollowing(principal);
              return { principal, isFollowing };
            } catch {
              return { principal: null, isFollowing: false };
            }
          })
        );
        
        return followingChecks
          .filter(check => check.isFollowing && check.principal)
          .map(check => check.principal!);
      } catch {
        return [];
      }
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
  };
}
