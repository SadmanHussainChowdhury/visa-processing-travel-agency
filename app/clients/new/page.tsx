import { Suspense } from 'react';
import NewClientPageClient from './page-client';

export default function NewClientPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50" />}>
      <NewClientPageClient />
    </Suspense>
  );
}
