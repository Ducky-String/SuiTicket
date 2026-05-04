import { ConnectButton, useCurrentAccount, useSignAndExecuteTransaction } from '@mysten/dapp-kit';
import { useState, type FormEvent } from 'react';
import { DEFAULT_NETWORK } from '../constants/networks';
import { PageContainer } from '../components/ui/PageContainer';
import { executeMintAndTransferTicket } from '../services/tx/executeMintTicket';

export function MintPage() {
  const currentAccount = useCurrentAccount();
  const { mutateAsync: signAndExecuteTransaction } = useSignAndExecuteTransaction();

  const [name, setName] = useState('VIP Ticket');
  const [description, setDescription] = useState('Entry pass');
  const [priceMist, setPriceMist] = useState('1000000000');
  const [buyer, setBuyer] = useState('');
  const [digest, setDigest] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resolvedBuyer = buyer.trim() || currentAccount?.address || '';

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setDigest('');

    if (!currentAccount) {
      setError('Please connect wallet first.');
      return;
    }
    if (!resolvedBuyer) {
      setError('Buyer address is required.');
      return;
    }

    try {
      setIsSubmitting(true);
      const result = await executeMintAndTransferTicket(
        {
          name,
          description,
          price: BigInt(priceMist),
          buyer: resolvedBuyer,
          network: DEFAULT_NETWORK,
        },
        ({ transaction }) =>
          signAndExecuteTransaction({
            transaction,
            chain: `sui:${DEFAULT_NETWORK}`,
          }),
      );
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
            className="rounded border px-3 py-2"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">Description</span>
          <input
            className="rounded border px-3 py-2"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            required
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">Price (MIST)</span>
          <input
            className="rounded border px-3 py-2"
            type="number"
            min="0"
            value={priceMist}
            onChange={(event) => setPriceMist(event.target.value)}
            required
          />
        </label>

        <label className="grid gap-1">
          <span className="text-sm font-medium">Buyer address (optional)</span>
          <input
            className="rounded border px-3 py-2"
            placeholder="Defaults to connected wallet"
            value={buyer}
            onChange={(event) => setBuyer(event.target.value)}
          />
        </label>

        <button
          className="mt-2 rounded bg-black px-4 py-2 text-white disabled:opacity-50"
          disabled={!currentAccount || isSubmitting}
          type="submit"
        >
          {isSubmitting ? 'Submitting...' : 'Mint and transfer ticket'}
        </button>
      </form>

      {digest ? <p className="mt-4 text-sm text-green-700">Success digest: {digest}</p> : null}
      {error ? <p className="mt-4 text-sm text-red-700">Error: {error}</p> : null}
    </PageContainer>
  );
}
