"use client";

import { useState } from "react";
import classNames from "classnames";
import { Link, usePathname, useRouter, locales } from '@/navigation';
import { useLocale } from "next-intl";
import Socials from "../socials";
import { NavbarLinkType } from "./index";

const Hamburger = ({ navbarLinks }: { navbarLinks: NavbarLinkType[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const currentLocale = useLocale();

  const toggleVisibility = () => setIsOpen(!isOpen);

  const handleLocaleChange = (newLocale: string) => {
    // @ts-ignore - Turbopack/TS niekedy frfle na string vs enum locale
    router.replace(pathname, { locale: newLocale });
    setIsOpen(false);
  };

  const createNavbarLinks = () => {
    return navbarLinks.map((link, index) => {
      if (link.subLinks) {
        const [showSubLinks, setShowSubLinks] = useState(false);

        return (
          <div key={index} className="w-full border-t max-[500px]">
            <button
              className="px-6 w-full hover:text-[#96120F] hover:bg-white transition-colors flex justify-center relative"
              onClick={() => setShowSubLinks(!showSubLinks)}
              type="button"
            >
              <Link href={link.url} onClick={toggleVisibility} className="font-argentumSansMedium px-8 py-4 uppercase">
                {link.text}
              </Link>
              <span className="absolute right-4 ml-2 py-4">{showSubLinks ? "▲" : "▼"}</span>
            </button>
            {showSubLinks && link.subLinks.map((subLink, subIndex) => (
              <div key={subIndex} className="w-full border-t bg-[#a83b38]">
                <Link href={subLink.url} target={subLink.target} onClick={toggleVisibility}>
                  <button className="font-argentumSansMedium px-6 py-4 w-full text-left hover:text-[#96120F] hover:bg-white transition-colors text-center uppercase">
                    {subLink.text}
                  </button>
                </Link>
              </div>
            ))}
          </div>
        );
      }
      return (
        <div key={index} className="font-argentumSansMedium w-full border-t">
          <Link href={link.url} onClick={toggleVisibility}>
            <button className="py-4 w-full hover:text-[#96120F] hover:bg-white transition-colors uppercase">
              {link.text}
            </button>
          </Link>
        </div>
      )
    })
  }

  return (
    <>
      <div className="lg:hidden my-auto mr-4 ml-auto">
        <button className="flex flex-col items-center justify-center w-12 h-12" onClick={toggleVisibility} aria-label="Menu">
          <span className={classNames("block w-8 h-1 bg-white my-1 transition-transform duration-300", { "transform rotate-45 translate-y-3": isOpen })}></span>
          <span className={classNames("block w-8 h-1 bg-white my-1 transition-opacity duration-300", { "opacity-0": isOpen })}></span>
          <span className={classNames("block w-8 h-1 bg-white my-1 transition-transform duration-300", { "transform -rotate-45 -translate-y-3": isOpen })}></span>
        </button>
      </div>

      <div 
        className={classNames("left-0 flex flex-col fixed w-full bg-[#96120F] z-20 top-[60px] transition-opacity duration-300 rounded-b-3xl lg:hidden", { "opacity-0 invisible": !isOpen, "opacity-95 visible": isOpen })} 
        style={{ maxHeight: "calc(100vh - 80px)", overflowY: "auto" }}
      >
        {createNavbarLinks()}
        
        {/* Language Selector s dominantnou vlajkou - BEZ TPI */}
        <div className="w-full border-t bg-[#7a0e0c] flex justify-center gap-6 py-5 px-4">
          {locales.filter(l => l !== 'tpi').map((l) => {
            const flags: Record<string, string> = {
              sk: "🇸🇰",
              en: "🇬🇧",
              de: "🇩🇪",
              es: "🇪🇸",
              uk: "🇺🇦"
            };

            return (
              <button
                key={l}
                onClick={() => handleLocaleChange(l)}
                className={classNames(
                  "flex flex-col items-center justify-center transition-all duration-200 active:scale-90", 
                  {
                    "scale-110 opacity-100": currentLocale === l,
                    "opacity-40 hover:opacity-80": currentLocale !== l,
                  }
                )}
              >
                {/* Vlajka */}
                <span className="text-3xl leading-none mb-1 shadow-sm">
                  {flags[l]}
                </span>

                {/* Text pod vlajkou */}
                <span 
                  className={classNames(
                    "text-[10px] font-argentumSansBold tracking-wider uppercase", 
                    {
                      "text-white underline underline-offset-4": currentLocale === l,
                      "text-gray-300": currentLocale !== l,
                    }
                  )}
                >
                  {l}
                </span>
              </button>
            );
          })}
        </div>

        <div className="w-full border-t min-[450px]:hidden">
          <div className="py-6 w-full flex justify-center">
            <Socials mobile={'mobile'} />
          </div>
        </div>
      </div>
    </>
  );
}

export default Hamburger;