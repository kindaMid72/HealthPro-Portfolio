'use client';

import { useFormStatus } from 'react-dom';
import { Button } from '@/components/admin/Button';

export default function LoginSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" pending={pending} className="mt-2 w-full">
      {pending ? 'Memproses...' : 'Masuk ke dashboard'}
    </Button>
  );
}
