import { Suspense } from 'react';
import { AuthWidget } from '@/features/auth';

export default function LoginPage() {
  return (
    <Suspense>
      <AuthWidget initialTab="login" />
    </Suspense>
  );
}
