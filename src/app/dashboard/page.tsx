import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard | ReadTrace',
  description: 'Your reading progress dashboard',
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-4 text-lg text-gray-600">
          Welcome to ReadTrace! Your dashboard will appear here.
        </p>
      </div>
    </div>
  );
}
