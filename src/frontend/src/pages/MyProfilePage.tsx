import { useState } from 'react';
import { useGetCallerUserProfile } from '../hooks/useProfiles';
import ProfileEditor from '../components/ProfileEditor';
import PostComposer from '../components/PostComposer';
import PostList from '../components/PostList';
import { useGetPostsForUser } from '../hooks/usePosts';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import ProfileImages from '../components/ProfileImages';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Loader2, Edit } from 'lucide-react';

export default function MyProfilePage() {
  const { identity } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();
  const { data: posts, isLoading: postsLoading } = useGetPostsForUser(identity?.getPrincipal());
  const [showEditor, setShowEditor] = useState(false);

  const showProfileSetup = !!identity && !profileLoading && isFetched && userProfile === null;

  if (profileLoading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (showProfileSetup) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Complete Your Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileEditor onComplete={() => setShowEditor(false)} />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!userProfile) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
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
            <Dialog open={showEditor} onOpenChange={setShowEditor}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                </DialogHeader>
                <ProfileEditor onComplete={() => setShowEditor(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Create Post</CardTitle>
        </CardHeader>
        <CardContent>
          <PostComposer />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Posts</CardTitle>
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
