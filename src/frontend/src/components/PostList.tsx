import { Post } from '../backend';
import { useGetUserProfile } from '../hooks/useProfiles';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';

interface PostListProps {
  posts: Post[];
}

function PostItem({ post }: { post: Post }) {
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
            <div>
              <p className="font-semibold">{authorProfile?.displayName || 'Unknown User'}</p>
              <p className="text-xs text-muted-foreground">{timeAgo}</p>
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
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No posts yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostItem key={post.id} post={post} />
      ))}
    </div>
  );
}
