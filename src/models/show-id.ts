import { ShowDto } from "@/types/show-id";

export class Show {
   public id: string;
   public name: string;
   public description: string;
   public moderators: Array<{ id: string, nickname: string }>;
   public createdDate: string;
   public profileImage: {
      id: string;
      url: string;
   };

   constructor(
      id: string,
      name: string,
      description: string,
      moderators: Array<{ id: string, nickname: string }>,
      createdDate: string,
      profileImage: {
         id: string;
         url: string;
      }
   ) {
      this.id = id;
      this.name = name;
      this.description = description;
      this.moderators = moderators;
      this.createdDate = createdDate;
      this.profileImage = profileImage;
   }

   public static fromDto(dto: ShowDto): Show {
      return new Show(
         dto.id,
         dto.name,
         dto.description,
         dto.moderators,
         dto.createdDate,
         dto.profileImage
      );
   }
}