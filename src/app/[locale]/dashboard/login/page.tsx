'use client';

import { useState, useEffect } from 'react';
import { useRouter } from '@/navigation'; 
import { useDashboardAuth } from '@/context/DashboardAuthContext';
import { useTranslations } from 'next-intl';

export default function LoginPage() {
   const t = useTranslations('DashboardLogin');
   const [email, setEmail] = useState('');
   const [password, setPassword] = useState('');
   const [error, setError] = useState('');
   const [isLoading, setIsLoading] = useState(false);
   const { login, isAuthenticated } = useDashboardAuth();
   const router = useRouter();

   useEffect(() => {
      if (isAuthenticated) {
         router.push('/dashboard');
      }
   }, [isAuthenticated, router]);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setError('');
      setIsLoading(true);

      try {
         const success = await login(email, password);
         if (success) {
            router.push('/dashboard');
         } else {
            setError(t('error'));
         }
      } catch (err) {
         setError('An error occurred');
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
         <div className="max-w-md w-full space-y-8 p-8 bg-gray-800 rounded-lg shadow-xl">
            <div>
               <h2 className="text-center text-3xl font-bold text-white">
                  {t('title')}
               </h2>
               <p className="mt-2 text-center text-sm text-gray-400">
                  {t('description')}
               </p>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
               <div className="rounded-md shadow-sm space-y-4">
                  <div>
                     <label htmlFor="email" className="sr-only">{t('email_label')}</label>
                     <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-600 bg-gray-700 placeholder-gray-400 text-white focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                        placeholder={t('email_label')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                     />
                  </div>
                  <div>
                     <label htmlFor="password" className="sr-only">{t('password_label')}</label>
                     <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-600 bg-gray-700 placeholder-gray-400 text-white focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                        placeholder={t('password_label')}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                     />
                  </div>
               </div>

               {error && (
                  <div className="rounded-md bg-red-900/50 p-4">
                     <p className="text-sm text-red-200">{error}</p>
                  </div>
               )}

               <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
               >
                  {isLoading ? t('loading') : t('button')}
               </button>
            </form>
         </div>
      </div>
   );
}