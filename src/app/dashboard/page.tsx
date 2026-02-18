import { Suspense } from 'react';
import { Metadata } from 'next';
import { DashboardTabs } from '@/components/dashboard/DashboardTabs';
import { DashboardSkeleton } from '@/components/dashboard/DashboardSkeleton';
import { fetchUserSeriesGrouped } from '@/backend/services/dashboard/seriesQueryService';
import { createServerClient } from '@/lib/supabase';
import { DEV_DASHBOARD_DATA } from '@/lib/devData';

export const metadata: Metadata = {
  title: 'My Library | ReadTrace',
  description: 'Your reading progress dashboard',
};

async function DashboardContent() {
  if (process.env.NEXT_PUBLIC_DEV_PREVIEW === 'true') {
    return <DashboardTabs data={DEV_DASHBOARD_DATA} />;
  }

  const supabase = await createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const dashboardData = await fetchUserSeriesGrouped(user.id);

  return <DashboardTabs data={dashboardData} />;
}

export default function DashboardPage() {
  return (
    <main className="min-h-screen bg-[#FFF8F2] px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-semibold text-[#222222] mb-6">My Library</h1>
        <Suspense fallback={<DashboardSkeleton />}>
          <DashboardContent />
        </Suspense>
      </div>
    </main>
  );
}
