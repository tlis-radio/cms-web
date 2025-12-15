/** 
 * import dynamic from 'next/dynamic';
 * const Lazymap = dynamic(() => import("./map"), {
 * ssr: false,
 * loading: () => <p>Loading...</p>,
 * });
*/


import Link from "next/link";
import Socials from "./socials";
import { faSpotify, faMixcloud, faSoundcloud, faYoutube } from "@fortawesome/free-brands-svg-icons";
import { IconDefinition } from "@fortawesome/fontawesome-svg-core";

// Custom playlist icon definition
export const CustomPlaylistIcon: IconDefinition = {
   icon: [
      24, // width
      24, // height
      [], // ligatures
      "e001", // unicode

      // SVG path data for the playlist icon
      "M2.25 6C2.25 5.58579 2.58579 5.25 3 5.25H21C21.4142 5.25 21.75 5.58579 21.75 6C21.75 6.41421 21.4142 6.75 21 6.75H3C2.58579 6.75 2.25 6.41421 2.25 6ZM2.25 10C2.25 9.58579 2.58579 9.25 3 9.25H21C21.4142 9.25 21.75 9.58579 21.75 10C21.75 10.4142 21.4142 10.75 21 10.75H3C2.58579 10.75 2.25 10.4142 2.25 10ZM2.25 14C2.25 13.5858 2.58579 13.25 3 13.25H11C11.4142 13.25 11.75 13.5858 11.75 14C11.75 14.4142 11.4142 14.75 11 14.75H3C2.58579 14.75 2.25 14.4142 2.25 14ZM2.25 18C2.25 17.5858 2.58579 17.25 3 17.25H11C11.4142 17.25 11.75 17.5858 11.75 18C11.75 18.4142 11.4142 18.75 11 18.75H3C2.58579 18.75 2.25 18.4142 2.25 18Z M18.875 14.1184C20.5288 15.0733 21.3558 15.5507 21.4772 16.2395C21.5076 16.4118 21.5076 16.5882 21.4772 16.7605C21.3558 17.4493 20.5288 17.9267 18.875 18.8816C17.2212 19.8364 16.3942 20.3138 15.737 20.0746C15.5725 20.0148 15.4199 19.9266 15.2858 19.8141C14.75 19.3645 14.75 18.4097 14.75 16.5C14.75 14.5903 14.75 13.6355 15.2858 13.1859C15.4199 13.0734 15.5725 12.9852 15.737 12.9254C16.3942 12.6862 17.2212 13.1636 18.875 14.1184Z"
   ],
   prefix: "fas",
   iconName: "function"
};

const Footer = () => {
   return (
      <footer className="bg-[#0b0b0b] text-gray-100 w-full mt-auto">
         <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
               {/* Brand / About */}
               <div className="pr-0 md:pr-12 lg:pr-20">
                  <Link href="/" className="inline-block">
                     <h3 className="text-2xl font-argentumSansBold tracking-tight">Radio TLIS</h3>
                  </Link>
                  <p className="font-argentumSansLight mt-3 text-sm text-gray-400 max-w-sm">
                     Jediné študentské, komunitné a alternatívne rádio
                      v Bratislave.
                  </p>
               </div>

               {/* Column: Explore */}
               <div>
                  <h4 className="text-sm font-argentumSansBold mb-3 text-gray-200">Prehliadať</h4>
                  <ul className="font-argentumSansLight space-y-2 text-sm text-gray-400">
                     <li><Link href="/" className="hover:text-white">Domov</Link></li>
                     <li><Link href="/program" className="hover:text-white">Program</Link></li>
                     <li><Link href="/relacie" className="hover:text-white">Relácie</Link></li>
                     <li><Link href="https://www.radia.sk/radia/tlis/playlist" target="_blank" className="hover:text-white">Playlist</Link></li>
                  </ul>
               </div>

               {/* Column: More Links */}
               <div>
                  <h4 className="text-sm font-argentumSansBold mb-3 text-gray-200">O rádiu</h4>
                  <ul className="font-argentumSansLight space-y-2 text-sm text-gray-400">
                     <li><Link href="/o-radiu" className="hover:text-white">Kto sme</Link></li>
                     <li><Link href="/dve-percenta" className="hover:text-white">Dve percentá</Link></li>
                     {/* <li><Link href="/o-radiu/kontakt" className="hover:text-white">Kontakt</Link></li> */}
                     {/* <li><Link href="/o-radiu/partneri" className="hover:text-white">Partneri</Link></li> */}
                  </ul>
               </div>

               {/* Column: Legal */}
               <div className="flex flex-col md:items-start">
                  <h4 className="text-sm font-argentumSansBold mb-3 text-gray-200">Právne</h4>
                  <ul className="font-argentumSansLight space-y-2 text-sm text-gray-400 mb-4">
                     <li><Link href="/gdpr" className="hover:text-white">GDPR</Link></li>
                     <li><Link href="/tos" className="hover:text-white">Zásady používania</Link></li>
                  </ul>
               </div>

               {/* Column: Contact */}
               <div className="flex flex-col md:items-start">
                  <h4 className="text-sm font-argentumSansBold mb-3 text-gray-200">Kontakt</h4>
                  <ul className="font-argentumSansLight space-y-2 text-sm text-gray-400 mb-4">
                     <li><Link href="mailto:radio@tlis.sk" className="hover:text-white">radio@tlis.sk</Link></li>
                     <li><Link href="mailto:media@tlis.sk" className="hover:text-white">media@tlis.sk</Link></li>
                     <li><Link href="mailto:sef@tlis.sk" className="hover:text-white">sef@tlis.sk</Link></li>
                  </ul>
               </div>
               </div>

            {/* Socials as a separate full-width row (row 2) */}
            <div className="mt-6 md:mt-8">
               <div className="flex justify-center md:justify-end">
                  <Socials mobile={'both'}
                     additionalLinks={[
                        { icon: faYoutube, url: "https://youtube.com/@radiotlis" },
                        { icon: faSpotify, url: "https://open.spotify.com/user/wskoqdo1mcisldwdvmzgj8bvf" },
                        { icon: faSoundcloud, url: "https://soundcloud.com/radiotlis" },
                        { icon: faMixcloud, url: "https://mixcloud.com/radiotlis" }
                     ]} />
               </div>
            </div>

            <div className="mt-8 border-t border-gray-800 pt-6">
               <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                  <p className="text-sm text-gray-500">© {new Date().getFullYear()} Radio TLIS. Všetky práva vyhradené. | <a href="https://webenta.sk">Webové služby Webenta</a></p>
                  <p className="text-sm text-gray-500">strictly alternative</p>
               </div>
            </div>
         </div>
      </footer>
   );
}
export default Footer;