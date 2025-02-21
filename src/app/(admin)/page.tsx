import { AdminStats } from '@/components/admin/stats-cards';
import { UserTable } from '@/components/admin/user-table';
import { getAdminStats, getUsers } from '@/lib/actions/admin.actions';

export default async function AdminPage() {
  const stats = await getAdminStats();
  const users = await getUsers();

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <AdminStats {...stats} />
      <UserTable data={users} />
    </div>
  );
} 