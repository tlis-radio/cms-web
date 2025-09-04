'use client'
import { FunctionComponent, ReactNode, useState } from "react";
import Link from 'next/link';

export type NavbarDropdownLinkProps = {
    text: string,
    href?: string,
    children: ReactNode,
    className?: string,
    target?: string,
}

/* desktop component only, mobile version handled in hamburger.tsx */
const NavbarDropdownLink: FunctionComponent<NavbarDropdownLinkProps> = ({ text, href = '#', children, className, target }) => {
    const [open, setOpen] = useState(false);

    const [dropdownHover, setDropdownHover] = useState(false);
    const isOpen = open || dropdownHover;

    return (
        <div
            className={`relative hidden lg:block ${className ?? ''}`}
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
        >
            <Link
                href={href}
                className="hidden lg:block hover:text-[#96120F] hover:bg-white px-2 transition-colors"
                target={target}
                tabIndex={0}
                onFocus={() => setOpen(true)}
                onBlur={() => setOpen(false)}
            >
                {text}
            </Link>
            {isOpen && (
                <div
                    className="py-1 absolute left-1/2 -translate-x-1/2 min-w-[10rem] bg-[#f8f8f8] shadow-lg z-50 flex flex-col gap-1 animate-fadeIn text-[#222]"
                    onMouseEnter={() => setDropdownHover(true)}
                    onMouseLeave={() => setDropdownHover(false)}
                >
                    {children}
                </div>
            )}
        </div>
    );
};

export default NavbarDropdownLink;
