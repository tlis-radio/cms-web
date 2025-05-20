/** 
 * import dynamic from 'next/dynamic';
 * const Lazymap = dynamic(() => import("./map"), {
 * ssr: false,
 * loading: () => <p>Loading...</p>,
 * });
*/

const Footer = () => {
   return (
      <footer className='bg-[#111111] text-white w-full py-8 px-4 mt-auto'>
         <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
               {/* Logo and basic info */}
               <div className="flex flex-col items-center md:items-start">
                  <h3 className="font-argentumSansMedium text-xl mb-2">Študentské rádio TLIS</h3>
                  <p className="text-gray-400 text-sm">Vysielame alternatívu od roku 1981</p>
               </div>

               {/* Social media links */}
               <div className="flex flex-col items-center md:items-end">
                  <h4 className="font-argentumSansMedium mb-3">Sledujte nás</h4>
                  <div className="flex gap-4">
                     <a
                        href="https://instagram.com/radiotlis"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#d43c4a] hover:bg-[#b83744] w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                        aria-label="Instagram"
                     >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                           <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                           <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                           <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                        </svg>
                     </a>
                     <a
                        href="https://facebook.com/radiotlis"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#d43c4a] hover:bg-[#b83744] w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                        aria-label="Facebook"
                     >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                           <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                        </svg>
                     </a>
                     <a
                        href="https://youtube.com/@radiotlis"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-[#d43c4a] hover:bg-[#b83744] w-10 h-10 rounded-full flex items-center justify-center transition-colors"
                        aria-label="YouTube"
                     >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                           <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                           <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                        </svg>
                     </a>
                  </div>
               </div>
            </div>

            {/* Copyright and links */}
            <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
               <p className="text-gray-400 text-sm">© {new Date().getFullYear()} Študentské rádio TLIS. Všetky práva vyhradené.</p>
               <div className="flex gap-4">
                  <a href="/relacie" className="text-gray-400 hover:text-white text-sm transition-colors">Program</a>
                  <a href="/relacie" className="text-gray-400 hover:text-white text-sm transition-colors">Archív</a>
                  <a href="/o-nas" className="text-gray-400 hover:text-white text-sm transition-colors">O nás</a>
               </div>
            </div>
         </div>
      </footer>
   )
}
export default Footer;