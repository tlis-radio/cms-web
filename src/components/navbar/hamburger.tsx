"use client";

import { useState } from "react";
import classNames from "classnames";
import HamburgerNavbarLink from "./hamburger-navbar-link";

const navbarLinks = [
  { 
     text: "Home", 
     url: "/"
  },
  { 
     text: "Program", 
     url: "/"
  },
  { 
     text: "Archív", 
     url: "/relacie"
  },
  { 
     text: "O nás",
     url: "/o-nas"
  }
];

const Hamburger = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleVisibility = () => setIsOpen(!isOpen);

  const createNavbarLinks = () => {
    return navbarLinks.map((link, index) => {
       return (
        <button className="py-2" onClick={toggleVisibility}>
          <HamburgerNavbarLink key={index} text={link.text} redirectUrl={link.url} />
        </button>
          
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
      
      <div className={classNames(
        "flex flex-col fixed w-full bg-[#96110f] z-20 top-[80px] items-center transition-opacity duration-300 lg:hidden",
        {
          "opacity-0": !isOpen,
          "opacity-90": isOpen,
        }
      )}>
        {createNavbarLinks()}
      </div>
      

    </>
  );
}

export default Hamburger;