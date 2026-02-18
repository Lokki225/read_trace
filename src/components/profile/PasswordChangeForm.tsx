'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { PasswordChange } from '@/model/schemas/profile';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/useToast';
import { Eye, EyeOff, KeyRound } from 'lucide-react';

interface PasswordChangeFormProps {
  hasPasswordIdentity?: boolean;
  onSuccess?: () => void;
}

export function PasswordChangeForm({ hasPasswordIdentity = true, onSuccess }: PasswordChangeFormProps) {
  const isSetMode = !hasPasswordIdentity;
  const [isLoading, setIsLoading] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const { toast } = useToast();
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
  } = useForm<PasswordChange>({
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  });

  const newPassword = watch('newPassword');

  const onSubmit = async (data: PasswordChange) => {
    setIsLoading(true);
    try {
      const payload = isSetMode
        ? { newPassword: data.newPassword, confirmPassword: data.confirmPassword }
        : data;

      const response = await fetch('/api/profile/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update password');
      }

      toast({
        title: 'Success',
        description: isSetMode ? 'Password set successfully' : 'Password changed successfully',
        type: 'success'
      });
      reset();
      onSuccess?.();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update password',
        type: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center gap-3 mb-2">
        <KeyRound className="w-5 h-5 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">
          {isSetMode ? 'Set a Password' : 'Change Password'}
        </h2>
      </div>
      {isSetMode && (
        <p className="text-sm text-gray-500 mb-6">
          Your account uses {'{'}provider{'}'} sign-in. You can optionally set a password to also log in with email.
        </p>
      )}

      <div className="space-y-6">
        {/* Current Password — only shown for email/password accounts */}
        {!isSetMode && (
          <div>
            <Label htmlFor="currentPassword" className="text-gray-700 font-medium">
              Current Password
            </Label>
            <div className="relative mt-2">
              <Input
                id="currentPassword"
                type={showPasswords.current ? 'text' : 'password'}
                {...register('currentPassword', {
                  required: 'Current password is required'
                })}
                disabled={isLoading}
                className="pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.currentPassword && (
              <p className="text-red-600 text-sm mt-1">{errors.currentPassword.message}</p>
            )}
          </div>
        )}

        {/* New Password */}
        <div>
          <Label htmlFor="newPassword" className="text-gray-700 font-medium">
            {isSetMode ? 'Password' : 'New Password'}
          </Label>
          <div className="relative mt-2">
            <Input
              id="newPassword"
              type={showPasswords.new ? 'text' : 'password'}
              {...register('newPassword', {
                required: 'Password is required',
                minLength: { value: 8, message: 'Password must be at least 8 characters' },
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/,
                  message: 'Password must contain uppercase, lowercase, number, and special character'
                }
              })}
              disabled={isLoading}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-red-600 text-sm mt-1">{errors.newPassword.message}</p>
          )}
          <p className="text-gray-500 text-xs mt-1">
            Min 8 chars · uppercase · lowercase · number · special character
          </p>
        </div>

        {/* Confirm Password */}
        <div>
          <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
            Confirm Password
          </Label>
          <div className="relative mt-2">
            <Input
              id="confirmPassword"
              type={showPasswords.confirm ? 'text' : 'password'}
              {...register('confirmPassword', {
                required: 'Please confirm your password',
                validate: (value) => value === newPassword || 'Passwords do not match'
              })}
              disabled={isLoading}
              className="pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="text-red-600 text-sm mt-1">{errors.confirmPassword.message}</p>
          )}
        </div>

        {/* Submit */}
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading
              ? isSetMode ? 'Setting...' : 'Changing...'
              : isSetMode ? 'Set Password' : 'Change Password'}
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
