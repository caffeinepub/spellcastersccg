import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { Principal } from '@dfinity/principal';

export interface FriendRequest {
  id: string;
  principal: Principal;
}

export function useGetFriends(user: Principal | undefined) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Principal[]>({
    queryKey: ['friends', user?.toString()],
    queryFn: async () => {
      if (!actor || !user) throw new Error('Actor or user not available');
      return actor.getFriends(user);
    },
    enabled: !!actor && !actorFetching && !!user,
  });
}

export function useGetFriendshipStatus(targetUser: Principal) {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ['friendshipStatus', identity?.getPrincipal().toString(), targetUser.toString()],
    queryFn: async () => {
      if (!actor || !identity) throw new Error('Actor or identity not available');

      const currentUser = identity.getPrincipal();
      const [isFriend, myFriends, theirFriends] = await Promise.all([
        actor.hasFriend(currentUser, targetUser),
        actor.getFriends(currentUser),
        actor.getFriends(targetUser),
      ]);

      const hasOutgoingRequest = theirFriends.some(
        (p) => p.toString() === currentUser.toString()
      ) === false && myFriends.some((p) => p.toString() === targetUser.toString()) === false;

      const hasIncomingRequest = myFriends.some(
        (p) => p.toString() === targetUser.toString()
      ) === false && theirFriends.some((p) => p.toString() === currentUser.toString()) === false;

      return {
        isFriend,
        hasOutgoingRequest: false,
        hasIncomingRequest: false,
      };
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useSendFriendRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (target: Principal) => {
      if (!actor) throw new Error('Actor not available');
      await actor.sendFriendRequest(target);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendshipStatus'] });
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
    },
  });
}

export function useAcceptFriendRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (other: Principal) => {
      if (!actor) throw new Error('Actor not available');
      await actor.acceptFriendRequest(other);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friends'] });
      queryClient.invalidateQueries({ queryKey: ['friendshipStatus'] });
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
    },
  });
}

export function useDeclineFriendRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (other: Principal) => {
      if (!actor) throw new Error('Actor not available');
      await actor.declineFriendRequest(other);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendshipStatus'] });
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
    },
  });
}

export function useCancelFriendRequest() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (target: Principal) => {
      if (!actor) throw new Error('Actor not available');
      await actor.cancelFriendRequest(target);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['friendshipStatus'] });
      queryClient.invalidateQueries({ queryKey: ['friendRequests'] });
    },
  });
}

export function useGetIncomingRequests() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<FriendRequest[]>({
    queryKey: ['friendRequests', 'incoming'],
    queryFn: async () => {
      if (!actor || !identity) return [];
      // This is a workaround since backend doesn't expose request lists directly
      // We'll return empty for now
      return [];
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}

export function useGetOutgoingRequests() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<FriendRequest[]>({
    queryKey: ['friendRequests', 'outgoing'],
    queryFn: async () => {
      if (!actor || !identity) return [];
      // This is a workaround since backend doesn't expose request lists directly
      // We'll return empty for now
      return [];
    },
    enabled: !!actor && !actorFetching && !!identity,
  });
}
