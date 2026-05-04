import type { ReactNode } from 'react';

type Props = {
  title: string;
  description?: string;
  children?: ReactNode;
};

export function PageContainer({ title, description, children }: Props) {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-10">
      <header className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        {description ? <p className="mt-2 text-sm text-gray-600">{description}</p> : null}
      </header>
      <section>{children}</section>
    </main>
  );
}
