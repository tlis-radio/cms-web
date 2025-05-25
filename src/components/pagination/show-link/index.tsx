import { FunctionComponent } from "react";
import Link from 'next/link';
import PaginationImage from "@/components/pagination/pagination-image";

type ShowLinkProps = {
   id: string,
   name: string,
   description: string,
   imageUrl: string,
   moderatorNames: Array<string>,
}

const ShowLink: FunctionComponent<ShowLinkProps> = ({ id, name, description, imageUrl, moderatorNames }) => {
   return (
      <Link href={`/relacie/${id}`} className="bg-[#1c1c1c] text-white flex cursor-pointer flex-col gap-4 border-b-2 p-4 hover:bg-[#111] transition-colors duration-200 sm:flex-row items-center">
         <PaginationImage src={imageUrl} alt={name} />

         <div className="flex flex-col gap-2 text-left">
            <h2 className="text-2xl font-semibold">{name}</h2>
            <span className="flex flex-wrap items-center gap-2">
               <p className="text-lg font-semibold">Účinkujúci: </p>
               {/* TODO: */}
               <p>{moderatorNames?.join(", ")}</p>
            </span>
            <p className="text-justify pb-4 font-argentumSansLight">{description}</p>
         </div>
      </Link>
   )
}

export default ShowLink;