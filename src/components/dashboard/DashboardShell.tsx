'use client';

import { useState, useEffect } from 'react';
import { AuthGuard } from '@/lib/dashboard/auth-guard';
import Sidebar from './Sidebar';
import ChangelogModal from './ChangelogModal';
import OnboardingTour from './OnboardingTour';
import { hasUnseenChangelog, markChangelogSeen } from './changelog-cookie';
import { hasSeenTour, markTourSeen } from './tour-cookie';
import { TOUR_STEPS } from './tour-steps';

export default function DashboardShell({ children }: { children: React.ReactNode }) {
   const [drawerOpen, setDrawerOpen] = useState(false);
   const [changelogOpen, setChangelogOpen] = useState(false);
   const [tourOpen, setTourOpen] = useState(false);

   useEffect(() => {
      if (hasUnseenChangelog()) {
         setChangelogOpen(true);
      } else if (!hasSeenTour()) {
         setTourOpen(true);
      }
   }, []);

   const closeChangelog = () => {
      setChangelogOpen(false);
      if (!hasSeenTour()) {
         setTourOpen(true);
      }
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
            steps={TOUR_STEPS}
            open={tourOpen}
            onClose={() => {
               markTourSeen();
               setTourOpen(false);
            }}
         />
      </AuthGuard>
   );
}
