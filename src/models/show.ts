import { ShowCast, ShowDto, ShowEpisode } from "@/types/show";

export class Show {
   public id: number;
   public user_created: string;
   public date_created: string;
   public user_updated: string;
   public date_updated: string;
   public Title: string;
   public Cover: string;
   public Description: string;
   public Episodes: ShowEpisode[];
   public Slug: string;
   public Cast: ShowCast[];
   public Filter: string;
   public ModeratorNames?: string[];
   public Views: number;

   constructor(
      id: number,
      user_created: string,
      date_created: string,
      user_updated: string,
      date_updated: string,
      Title: string,
      Slug: string,
      Cover: string,
      Description: string,
      Episodes: ShowEpisode[],
      Cast: ShowCast[],
      Filter: string,
      Views: number,
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
      this.Episodes = Episodes;
      this.Cast = Cast;
      this.Slug = Slug;
      this.Filter = Filter;
      this.ModeratorNames = ModeratorNames;
      this.Views = Views;
   }

   public static fromDto(dto: ShowDto): Show {
      return new Show(
         dto.id,
         dto.user_created,
         dto.date_created,
         dto.user_updated,
         dto.date_updated,
         dto.Title,
         dto.Slug,
         dto.Cover,
         dto.Description,
         dto.Episodes,
         dto.Cast,
         dto.Filter,
         dto.Views,
         dto.ModeratorNames,
      );
   }
}