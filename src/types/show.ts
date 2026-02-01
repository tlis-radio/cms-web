import { Episode } from "@/models/episode";

export type ShowCast = {
   id: number;
   Cast_id: CastDto;
   Show_id: ShowDto;
}

export type CastDto = {
   id: number;
   Name: string;
   Slug: string;
   Description: string;
}

export type ShowDto = {
   id: number,
   user_created: string,
   date_created: string,
   user_updated: string,
   date_updated: string,
   Title: string,
   Slug: string,
   Cover: string,
   Description: string,
   Episode: Array<Episode>,
   Cast: ShowCast[],
   Filter: string;
   ModeratorNames?: string[];
   Views: number;
};