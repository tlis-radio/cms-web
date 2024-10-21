import { PaginationShowDto } from "@/types/show-list";

export class PaginationShow {
   public id: string;
   public name: string;
   public description: string;
   public moderatorNames: Array<string>;
   public createdDate: string;
   public profileImageUrl: string;

   constructor(
      id: string,
      name: string,
      description: string,
      moderatorNames: Array<string>,
      createdDate: string,
      profileImageUrl: string
   ) {
      this.id = id;
      this.name = name;
      this.description = description;
      this.moderatorNames = moderatorNames;
      this.createdDate = createdDate;
      this.profileImageUrl = profileImageUrl;
   }

   public static fromDto(dto: PaginationShowDto): PaginationShow {
      return new PaginationShow(
         dto.id,
         dto.name,
         dto.description,
         dto.moderatorNames,
         dto.createdDate,
         dto.profileImageUrl
      );
   }
}