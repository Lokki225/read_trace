'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { UserProfile, ProfileUpdate } from '@/model/schemas/profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/useToast';

interface ProfileFormProps {
  profile: UserProfile;
  onSuccess?: (updatedProfile: UserProfile) => void;
}

export function ProfileForm({ profile, onSuccess }: ProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ProfileUpdate>({
    defaultValues: {
      username: profile.username,
      display_name: profile.display_name || '',
      bio: profile.bio || '',
      avatar_url: profile.avatar_url || ''
    }
  });

  const onSubmit = async (data: ProfileUpdate) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update profile');
      }

      const updatedProfile = await response.json();
      toast({
        title: 'Success',
        description: 'Profile updated successfully',
        type: 'success'
      });
      onSuccess?.(updatedProfile);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update profile',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Profile</h2>

      <div className="space-y-6">
        {/* Username */}
        <div>
          <Label htmlFor="username" className="text-gray-700 font-medium">
            Username
          </Label>
          <Input
            id="username"
            {...register('username', {
              required: 'Username is required',
              minLength: { value: 3, message: 'Username must be at least 3 characters' },
              maxLength: { value: 30, message: 'Username must be at most 30 characters' },
              pattern: {
                value: /^[a-zA-Z0-9_]+$/,
                message: 'Username can only contain letters, numbers, and underscores'
              }
            })}
            className="mt-2"
            disabled={isLoading}
          />
          {errors.username && (
            <p className="text-red-600 text-sm mt-1">{errors.username.message}</p>
          )}
        </div>

        {/* Display Name */}
        <div>
          <Label htmlFor="display_name" className="text-gray-700 font-medium">
            Display Name
          </Label>
          <Input
            id="display_name"
            {...register('display_name', {
              maxLength: { value: 100, message: 'Display name must be at most 100 characters' }
            })}
            className="mt-2"
            disabled={isLoading}
            placeholder="Your full name or preferred name"
          />
          {errors.display_name && (
            <p className="text-red-600 text-sm mt-1">{errors.display_name.message}</p>
          )}
        </div>

        {/* Bio */}
        <div>
          <Label htmlFor="bio" className="text-gray-700 font-medium">
            Bio
          </Label>
          <Textarea
            id="bio"
            {...register('bio', {
              maxLength: { value: 500, message: 'Bio must be at most 500 characters' }
            })}
            className="mt-2"
            disabled={isLoading}
            placeholder="Tell us about yourself"
            rows={4}
          />
          {errors.bio && (
            <p className="text-red-600 text-sm mt-1">{errors.bio.message}</p>
          )}
        </div>

        {/* Avatar URL */}
        <div>
          <Label htmlFor="avatar_url" className="text-gray-700 font-medium">
            Avatar URL
          </Label>
          <Input
            id="avatar_url"
            type="url"
            {...register('avatar_url')}
            className="mt-2"
            disabled={isLoading}
            placeholder="https://example.com/avatar.jpg"
          />
          {errors.avatar_url && (
            <p className="text-red-600 text-sm mt-1">{errors.avatar_url.message}</p>
          )}
        </div>

        {/* Submit Button */}
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => reset()}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
}
