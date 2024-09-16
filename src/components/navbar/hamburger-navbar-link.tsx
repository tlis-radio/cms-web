import { FunctionComponent } from "react";
import Link from 'next/link';

type NavbarLinkProps = {
   text: string,
   redirectUrl: string
}

const HamburgerNavbarLink: FunctionComponent<NavbarLinkProps> = ({ text, redirectUrl }) => {
   return (
      <Link href={redirectUrl} className="py-6 transition-colors text-xl w-full">
         <p className="font-argentumSansLight">{text}</p>
      </Link>
   )
}

export default HamburgerNavbarLink;