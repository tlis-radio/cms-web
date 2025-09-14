/** 
 * import dynamic from 'next/dynamic';
 * const Lazymap = dynamic(() => import("./map"), {
 * ssr: false,
 * loading: () => <p>Loading...</p>,
 * });
*/


import Link from "next/link";
import Socials from "./socials";

const Footer = () => {
   return (
      <footer className='bg-[#111111] text-white w-full py-8 px-4 mt-auto'>
         <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
               {/* Logo and basic info */}
               <div className="flex flex-col items-center md:items-start">
                  <h3 className="font-argentumSansMedium text-xl mb-2">Študentské rádio TLIS</h3>
                  <p className="text-gray-400 text-sm">Vysielame alternatívu od roku 1981</p>
               </div>

               {/* Social media links */}
               <div className="flex flex-col items-center md:items-end">
                  <h4 className="font-argentumSansMedium mb-3">Sledujte nás</h4>
                  <Socials mobile={'both'} />
               </div>
            </div>

            {/* Copyright and links */}
            <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
               <p className="text-gray-400 text-sm">© {new Date().getFullYear()} Študentské rádio TLIS. Všetky práva vyhradené.</p>
               <div className="flex gap-4">
                  <Link href="/program" className="text-gray-400 hover:text-white text-sm transition-colors">Program</Link>
                  <Link href="/relacie" className="text-gray-400 hover:text-white text-sm transition-colors">Archív</Link>
                  <Link href="/o-nas" className="text-gray-400 hover:text-white text-sm transition-colors">O nás</Link>
               </div>
            </div>
         </div>
      </footer>
   )
}
export default Footer;