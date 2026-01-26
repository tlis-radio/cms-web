'use client';

import { useDashboardAuth } from '@/context/DashboardAuthContext';

interface DashboardHeaderProps {
   children?: React.ReactNode;
}

export default function DashboardHeader({ children }: DashboardHeaderProps) {
   const { user, logout } = useDashboardAuth();

   const getUserDisplayName = () => {
      if (user?.first_name || user?.last_name) {
         return `${user.first_name || ''} ${user.last_name || ''}`.trim();
      }
      return user?.email || 'User';
   };

   return (
      <div className="flex justify-between items-center mb-8">
         <div className="flex items-center gap-4">
            {children}
         </div>
         <div className="flex items-center gap-4">
            <span className="text-white text-sm">
               {getUserDisplayName()}
            </span>
            <button
               onClick={logout}
               className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
               title="Logout"
            >
               <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
               >
                  <path
                     strokeLinecap="round"
                     strokeLinejoin="round"
                     d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
               </svg>
            </button>
         </div>
      </div>
   );
}
