import { Broadcast } from "@/models/broadcast/broadcast";
import { BroadcastDetails } from "@/models/broadcast/broadcast-details";
import { Pagination, PaginationDto } from "@/models/pagination";
import { Show } from "@/models/show";
import { BroadcastDto, GetByIdBroadcastDto } from "@/types/broadcast";
import { ShowDto } from "@/types/show";

const getAsync = async <T>(uri: string): Promise<T> => {
   const response = await fetch(uri);

   if (response.status >= 400) {
      throw new Error(response.statusText);
   }

   return response.json();
}

const showEndpoints = {
   PaginationAsync: async (limit: number, page: number): Promise<Pagination<Show>> => {
      const result = await getAsync<PaginationDto<ShowDto>>(`/api/show-management/pagination?limit=${limit}&page=${[page]}`);

      return new Pagination<Show>(
         result.limit,
         result.page,
         result.total,
         result.totalPages,
         result.results.map(r => Show.fromDto(r))
      );
   },
   GetByIdAsync: async (id: string | null): Promise<Show | undefined> => {
      if (!id) {
         return undefined;
      }

      const result = await getAsync<ShowDto>(`/api/show-management/${id}`);

      return Show.fromDto(result);
   }
};

const broadcastEndpoints = {
   PaginationAsync: async (limit: number, page: number): Promise<Pagination<Broadcast>> => {
      const result = await getAsync<PaginationDto<BroadcastDto>>(`/api/broadcast-management/pagination?limit=${limit}&page=${[page]}`);

      return new Pagination<Broadcast>(
         result.limit,
         result.page,
         result.total,
         result.totalPages,
         result.results.map(r => Broadcast.fromDto(r))
      );
   },
   GetByIdAsync: async (id: string | null): Promise<BroadcastDetails | undefined> => {
      if (!id) {
         return undefined;
      }

      const result = await getAsync<GetByIdBroadcastDto>(`/api/broadcast-management/${id}`);

      return BroadcastDetails.fromDto(id, result);
   }
};

class CmsApi {
   static Show = showEndpoints;
   static Broadcast = broadcastEndpoints;
}

export default CmsApi;