import { ModeratorDto } from "@/types/moderator";

export class Moderator {
   public id: number;
   public user_created: string;
   public date_created: string;
   public user_updated: string | null;
   public date_updated: string | null;
   public Name: string;

   constructor(
      id: number,
      user_created: string,
      date_created: string,
      user_updated: string | null,
      date_updated: string | null,
      Name: string
   ) {
      this.id = id;
      this.user_created = user_created;
      this.date_created = date_created;
      this.user_updated = user_updated;
      this.date_updated = date_updated;
      this.Name = Name;
   }

   public static fromDto(dto: ModeratorDto): Moderator {
      return new Moderator(
         dto.id,
         dto.user_created,
         dto.date_created,
         dto.user_updated,
         dto.date_updated,
         dto.Name
      );
   }
}