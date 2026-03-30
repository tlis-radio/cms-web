import { FunctionComponent } from "react";
import { Link } from '@/navigation';

type NavbarLinkProps = {
   text: string,
   redirectUrl: string,
   target?: string,
   locale?: string,
   className?: string
}

const NavbarLink: FunctionComponent<NavbarLinkProps> = ({ text, redirectUrl, target, locale, className }) => {
   return <Link href={redirectUrl} locale={locale} className={`hidden lg:block hover:text-[#96120F] hover:bg-white px-2 transition-colors whitespace-nowrap uppercase ${className ?? ''}`} target={target}>
      {text}
   </Link>
}

export default NavbarLink;