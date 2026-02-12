import { useState } from 'react';
import { Post } from '../backend';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useDeletePost, usePinPost } from '../hooks/usePosts';
import PostEditDialog from './PostEditDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreVertical, Edit, Trash2, Pin, PinOff, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface PostOwnerActionsProps {
  post: Post;
  showPinActions?: boolean;
}

export default function PostOwnerActions({ post, showPinActions = false }: PostOwnerActionsProps) {
  const { identity } = useInternetIdentity();
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { mutate: deletePost, isPending: isDeleting } = useDeletePost();
  const { mutate: pinPost, isPending: isPinning } = usePinPost();

  const isOwner = identity?.getPrincipal().toString() === post.author.toString();

  if (!isOwner) {
    return null;
  }

  const handleDelete = () => {
    deletePost(post.id, {
      onSuccess: () => {
        toast.success('Post deleted');
        setShowDeleteDialog(false);
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to delete post');
      },
    });
  };

  const handlePin = () => {
    pinPost(post.id, {
      onSuccess: () => {
        toast.success(post.isPinned ? 'Post unpinned' : 'Post pinned');
      },
      onError: (error: any) => {
        toast.error(error.message || 'Failed to pin post');
      },
    });
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {showPinActions && (
            <DropdownMenuItem onClick={handlePin} disabled={isPinning}>
              {post.isPinned ? (
                <>
                  <PinOff className="h-4 w-4 mr-2" />
                  Unpin
                </>
              ) : (
                <>
                  <Pin className="h-4 w-4 mr-2" />
                  Pin
                </>
              )}
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <PostEditDialog post={post} open={showEditDialog} onOpenChange={setShowEditDialog} />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
