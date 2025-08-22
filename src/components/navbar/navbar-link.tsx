import { FunctionComponent } from "react";
import Link from 'next/link';

type NavbarLinkProps = {
   text: string,
   redirectUrl: string,
   target?: string
}

const NavbarLink: FunctionComponent<NavbarLinkProps> = ({ text, redirectUrl, target }) => {
   return (
      <Link href={redirectUrl} className="hidden lg:block hover:text-[#96120F] hover:bg-white px-2 transition-colors" target={target}>
         {text}
      </Link>
   )
}

export default NavbarLink;