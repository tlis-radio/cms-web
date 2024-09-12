import { FunctionComponent } from "react";
import Link from 'next/link';

type NavbarLinkProps = {
   text: string,
   redirectUrl: string
}

const HamburgerNavbarLink: FunctionComponent<NavbarLinkProps> = ({ text, redirectUrl }) => {
   return (
      <Link href={redirectUrl} className="hover:text-[#96120F] hover:bg-white px-2 transition-colors font-argentumSansRegular text-xl">
         {text}
      </Link>
   )
}

export default HamburgerNavbarLink;