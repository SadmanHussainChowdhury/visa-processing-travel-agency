'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function EditPatientRedirectPage() {
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    // Redirect from patients to clients for visa processing travel agency
    const clientId = params.id;
    router.replace(`/clients/${clientId}/edit`);
  }, [router, params]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to edit client page...</p>
      </div>
    </div>
  );
}
