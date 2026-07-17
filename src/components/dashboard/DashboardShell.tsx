'use client';

import { useState, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { AuthGuard } from '@/lib/dashboard/auth-guard';
import Sidebar from './Sidebar';
import ChangelogModal from './ChangelogModal';
import OnboardingTour from './OnboardingTour';
import { hasUnseenChangelog, markChangelogSeen } from './changelog-cookie';
import { hasSeenTour, markTourSeen } from './tour-cookie';
import { getTourForPath } from './tour-steps';

export default function DashboardShell({ children }: { children: React.ReactNode }) {
   const pathname = usePathname() || '';
   const [drawerOpen, setDrawerOpen] = useState(false);
   const [changelogOpen, setChangelogOpen] = useState(false);
   const [tourOpen, setTourOpen] = useState(false);
   const [changelogChecked, setChangelogChecked] = useState(false);

   const tour = useMemo(() => getTourForPath(pathname), [pathname]);

   // The changelog is a one-time, global prompt — checked once on mount, not per page.
   useEffect(() => {
      if (hasUnseenChangelog()) {
         setChangelogOpen(true);
      }
      setChangelogChecked(true);
   }, []);

   // Each dashboard page has its own tour, shown the first time that page is visited.
   useEffect(() => {
      if (!changelogChecked || changelogOpen) return;
      setTourOpen(!hasSeenTour(tour.id));
   }, [tour.id, changelogChecked, changelogOpen]);

   const closeChangelog = () => {
      setChangelogOpen(false);
      if (!hasSeenTour(tour.id)) {
         setTourOpen(true);
      }
   };

   const closeTour = () => {
      markTourSeen(tour.id);
      setTourOpen(false);
   };

   return (
      <AuthGuard>
         <Sidebar
            drawerOpen={drawerOpen}
            onCloseDrawer={() => setDrawerOpen(false)}
            onOpenDrawer={() => setDrawerOpen(true)}
            onStartTour={() => setTourOpen(true)}
            onOpenChangelog={() => setChangelogOpen(true)}
         />
         <main className="md:pl-56 lg:pl-72 min-h-screen bg-gray-900 p-4 md:p-6">{children}</main>

         <ChangelogModal
            open={changelogOpen}
            onClose={closeChangelog}
            onAcknowledge={markChangelogSeen}
         />
         <OnboardingTour
            key={tour.id}
            definition={tour}
            pathname={pathname}
            open={tourOpen}
            onClose={closeTour}
         />
      </AuthGuard>
   );
}
