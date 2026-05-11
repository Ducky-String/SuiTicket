import { ConnectButton, useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { useState, type FormEvent } from 'react';
import { PageContainer } from '../components/ui/PageContainer';
import { handleMintTicket } from '../services/tx/executeMintTicket';

export function MintPage() {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const [name, setName] = useState('VIP Ticket');
  const [imageUrl, setImageUrl] = useState('https://example.com/image.png');
  const [showtime, setShowtime] = useState('10:00');
  const [quantity, setQuantity] = useState(1);
  const [digest, setDigest] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setDigest('');

    if (!currentAccount) {
      setError('Please connect wallet first.');
      return;
    }

    try {
      setIsSubmitting(true);
      const transaction = await handleMintTicket(name, imageUrl, showtime, '', quantity);
      
      const result = await signAndExecuteTransaction({
        transaction,
      });
      
      setDigest(result.digest);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Transaction failed.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageContainer title="Mint Ticket" description="Create and issue tickets for an event.">
      <div className="mb-4">
        <ConnectButton />
      </div>

      <form className="grid max-w-xl gap-3" onSubmit={onSubmit}>
        <label className="grid gap-1">
          <span className="text-sm font-medium">Ticket name</span>
          <input
            className="rounded border px-3 py-2 bg-gray-900"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">Image URL</span>
          <input
            className="rounded border px-3 py-2 bg-gray-900"
            value={imageUrl}
            onChange={(event) => setImageUrl(event.target.value)}
            required
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">Showtime</span>
          <input
            className="rounded border px-3 py-2 bg-gray-900"
            value={showtime}
            onChange={(event) => setShowtime(event.target.value)}
            required
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">Quantity</span>
          <input
            className="rounded border px-3 py-2 bg-gray-900"
            type="number"
            min="1"
            value={quantity}
            onChange={(event) => setQuantity(parseInt(event.target.value))}
            required
          />
        </label>

        <button
          className="mt-2 rounded bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
          disabled={!currentAccount || isSubmitting}
          type="submit"
        >
          {isSubmitting ? 'Submitting...' : 'Mint ticket'}
        </button>
      </form>

      {digest ? <p className="mt-4 text-sm text-green-700">Success digest: {digest}</p> : null}
      {error ? <p className="mt-4 text-sm text-red-700">Error: {error}</p> : null}
    </PageContainer>
  );
}
