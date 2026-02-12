import { useNavigate } from '@tanstack/react-router';
import { UserDirectoryProfile } from '../backend';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Loader2 } from 'lucide-react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Principal } from '@dfinity/principal';
import { useIsFollowing, useFollowUser, useUnfollowUser } from '../hooks/useFollow';

interface UserCardProps {
  profile: UserDirectoryProfile;
}

export default function UserCard({ profile }: UserCardProps) {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  
  const userPrincipal = Principal.fromText(profile.id);
  const isOwnProfile = identity?.getPrincipal().toString() === profile.id;
  
  const { data: isFollowing, isLoading: isFollowingLoading } = useIsFollowing(
    isOwnProfile ? undefined : userPrincipal
  );
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  const handleCardClick = () => {
    navigate({ to: '/user/$userId', params: { userId: profile.id } });
  };

  const handleFollowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isFollowing) {
      unfollowMutation.mutate(userPrincipal);
    } else {
      followMutation.mutate(userPrincipal);
    }
  };

  const isActionLoading = followMutation.isPending || unfollowMutation.isPending;

  return (
    <Card className="hover:bg-accent/50 transition-colors cursor-pointer" onClick={handleCardClick}>
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
          </div>

          <div className="flex items-center gap-2">
            {!isOwnProfile && (
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
            <Button variant="ghost" size="sm">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
