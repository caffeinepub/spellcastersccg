import { useNavigate } from '@tanstack/react-router';
import { UserDirectoryProfile } from '../backend';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Loader2 } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Principal } from '@dfinity/principal';
import { useIsFollowing, useFollowUser, useUnfollowUser } from '../hooks/useFollow';
import { useDiscoverSignals } from '../hooks/useDiscoverSignals';

interface UserCardProps {
  profile: UserDirectoryProfile;
}

export default function UserCard({ profile }: UserCardProps) {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { recordProfileView } = useDiscoverSignals();
  
  // Safely parse principal with error handling
  let userPrincipal: Principal | undefined;
  let isValidPrincipal = false;
  try {
    userPrincipal = Principal.fromText(profile.id);
    isValidPrincipal = true;
  } catch (error) {
    console.error('[UserCard] Invalid principal ID:', profile.id, error);
  }

  const isOwnProfile = identity?.getPrincipal().toString() === profile.id;
  
  const { data: isFollowing, isLoading: isFollowingLoading } = useIsFollowing(
    isOwnProfile || !isValidPrincipal ? undefined : userPrincipal
  );
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  const handleCardClick = () => {
    if (!isValidPrincipal) {
      console.error('[UserCard] Cannot navigate to invalid profile:', profile.id);
      return;
    }
    
    // Record profile view signal (fire-and-forget)
    recordProfileView(profile.id);
    
    navigate({ to: '/user/$userId', params: { userId: profile.id } });
  };

  const handleFollowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!isValidPrincipal || !userPrincipal) {
      console.error('[UserCard] Cannot follow invalid profile:', profile.id);
      return;
    }

    if (isFollowing) {
      unfollowMutation.mutate(userPrincipal);
    } else {
      followMutation.mutate(userPrincipal);
    }
  };

  const isActionLoading = followMutation.isPending || unfollowMutation.isPending;

  return (
    <Card 
      className="hover:bg-accent/50 transition-colors cursor-pointer" 
      onClick={handleCardClick}
      style={{ opacity: isValidPrincipal ? 1 : 0.5 }}
    >
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage
              src={profile.avatarBlob?.getDirectURL() || '/assets/generated/default-avatar.dim_256x256.png'}
              alt={profile.displayName}
            />
            <AvatarFallback>{profile.displayName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{profile.displayName}</p>
            {profile.bio && (
              <p className="text-sm text-muted-foreground truncate">{profile.bio}</p>
            )}
            {!isValidPrincipal && (
              <p className="text-xs text-destructive">Invalid profile</p>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isOwnProfile && isValidPrincipal && (
              <Button
                variant={isFollowing ? 'outline' : 'default'}
                size="sm"
                onClick={handleFollowClick}
                disabled={isActionLoading || isFollowingLoading}
              >
                {isActionLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : isFollowing ? (
                  'Unfollow'
                ) : (
                  'Follow'
                )}
              </Button>
            )}
            <Button variant="ghost" size="sm" disabled={!isValidPrincipal}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
