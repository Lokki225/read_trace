'use client';

import { useState, useEffect } from 'react';
import { OAuthProvider } from '@/model/schemas/oauth';
import { Loader2, Link, Unlink, Check, X } from 'lucide-react';

interface LinkedProvider {
  provider: OAuthProvider;
  linked: boolean;
}

interface OAuthLinkManagerProps {
  userId?: string;
  onLinkSuccess?: (provider: OAuthProvider) => void;
  onUnlinkSuccess?: (provider: OAuthProvider) => void;
  onError?: (error: Error) => void;
}

export function OAuthLinkManager({
  userId,
  onLinkSuccess,
  onUnlinkSuccess,
  onError
}: OAuthLinkManagerProps) {
  const [linkedProviders, setLinkedProviders] = useState<LinkedProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [linkingProvider, setLinkingProvider] = useState<OAuthProvider | null>(null);

  useEffect(() => {
    fetchLinkedProviders();
  }, []);

  const fetchLinkedProviders = async () => {
    try {
      const response = await fetch('/api/auth/oauth/link');
      if (!response.ok) {
        throw new Error('Failed to fetch linked providers');
      }
      
      const data = await response.json();
      const providers = Object.values(OAuthProvider).map(provider => ({
        provider,
        linked: data.providers.includes(provider)
      }));
      
      setLinkedProviders(providers);
    } catch (error) {
      console.error('Error fetching linked providers:', error);
      onError?.(error instanceof Error ? error : new Error('Failed to fetch providers'));
    } finally {
      setLoading(false);
    }
  };

  const handleLinkOAuth = async (provider: OAuthProvider) => {
    setLinkingProvider(provider);
    
    try {
      // Initiate OAuth flow for linking
      const response = await fetch('/api/auth/oauth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          provider,
          action: 'link' // Indicate this is for linking, not initial auth
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to initiate OAuth linking');
      }

      const data = await response.json();
      
      // Redirect to OAuth provider
      if (data.authUrl) {
        window.location.href = data.authUrl;
      } else {
        throw new Error('No OAuth URL received');
      }
    } catch (error) {
      console.error('OAuth linking error:', error);
      onError?.(error instanceof Error ? error : new Error('OAuth linking failed'));
      setLinkingProvider(null);
    }
  };

  const handleUnlinkOAuth = async (provider: OAuthProvider) => {
    try {
      const response = await fetch('/api/auth/oauth/link', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ provider }),
      });

      if (!response.ok) {
        throw new Error('Failed to unlink OAuth provider');
      }

      // Update local state
      setLinkedProviders(prev => 
        prev.map(p => 
          p.provider === provider ? { ...p, linked: false } : p
        )
      );

      onUnlinkSuccess?.(provider);
    } catch (error) {
      console.error('OAuth unlinking error:', error);
      onError?.(error instanceof Error ? error : new Error('OAuth unlinking failed'));
    }
  };

  const getProviderInfo = (provider: OAuthProvider) => {
    switch (provider) {
      case OAuthProvider.GOOGLE:
        return {
          name: 'Google',
          icon: '🔵',
          description: 'Link your Google account for easy sign-in'
        };
      case OAuthProvider.DISCORD:
        return {
          name: 'Discord',
          icon: '🟣',
          description: 'Link your Discord account for easy sign-in'
        };
      default:
        return {
          name: provider,
          icon: '🔗',
          description: 'Link your account for easy sign-in'
        };
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading linked accounts...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Linked Accounts</h3>
      <p className="text-sm text-muted-foreground">
        Connect OAuth providers to your account for easier sign-in options.
      </p>
      
      <div className="space-y-3">
        {linkedProviders.map(({ provider, linked }) => {
          const info = getProviderInfo(provider);
          const isLoading = linkingProvider === provider;
          
          return (
            <div
              key={provider}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{info.icon}</span>
                <div>
                  <h4 className="font-medium">{info.name}</h4>
                  <p className="text-sm text-muted-foreground">{info.description}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                {linked ? (
                  <>
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm text-green-600">Linked</span>
                    <button
                      onClick={() => handleUnlinkOAuth(provider)}
                      disabled={isLoading}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                      title="Unlink account"
                    >
                      <Unlink className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => handleLinkOAuth(provider)}
                    disabled={isLoading}
                    className="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-md transition-colors disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Linking...</span>
                      </>
                    ) : (
                      <>
                        <Link className="w-4 h-4" />
                        <span>Link Account</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h4 className="font-medium text-blue-900 mb-2">Security Note</h4>
        <p className="text-sm text-blue-700">
          Linking OAuth providers allows you to sign in with them, but you'll still need to 
          authenticate with the provider to verify ownership. You can unlink accounts at any time.
        </p>
      </div>
    </div>
  );
}
