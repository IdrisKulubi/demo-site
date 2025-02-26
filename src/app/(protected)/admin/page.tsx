import { AdminStats } from '@/components/admin/stats-cards';
import { UserManagementTable } from '@/components/admin/user-table';
import { ContestManager } from '@/components/admin/contest-manager';
import { getAdminStats, getUsers, getAdminContests } from '@/lib/actions/admin.actions';

export default async function AdminPage() {
  const [stats, users, contests] = await Promise.all([
    getAdminStats(),
    getUsers(),
    getAdminContests()
  ]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <AdminStats {...stats} />
      <ContestManager contests={contests} />
      <UserManagementTable data={users} />
    </div>
  );
} 