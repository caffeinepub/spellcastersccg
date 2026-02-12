import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Reaction } from '../backend';

export function useGetReactionsForPost(postId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Reaction[]>({
    queryKey: ['reactions', postId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getReactionsForPost(postId);
    },
    enabled: !!actor && !actorFetching && !!postId,
  });
}

export function useGetCallerReactionForPost(postId: string) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Reaction | null>({
    queryKey: ['callerReaction', postId],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerReactionForPost(postId);
    },
    enabled: !!actor && !actorFetching && !!postId,
  });
}

export function useToggleReaction() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, hasReacted }: { postId: string; hasReacted: boolean }) => {
      if (!actor) throw new Error('Actor not available');
      if (hasReacted) {
        await actor.removeReaction(postId);
      } else {
        await actor.addReaction(postId, 'like');
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reactions', variables.postId] });
      queryClient.invalidateQueries({ queryKey: ['callerReaction', variables.postId] });
    },
  });
}
