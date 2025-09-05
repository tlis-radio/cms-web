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
   return (
      <Link prefetch={prefetch} href={redirectUrl} className={`hidden lg:block hover:text-[#96120F] hover:bg-white px-2 transition-colors ${className??''}`} target={target}>
         {text}
      </Link>
   )
}

export default NavbarLink;