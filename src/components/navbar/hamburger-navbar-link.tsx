import { FunctionComponent } from "react";
import Link from 'next/link';

type NavbarLinkProps = {
   text: string,
   redirectUrl: string
}

const HamburgerNavbarLink: FunctionComponent<NavbarLinkProps> = ({ text, redirectUrl }) => {
   return (
      <Link href={redirectUrl} className="px-2 transition-colors font-argentumSansRegular text-xl w-full">
         {text}
      </Link>
   )
}

export default HamburgerNavbarLink;