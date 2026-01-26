'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createDirectus, authentication, rest, RestClient, readMe, staticToken } from '@directus/sdk';

interface UserInfo {
   id: string;
   first_name?: string;
   last_name?: string;
   email: string;
}

interface DashboardAuthContextType {
   isAuthenticated: boolean;
   isLoading: boolean;
   user: UserInfo | null;
   login: (email: string, password: string) => Promise<boolean>;
   logout: () => void;
   directusClient: RestClient<any> | null;
}

const DashboardAuthContext = createContext<DashboardAuthContextType | undefined>(undefined);

const COOKIE_NAME = 'directus_dashboard_token';
const COOKIE_MAX_AGE = 86400; // 1 day in seconds

export function DashboardAuthProvider({ children }: { children: React.ReactNode }) {
   const [isAuthenticated, setIsAuthenticated] = useState(false);
   const [isLoading, setIsLoading] = useState(true);
   const [user, setUser] = useState<UserInfo | null>(null);
   const [directusClient, setDirectusClient] = useState<RestClient<any> | null>(null);

   const initializeClient = useCallback(async (token: string) => {
      const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;
      if (!directusUrl) {
         console.error('NEXT_PUBLIC_DIRECTUS_URL is not set');
         return null;
      }

      const client = createDirectus(directusUrl)
         .with(staticToken(token))
         .with(rest());
      
      return client;
   }, []);

   const getCookie = (name: string): string | null => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
      return null;
   };

   const setCookie = (name: string, value: string, maxAge: number) => {
      document.cookie = `${name}=${value}; max-age=${maxAge}; path=/; SameSite=Strict`;
   };

   const deleteCookie = (name: string) => {
      document.cookie = `${name}=; max-age=0; path=/;`;
   };

   // Check for existing auth token on mount
   useEffect(() => {
      const token = getCookie(COOKIE_NAME);
      if (token) {
         initializeClient(token).then(async (client) => {
            if (client) {
               try {
                  const userInfo = await client.request(readMe());
                  setUser(userInfo as UserInfo);
                  setDirectusClient(client);
                  setIsAuthenticated(true);
               } catch (error) {
                  console.error('Failed to fetch user info:', error);
                  deleteCookie(COOKIE_NAME);
               } finally {
                  setIsLoading(false);
               }
            } else {
               setIsLoading(false);
            }
         });
      } else {
         setIsLoading(false);
      }
   }, [initializeClient]);

   const login = async (email: string, password: string): Promise<boolean> => {
      try {
         const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL;
         if (!directusUrl) {
            console.error('NEXT_PUBLIC_DIRECTUS_URL is not set');
            return false;
         }

         const client = createDirectus(directusUrl)
            .with(authentication('json'))
            .with(rest());

         await client.login(email, password);
         
         // Get the token from the client
         const token = await client.getToken();
         
         if (token) {
            setCookie(COOKIE_NAME, token, COOKIE_MAX_AGE);
            
            // Fetch user info
            try {
               const userInfo = await client.request(readMe());
               setUser(userInfo as UserInfo);
               setDirectusClient(client);
               setIsAuthenticated(true);
               return true;
            } catch (error) {
               console.error('Failed to fetch user info after login:', error);
               deleteCookie(COOKIE_NAME);
               return false;
            }
         }
         
         return false;
      } catch (error) {
         console.error('Login failed:', error);
         return false;
      }
   };

   const logout = () => {
      deleteCookie(COOKIE_NAME);
      setDirectusClient(null);
      setUser(null);
      setIsAuthenticated(false);
   };

   return (
      <DashboardAuthContext.Provider
         value={{
            isAuthenticated,
            isLoading,
            user,
            login,
            logout,
            directusClient,
         }}
      >
         {children}
      </DashboardAuthContext.Provider>
   );
}

export function useDashboardAuth() {
   const context = useContext(DashboardAuthContext);
   if (context === undefined) {
      throw new Error('useDashboardAuth must be used within a DashboardAuthProvider');
   }
   return context;
}
