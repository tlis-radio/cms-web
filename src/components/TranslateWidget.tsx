'use client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLanguage } from '@fortawesome/free-solid-svg-icons';
import { useEffect, useRef, useState } from 'react';

const TranslateWidget = () => {
   const [isOpen, setIsOpen] = useState(false);
   const wrapperRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      // Load Google Translate script
      if (!document.querySelector('script[src*="translate.google.com"]')) {
         const script = document.createElement('script');
         script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
         script.async = true;
         document.body.appendChild(script);
         console.log(script);
      }

      // Initialize Google Translate
      (window as any).googleTranslateElementInit = () => {
         try {
            new (window as any).google.translate.TranslateElement(
               { pageLanguage: 'sk', includedLanguages: 'en,uk,es,tpi,de' },
               'google_translate_element'
            );
         } catch (e) {
            console.error('Google Translate initialization error:', e);
         }
      };
   }, []);

   useEffect(() => {
      // Close dropdown when clicking outside
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

   const toggleWidget = () => {
      setIsOpen(!isOpen);
   };

   return (
      <div className="relative max-[500px]:hidden" ref={wrapperRef}>
         <button
            onClick={toggleWidget}
            className="flex h-8 w-8 items-center justify-center border-2 rounded-3xl hover:text-[#96120F] hover:bg-white transition-colors"
            aria-label="Translate page"
         >
            <FontAwesomeIcon className="text-xl" icon={faLanguage} />
         </button>

         <div 
            className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg p-4 z-50 min-w-[200px]"
            style={{ display: isOpen ? 'block' : 'none' }}
         >
            <div id="translate-wrapper">
               <div id="google_translate_element"></div>
            </div>
         </div>
      </div>
   );
};

export default TranslateWidget;
