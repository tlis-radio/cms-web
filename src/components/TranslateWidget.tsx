'use client';

import 'flag-icons/css/flag-icons.min.css';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl'; // 1. Import useTranslationsimport { UmamiTrack } from "@/components/Analytics";
import { UmamiTrack } from './Analytics';

// Material Icons "translate" glyph - not part of FontAwesome's free set. Rendered
// as a plain SVG (rather than through FontAwesomeIcon) so a stroke can be added
// on top of the fill, bulking up the linework to match FontAwesome's bolder,
// rounder solid-icon style used by the rest of the header.
const TranslateIcon = ({ className }: { className?: string }) => (
   <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="0.75"
      strokeLinejoin="round"
      strokeLinecap="round"
   >
      <path d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z" />
   </svg>
);

const TranslateWidget = () => {
   const t = useTranslations('navbar'); // 2. Initialize translations (using 'navbar' namespace based on your JSON files)
   const [isOpen, setIsOpen] = useState(false);
   const wrapperRef = useRef<HTMLDivElement>(null);
   const pathname = usePathname() || '/';

   const languages = [
      { code: 'sk', name: 'Slovenčina', flagCode: 'sk' },
      { code: 'en', name: 'English', flagCode: 'gb' },
      { code: 'de', name: 'Deutsch', flagCode: 'de' },
      { code: 'es', name: 'Español', flagCode: 'es' },
      { code: 'uk', name: 'Українська', flagCode: 'ua' },
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
            className="flex h-8 w-8 items-center justify-center border-2 rounded-3xl hover:text-[#96120F] hover:bg-white transition-all shadow-sm focus:outline-none"
            aria-label="Change language"
         >
            <TranslateIcon className="w-[18px] h-[18px]" />
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
                        onClick={() => {
                           UmamiTrack("language_change", { locale: lang.code });
                           setIsOpen(false);
                        }}
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 rounded-lg transition-colors text-gray-700 hover:text-[#96120F]"
                     >
                        <span className={`fi fi-${lang.flagCode} rounded-sm text-lg`}></span>
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
