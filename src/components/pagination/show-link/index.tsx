'use client'
import { FunctionComponent, useEffect, useRef, useState } from "react";
import Link from 'next/link';
import PaginationImage from "@/components/pagination/pagination-image";
import Markdown from "react-markdown";

type ShowLinkProps = {
   id: string,
   name: string,
   description: string,
   imageUrl: string,
   moderatorNames: Array<string>,
}

const ShowLink: FunctionComponent<ShowLinkProps> = ({ id, name, description, imageUrl, moderatorNames }) => {
   const [isDescriptionExpanded, setDescriptionExpanded] = useState(false);
   const [isDescriptionOverflowing, setIsDescriptionOverflowing] = useState(false);
   const descriptionRef = useRef<HTMLDivElement>(null);

   useEffect(() => {
      function checkOverflow() {
         if (descriptionRef.current) {
            setIsDescriptionOverflowing(descriptionRef.current.scrollHeight > descriptionRef.current.clientHeight);
         }
      }

      checkOverflow();
      window.addEventListener("resize", checkOverflow);
      return () => window.removeEventListener("resize", checkOverflow);
   }, []);

   return (
      <Link href={`/relacie/${id}`} className="bg-[#1c1c1c] text-white flex cursor-pointer flex-col gap-4 border-b-2 p-4 group hover:bg-[#111] transition-colors duration-200 sm:flex-row items-center">
         <PaginationImage src={imageUrl} alt={name} />

         <div className="flex flex-col gap-2 text-left">
            <h2 className="text-2xl font-semibold">{name}</h2>
            <span className="flex flex-wrap items-center gap-2">
               <p className="text-lg font-semibold">Účinkujúci: </p>
               {/* TODO: */}
               <p>{moderatorNames?.join(", ")}</p>
            </span>
            <div className="relative">
               <div ref={descriptionRef} className="text-justify font-argentumSansLight max-h-[120px] overflow-hidden text-overflow-ellipsis">
                  <Markdown>
                     {description}
                  </Markdown>
               </div>
               {isDescriptionOverflowing && <div className="w-full absolute bottom-0 h-10 bg-gradient-to-b from-transparent to-[#1C1C1C] group-hover:to-[#111111] transition-colors duration-200" />}
            </div>
         </div>
      </Link>
   )
}

export default ShowLink;