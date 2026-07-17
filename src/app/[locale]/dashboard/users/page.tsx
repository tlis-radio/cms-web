'use client';

import { useDashboardAuth } from '@/context/DashboardAuthContext';
import { DashboardService } from '@/lib/dashboard/dashboard-service';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import FilterBar from '@/components/dashboard/FilterBar';
import Select from '@/components/primitives/Select';
import UserDetailModal from '@/components/dashboard/UserDetailModal';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const PAGE_SIZE = 50;
const PIE_COLORS = ['#6B7280', '#d43c4a'];

export default function DashboardUsersPage() {
   const { directusClient } = useDashboardAuth();
   const router = useRouter();
   const pathname = usePathname();
   const searchParams = useSearchParams();
   const [isLoading, setIsLoading] = useState(true);
   const [loadingProgress, setLoadingProgress] = useState(0);
   const [loadingMessage, setLoadingMessage] = useState('');
   const [dashboardData, setDashboardData] = useState<any>(null);
   const [showFilter, setShowFilter] = useState<string>('all');
   const [sortBy, setSortBy] = useState<'lastSeen' | 'episodeCount'>('lastSeen');
   const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
   const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
   const openSessionId = searchParams.get('session');

   const openUser = useCallback((sessionId: string) => {
      router.push(`${pathname}?session=${sessionId}`, { scroll: false });
   }, [router, pathname]);

   const closeUser = useCallback(() => {
      router.push(pathname, { scroll: false });
   }, [router, pathname]);

   useEffect(() => {
      if (directusClient && !dashboardData) {
         const service = new DashboardService(directusClient);
         service.getAllDashboardDataWithProgress((progress, message) => {
            setLoadingProgress(progress);
            setLoadingMessage(message);
         }).then((data) => {
            setDashboardData(data);
            setIsLoading(false);
         }).catch((error) => {
            console.error('Error loading users overview data:', error);
            setIsLoading(false);
         });
      }
   }, [directusClient, dashboardData]);

   useEffect(() => {
      setVisibleCount(PAGE_SIZE);
   }, [showFilter, sortBy, sortOrder]);

   const service = useMemo(() => (directusClient ? new DashboardService(directusClient) : null), [directusClient]);

   const overview = useMemo(() => {
      if (!service || !dashboardData) return null;
      const filter = showFilter !== 'all' ? { showId: Number(showFilter) } : undefined;
      return service.getUserOverviewStats(
         {
            listeningSessions: dashboardData.listeningSessions,
            listeningSessionsStream: dashboardData.listeningSessionsStream,
            episodes: dashboardData.episodes,
            shows: dashboardData.shows,
         },
         filter
      );
   }, [service, dashboardData, showFilter]);

   const episodesById = useMemo(() => {
      const map = new Map<string, any>();
      (dashboardData?.episodes || []).forEach((ep: any) => map.set(String(ep.id), ep));
      return map;
   }, [dashboardData]);

   const getFavoriteShowTitle = (episodeId: string | null) => {
      if (!episodeId) return '—';
      const ep = episodesById.get(episodeId);
      return ep?.Show_Id?.Title || '—';
   };

   const safeTime = (dateString: string) => {
      const t = new Date(dateString).getTime();
      return Number.isNaN(t) ? 0 : t;
   };

   const sortedUsers = useMemo(() => {
      if (!overview) return [];
      const arr = [...overview.users];
      arr.sort((a, b) => {
         const comparison =
            sortBy === 'episodeCount'
               ? a.episodeCount - b.episodeCount
               : safeTime(a.lastSeen) - safeTime(b.lastSeen);
         return sortOrder === 'asc' ? comparison : -comparison;
      });
      return arr;
   }, [overview, sortBy, sortOrder]);

   const handleSort = (criteria: 'lastSeen' | 'episodeCount') => {
      if (sortBy === criteria) {
         setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
      } else {
         setSortBy(criteria);
         setSortOrder('desc');
      }
   };

   const formatDate = (dateString: string) =>
      new Date(dateString).toLocaleString('sk-SK', {
         year: 'numeric',
         month: 'short',
         day: 'numeric',
         hour: '2-digit',
         minute: '2-digit',
      });

   const showOptions = [
      { value: 'all', label: 'Všetky relácie' },
      ...((dashboardData?.shows || []) as any[]).map((s) => ({ value: String(s.id), label: s.Title })),
   ];

   const bounceTotal = overview ? overview.bounceVsReturning.bounce + overview.bounceVsReturning.returning : 0;
   const bouncePct = bounceTotal > 0 && overview ? Math.round((overview.bounceVsReturning.bounce / bounceTotal) * 100) : 0;
   const returningPct = bounceTotal > 0 ? 100 - bouncePct : 0;

   const bounceAnonPct =
      overview && overview.bounceVsReturning.bounce > 0
         ? Math.round((overview.bounceAnonymity.anonymous / overview.bounceVsReturning.bounce) * 100)
         : 0;

   const pieData = overview
      ? [
           { name: 'Jednorazoví', value: overview.bounceVsReturning.bounce },
           { name: 'Vracajúci sa', value: overview.bounceVsReturning.returning },
        ]
      : [];

   return (
      <div className="max-w-7xl mx-auto">
         <FilterBar title="Poslucháči" data-tour="filter-bar">
            <Select
               compact
               searchable
               searchPlaceholder="Hľadať reláciu..."
               options={showOptions}
               value={showFilter}
               onChange={setShowFilter}
               className="bg-gray-800 text-white min-w-[280px]"
            />
            <button
               onClick={() => handleSort('lastSeen')}
               className={`px-3 py-1.5 text-xs rounded transition ${
                  sortBy === 'lastSeen' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
               }`}
            >
               Aktivita {sortBy === 'lastSeen' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
            <button
               onClick={() => handleSort('episodeCount')}
               className={`px-3 py-1.5 text-xs rounded transition ${
                  sortBy === 'episodeCount' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
               }`}
            >
               Epizódy {sortBy === 'episodeCount' && (sortOrder === 'asc' ? '↑' : '↓')}
            </button>
         </FilterBar>

         {isLoading ? (
            <div className="bg-gray-800 rounded-lg p-6 text-center mb-6">
               <h3 className="text-sm font-bold text-white mb-3">Načítavam dáta poslucháčov...</h3>
               <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden mb-2 max-w-md mx-auto">
                  <div
                     className="bg-blue-500 h-full transition-all duration-300 ease-out"
                     style={{ width: `${loadingProgress}%` }}
                  />
               </div>
               <p className="text-gray-400 text-xs">{loadingMessage}</p>
            </div>
         ) : overview ? (
            <>
               {/* Headline: bounce vs returning */}
               <div data-tour="users-bounce" className="bg-gray-800 rounded-lg p-4 mb-4">
                  <h2 className="text-sm font-semibold text-white mb-1">Jednorazoví vs. vracajúci sa poslucháči</h2>
                  <div className="text-gray-400 text-xs mb-3">
                     Jednorazový poslucháč (bounce) = presne jedna relácia s celkovým počúvaním pod 5 minút.
                  </div>
                  <div className="flex flex-col md:flex-row items-center gap-4">
                     <div className="w-full max-w-xs flex-shrink-0">
                        <ResponsiveContainer width="100%" height={200}>
                           <PieChart>
                              <Pie data={pieData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
                                 {pieData.map((entry, index) => (
                                    <Cell key={entry.name} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                 ))}
                              </Pie>
                              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} labelStyle={{ color: '#fff' }} />
                              <Legend />
                           </PieChart>
                        </ResponsiveContainer>
                     </div>
                     <div className="flex-1 grid grid-cols-2 gap-3 w-full">
                        <div className="bg-gray-700 rounded-lg p-3">
                           <div className="text-xs text-gray-400 mb-1">Jednorazoví (bounce)</div>
                           <div className="text-lg font-bold text-gray-300">
                              {overview.bounceVsReturning.bounce} ({bouncePct}%)
                           </div>
                           {overview.bounceVsReturning.bounce > 0 && (
                              <div className="mt-2 pt-2 border-t border-gray-600">
                                 <div className="text-[11px] text-gray-400">
                                    z toho <span className="text-gray-200 font-semibold">{overview.bounceAnonymity.anonymous}</span> ({bounceAnonPct}%) bez súhlasu s cookies
                                 </div>
                                 <div className="text-[10px] text-gray-500 mt-0.5 leading-snug">
                                    Nemusí ísť o jednorazových poslucháčov — bez cookies dostanú nové ID pri každej návšteve, takže sa môžu vracať pravidelne a my to nevidíme.
                                 </div>
                              </div>
                           )}
                        </div>
                        <div className="bg-gray-700 rounded-lg p-3">
                           <div className="text-xs text-gray-400 mb-1">Vracajúci sa</div>
                           <div className="text-lg font-bold text-[#d43c4a]">
                              {overview.bounceVsReturning.returning} ({returningPct}%)
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               {/* Secondary charts */}
               <div data-tour="users-charts" className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-800 rounded-lg p-4">
                     <h2 className="text-sm font-semibold text-white mb-3">Počet epizód na poslucháča</h2>
                     <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={overview.episodesPerUserHistogram}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                           <XAxis dataKey="bucket" stroke="#9CA3AF" />
                           <YAxis stroke="#9CA3AF" allowDecimals={false} />
                           <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} labelStyle={{ color: '#fff' }} />
                           <Bar dataKey="count" name="Poslucháči" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                     </ResponsiveContainer>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4">
                     <h2 className="text-sm font-semibold text-white mb-1">Rozloženie dopočutia</h2>
                     <div className="text-gray-400 text-xs mb-2">
                        Približný odhad — presnú dĺžku skladby nemáme vždy k dispozícii.
                     </div>
                     <ResponsiveContainer width="100%" height={190}>
                        <BarChart data={overview.completionDistribution}>
                           <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                           <XAxis dataKey="bucket" stroke="#9CA3AF" />
                           <YAxis stroke="#9CA3AF" allowDecimals={false} />
                           <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px' }} labelStyle={{ color: '#fff' }} />
                           <Bar dataKey="count" name="Poslucháči" fill="#A855F7" radius={[4, 4, 0, 0]} />
                        </BarChart>
                     </ResponsiveContainer>
                  </div>
               </div>

               {/* Table */}
               <div data-tour="users-table" className="bg-gray-800 rounded-lg p-4">
                  <h2 className="text-sm font-semibold text-white mb-3">Zoznam poslucháčov ({sortedUsers.length})</h2>
                  <div className="overflow-x-auto">
                     <table className="w-full text-sm">
                        <thead>
                           <tr className="border-b border-gray-700 text-left text-gray-400 text-xs">
                              <th className="py-1.5 px-2">#</th>
                              <th className="py-1.5 px-2">Posledná aktivita</th>
                              <th className="py-1.5 px-2">Epizódy</th>
                              <th className="py-1.5 px-2">Priem. dopočutie</th>
                              <th className="py-1.5 px-2">Obľúbená relácia</th>
                              <th className="py-1.5 px-2">Typ</th>
                              <th className="py-1.5 px-2"></th>
                           </tr>
                        </thead>
                        <tbody>
                           {sortedUsers.slice(0, visibleCount).map((u, i) => (
                              <tr key={u.sessionId} className="border-b border-gray-700 hover:bg-gray-700 transition">
                                 <td className="py-1.5 px-2 text-gray-400">{sortedUsers.length - i}</td>
                                 <td className="py-1.5 px-2 text-white text-xs">{formatDate(u.lastSeen)}</td>
                                 <td className="py-1.5 px-2 text-white text-xs">{u.episodeCount}</td>
                                 <td className="py-1.5 px-2 text-white text-xs">{u.avgCompletionPct.toFixed(0)}%</td>
                                 <td className="py-1.5 px-2 text-white text-xs">{getFavoriteShowTitle(u.favoriteEpisodeId)}</td>
                                 <td className="py-1.5 px-2">
                                    <span
                                       className={`px-1.5 py-0.5 rounded text-[10px] ${
                                          u.bounceClass === 'bounce' ? 'bg-gray-700 text-gray-300' : 'bg-red-900/40 text-red-200'
                                       }`}
                                    >
                                       {u.bounceClass === 'bounce' ? 'Jednorazový' : 'Vracajúci sa'}
                                    </span>
                                    {u.isAnonymous && (
                                       <span
                                          className="ml-1 px-1.5 py-0.5 rounded text-[10px] bg-gray-900 text-gray-500"
                                          title="Bez súhlasu s cookies — nevieme, či ide o naozaj nového poslucháča"
                                       >
                                          bez cookies
                                       </span>
                                    )}
                                 </td>
                                 <td className="py-1.5 px-2 text-right">
                                    <button onClick={() => openUser(u.sessionId)} className="text-red-400 hover:text-red-300 text-xs">
                                       Detail →
                                    </button>
                                 </td>
                              </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>
                  {visibleCount < sortedUsers.length && (
                     <div className="mt-4 text-center">
                        <button
                           onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                           className="px-4 py-2 text-xs bg-gray-700 text-white rounded hover:bg-gray-600 transition"
                        >
                           Zobraziť viac
                        </button>
                     </div>
                  )}
               </div>
            </>
         ) : null}

         {openSessionId && <UserDetailModal sessionId={openSessionId} onClose={closeUser} />}
      </div>
   );
}
