import { ShowDto } from "@/types/show";
import { Show } from "@/models/show";
import { ModeratorDto } from "@/types/moderator";
import { Moderator } from "@/models/moderator";
import { EpisodeDto } from '@/types/episode';
import { Episode } from '@/models/episode';

import { aggregate, createDirectus, readItem, readItems, rest, RestClient, staticToken } from '@directus/sdk';
import Config from "@/types/config";

let directusInstance: RestClient<any>;
let publicDirectusInstance: RestClient<any>;

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

export function getPublicDirectusInstance(): RestClient<any> {
   if (!publicDirectusInstance) {
      if (!process.env.NEXT_PUBLIC_DIRECTUS_URL) {
         throw new Error("NEXT_PUBLIC_DIRECTUS_URL environment variable is not set.");
      }
      publicDirectusInstance = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL!)
         .with(rest({ onRequest: (options) => ({ ...options, cache: "no-store" }), }));
   }
   return publicDirectusInstance;
}

const showEndpoints = {
   listShows: async (): Promise<Array<Show>> => {
      const shows = await getDirectusInstance().request<Array<ShowDto>>(readItems("Shows", {
         sort: ['-Episode.Date'],
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

   getEpisodeById: async (id: number): Promise<Episode | null> => {
      const episode = await getDirectusInstance().request<EpisodeDto>(readItem("Episodes", id));
      return episode || null;
   },

   getShowEpisodesCountById: async (id: string): Promise<number> => {
      const showData = await getDirectusInstance().request<ShowDto>(readItem("Shows", id));
      if (showData.Episode.length === 0) return 0;
      const showEpisodesCount = await getDirectusInstance().request(aggregate("Episodes", {
         query: { filter: { id: { _in: showData.Episode } }, },
         aggregate: { count: '*' },
      }));
      return parseInt(showEpisodesCount[0].count!) || 0;
   },

   PAGE_SIZE: 10, // TODO: adjustable page size in future?
   getShowEpisodesByIdPaginated: async (id: string, page: number): Promise<{ episodes: Array<Episode>, totalCount: number }> => {
      const showData = await getDirectusInstance().request<ShowDto>(readItem("Shows", id));
      if (showData.Episode.length === 0) return { episodes: [], totalCount: 0 };
      const total_count = await showEndpoints.getShowEpisodesCountById(id);
      var episodeData = await getDirectusInstance().request<Array<EpisodeDto>>(readItems("Episodes", {
         filter: { id: { _in: showData.Episode } },
         sort: ['-Date'],
         limit: showEndpoints.PAGE_SIZE,
         page
      }));
      return { episodes: episodeData || [], totalCount: total_count };
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

var configEndpoints = {
   getConfig: async (): Promise<Config> => {
      const config = await getPublicDirectusInstance().request<Config>(readItems("config"));
      return config;
   }
}

class CmsApiService {
   static Show = showEndpoints;
   static Member = memberEndpoints;
   static Config = configEndpoints;
}

export default CmsApiService;