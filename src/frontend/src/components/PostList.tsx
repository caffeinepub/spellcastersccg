import { Post } from '../backend';
import { useGetUserProfile } from '../hooks/useProfiles';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Pin } from 'lucide-react';
import PostReactions from './PostReactions';
import PostComments from './PostComments';
import PostOwnerActions from './PostOwnerActions';

interface PostListProps {
  posts: Post[];
  profileMode?: boolean;
}

function PostItem({ post, showPinActions = false }: { post: Post; showPinActions?: boolean }) {
  const { data: authorProfile } = useGetUserProfile(post.author);

  const timeAgo = formatDistanceToNow(new Date(Number(post.timestamp) / 1000000), {
    addSuffix: true,
  });

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={authorProfile?.avatarBlob?.getDirectURL() || '/assets/generated/default-avatar.dim_256x256.png'}
              alt={authorProfile?.displayName || 'User'}
            />
            <AvatarFallback>
              {authorProfile?.displayName?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{authorProfile?.displayName || 'Unknown User'}</p>
                  {post.isPinned && (
                    <Badge variant="secondary" className="gap-1 text-xs">
                      <Pin className="h-3 w-3" />
                      Pinned
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{timeAgo}</p>
              </div>
              <PostOwnerActions post={post} showPinActions={showPinActions} />
            </div>

            <p className="text-sm whitespace-pre-wrap">{post.content}</p>

            {post.media && (
              <div className="rounded-lg overflow-hidden bg-muted">
                <img
                  src={post.media.getDirectURL()}
                  alt="Post media"
                  className="w-full h-auto"
                />
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <PostReactions postId={post.id} />
            </div>

            <PostComments postId={post.id} postAuthor={post.author.toString()} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PostList({ posts, profileMode = false }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No posts yet
      </div>
    );
  }

  // In profile mode, separate pinned post from regular posts
  if (profileMode) {
    const pinnedPost = posts.find(post => post.isPinned);
    const regularPosts = posts.filter(post => !post.isPinned);

    return (
      <div className="space-y-4">
        {pinnedPost && (
          <PostItem key={pinnedPost.id} post={pinnedPost} showPinActions={true} />
        )}
        {regularPosts.map((post) => (
          <PostItem key={post.id} post={post} showPinActions={true} />
        ))}
      </div>
    );
  }

  // Regular mode: show all posts with pinned badge but no pin actions
  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostItem key={post.id} post={post} showPinActions={false} />
      ))}
    </div>
  );
}
