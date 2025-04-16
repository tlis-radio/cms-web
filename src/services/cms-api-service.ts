import { PaginationDto } from "@/models/pagination";
import { PaginationShowDto } from "@/types/show-list";
import { ShowDto } from "@/types/show-id";
import { PaginationShow } from "@/models/show-list";
import { Show } from "@/models/show-id";

import { createDirectus, readItem, readItems, rest } from '@directus/sdk';
const directus = createDirectus('http://directus.tlis.sk').with(rest());

const getData = async <T>(uri: string): Promise<T> => {
   const response = await fetch(uri);

   if (response.status >= 400) {
      throw new Error(response.statusText);
   }

   return response.json();
}

const showEndpoints = {
   /* UROBIT TYP TOMUTO nech to nepromisuje any */
   listShows: async (limit: number, page: number): Promise<any> => {
      const data = await directus.request(readItems("Shows"));
      const moderators = await directus.request(readItems("Moderators"));
      const shows = data.map((show: any) => {
         const showModerators = show.Moderators.map((moderator: any) => {
            const foundModerator = moderators.find((m: any) => m.id === moderator);
            return foundModerator ? foundModerator.Name : null;
         }).filter((name: any) => name !== null);

         return {
            ...show,
            Moderators: showModerators,
         };
      });
      // console.log(shows)
      return shows || [];
   },

   getShowDataById: async (id: string): Promise<any> => {
      const data = await directus.request(readItem("Shows", id));
      const moderators = await directus.request(readItems("Moderators"));
      const showModerators = data.Moderators.map((moderator: any) => {
         const foundModerator = moderators.find((m: any) => m.id === moderator);
         return foundModerator ? foundModerator.Name : null;
      }).filter((name: any) => name !== null);

      data.Moderators = showModerators;

      return data;
   },

   getShowEpisodesById: async (id: string): Promise<any> => {
      const showData = await directus.request(readItem("Shows", id));
      var episodes = showData.Episode;
      var episodeData = await directus.request(readItems("Episodes", {
         filter: { id: { _in: episodes } },
      }));
      const moderators = await directus.request(readItems("Moderators"));
      return episodeData || [];
   },

};

class CmsApiService {
   static Show = showEndpoints;
}

export default CmsApiService;