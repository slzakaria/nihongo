'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

// Catches render/runtime errors anywhere under the root layout (nav/footer still render)
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-3 px-4 py-20 text-center">
      <h1 className="text-xl font-semibold tracking-tight">Something went wrong</h1>
      <p className="text-sm text-muted-foreground">
        An unexpected error occurred. You can try again, or head back home.
      </p>
      <div className="flex gap-2">
        <Button className="cursor-pointer" onClick={reset}>
          Try again
        </Button>
        <Button
          className="cursor-pointer"
          variant="outline"
          onClick={() => router.push('/')}
        >
          Go home
        </Button>
      </div>
    </div>
  );
}
