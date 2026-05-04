import { PageContainer } from '../components/ui/PageContainer';

export function AdminPage() {
  return (
    <PageContainer title="Admin" description="Manage event configuration and treasury actions.">
      <p className="text-sm text-gray-700">Admin controls are scoped by on-chain object capabilities.</p>
    </PageContainer>
  );
}
