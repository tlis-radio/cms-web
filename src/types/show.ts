export type ShowCast = {
   id: number;
   Cast_id: CastDto;
   Show_id: ShowDto;
}

export type CastDto = {
   id: number;
   Name: string;
}

export type ShowDto = {
   id: number,
   user_created: string,
   date_created: string,
   user_updated: string,
   date_updated: string,
   Title: string,
   Cover: string,
   Description: string,
   Episode: Array<string>,
   Cast: ShowCast[],
   Filter: string;
   ModeratorNames?: string[];
   Views: number;
};