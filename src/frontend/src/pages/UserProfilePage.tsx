import { useParams, useNavigate } from '@tanstack/react-router';
import { Principal } from '@dfinity/principal';
import { useGetUserProfile } from '../hooks/useProfiles';
import { useGetPostsForUser } from '../hooks/usePosts';
import { useGetFriendshipStatus } from '../hooks/useFriends';
import { useGetFollowStats } from '../hooks/useFollowStats';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { formatJoinedDate } from '../utils/formatDate';
import ProfileFollowButton from '../components/ProfileFollowButton';
import PostList from '../components/PostList';
import ProfileImages from '../components/ProfileImages';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowLeft, Lock, Calendar, Users, UserPlus } from 'lucide-react';

export default function UserProfilePage() {
  const { userId } = useParams({ from: '/user/$userId' });
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();

  let userPrincipal: Principal | null = null;
  let isInvalidUserId = false;
  
  try {
    userPrincipal = Principal.fromText(userId);
  } catch {
    isInvalidUserId = true;
  }

  const isOwnProfile = identity?.getPrincipal().toString() === userId;
  const { data: userProfile, isLoading: profileLoading } = useGetUserProfile(userPrincipal || undefined);
  const { data: posts, isLoading: postsLoading, error: postsError } = useGetPostsForUser(userPrincipal || undefined);
  const { data: friendshipStatus } = useGetFriendshipStatus(userPrincipal!);
  const { data: followStats, isLoading: statsLoading } = useGetFollowStats(userPrincipal || undefined);

  if (isInvalidUserId) {
    return (
      <div className="text-center py-16">
        <p className="text-destructive">Invalid user ID</p>
      </div>
    );
  }

  if (profileLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">User profile not found</p>
      </div>
    );
  }

  if (isOwnProfile) {
    navigate({ to: '/profile' });
    return null;
  }

  const isPrivacyBlocked = postsError && (postsError as any).message?.includes('only visible to friends');
  const isFriend = friendshipStatus?.isFriend;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate({ to: '/directory' })}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Directory
      </Button>

      <Card className="overflow-hidden">
        <ProfileImages
          coverUrl={userProfile.coverPhotoBlob?.getDirectURL()}
          avatarUrl={userProfile.avatarBlob?.getDirectURL()}
          displayName={userProfile.displayName}
          size="lg"
        />
        <CardContent className="pt-20">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-3xl font-bold">{userProfile.displayName}</h1>
              <p className="text-muted-foreground mt-2">{userProfile.bio}</p>
              
              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {formatJoinedDate(userProfile.joinedDate)}</span>
                </div>
                {!statsLoading && followStats && (
                  <>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-4 w-4" />
                      <span><strong className="text-foreground">{followStats.followers.toString()}</strong> Followers</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <UserPlus className="h-4 w-4" />
                      <span><strong className="text-foreground">{followStats.following.toString()}</strong> Following</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            {userPrincipal && <ProfileFollowButton targetUser={userPrincipal} />}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Posts</CardTitle>
        </CardHeader>
        <CardContent>
          {postsLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
          {!postsLoading && isPrivacyBlocked && (
            <Alert>
              <Lock className="h-4 w-4" />
              <AlertDescription>
                This user's posts are only visible to friends. {!isFriend && 'Send a friend request to view their posts.'}
              </AlertDescription>
            </Alert>
          )}
          {!postsLoading && !isPrivacyBlocked && posts && <PostList posts={posts} profileMode={true} />}
        </CardContent>
      </Card>
    </div>
  );
}
