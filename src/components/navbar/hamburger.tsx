"use client";

import { useState } from "react";
import classNames from "classnames";

const Hamburger = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleVisibility = () => setIsOpen(!isOpen);

  return (
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
  );
}

export default Hamburger;