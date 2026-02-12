import { useState } from 'react';
import { useCreatePost } from '../hooks/usePosts';
import ImagePicker from './ImagePicker';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Image as ImageIcon } from 'lucide-react';
import { ExternalBlob } from '../backend';

export default function PostComposer() {
  const [content, setContent] = useState('');
  const [media, setMedia] = useState<ExternalBlob | undefined>();
  const [showImagePicker, setShowImagePicker] = useState(false);
  const { mutate: createPost, isPending, error } = useCreatePost();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    createPost(
      { content: content.trim(), media: media || null },
      {
        onSuccess: () => {
          setContent('');
          setMedia(undefined);
          setShowImagePicker(false);
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="What's on your mind?"
        rows={3}
        maxLength={1000}
      />

      {showImagePicker && (
        <ImagePicker
          currentUrl={media?.getDirectURL()}
          onImageSelect={setMedia}
          aspectRatio="wide"
        />
      )}

      {error && (
        <div className="text-sm text-destructive">
          Failed to create post. Please try again.
        </div>
      )}

      <div className="flex justify-between items-center">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setShowImagePicker(!showImagePicker)}
          className="gap-2"
        >
          <ImageIcon className="h-4 w-4" />
          {showImagePicker ? 'Remove Image' : 'Add Image'}
        </Button>

        <Button type="submit" disabled={isPending || !content.trim()}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isPending ? 'Posting...' : 'Post'}
        </Button>
      </div>
    </form>
  );
}
