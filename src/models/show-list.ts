import { PaginationShowDto } from "@/types/show-list";

export class PaginationShow {
   public id: string;
   public name: string;
   public description: string;
   public moderatorIds: Array<string>;
   public createdDate: string;
   public profileImageId: string;

   constructor(
      id: string,
      name: string,
      description: string,
      moderatorIds: Array<string>,
      createdDate: string,
      profileImageId: string
   ) {
      this.id = id;
      this.name = name;
      this.description = description;
      this.moderatorIds = moderatorIds;
      this.createdDate = createdDate;
      this.profileImageId = profileImageId;
   }

   public static fromDto(dto: PaginationShowDto): PaginationShow {
      return new PaginationShow(
         dto.id,
         dto.name,
         dto.description,
         dto.moderatorIds,
         dto.createdDate,
         dto.profileImageId
      );
   }
}