import Image from "next/image";
import Socials from "./socials";
import logo from "../../public/03_TLIS_logo2020_white_no-bkg.svg";

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
         <div className='flex items-center'>
            Header
         </div>
         <Socials />
      </header>
   )
}
export default Header;