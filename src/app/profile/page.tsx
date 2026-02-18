'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile } from '@/model/schemas/profile';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { ProfileForm } from '@/components/profile/ProfileForm';
import { PasswordChangeForm } from '@/components/profile/PasswordChangeForm';
import { ConnectedAccountsSection } from '@/components/profile/ConnectedAccountsSection';
import { Loader2 } from 'lucide-react';

interface Identity {
  provider: string;
  linked_at: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [hasPasswordIdentity, setHasPasswordIdentity] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const [profileRes, sessionRes] = await Promise.all([
          fetch('/api/profile'),
          fetch('/api/auth/session')
        ]);

        if (profileRes.status === 401) {
          router.push('/auth/login');
          return;
        }

        if (!profileRes.ok) {
          throw new Error('Failed to fetch profile');
        }

        const data = await profileRes.json();
        setProfile(data);

        if (sessionRes.ok) {
          const session = await sessionRes.json();
          const ids: Identity[] = (session?.user?.identities ?? []).map((id: any) => ({
            provider: id.provider,
            linked_at: id.created_at ?? ''
          }));
          setIdentities(ids);
          setHasPasswordIdentity(ids.some((id) => id.provider === 'email'));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-w-md">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error</h1>
          <p className="text-gray-600 mb-4">{error || 'Profile not found'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account information and preferences</p>
        </div>

        <ProfileHeader profile={profile} />

        <div className="grid gap-6">
          <ProfileForm 
            profile={profile} 
            onSuccess={(updatedProfile) => setProfile(updatedProfile)}
          />
          <ConnectedAccountsSection
            identities={identities}
            onUnlink={(provider) => {
              const updated = identities.filter((id) => id.provider !== provider);
              setIdentities(updated);
              setHasPasswordIdentity(updated.some((id) => id.provider === 'email'));
            }}
          />
          <PasswordChangeForm hasPasswordIdentity={hasPasswordIdentity} />
        </div>
      </div>
    </div>
  );
}
