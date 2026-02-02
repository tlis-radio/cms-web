"use client";
import React, { useEffect, useState } from "react";

type Heading = {
   id: string;
   text: string;
   level: number;
};

interface TableOfContentsProps {
   content: string;
}

export default function TableOfContents({ content }: TableOfContentsProps) {
   const [headings, setHeadings] = useState<Heading[]>([]);
   const [activeId, setActiveId] = useState<string>("");

   useEffect(() => {
      // Extract headings from markdown content
      const headingRegex = /^(#{1,4})\s+(.+)$/gm;
      const extractedHeadings: Heading[] = [];
      let match;

      while ((match = headingRegex.exec(content)) !== null) {
         const level = match[1].length;
         const text = match[2].trim();
         const id = text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
         extractedHeadings.push({ id, text, level });
      }

      setHeadings(extractedHeadings);
   }, [content]);

   useEffect(() => {
      const observer = new IntersectionObserver(
         (entries) => {
            entries.forEach((entry) => {
               if (entry.isIntersecting) {
                  setActiveId(entry.target.id);
                  // Update URL hash without scrolling
                  if (entry.target.id) {
                     window.history.replaceState(null, "", `#${entry.target.id}`);
                  }
               }
            });
         },
         {
            rootMargin: "-100px 0px -66%",
            threshold: 0.5,
         }
      );

      // Observe all heading elements
      headings.forEach((heading) => {
         const element = document.getElementById(heading.id);
         if (element) {
            observer.observe(element);
         }
      });

      return () => {
         headings.forEach((heading) => {
            const element = document.getElementById(heading.id);
            if (element) {
               observer.unobserve(element);
            }
         });
      };
   }, [headings]);

   const handleClick = (id: string) => {
      const element = document.getElementById(id);
      if (element) {
         element.scrollIntoView({ behavior: "smooth" });
         setActiveId(id);
      }
   };

   if (headings.length === 0) {
      return null;
   }

   return (
      <nav className="sticky top-32">
         <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
            Obsah
         </h4>
         <ul className="space-y-2">
            {headings.map((heading) => (
               <li
                  key={heading.id}
                  style={{ paddingLeft: `${(heading.level - 1) * 0.75}rem` }}
               >
                  <button
                     onClick={() => handleClick(heading.id)}
                     className={`text-left text-sm transition-colors duration-200 block w-full truncate ${
                        activeId === heading.id
                           ? "text-[#d43c4a] font-medium"
                           : "text-gray-400 hover:text-white"
                     }`}
                  >
                     {heading.text}
                  </button>
               </li>
            ))}
         </ul>
      </nav>
   );
}
