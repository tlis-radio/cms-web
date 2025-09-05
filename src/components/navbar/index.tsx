import NavbarLink from "./navbar-link";
import NavbarDropdownLink from "./navbar-dropdown-link";
import CmsApiService from "@/services/cms-api-service";

export type NavbarLinkType = {
   text: string,
   url: string,
   target?: string,
   subLinks?: { text: string, url: string, target?: string }[],
}

export async function getNavbarLinks(): Promise<NavbarLinkType[]> {
   const config = await CmsApiService.Config.getConfig();

   /* only use prefetch:true (default), for internal links */
   return [
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
      ...(config.audition ? [{
         text: "Konkurz",
         target: "_blank",
         url: "https://docs.google.com/forms/d/e/1FAIpQLSfENP1vGmJ9JaLeAII2sbF2WFvL9wcode0ZtRAAPRWOSwIr9Q/viewform",
      }] : []),
      {
         text: "2%",
         url: "/dve-percenta"
      }
   ];
}

const Navbar = ({ navbarLinks }: { navbarLinks: NavbarLinkType[] }) => {

   const createNavbarLinks = () => {
      return navbarLinks.map((link, index) => {
         if (link.subLinks) {
            return (
               <NavbarDropdownLink key={index} text={link.text} href={link.url}>
                  {link.subLinks.map((subLink, subIndex) => (
                     <NavbarLink target={subLink.target} key={subIndex} text={subLink.text} redirectUrl={subLink.url} />
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