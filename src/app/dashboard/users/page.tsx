'use client';

import { AuthGuard } from '@/lib/dashboard/auth-guard';
import { useDashboardAuth } from '@/context/DashboardAuthContext';
import { DashboardService } from '@/lib/dashboard/dashboard-service';
import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import DashboardHeader from '@/components/dashboard/DashboardHeader';

type UserSession = {
   session_id: string;
   lastSession: string;
   count?: number; 
};

export default function DashboardUsersPage() {
   const { directusClient } = useDashboardAuth();
   const [users, setUsers] = useState<UserSession[]>([]);
   const [isLoading, setIsLoading] = useState(true);
   const [page, setPage] = useState(1);
   const [hasMore, setHasMore] = useState(true);
   const [isLoadingMore, setIsLoadingMore] = useState(false);
   const [sortBy, setSortBy] = useState<'date' | 'count'>('date');
   const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

   const loadUsers = useCallback(async (pageNum: number) => {
      if (!directusClient) return;
      if (pageNum === 1) setIsLoading(true);
      else setIsLoadingMore(true);

      const service = new DashboardService(directusClient);
      const newUsers = await service.getSessionsPaginated(pageNum, 50, sortBy, sortOrder);
      
      if (newUsers.length < 50) {
          setHasMore(false);
      } else {
          setHasMore(true); // crude check, ideally fetch count
      }
      
      setUsers(prev => pageNum === 1 ? newUsers : [...prev, ...newUsers]);
      
      setIsLoading(false);
      setIsLoadingMore(false);
   }, [directusClient, sortBy, sortOrder]);

   useEffect(() => {
     setPage(1);
     loadUsers(1);
   }, [loadUsers]);

   const loadMore = () => {
       if (!isLoadingMore && hasMore) {
           const nextPage = page + 1;
           setPage(nextPage);
           loadUsers(nextPage);
       }
   };

   const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleString('sk-SK', {
         year: 'numeric',
         month: 'long',
         day: 'numeric',
         hour: '2-digit',
         minute: '2-digit',
      });
   };

   const handleSort = (criteria: 'date' | 'count') => {
      if (sortBy === criteria) {
          setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
      } else {
          setSortBy(criteria);
          setSortOrder('desc');
      }
   };

   return (
      <AuthGuard>
         <div className="min-h-screen bg-gray-900 p-8">
            <div className="max-w-7xl mx-auto">
               <DashboardHeader>
                  <Link
                     href="/dashboard"
                     className="text-red-400 hover:text-red-300 transition"
                  >
                     ← Back to Dashboard
                  </Link>
                  <h1 className="text-4xl font-bold text-white">Users</h1>
               </DashboardHeader>

               {isLoading ? (
                  <div className="text-white text-center">Loading users...</div>
               ) : (
                  <>
                     <div className="bg-gray-800 rounded-lg p-6 mb-6">
                        <div className="text-gray-400">
                           Loaded listeners: <span className="text-white font-semibold">{users.length}</span>
                        </div>
                     </div>

                     <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                        <h2 className="text-2xl font-bold text-white">Listeners List</h2>
                        
                        <div className="flex gap-4">
                           <button 
                              onClick={() => handleSort('date')}
                              className={`px-4 py-2 rounded flex items-center gap-2 transition ${
                                 sortBy === 'date' 
                                    ? 'bg-red-600 text-white hover:bg-red-500' 
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                              }`}
                           >
                              Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                           </button>
                           
                           <button 
                              onClick={() => handleSort('count')}
                              className={`px-4 py-2 rounded flex items-center gap-2 transition ${
                                 sortBy === 'count' 
                                    ? 'bg-red-600 text-white hover:bg-red-500' 
                                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                              }`}
                           >
                              Episodes {sortBy === 'count' && (sortOrder === 'asc' ? '↑' : '↓')}
                           </button>
                        </div>
                     </div>

                     <div className="space-y-4">
                        {users.map((user, i) => (
                           <Link
                              key={`${user.session_id}-${i}`}
                              href={`/dashboard/users/${user.session_id}`}
                              className="block bg-gray-800 rounded-lg p-6 hover:bg-gray-700 transition"
                           >
                              <div className="flex justify-between items-center">
                                 <div className="flex-1">
                                    <div className="text-white font-medium font-mono mb-1">
                                       {user.session_id}
                                    </div>
                                    <div className="text-gray-400 text-sm">
                                       Session ID
                                    </div>
                                 </div>
                                 
                                 <div className="text-right flex items-center gap-8">
                                    <div className="text-right">
                                       <div className="text-white font-medium">
                                          {user.count || 0}
                                       </div>
                                       <div className="text-gray-400 text-sm">
                                          Episodes
                                       </div>
                                    </div>
                                    <div className="text-right w-32">
                                       <div className="text-white font-medium">
                                          {formatDate(user.lastSession)}
                                       </div>
                                       <div className="text-gray-400 text-sm">
                                          Last Active
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </Link>
                        ))}
                     </div>
                     
                     {hasMore && (
                        <div className="mt-8 text-center">
                            <button 
                                onClick={loadMore}
                                disabled={isLoadingMore}
                                className="px-6 py-3 bg-gray-800 text-white rounded hover:bg-gray-700 transition disabled:opacity-50"
                            >
                                {isLoadingMore ? 'Loading...' : 'Load More Users'}
                            </button>
                        </div>
                     )}

                     {users.length === 0 && (
                        <div className="text-center text-gray-400 mt-12">
                           No users found.
                        </div>
                     )}
                  </>
               )}
            </div>
         </div>
      </AuthGuard>
   );
}
