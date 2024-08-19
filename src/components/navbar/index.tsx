import NavbarLink from "./navbar-link";

const navbarLinks = [
   { 
      text: "Home", 
      url: "/main"
   },
   { 
      text: "Program", 
      url: "/main"
   },
   { 
      text: "Archív", 
      url: "/relacie"
   },
   { 
      text: "O nás",
      url: "/main"
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
