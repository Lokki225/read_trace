export enum OAuthProvider {
  GOOGLE = 'google',
  DISCORD = 'discord'
}

export interface OAuthToken {
  access_token: string;
  refresh_token?: string;
  expires_at: number;
  token_type: string;
  scope: string;
}

export interface OAuthProfile {
  provider_id: string;
  provider_name: OAuthProvider;
  email: string;
  display_name?: string;
  avatar_url?: string;
  raw_data: Record<string, any>;
}

export interface OAuthConfig {
  provider: OAuthProvider;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scopes: string[];
}

export interface OAuthCallbackData {
  code: string;
  state: string;
  provider: OAuthProvider;
}

export interface OAuthLinkRequest {
  provider: OAuthProvider;
  profile: OAuthProfile;
  token: OAuthToken;
}
