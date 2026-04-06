'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import Cookies from 'js-cookie';

interface PublicRouteProps {
  children: React.ReactNode;
}

export function PublicRoute({ children }: PublicRouteProps) {
  const router = useRouter();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);
  const hasToken = Boolean(Cookies.get('authToken'));
  const authenticated = hasToken || isAuthenticated;

  useEffect(() => {
    if (authenticated) {
      router.replace('/dashboard');
    }
  }, [authenticated, router]);

  if (authenticated) {
    return null;
  }

  return <>{children}</>;
}