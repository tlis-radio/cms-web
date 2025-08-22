import { text } from "stream/consumers";
import NavbarLink from "./navbar-link";

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
      url: "/relacie"
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
      url: "https://docs.google.com/forms/d/e/1FAIpQLSfENP1vGmJ9JaLeAII2sbF2WFvL9wcode0ZtRAAPRWOSwIr9Q/viewform"
   }
];

const Navbar = () => {

   const createNavbarLinks = () => {
      return navbarLinks.map((link, index) => {
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
