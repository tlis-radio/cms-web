import { ShowDto } from "@/types/show";
import { Show } from "@/models/show";
import { ModeratorDto } from "@/types/moderator";
import { Moderator } from "@/models/moderator";
import { EpisodeDto } from '@/types/episode';
import { Episode } from '@/models/episode';

import { createDirectus, readItem, readItems, rest } from '@directus/sdk';

const directus = createDirectus('http://directus.tlis.sk').with(rest({ onRequest: (options) => ({ ...options, cache: "no-store" }), }));

const showEndpoints = {
   listShows: async (): Promise<Array<Show>> => {
      const shows = await directus.request<Array<ShowDto>>(readItems("Shows", {
         sort: ['-Episode.date_created'],
      }));
      return shows || [];
   },

   getShowDataById: async (id: number): Promise<Show> => {
      try {
         const data = await directus.request<ShowDto>(readItem("Shows", id));
         return data;
      } catch (error) {
         console.error("Error fetching show data: (Probably not found)");
         throw error;
      }
   },

   getShowEpisodesById: async (id: string): Promise<Array<Episode>> => {
      const showData = await directus.request<ShowDto>(readItem("Shows", id));
      if (showData.Episode.length === 0) return [];
      var episodeData = await directus.request<Array<EpisodeDto>>(readItems("Episodes", {
         filter: { id: { _in: showData.Episode } },
         sort: ['-Date'],
      }));

      return episodeData || [];
   },

   getShowModeratorsByIds: async (ids: Array<number>): Promise<Array<string>> => {
      if (ids.length === 0) return [];
      var moderatorData = await directus.request<Array<ModeratorDto>>(readItems("Cast", {
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
      const members = await directus.request<Array<Object>>(readItems("Members"));
      return members || [];
   }
};

class CmsApiService {
   static Show = showEndpoints;
   static Member = memberEndpoints;
}

export default CmsApiService;