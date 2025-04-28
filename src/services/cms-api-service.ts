import { ShowDto } from "@/types/show";
import { Show } from "@/models/show";
import { ModeratorDto } from "@/types/moderator";
import { Moderator } from "@/models/moderator";
import { EpisodeDto } from '@/types/episode';
import { Episode } from '@/models/episode';

import { createDirectus, readItem, readItems, rest } from '@directus/sdk';

const directus = createDirectus('http://directus.tlis.sk').with(rest());

const showEndpoints = {
   listShows: async (): Promise<Array<Show>> => {
      const shows = await directus.request<Array<ShowDto>>(readItems("Shows"));
      return shows || [];
   },

   getShowDataById: async (id: number): Promise<Show> => {
      const data = await directus.request<ShowDto>(readItem("Shows", id));
      return data;
   },

   getShowEpisodesById: async (id: string): Promise<Array<Episode>> => {
      const showData = await directus.request<ShowDto>(readItem("Shows", id));
      var episodeData = await directus.request<Array<EpisodeDto>>(readItems("Episodes", {
         filter: { id: { _in: showData.Episode } },
         sort: ['id'],
      }));

      return episodeData || [];
   },

   getShowModeratorsByIds: async (ids: Array<number>): Promise<Array<string>> => {
      var moderatorData = await directus.request<Array<ModeratorDto>>(readItems("Moderators", {
         filter: { id: { _in: ids } },
      }));

      const moderatorNames = moderatorData.map((moderator: Moderator) => {
         return moderator.Name;
      });

      return moderatorNames || "";
   }

};

class CmsApiService {
   static Show = showEndpoints;
}

export default CmsApiService;