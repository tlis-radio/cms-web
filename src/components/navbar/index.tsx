import { text } from "stream/consumers";
import NavbarLink from "./navbar-link";
import NavbarDropdownLink from "./navbar-dropdown-link";
import Link from "next/link";

export const navbarLinks = [
   {
      text: "Home",
      url: "/"
   },
   {
      text: "Program",
      url: "/program"
   },
   {
      text: "Archív",
      url: "/relacie",
      subLinks: [
         {
            text: "Aktívne relácie",
            url: "/relacie?filter=active"
         },
         {
            text: "Archívne relácie",
            url: "/relacie?filter=archived"
         },
         {
            text: "Digitálne relácie",
            url: "/relacie?filter=digital"
         }
      ]
   },
   {
      text: "Členovia",
      url: "/clenovia"
   },
   {
      text: "O nás",
      url: "/o-nas"
   },
   {
      text: "Konkurz",
      target: "_blank",
      url: "/konkurz"
   },
   {
      text: "2%",
      url: "/dve-percenta"
   }
];

const Navbar = () => {

   const createNavbarLinks = () => {
      return navbarLinks.map((link, index) => {
         if (link.subLinks) {
            return (
               <NavbarDropdownLink key={index} text={link.text} href={link.url}>
                  {link.subLinks.map((subLink, subIndex) => (
                     <NavbarLink key={subIndex} text={subLink.text} redirectUrl={subLink.url} />
                  ))}
               </NavbarDropdownLink>
            )
         }
         return (
            <NavbarLink key={index} text={link.text} redirectUrl={link.url} target={link.target} />
         )
      })
   }

   return (
      <nav className='bg-[#96120F] flex font-semibold max-w-7xl mx-auto'>
         {createNavbarLinks()}
      </nav>
   )
};

export default Navbar;
