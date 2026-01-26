'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboardAuth } from '@/context/DashboardAuthContext';

export function AuthGuard({ children }: { children: React.ReactNode }) {
   const { isAuthenticated, isLoading } = useDashboardAuth();
   const router = useRouter();

   useEffect(() => {
      if (!isLoading && !isAuthenticated) {
         router.push('/dashboard/login');
      }
   }, [isAuthenticated, isLoading, router]);

   if (isLoading) {
      return (
         <div className="min-h-screen flex items-center justify-center bg-gray-900">
            <div className="text-white text-xl">Loading...</div>
         </div>
      );
   }

   if (!isAuthenticated) {
      return null;
   }

   return <>{children}</>;
}
