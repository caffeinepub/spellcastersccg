import { useState } from 'react';
import { useGetCallerUserProfile, useSaveCallerUserProfile } from '../hooks/useProfiles';
import ImagePicker from './ImagePicker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { ExternalBlob } from '../backend';

interface ProfileEditorProps {
  onComplete?: () => void;
}

export default function ProfileEditor({ onComplete }: ProfileEditorProps) {
  const { data: existingProfile } = useGetCallerUserProfile();
  const { mutate: saveProfile, isPending, error } = useSaveCallerUserProfile();

  const [displayName, setDisplayName] = useState(existingProfile?.displayName || '');
  const [bio, setBio] = useState(existingProfile?.bio || '');
  const [avatarBlob, setAvatarBlob] = useState<ExternalBlob | undefined>(existingProfile?.avatarBlob);
  const [coverPhotoBlob, setCoverPhotoBlob] = useState<ExternalBlob | undefined>(existingProfile?.coverPhotoBlob);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) return;

    saveProfile(
      {
        id: existingProfile?.id || Date.now().toString(),
        displayName: displayName.trim(),
        bio: bio.trim(),
        avatarBlob,
        coverPhotoBlob,
      },
      {
        onSuccess: () => {
          onComplete?.();
        },
      }
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="displayName">Display Name *</Label>
        <Input
          id="displayName"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="Enter your name"
          required
          maxLength={50}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="bio">Bio</Label>
        <Textarea
          id="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tell us about yourself..."
          rows={4}
          maxLength={500}
        />
      </div>

      <div className="space-y-2">
        <Label>Profile Picture</Label>
        <ImagePicker
          currentUrl={avatarBlob?.getDirectURL()}
          onImageSelect={setAvatarBlob}
          aspectRatio="square"
        />
      </div>

      <div className="space-y-2">
        <Label>Cover Photo</Label>
        <ImagePicker
          currentUrl={coverPhotoBlob?.getDirectURL()}
          onImageSelect={setCoverPhotoBlob}
          aspectRatio="wide"
        />
      </div>

      {error && (
        <div className="text-sm text-destructive">
          Failed to save profile. Please try again.
        </div>
      )}

      <Button type="submit" disabled={isPending || !displayName.trim()} className="w-full">
        {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isPending ? 'Saving...' : 'Save Profile'}
      </Button>
    </form>
  );
}
