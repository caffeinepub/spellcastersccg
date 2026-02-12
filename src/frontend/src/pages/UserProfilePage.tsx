import { useParams, useNavigate } from '@tanstack/react-router';
import { Principal } from '@dfinity/principal';
import { useGetUserProfile } from '../hooks/useProfiles';
import { useGetPostsForUser } from '../hooks/usePosts';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import FriendActions from '../components/FriendActions';
import FriendsList from '../components/FriendsList';
import PostList from '../components/PostList';
import ProfileImages from '../components/ProfileImages';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';

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
  const { data: posts, isLoading: postsLoading } = useGetPostsForUser(userPrincipal || undefined);

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
            <div>
              <h1 className="text-3xl font-bold">{userProfile.displayName}</h1>
              <p className="text-muted-foreground mt-2">{userProfile.bio}</p>
            </div>
            {userPrincipal && <FriendActions targetUser={userPrincipal} />}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Friends</CardTitle>
        </CardHeader>
        <CardContent>
          {userPrincipal && <FriendsList user={userPrincipal} />}
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
          {!postsLoading && posts && <PostList posts={posts} />}
        </CardContent>
      </Card>
    </div>
  );
}
