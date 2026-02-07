"use client";
import React from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faChevronRight } from "@fortawesome/free-solid-svg-icons";

export type BreadcrumbItem = {
   label: string;
   href: string;
};

interface BreadcrumbsProps {
   items: BreadcrumbItem[];
   className?: string;
}

export default function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
   const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tlis.sk";

   // Generate JSON-LD for breadcrumbs
   const jsonLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
         {
            "@type": "ListItem",
            "position": 1,
            "name": "Domov",
            "item": SITE_URL
         },
         ...items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 2,
            "name": item.label,
            "item": `${SITE_URL}${item.href}`
         }))
      ]
   };

   return (
      <>
         {/* JSON-LD Script */}
         <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
         />

         {/* Visual Breadcrumbs */}
         <nav aria-label="Breadcrumb" className={`flex items-center gap-2 text-sm text-gray-400 ${className}`}>
            <Link
               href="/"
               className="hover:text-white transition-colors flex items-center gap-1"
               aria-label="Domov"
            >
               <FontAwesomeIcon icon={faHome} className="w-4 h-4" />
            </Link>

            {items.map((item, index) => (
               <React.Fragment key={item.href}>
                  <FontAwesomeIcon icon={faChevronRight} className="w-3 h-3 text-gray-200" />
                  {index === items.length - 1 ? (
                     <span className="text-gray-300" aria-current="page">
                        {item.label}
                     </span>
                  ) : (
                     <Link
                        href={item.href}
                        className="hover:text-white transition-colors"
                     >
                        {item.label}
                     </Link>
                  )}
               </React.Fragment>
            ))}
         </nav>
      </>
   );
}
