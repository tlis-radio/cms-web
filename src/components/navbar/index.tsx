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
   }
];

const Navbar = () => {

   const createNavbarLinks = () => {
      return navbarLinks.map((link, index) => {
         return (
            <NavbarLink key={index} text={link.text} redirectUrl={link.url} />
         )
      })
   }

   return (
      <nav className='bg-[#96120F] flex font-semibold'>
         {createNavbarLinks()}
      </nav>
   )
};

export default Navbar;
