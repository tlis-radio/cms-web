import { FunctionComponent } from "react";
import Link from 'next/link';

type NavbarLinkProps = {
   text: string,
   redirectUrl: string
}

const NavbarLink: FunctionComponent<NavbarLinkProps> = ({ text, redirectUrl }) => {
   // TODO: "hidden lg:block" into className to hide navbar on mobile devices after hamburger menu is done 
   return (
      <Link href={redirectUrl} className="hover:text-[#96120F] hover:bg-white px-2 transition-colors">
         {text}
      </Link>
   )
}

export default NavbarLink;