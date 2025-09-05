import { FunctionComponent } from "react";
import Link from 'next/link';

type NavbarLinkProps = {
   text: string,
   redirectUrl: string,
   target?: string
   className?: string
   prefetch?: boolean
}

const NavbarLink: FunctionComponent<NavbarLinkProps> = ({ text, redirectUrl, target, className, prefetch }) => {
   /* Only use <Link> for internal navigation */
   return prefetch ?
      <Link prefetch={prefetch} href={redirectUrl} className={`hidden lg:block hover:text-[#96120F] hover:bg-white px-2 transition-colors ${className ?? ''}`} target={target}>
         {text}
      </Link> :
      <a href={redirectUrl} className={`hidden lg:block hover:text-[#96120F] hover:bg-white px-2 transition-colors ${className ?? ''}`} target={target}>
         {text}
      </a>
}

export default NavbarLink;