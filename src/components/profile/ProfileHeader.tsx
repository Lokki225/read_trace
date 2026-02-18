import { UserProfile } from '@/model/schemas/profile';
import { Mail, Calendar } from 'lucide-react';

interface ProfileHeaderProps {
  profile: UserProfile;
}

export function ProfileHeader({ profile }: ProfileHeaderProps) {
  const createdDate = new Date(profile.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
      <div className="flex items-start gap-6">
        {/* Avatar */}
        <div className="shrink-0">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.display_name || profile.username}
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold border-4 border-gray-200">
              {(profile.display_name || profile.username)[0].toUpperCase()}
            </div>
          )}
        </div>

        {/* Profile Info */}
        <div className="flex-1">
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-gray-900 mb-1">
              {profile.display_name || profile.username}
            </h1>
            <p className="text-gray-600">@{profile.username}</p>
          </div>

          {profile.bio && (
            <p className="text-gray-700 mb-4 max-w-2xl">{profile.bio}</p>
          )}

          <div className="flex flex-col gap-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4" />
              <span>{profile.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Joined {createdDate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
