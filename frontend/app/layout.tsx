import type { Metadata } from 'next';
import './globals.css';
import QueryProvider from '@/components/QueryProvider';

export const metadata: Metadata = {
  title: 'Controle de Abastecimentos — GD Tech',
  description:
    'Sistema de Gestão, Ingestão e Comprovantes de Abastecimentos de Combustível',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased bg-slate-900 text-slate-100">
      <body className="min-h-full flex flex-col bg-slate-900 text-slate-100">
        <QueryProvider>
          <div className="flex-1 flex flex-col">{children}</div>
        </QueryProvider>
      </body>
    </html>
  );
}
