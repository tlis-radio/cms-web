import { Broadcast } from "@/models/broadcast/broadcast";
import { BroadcastDetails } from "@/models/broadcast/broadcast-details";
import { Pagination, PaginationDto } from "@/models/pagination";
import { Show } from "@/models/show";
import { BroadcastDto, GetByIdBroadcastDto } from "@/types/broadcast";
import { ShowDto } from "@/types/show";

const getData = async <T>(uri: string): Promise<T> => {
   const response = await fetch(uri);

   if (response.status >= 400) {
      throw new Error(response.statusText);
   }

   return response.json();
}

const showEndpoints = {
   ListShows: async (limit: number, page: number): Promise<Show[]> => {
      const data = await getData<PaginationDto<ShowDto>>(`https://cms.api.staging.tlis.sk/showmanagement/Show/pagination?limit=${limit}&page=${[page]}`);
      // Oconsole.log(data.results);
      return data.results || [];
   }
};

class CmsApiService {
   static Show = showEndpoints;
}

export default CmsApiService;