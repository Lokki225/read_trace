import React from 'react';
import { createServerClient } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import { PreferredSitesForm } from '@/components/settings/PreferredSitesForm';
import { AddScanSiteForm } from '@/components/settings/AddScanSiteForm';
import { CustomSite } from '@/types/preferences';

export default async function SettingsPage() {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/auth/login');
  }

  const { data: profile } = await (supabase as any)
    .from('user_profiles')
    .select('preferred_sites, custom_sites')
    .eq('id', user.id)
    .single();

  const preferredSites = profile?.preferred_sites || ['mangadex'];
  const customSites = (profile?.custom_sites || []) as CustomSite[];

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Settings</h1>

        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Scan Site Preferences
            </h2>
            <p className="text-gray-600 mb-6">
              Manage your preferred scanlation sites. The ReadTrace extension will
              prioritize these sites when tracking your reading.
            </p>
            <PreferredSitesForm initialPreferences={preferredSites} />
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <AddScanSiteForm existingSites={customSites} />
          </div>
        </div>
      </div>
    </div>
  );
}
