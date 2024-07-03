import Image from "next/image";
import Socials from "./socials";
import Player from "./player";
import logo from "../../public/03_TLIS_logo2020_white_no-bkg.svg";
import { isMobile, isTablet } from "react-device-detect";

const Header = () => {
   return (
      <header className='bg-cyan-500 flex flex-row justify-between h-full w-full p-4'>
         <div className='bg-[#96120F]'>
            <Image
               src={logo}
               alt="Logo"
               height={64}
               priority={true}
            />
         </div>
         {(!isMobile || isTablet) && <Player />}
         <Socials />
      </header>
   )
}
export default Header;