import { useNavigate } from '@tanstack/react-router';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetTimeline } from '../hooks/useTimeline';
import PostList from '../components/PostList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';

export default function FeedPage() {
  const { identity } = useInternetIdentity();
  const navigate = useNavigate();
  const { data: posts, isLoading, error } = useGetTimeline();

  useEffect(() => {
    if (!identity) {
      navigate({ to: '/' });
    }
  }, [identity, navigate]);

  if (!identity) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Your Feed</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}
          {error && (
            <div className="text-center py-8 text-destructive">
              Failed to load feed. Please try again.
            </div>
          )}
          {!isLoading && !error && posts && (
            <PostList posts={posts} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
