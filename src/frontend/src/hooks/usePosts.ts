import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { Post, ExternalBlob } from '../backend';
import { Principal } from '@dfinity/principal';

export function useGetPostsForUser(user: Principal | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Post[]>({
    queryKey: ['posts', user?.toString()],
    queryFn: async () => {
      if (!actor || !user) throw new Error('Actor or user not available');
      return actor.getPostsForUser(user);
    },
    enabled: !!actor && !actorFetching && !!user,
  });
}

export function useCreatePost() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ content, media }: { content: string; media: ExternalBlob | null }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createPost(content, media);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      queryClient.invalidateQueries({ queryKey: ['timeline'] });
    },
  });
}
