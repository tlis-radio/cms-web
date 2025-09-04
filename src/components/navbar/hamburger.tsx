"use client";

import { useState } from "react";
import classNames from "classnames";
import Link from "next/link";
import Socials from "../socials";
import { navbarLinks } from "./index";

const Hamburger = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleVisibility = () => setIsOpen(!isOpen);

  const createNavbarLinks = () => {
    return navbarLinks.map((link, index) => {
      if (link.subLinks) {
        const [showSubLinks, setShowSubLinks] = useState(false);

        const handleMainLinkClick = () => {
          setShowSubLinks((prev) => !prev);
          toggleVisibility();
        };

        return (
          <div key={index} className="w-full border-t">
            <button
              className="px-6 w-full hover:text-[#96120F] hover:bg-white transition-colors flex justify-center"
              onClick={(e) => {
                e.stopPropagation();
                setShowSubLinks((prev) => !prev);
              }}
              type="button"
            >
              <Link href={link.url} onClick={handleMainLinkClick} className="px-8 py-4">
                {link.text}
              </Link>
              <span className="absolute right-4 ml-2 py-4">{showSubLinks ? "▲" : "▼"}</span>
            </button>
            {showSubLinks && link.subLinks.map((subLink, subIndex) => (
              <div key={subIndex} className="w-full border-t bg-[#a83b38]">
                <Link href={subLink.url}>
                  <button
                    className="px-6 py-4 w-full text-left hover:text-[#96120F] hover:bg-white transition-colors text-center"
                    onClick={toggleVisibility}
                  >
                    {subLink.text}
                  </button>
                </Link>
              </div>
            ))}
          </div>
        );
      }
      return (
        <div key={index} className="w-full border-t">
          <Link href={link.url}>
            <button className="py-4 w-full hover:text-[#96120F] hover:bg-white transition-colors" onClick={toggleVisibility}>
              {link.text}
            </button>
          </Link>
        </div>
      )
    })
  }

  return (
    <>
      <div className="lg:hidden my-auto">
        <button className="flex flex-col items-center justify-center w-12 h-12" onClick={toggleVisibility}>
          <span className={classNames("block w-8 h-1 bg-white my-1 transition-transform duration-300 ease-in-out", {
            "transform rotate-45 translate-y-3": isOpen,
          })}></span>
          <span className={classNames("block w-8 h-1 bg-white my-1 transition-opacity duration-300 ease-in-out", {
            "opacity-0": isOpen,
          })}></span>
          <span className={classNames("block w-8 h-1 bg-white my-1 transition-transform duration-300 ease-in-out", {
            "transform -rotate-45 -translate-y-3": isOpen,
          })}></span>
        </button>
      </div>

      <div
        className={classNames(
          "flex flex-col fixed w-full bg-[#96120F] z-20 top-[80px] transition-opacity duration-300 rounded-b-3xl lg:hidden",
          {
        "opacity-0 invisible": !isOpen,
        "opacity-95 visible": isOpen,
          }
        )}
        style={{ maxHeight: "calc(100vh - 80px)", overflowY: "auto" }}
      >
        {createNavbarLinks()}
        <div className="w-full border-t min-[450px]:hidden">
          <div className="py-6 w-full flex justify-center">
        <Socials mobile={true} />
          </div>
        </div>
      </div>


    </>
  );
}

export default Hamburger;