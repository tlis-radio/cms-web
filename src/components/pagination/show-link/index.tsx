import { FunctionComponent } from "react";
import Link from 'next/link';
import CmsApiService from "@/services/cms-api-service";
import PaginationImage from "@/components/pagination/pagination-image";

type ShowLinkProps = {
   id: string,
   name: string,
   description: string,
   imageId: string,
   moderatorIds: string[]
}

const ShowLink: FunctionComponent<ShowLinkProps> = ({ id, name, description, imageId, moderatorIds }) => {
   return (
      <Link href={`/relacie/${id}`} className="bg-[#1c1c1c] text-white mx-4 flex cursor-pointer flex-col gap-4 border-b-2 p-4 hover:bg-[#111] transition-colors duration-200 sm:flex-row items-center">
         <PaginationImage src={CmsApiService.Image.getShowImage(imageId)} alt={name} />

         <div className="flex flex-col gap-2 text-left">
            <h2 className="text-2xl font-semibold">{name}</h2>
            <span className="flex items-center gap-2">
               <p className="text-lg font-semibold">Moderátori:</p>
               <p>{CmsApiService.Show.getModeratorName(moderatorIds)}</p>
            </span>
            <p className="text-justify pb-4 font-argentumSansLight">{description}</p>
         </div>
      </Link>
   )
}

export default ShowLink;