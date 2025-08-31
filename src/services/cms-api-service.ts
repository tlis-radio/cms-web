import { ShowDto } from "@/types/show";
import { Show } from "@/models/show";
import { ModeratorDto } from "@/types/moderator";
import { Moderator } from "@/models/moderator";
import { EpisodeDto } from '@/types/episode';
import { Episode } from '@/models/episode';

import { createDirectus, readItem, readItems, rest, RestClient, staticToken } from '@directus/sdk';

let directusInstance: RestClient<any>;

export function getDirectusInstance(): RestClient<any> {
   if (!directusInstance) {
      if (!process.env.DIRECTUS_TOKEN) {
         throw new Error("DIRECTUS_TOKEN environment variable is not set.");
      }

      if (!process.env.NEXT_PUBLIC_DIRECTUS_URL) {
         throw new Error("NEXT_PUBLIC_DIRECTUS_URL environment variable is not set.");
      }
      directusInstance = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL!)
         .with(staticToken(process.env.DIRECTUS_TOKEN!))
         .with(rest({ onRequest: (options) => ({ ...options, cache: "no-store" }), }));
   }
   return directusInstance;
}


const showEndpoints = {
   listShows: async (): Promise<Array<Show>> => {
      const shows = await getDirectusInstance().request<Array<ShowDto>>(readItems("Shows", {
         sort: ['-Episode.date_created'],
         fields: ['*', 'Cast.*'],
      }));
      return shows || [];
   },

   getShowDataById: async (id: number): Promise<Show> => {
      try {
         const data = await getDirectusInstance().request<ShowDto>(readItem("Shows", id, {
            fields: ['*', 'Cast.*'],
         }));
         return data;
      } catch (error) {
         console.error("Error fetching show data: (Probably not found)");
         throw error;
      }
   },

   getShowEpisodesById: async (id: string): Promise<Array<Episode>> => {
      const showData = await getDirectusInstance().request<ShowDto>(readItem("Shows", id));
      if (showData.Episode.length === 0) return [];
      var episodeData = await getDirectusInstance().request<Array<EpisodeDto>>(readItems("Episodes", {
         filter: { id: { _in: showData.Episode } },
         sort: ['-Date'],
      }));

      return episodeData || [];
   },

   getShowModeratorsByIds: async (ids: Array<number>): Promise<Array<string>> => {
      if (ids.length === 0) return [];
      var moderatorData = await getDirectusInstance().request<Array<ModeratorDto>>(readItems("Cast", {
         filter: { id: { _in: ids } },
      }));

      const moderatorNames = moderatorData.map((moderator: Moderator) => {
         return moderator.Name;
      });

      return moderatorNames || "";
   }
};

var memberEndpoints = {
   listMembers: async (): Promise<Array<Object>> => {
      const members = await getDirectusInstance().request<Array<Object>>(readItems("Members"));
      return members || [];
   }
};

class CmsApiService {
   static Show = showEndpoints;
   static Member = memberEndpoints;
}

export default CmsApiService;