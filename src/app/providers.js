'use client';

import { AuthProvider } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';

export function Providers({ children }) {
  return (
    <AuthProvider>
      <Sidebar />
      {children}
    </AuthProvider>
  );
}
