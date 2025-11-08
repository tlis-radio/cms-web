import { ShowDto } from "@/types/show";
import { Show } from "@/models/show";
import { EpisodeDto, Tag } from '@/types/episode';
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
   PAGE_SIZE: 10, // TODO: adjustable page size in future?
   listShows: async (): Promise<Array<Show>> => {
      const shows = await getDirectusInstance().request<Array<ShowDto>>(readItems("Shows", {
         sort: ['-Episode.Date'],
         fields: ['*', 'Cast.Cast_id.*'],
      }));
      return shows || [];
   },

   listShowsCount: async (filter: string): Promise<number> => {
      const showsCount = await getDirectusInstance().request(aggregate("Shows", {
         aggregate: { count: '*' },
         query: { filter: { Filter: { _eq: filter } } },
      }));
      return parseInt(showsCount[0].count!) || 0;
   },

   listShowsPaginated: async (page: number, filter: string): Promise<{ shows: Array<Show>, totalCount: number }> => {
      const total_count = await showEndpoints.listShowsCount(filter);
      var shows = await getDirectusInstance().request<Array<ShowDto>>(readItems("Shows", {
         sort: ['-Episode.Date'],
         fields: ['*', 'Cast.Cast_id.Name'],
         filter: { Filter: { _eq: filter } },
         limit: showEndpoints.PAGE_SIZE,
         page
      }));
      return { shows: shows || [], totalCount: total_count };
   },

   getShowDataById: async (id: number): Promise<Show> => {
      try {
         const data = await getDirectusInstance().request<ShowDto>(readItem("Shows", id, {
            fields: ['*', 'Cast.Cast_id.Name'],
         }));
         return data;
      } catch (error) {
         console.error("Error fetching show data: (Probably not found)");
         throw error;
      }
   },

   getShowTagsById: async (id: string): Promise<Array<Tag>> => {
      const showData = await getDirectusInstance().request<ShowDto>(readItem("Shows", id, {
         fields: ['Episode.Tags.Tags_id.*'],
      }));
      var allTags: Array<Tag> = [];
      for (let episode of showData.Episode) {
         for (let tagRelation of episode.Tags) {
            const tag = tagRelation.Tags_id;
            if (!allTags.find(t => t.id === tag.id)) {
               allTags.push(tag);
            }
         }
      }
      return allTags;
   },

   getEpisodesByTagId: async (tagId: number): Promise<Array<Episode>> => {
      const episodes = await getDirectusInstance().request<Array<EpisodeDto>>(readItems("Episodes", {
         fields: ["*", "Tags.Tags_id.*"],
         filter: { "Tags.Tags_id.id": { _eq: tagId } }
      }));
      return episodes || [];
   },

   getShowEpisodesById: async (id: string): Promise<Array<Episode>> => {
      const showData = await getDirectusInstance().request<ShowDto>(readItem("Shows", id));
      if (showData.Episode.length === 0) return [];
      var episodeData = await getDirectusInstance().request<Array<EpisodeDto>>(readItems("Episodes", {
         fields: ["*", "Tags.Tags_id.*"],
         filter: { id: { _in: showData.Episode } },
         sort: ['-Date'],
      }));

      return episodeData || [];
   },

   getEpisodeById: async (id: number): Promise<Episode | null> => {
      const episode = await getDirectusInstance().request<EpisodeDto>(readItem("Episodes", id, {
         fields: ["*", "Tags.Tags_id.*"]
      }));
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

   getShowEpisodesByIdPaginated: async (id: string, page: number): Promise<{ show: Show, episodes: Array<Episode>, totalCount: number }> => {
      const showData = await getDirectusInstance().request<ShowDto>(readItem("Shows", id, { fields: ['*', 'Cast.Cast_id.Name' ] }));
      if (showData.Episode.length === 0) return { show: showData, episodes: [], totalCount: 0 };
      const total_count = await showEndpoints.getShowEpisodesCountById(id);
      var episodeData = await getDirectusInstance().request<Array<EpisodeDto>>(readItems("Episodes", {
         fields: ["*", "Tags.Tags_id.*"],
         filter: { id: { _in: showData.Episode } },
         sort: ['-Date'],
         limit: showEndpoints.PAGE_SIZE,
         page
      }));
      return { show: showData, episodes: episodeData || [], totalCount: total_count };
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
      const config = await getPublicDirectusInstance().request<Config>(readItems("config", {
         fields: ['links.*']
      }));
      return config;
   }
}

var streamEndpoints = {
   getCurrentStreamTitle: async (): Promise<string> => {
      const stream = await getPublicDirectusInstance().request<{ current_episode: EpisodeDto }>(readItem("stream", 1, {
         fields: ['current_episode.*']
      }));
      var {current_episode} = stream;
      if(!current_episode) return "";
      return current_episode.Title || "";
   }
}

class CmsApiService {
   static Show = showEndpoints;
   static Member = memberEndpoints;
   static Config = configEndpoints;
   static Stream = streamEndpoints;
}

export default CmsApiService;