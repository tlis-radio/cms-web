import { DashboardAuthProvider } from '@/context/DashboardAuthContext';
import DashboardChrome from '@/components/dashboard/DashboardChrome';
import type { Metadata } from 'next';
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter", 
});


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
         <div className={`${inter.variable} font-sans antialiased min-h-screen bg-gray-900`}>
            <DashboardChrome>{children}</DashboardChrome>
         </div>
      </DashboardAuthProvider>
   );
}

export default DashboardLayoutClient;
