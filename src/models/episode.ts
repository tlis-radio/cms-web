import { EpisodeDto, Tags } from "@/types/episode";

export class Episode {
   public id: string;
   public user_created: string;
   public date_created: string;
   public user_updated: string;
   public date_updated: string;
   public Title: string;
   public Cover: string;
   public Audio: { id: string; duration?: number };
   public Show_Id: string;
   public Date: string;
   public Views: number;
   public Tags: Array<Tags>;

   constructor(
      id: string,
      user_created: string,
      date_created: string,
      user_updated: string,
      date_updated: string,
      Title: string,
      Cover: string,
      Audio: { id: string; duration?: number },
      Show_Id: string,
      Date: string,
      Views: number,
      Tags: Array<Tags>
   ) {
      this.id = id;
      this.user_created = user_created;
      this.date_created = date_created;
      this.user_updated = user_updated;
      this.date_updated = date_updated;
      this.Title = Title;
      this.Cover = Cover;
      this.Audio = Audio;
      this.Show_Id = Show_Id;
      this.Date = Date;
      this.Views = Views;
      this.Tags = Tags;
   }

   public static fromDto(dto: EpisodeDto): Episode {
      return new Episode(
         dto.id,
         dto.user_created,
         dto.date_created,
         dto.user_updated,
         dto.date_updated,
         dto.Title,
         dto.Cover,
         dto.Audio,
         dto.Show_Id,
         dto.Date,
         dto.Views,
         dto.Tags
      );
   }
}