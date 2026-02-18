'use client';

import { useState } from 'react';
import { useToast } from '@/hooks/useToast';
import { Button } from '@/components/ui/button';
import { Link2, Unlink, AlertCircle } from 'lucide-react';

interface Identity {
  provider: string;
  linked_at: string;
}

interface ConnectedAccountsSectionProps {
  identities: Identity[];
  onUnlink?: (provider: string) => void;
}

const PROVIDER_LABELS: Record<string, string> = {
  email: 'Email & Password',
  google: 'Google',
  discord: 'Discord',
  github: 'GitHub',
  twitter: 'Twitter / X'
};

const PROVIDER_COLORS: Record<string, string> = {
  email: 'bg-gray-100 text-gray-700',
  google: 'bg-red-50 text-red-700',
  discord: 'bg-indigo-50 text-indigo-700',
  github: 'bg-gray-900 text-white',
  twitter: 'bg-sky-50 text-sky-700'
};

export function ConnectedAccountsSection({ identities, onUnlink }: ConnectedAccountsSectionProps) {
  const [unlinking, setUnlinking] = useState<string | null>(null);
  const [confirmProvider, setConfirmProvider] = useState<string | null>(null);
  const { toast } = useToast();

  const handleUnlink = async (provider: string) => {
    if (identities.length <= 1) {
      toast({
        title: 'Cannot unlink',
        description: 'You must keep at least one login method.',
        type: 'error'
      });
      setConfirmProvider(null);
      return;
    }

    setUnlinking(provider);
    setConfirmProvider(null);
    try {
      const response = await fetch(`/api/profile/oauth/${provider}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Failed to unlink provider');
      }

      toast({
        title: 'Success',
        description: `${PROVIDER_LABELS[provider] ?? provider} unlinked successfully`,
        type: 'success'
      });
      onUnlink?.(provider);
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to unlink provider',
        type: 'error'
      });
    } finally {
      setUnlinking(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-center gap-3 mb-2">
        <Link2 className="w-5 h-5 text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-900">Connected Accounts</h2>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Manage the login methods linked to your account.
      </p>

      {identities.length === 0 ? (
        <p className="text-gray-500 text-sm">No connected accounts found.</p>
      ) : (
        <ul className="space-y-3">
          {identities.map((identity) => {
            const label = PROVIDER_LABELS[identity.provider] ?? identity.provider;
            const colorClass = PROVIDER_COLORS[identity.provider] ?? 'bg-gray-100 text-gray-700';
            const linkedDate = identity.linked_at
              ? new Date(identity.linked_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })
              : null;

            return (
              <li
                key={identity.provider}
                className="flex items-center justify-between rounded-lg border border-gray-100 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-2 py-1 rounded-full ${colorClass}`}>
                    {label}
                  </span>
                  {linkedDate && (
                    <span className="text-xs text-gray-400">Linked {linkedDate}</span>
                  )}
                </div>

                {confirmProvider === identity.provider ? (
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-500" />
                    <span className="text-xs text-gray-600">Are you sure?</span>
                    <Button
                      variant="outline"
                      onClick={() => handleUnlink(identity.provider)}
                      disabled={!!unlinking}
                      className="text-xs h-7 px-2 text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Yes, unlink
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setConfirmProvider(null)}
                      className="text-xs h-7 px-2"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="outline"
                    onClick={() => setConfirmProvider(identity.provider)}
                    disabled={!!unlinking || identities.length <= 1}
                    title={identities.length <= 1 ? 'Cannot unlink your only login method' : `Unlink ${label}`}
                    className="text-xs h-7 px-2 text-gray-500 hover:text-red-600 hover:border-red-300 disabled:opacity-40"
                  >
                    <Unlink className="w-3 h-3 mr-1" />
                    {unlinking === identity.provider ? 'Unlinking...' : 'Unlink'}
                  </Button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
