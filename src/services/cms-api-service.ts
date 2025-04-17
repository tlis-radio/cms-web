import { ShowDto } from "@/types/show";
import { Show } from "@/models/show";
import { ModeratorDto } from "@/types/moderator";
import { Moderator } from "@/models/moderator";
import { EpisodeDto } from '@/types/episode';
import { Episode } from '@/models/episode';

import { createDirectus, Query, readItem, readItems, rest } from '@directus/sdk';

const directus = createDirectus('http://directus.tlis.sk').with(rest());

/*const getData = async <T>(uri: string): Promise<T> => {
   const response = await fetch(uri);

   if (response.status >= 400) {
      throw new Error(response.statusText);
   }

   return response.json();
}*/

const showEndpoints = {
   /* UROBIT TYP TOMUTO nech to nepromisuje any */
   listShows: async (): Promise<Array<Show>> => {
      const data = await directus.request<Array<ShowDto>>(readItems("Shows"));
      const moderators = await directus.request<Array<ModeratorDto>>(readItems("Moderators"));
      const shows = data.map((show: Show) => {
         const showModerators = show.Moderators.map((moderator: string) => {
            const foundModerator = moderators.find((m: Moderator) => m.id === moderator);
            
            //console.log(foundModerator);

            return foundModerator ? foundModerator.Name : null;
         }).filter((name: string | null) => name !== null);
         
         //console.log(showModerators);

         return {
            ...show,
            Moderators: showModerators,
         };
      });

      //console.log(shows);
      
      return shows || [];
   },

   getShowDataById: async (id: number): Promise<Show> => {
      const data = await directus.request<ShowDto>(readItem("Shows", id));
      const moderators = await directus.request<Array<ModeratorDto>>(readItems("Moderators"));
      const showModerators = data.Moderators.map((moderator: string) => {
         const foundModerator = moderators.find((m: Moderator) => m.id === moderator);
         return foundModerator ? foundModerator.Name : null;
      }).filter((name: string | null) => name !== null);

      data.Moderators = showModerators;

      //console.log(data);

      return data;
   },

   getShowEpisodesById: async (id: string): Promise<Array<Episode>> => {
      const showData = await directus.request<ShowDto>(readItem("Shows", id));
      var episodes = showData.Episode;
      var episodeData = await directus.request<Array<EpisodeDto>>(readItems("Episodes", {
         filter: { id: { _in: episodes } },
      }));

      //console.log(episodeData);

      return episodeData || [];
   },

};

class CmsApiService {
   static Show = showEndpoints;
}

export default CmsApiService;