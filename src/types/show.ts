import { Episode } from "@/models/episode";

export type ShowCast = {
   id: number;
   Cast_id: CastDto;
   Show_id: ShowDto;
}

export type MemberData = {
   id: number;
   Picture: string;
   Role: string;
   BestOfTheMonth: boolean;
}

export type CastDto = {
   id: number;
   Name: string;
   Slug: string;
   Description?: string; // Optional, deprecated
   Member?: MemberData; // Optional member data
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