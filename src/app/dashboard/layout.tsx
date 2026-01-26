import { DashboardAuthProvider } from '@/context/DashboardAuthContext';
import type { Metadata } from 'next';

export const metadata: Metadata = {
   robots: {
      index: false,
      follow: false,
   },
};

function DashboardLayoutClient({
   children,
}: {
   children: React.ReactNode;
}) {
   return (
      <DashboardAuthProvider>
         <div className="min-h-screen bg-gray-900">
            {children}
         </div>
      </DashboardAuthProvider>
   );
}

export default DashboardLayoutClient;
