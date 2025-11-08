export type Tags = {
   id: number,
   Episodes_id: EpisodeDto,
   Tags_id: Tag
}

export type Tag = {
   id: number,
   Title: string,
   Color: string
}

export type EpisodeDto = {
   id: string,
   user_created: string,
   date_created: string,
   user_updated: string,
   date_updated: string,
   Title: string,
   Cover: string,
   Audio: string,
   Show_Id: string,
   Date: string,
   Views: number,
   Tags: Tags[]
};