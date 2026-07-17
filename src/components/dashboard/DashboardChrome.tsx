'use client';

import { usePathname } from 'next/navigation';
import DashboardShell from './DashboardShell';

export default function DashboardChrome({ children }: { children: React.ReactNode }) {
   const pathname = usePathname();

   if (pathname?.endsWith('/dashboard/login')) {
      return <>{children}</>;
   }

   return <DashboardShell>{children}</DashboardShell>;
}
