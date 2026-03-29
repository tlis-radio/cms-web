import NavbarLink from "./navbar-link";
import NavbarDropdownLink from "./navbar-dropdown-link";
import CmsApiService from "@/services/cms-api-service";
import { getTranslations } from 'next-intl/server';

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
   const t = await getTranslations('navbar');

   return [
      {
         text: t('home'),
         url: "/"
      },
      {
         text: t('podcasts'),
         url: "/relacie",
         subLinks: [
            {
               text: t('active_shows'),
               url: "/relacie?filter=active"
            },
            {
               text: t('archived_shows'),
               url: "/relacie?filter=archived"
            },
            {
               text: t('old_archive'),
               url: "/relacie?filter=digital"
            }
         ]
      },
      {
         text: t('articles'),
         url: "/clanky",
      },
      {
         text: t('live'),
         url: "/tlistv",
      },
      // {
      //    text: t('reports'),
      //    url: "/reporty"
      // },
      {
         text: t('about_radio'),
         url: "/o-radiu",
         subLinks: [
            {
               text: t('who_we_are'),
               url: "/o-radiu"
            },
            {
               text: t('members'),
               url: "/o-radiu/clenovia"
            },
            //{
            //   text: t('history'),
            //   url: "/o-radiu/historia"
            //},
            // {
            //    text: t('partners'),
            //    url: "/o-radiu/partneri"
            // },
            // {
            //    text: t('contact'),
            //    url: "/o-radiu/contact"
            // }
         ]
      }
   ];
}

export async function getMarqueeLinks(): Promise<MarqueeLinkType[]> {
   try {
      const config = await CmsApiService.Config.getConfig();
      return config.links.map(link => ({
         text: link.text,
         url: link.link,
         target: link.external ? "_blank" : undefined,
      }));
   } catch (error) {
      console.error("Error fetching marquee links:", error);
      return [];
   }
}

const Navbar = ({ navbarLinks }: { navbarLinks: NavbarLinkType[] }) => {

   const createNavbarLinks = () => {
      return navbarLinks.map((link, index) => {
         if (link.subLinks) {
            return (
               <NavbarDropdownLink key={index} text={link.text} href={link.url}>
                  {link.subLinks.map((subLink, subIndex) => (
                     <NavbarLink 
                        target={subLink.target} 
                        key={subIndex} 
                        text={subLink.text} 
                        redirectUrl={subLink.url} 
                     />
                  ))}
               </NavbarDropdownLink>
            )
         }
         return (
            <NavbarLink 
               key={index} 
               text={link.text} 
               redirectUrl={link.url} 
               target={link.target} 
            />
         )
      })
   }

   return (
      <nav className='font-argentumSansLight bg-[#96120F] flex font-semibold max-w-7xl'>
         {createNavbarLinks()}
      </nav>
   )
};

export default Navbar;