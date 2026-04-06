'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import Cookies from 'js-cookie';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const hasToken = Boolean(Cookies.get('authToken'));
  const canAccess = hasToken || isAuthenticated;

  useEffect(() => {
    if (!canAccess) {
      router.replace('/auth/login');
    }
  }, [canAccess, router]);

  if (!canAccess) {
    return null;
  }

  return <>{children}</>;
}