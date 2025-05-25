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
   Cast: Array<number>
   Filter: string;
   ModeratorNames?: string[];
};