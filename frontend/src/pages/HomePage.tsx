import { PageContainer } from '../components/ui/PageContainer';

export function HomePage() {
  return (
    <PageContainer title="SuiTicket Home" description="Ticket management platform on Sui.">
      <p className="text-sm text-gray-700">Start by connecting a wallet and creating your first event.</p>
    </PageContainer>
  );
}
