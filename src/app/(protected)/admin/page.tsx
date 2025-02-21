import { AdminStats } from '@/components/admin/stats-cards';
import { UserManagementTable } from '@/components/admin/user-table';

export default function AdminPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <AdminStats />
      <UserManagementTable />
    </div>
  );
} 