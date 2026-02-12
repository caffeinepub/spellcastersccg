import { useState, useEffect } from 'react';
import { Post, ExternalBlob } from '../backend';
import { useUpdatePost } from '../hooks/usePosts';
import ImagePicker from './ImagePicker';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

interface PostEditDialogProps {
  post: Post;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PostEditDialog({ post, open, onOpenChange }: PostEditDialogProps) {
  const [content, setContent] = useState(post.content);
  const [media, setMedia] = useState<ExternalBlob | undefined>(post.media || undefined);
  const { mutate: updatePost, isPending } = useUpdatePost();

  useEffect(() => {
    if (open) {
      setContent(post.content);
      setMedia(post.media || undefined);
    }
  }, [open, post]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error('Post content cannot be empty');
      return;
    }

    updatePost(
      { postId: post.id, content: content.trim(), media: media || null },
      {
        onSuccess: () => {
          toast.success('Post updated');
          onOpenChange(false);
        },
        onError: (error: any) => {
          toast.error(error.message || 'Failed to update post');
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
          <DialogDescription>Make changes to your post</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              placeholder="What's on your mind?"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] resize-none"
              disabled={isPending}
            />
          </div>

          <div className="space-y-2">
            <Label>Image (optional)</Label>
            {media ? (
              <div className="relative">
                <img
                  src={media.getDirectURL()}
                  alt="Post media"
                  className="w-full rounded-lg border"
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => setMedia(undefined)}
                  disabled={isPending}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <ImagePicker
                onImageSelect={setMedia}
                aspectRatio="wide"
              />
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={!content.trim() || isPending}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
