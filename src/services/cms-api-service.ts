import { PaginationDto } from "@/models/pagination";
import { PaginationShowDto } from "@/types/show-list";
import { ShowDto } from "@/types/show-id";
import { PaginationShow } from "@/models/show-list";
import { Show } from "@/models/show-id";

const getData = async <T>(uri: string): Promise<T> => {
   const response = await fetch(uri);

   if (response.status >= 400) {
      throw new Error(response.statusText);
   }

   return response.json();
}

const showEndpoints = {
   listShows: async (limit: number, page: number): Promise<Array<PaginationShow>> => {
      const data = await getData<PaginationDto<PaginationShowDto>>(`https://cms.api.staging.tlis.sk/Show/pagination?limit=${limit}&page=${page}`);
      //console.log(data);
      return data.results || [];
   },

   getShowDataById: async (id: string): Promise<Show> => {
      const data = await getData<ShowDto>(`https://cms.api.staging.tlis.sk/Show/${id}`)
      //console.log(data);
      return data;
   },
};

class CmsApiService {
   static Show = showEndpoints;
}

export default CmsApiService;