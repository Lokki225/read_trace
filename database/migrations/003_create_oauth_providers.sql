-- Create oauth_providers table for storing OAuth provider links
CREATE TABLE oauth_providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  provider_name TEXT NOT NULL,
  provider_id TEXT NOT NULL,
  email TEXT,
  avatar_url TEXT,
  linked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, provider_name),
  UNIQUE(provider_name, provider_id)
);

-- Create indexes for efficient queries
CREATE INDEX idx_oauth_providers_user_id ON oauth_providers(user_id);
CREATE INDEX idx_oauth_providers_provider ON oauth_providers(provider_name, provider_id);

-- Enable Row Level Security
ALTER TABLE oauth_providers ENABLE ROW LEVEL SECURITY;

-- Users can only see their own OAuth providers
CREATE POLICY "Users can view their own OAuth providers"
  ON oauth_providers FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own OAuth providers
CREATE POLICY "Users can link OAuth providers"
  ON oauth_providers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own OAuth providers
CREATE POLICY "Users can update their own OAuth providers"
  ON oauth_providers FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own OAuth providers
CREATE POLICY "Users can unlink OAuth providers"
  ON oauth_providers FOR DELETE
  USING (auth.uid() = user_id);
