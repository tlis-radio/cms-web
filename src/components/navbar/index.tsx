import NavbarLink from "./navbar-link";
import NavbarDropdownLink from "./navbar-dropdown-link";
import CmsApiService from "@/services/cms-api-service";

export type NavbarLinkType = {
   text: string,
   url: string,
   target?: string,
   subLinks?: { text: string, url: string, target?: string }[],
}

export type MarqueeLinkType = {
   text: string,
   url: string,
   target?: string,
}

export async function getNavbarLinks(): Promise<NavbarLinkType[]> {
   /* only use prefetch:true (default), for internal links */
   return [
      {
         text: "Domov",
         url: "/"
      },
      {
         text: "Podcasty",
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
               text: "Starý archív",
               url: "/relacie?filter=digital"
            }
         ]
      },
      // {
      //    text: "Reporty",
      //    url: "/reporty"
      // },
      {
         text: "O rádiu",
         url: "/o-nas",
         subLinks: [
            {
               text: "Kto sme",
               url: "/o-nas"
            },
            {
               text: "Členovia",
               url: "/clenovia"
            },
            // {
            //    text: "História",
            //    url: "/o-nas/historia"
            // },
            // {
            //    text: "Partneri",
            //    url: "/o-nas/partneri"
            // },
            // {
            //    text: "Kontakt",
            //    url: "/kontakt"
            // }
         ]
      }
   ];
}

export async function getMarqueeLinks(): Promise<MarqueeLinkType[]> {
   const config = await CmsApiService.Config.getConfig();
   return config.links.map(link => ({
         text: link.text,
         url: link.link,
         target: link.external ? "_blank" : undefined,
      }));
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