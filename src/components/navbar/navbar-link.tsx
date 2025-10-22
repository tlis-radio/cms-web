import { FunctionComponent } from "react";
import Link from 'next/link';

type NavbarLinkProps = {
   text: string,
   redirectUrl: string,
   target?: string
   className?: string
}

const NavbarLink: FunctionComponent<NavbarLinkProps> = ({ text, redirectUrl, target, className }) => {
   return <Link href={redirectUrl} className={`hidden lg:block hover:text-[#96120F] hover:bg-white px-2 transition-colors whitespace-nowrap uppercase ${className ?? ''}`} target={target}>
      {text}
   </Link>
}

export default NavbarLink;