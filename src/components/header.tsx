import PlayerComponent from "./player";
import Image from "next/image";
import Socials from "./socials";
import logo from "@/../public/images/03_TLIS_logo2020_white_no-bkg.svg";
import Navbar from "./navbar";
import Link from "next/link";

const Header = () => {
   return (
      <header className='bg-[#96120F] text-white pr-4 fixed w-full'>
         <div className='flex flex-row justify-between h-[80px] w-full'>
            <Link href={"/"}>
            <Image
               src={logo}
               alt="Logo"
               height={80}
               priority={true}
            />
            </Link>
            <PlayerComponent />
            <Socials />
         </div>
         <Navbar />
      </header>
   )
}
export default Header;