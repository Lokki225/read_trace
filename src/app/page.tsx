import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase';

export default async function RootPage() {
  const supabase = await createServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/register');
  }

  const { data: profile } = await (supabase as any)
    .from('user_profiles')
    .select('onboarding_completed')
    .eq('id', user.id)
    .single();

  if (profile?.onboarding_completed) {
    redirect('/dashboard');
  }

  redirect('/onboarding');
}
