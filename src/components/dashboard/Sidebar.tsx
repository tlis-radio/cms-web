'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
   faGauge,
   faMicrophone,
   faTowerBroadcast,
   faShareNodes,
   faUsers,
   faCircleQuestion,
   faClockRotateLeft,
   faRightFromBracket,
   faBars,
   faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { useDashboardAuth } from '@/context/DashboardAuthContext';

const NAV_ITEMS = [
   { href: '/dashboard', label: 'Prehľad', icon: faGauge },
   { href: '/dashboard/shows', label: 'Relácie', icon: faMicrophone },
   { href: '/dashboard/stream-listeners', label: 'Poslucháči vysielania', icon: faTowerBroadcast },
   { href: '/dashboard/track-shares', label: 'Zdieľania', icon: faShareNodes },
   { href: '/dashboard/users', label: 'Poslucháči', icon: faUsers },
];

type SidebarProps = {
   drawerOpen: boolean;
   onCloseDrawer: () => void;
   onOpenDrawer: () => void;
   onStartTour: () => void;
   onOpenChangelog: () => void;
};

export default function Sidebar({ drawerOpen, onCloseDrawer, onOpenDrawer, onStartTour, onOpenChangelog }: SidebarProps) {
   const pathname = usePathname();
   const { user, logout } = useDashboardAuth();

   const getUserDisplayName = () => {
      if (user?.first_name || user?.last_name) {
         return `${user.first_name || ''} ${user.last_name || ''}`.trim();
      }
      return user?.email || 'Užívateľ';
   };

   const isActive = (href: string) => {
      if (href === '/dashboard') return pathname?.endsWith('/dashboard');
      return pathname?.includes(href);
   };

   const content = (
      <div className="flex flex-col h-full bg-gray-950 border-r border-gray-800">
         <div className="px-4 py-4 flex items-center justify-between md:justify-start">
            <span className="text-white font-bold text-sm tracking-wide">TLIS Dashboard</span>
            <button onClick={onCloseDrawer} className="md:hidden text-gray-400 hover:text-white p-1">
               <FontAwesomeIcon icon={faXmark} />
            </button>
         </div>

         <nav data-tour="sidebar-nav" className="flex-1 px-2 space-y-1 overflow-y-auto">
            {NAV_ITEMS.map((item) => (
               <Link
                  key={item.href}
                  href={item.href}
                  onClick={onCloseDrawer}
                  className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm transition ${
                     isActive(item.href)
                        ? 'bg-gray-800 text-white'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                  }`}
               >
                  <FontAwesomeIcon icon={item.icon} className="w-4" />
                  {item.label}
               </Link>
            ))}
         </nav>

         <div className="px-2 py-2 border-t border-gray-800 space-y-1">
            <button
               onClick={onStartTour}
               className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition"
            >
               <FontAwesomeIcon icon={faCircleQuestion} className="w-4" />
               Sprievodca
            </button>
            <button
               data-tour="whats-new"
               onClick={onOpenChangelog}
               className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-gray-400 hover:bg-gray-800 hover:text-white transition"
            >
               <FontAwesomeIcon icon={faClockRotateLeft} className="w-4" />
               Čo je nové
            </button>
         </div>

         <div className="px-4 py-3 border-t border-gray-800 flex items-center justify-between gap-2">
            <span className="text-xs text-gray-400 truncate">{getUserDisplayName()}</span>
            <button
               onClick={logout}
               title="Odhlásiť sa"
               className="text-gray-400 hover:text-red-400 transition p-1 flex-shrink-0"
            >
               <FontAwesomeIcon icon={faRightFromBracket} />
            </button>
         </div>
      </div>
   );

   return (
      <>
         {/* Mobile hamburger trigger */}
         <button
            onClick={onOpenDrawer}
            className="md:hidden fixed top-3 left-3 z-30 bg-gray-800 text-white p-2 rounded-md shadow-lg"
         >
            <FontAwesomeIcon icon={faBars} />
         </button>

         {/* Desktop fixed rail */}
         <aside className="hidden md:flex md:flex-col md:w-56 lg:w-64 fixed inset-y-0 left-0 z-30">
            {content}
         </aside>

         {/* Mobile drawer */}
         {drawerOpen && (
            <div className="fixed inset-0 z-40 md:hidden">
               <div className="absolute inset-0 bg-black/50" onClick={onCloseDrawer} />
               <aside className="absolute inset-y-0 left-0 w-64 z-50">{content}</aside>
            </div>
         )}
      </>
   );
}
