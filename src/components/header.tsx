import PlayerComponent from "./player";
import Image from "next/image";
import Socials from "./socials";
import logo from "@/../public/images/03_TLIS_logo2020_white_no-bkg.svg";
import Navbar, { getMarqueeLinks, getNavbarLinks } from "./navbar";
import Hamburger from "./navbar/hamburger";
import Link from "next/link";
import Marquee from "./navbar/marquee";

const Header = async () => {
   var navbarLinks = await getNavbarLinks();
   var marqueeLinks = await getMarqueeLinks();
   
   return (
      <header className='bg-[#96120F] text-white fixed w-full z-20'>
         <div className='flex flex-row justify-between h-[80px] w-full max-w-7xl mx-auto'>
            <Link href={"/"}>
               <Image
                  src={logo}
                  alt="Logo"
                  height={80}
                  priority={true}
               />
            </Link>
            <PlayerComponent />
            <Socials mobile={"desktop"} />
            <Hamburger navbarLinks={navbarLinks} />
         </div>
         <Navbar navbarLinks={navbarLinks} />
         <Marquee data={marqueeLinks} />
      </header>
   )
}
export default Header;