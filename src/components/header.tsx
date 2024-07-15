import PlayerComponent from "./player";
import Image from "next/image";
import Socials from "./socials";
import logo from "../../public/03_TLIS_logo2020_white_no-bkg.svg";

const Header = () => {
   return (
      <header className='bg-[#96120F] flex flex-row justify-between h-[80px] w-full pr-4'>
         <Image
            src={logo}
            alt="Logo"
            height={80}
            priority={true}
         />
         <PlayerComponent />
         <Socials />
      </header>
   )
}
export default Header;