import { FunctionComponent } from "react";

type NavbarLinkProps = {
   text: string,
   redirectUrl: string
}

const NavbarLink: FunctionComponent<NavbarLinkProps> = ({ text,redirectUrl }) => {
   return(
      <a className=' hover:text-[#96120F] hover:bg-white px-2 transition-colors' href={redirectUrl}>{text}</a>
   )
}

export default NavbarLink;