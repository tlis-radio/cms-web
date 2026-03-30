'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLanguage } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl'; // 1. Import useTranslations

const TranslateWidget = () => {
   const t = useTranslations('navbar'); // 2. Initialize translations (using 'navbar' namespace based on your JSON files)
   const [isOpen, setIsOpen] = useState(false);
   const wrapperRef = useRef<HTMLDivElement>(null);
   const pathname = usePathname() || '/'; 

   const languages = [
      { code: 'sk', name: 'Slovenčina', flag: '🇸🇰' },
      { code: 'en', name: 'English', flag: '🇬🇧' },
      { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
      { code: 'es', name: 'Español', flag: '🇪🇸' },
      { code: 'uk', name: 'Українська', flag: '🇺🇦' },
   ];

   /**
    * Handles URL transformation:
    * 1. If switching to 'sk', remove any existing lang prefix.
    * 2. If switching to others, replace or add the prefix.
    */
   const getLanguagePath = (targetCode: string) => {
      const segments = pathname.split('/').filter(Boolean);
      const supportedCodes = languages.map(l => l.code);
      
      const currentFirstSegment = segments[0];
      const hasLangPrefix = supportedCodes.includes(currentFirstSegment);

      // Get the path without the language prefix
      const cleanPathSegments = hasLangPrefix ? segments.slice(1) : segments;
      const cleanPath = `/${cleanPathSegments.join('/')}`;

      // All locales are prefixed under localePrefix: 'always'
      return `/${targetCode}${cleanPath === '/' ? '' : cleanPath}`;
   };

   // Close dropdown when clicking outside
   useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
         if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
            setIsOpen(false);
         }
      };
      if (isOpen) {
         document.addEventListener('mousedown', handleClickOutside);
      }
      return () => {
         document.removeEventListener('mousedown', handleClickOutside);
      };
   }, [isOpen]);

   return (
      <div className="relative max-[500px]:hidden" ref={wrapperRef}>
         <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex h-10 w-10 items-center justify-center border-2 rounded-full hover:text-[#96120F] hover:bg-white transition-all shadow-sm focus:outline-none"
            aria-label="Change language"
         >
            <FontAwesomeIcon className="text-xl" icon={faLanguage} />
         </button>

         {isOpen && (
            <div className="absolute top-full right-0 mt-3 bg-white rounded-xl shadow-2xl p-2 z-50 min-w-[200px] border border-gray-100 animate-in fade-in zoom-in duration-200">
               <div className="flex flex-col gap-1">
                  {/* 3. Use the translation key instead of hardcoded "Jazyk" */}
                  <p className="px-4 py-2 text-xs font-bold uppercase text-gray-400">
                     {t('language_label' as any) || 'Jazyk'} 
                  </p>
                  <hr className="mb-1 border-gray-50" />
                  
                  {languages.map((lang) => (
                     <Link
                        key={lang.code}
                        href={getLanguagePath(lang.code)}
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 rounded-lg transition-colors text-gray-700 hover:text-[#96120F]"
                     >
                        <span className="text-xl leading-none">{lang.flag}</span>
                        <span className="font-medium text-sm">{lang.name}</span>
                        {/* Checkmark for active language */}
                        {(pathname.startsWith(`/${lang.code}`) || (lang.code === 'sk' && !languages.some(l => l.code !== 'sk' && pathname.startsWith(`/${l.code}`)))) && (
                           <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[#96120F]" />
                        )}
                     </Link>
                  ))}
               </div>
            </div>
         )}
      </div>
   );
};

export default TranslateWidget;