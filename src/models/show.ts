import { ShowDto } from "@/types/show";

export class Show {
   public id: number;
   public user_created: string;
   public date_created: string;
   public user_updated: string;
   public date_updated: string;
   public Title: string;
   public Cover: string;
   public Description: string;
   public Episode: Array<string>;
   public Cast: Array<number>;
   public Filter: string;
   public ModeratorNames?: string[];

   constructor(
      id: number,
      user_created: string,
      date_created: string,
      user_updated: string,
      date_updated: string,
      Title: string,
      Cover: string,
      Description: string,
      Episode: Array<string>,
      Cast: Array<number>,
      Filter: string,
      ModeratorNames?: string[]
   ) {
      this.id = id;
      this.user_created = user_created;
      this.date_created = date_created;
      this.user_updated = user_updated;
      this.date_updated = date_updated;
      this.Title = Title;
      this.Cover = Cover;
      this.Description = Description;
      this.Episode = Episode;
      this.Cast = Cast;
      this.Filter = Filter;
      this.ModeratorNames = ModeratorNames;
   }

   public static fromDto(dto: ShowDto): Show {
      return new Show(
         dto.id,
         dto.user_created,
         dto.date_created,
         dto.user_updated,
         dto.date_updated,
         dto.Title,
         dto.Cover,
         dto.Description,
         dto.Episode,
         dto.Cast,
         dto.Filter,
         dto.ModeratorNames
      );
   }
}