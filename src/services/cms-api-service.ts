import { PaginationDto } from "@/models/pagination";
import { PaginationShowDto } from "@/types/show-list";
import { ShowDto } from "@/types/show-id";
import { PaginationShow } from "@/models/show-list";
import { Show } from "@/models/show-id";
import { ImageDto } from "@/types/image";
import { UserDto } from "@/types/user";

const getData = async <T>(uri: string): Promise<T> => {
   const response = await fetch(uri);

   if (response.status >= 400) {
      throw new Error(response.statusText);
   }

   return response.json();
}

const showEndpoints = {
   listShows: async (limit: number, page: number): Promise<Array<PaginationShow>> => {
      const data = await getData<PaginationDto<PaginationShowDto>>(`https://cms.api.staging.tlis.sk/showmanagement/Show/pagination?limit=${limit}&page=${page}`);
      //console.log(data);
      return data.results || [];
   },

   getShowDataById: async (id: string): Promise<Show> => {
      const data = await getData<ShowDto>(`https://cms.api.staging.tlis.sk/showmanagement/Show/${id}`)
      //console.log(data);
      return data;
   },

   getModeratorName: async (ids: Array<string>): Promise<string> => {
      const names = await Promise.all(
         ids.map(async (id) => {
            const userData = await getData<PaginationDto<UserDto>>(`https://cms.api.staging.tlis.sk/usermanagement/User/filter?UserIds=${id}`)

            //console.log(data.results[0]?.firstname, data.results[0]?.lastname);

            if (!userData.results || !userData.results[0] || !userData.results[0].firstname || !userData.results[0].lastname) {
               return "Nejaký Tlisák";
            }

            return `${userData.results[0].firstname} ${userData.results[0].lastname}`;
         })
      );
      //console.log(names);
      return names.join(', ');
   }
};

const imageEndpoints = {
   getShowImage: async (id: string): Promise<string> => {
      const imageData = await getData<ImageDto>(`https://cms.api.staging.tlis.sk/imageassetmanagement/Image/${id}`);
      //console.log(imageData);
      return `${imageData.url}`;
   }
}

class CmsApiService {
   static Show = showEndpoints;
   static Image = imageEndpoints;
}

export default CmsApiService;