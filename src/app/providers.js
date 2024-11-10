'use client';

import { useEffect, useState } from 'react';
import { AuthProvider } from '../context/AuthContext';
import dynamic from 'next/dynamic';

const Sidebar = dynamic(() => import('../components/Sidebar'), {
  ssr: false,
});

export function Providers({ children }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <AuthProvider>
      <Sidebar />
      {children}
    </AuthProvider>
  );
}
