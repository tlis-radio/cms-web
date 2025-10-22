'use client'
import { FunctionComponent, useEffect, useRef, useState } from "react";
import Link from 'next/link';
import Markdown from "react-markdown";
import TlisImage from "@/components/TlisImage";
import { Show } from "@/models/show";
import { ShowCast } from "@/types/show";

type ShowLinkProps = {
   show: Show;
}

const ShowLink: FunctionComponent<ShowLinkProps> = ({ show }) => {
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
      <Link href={`/relacie/${show.id}`} className="bg-[#1c1c1c] text-white flex cursor-pointer flex-col gap-4 border-b-2 p-4 group hover:bg-[#111] transition-colors duration-200 sm:flex-row items-center">
         <div className="sm:w-48 w-full flex-shrink-0">
            <TlisImage src={show.Cover} alt={show.Title} />
         </div>

         <div className="flex flex-col gap-2 text-left">
            <h2 className="text-2xl font-bold">{show.Title}</h2>
            <span className="flex flex-wrap items-center gap-1">
               <p className="text-lg font-semibold">Redaktori: </p>
               {show.Cast.map((castMember: ShowCast, index) => {
                  return <span key={index} className="text-lg">{castMember.Cast_id.Name}{index < show.Cast.length - 1 ? ',' : ''}</span>
               })}
            </span>
            <div className="relative">
               <div ref={descriptionRef} className="text-justify font-argentumSansLight max-h-[120px] overflow-hidden text-overflow-ellipsis">
                  <Markdown>
                     {show.Description}
                  </Markdown>
               </div>
               {isDescriptionOverflowing && <div className="w-full absolute bottom-0 h-10 bg-gradient-to-b from-transparent to-[#1C1C1C] group-hover:to-[#111111] transition-colors duration-200" />}
            </div>
         </div>
      </Link>
   )
}

export default ShowLink;