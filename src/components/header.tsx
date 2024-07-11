import Player from "./player";
import Image from "next/image";
import Socials from "./socials";
import logo from "../../public/03_TLIS_logo2020_white_no-bkg.svg";

const Header = () => {
   return (
      <header className='bg-[#96120F] flex flex-row justify-between h-full w-full pr-4'>
         <Image
            src={logo}
            alt="Logo"
            height={80}
            priority={true}
         />
         <Player />
         <Socials />
      </header>
   )
}
export default Header;