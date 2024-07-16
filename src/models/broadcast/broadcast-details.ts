import { GetByIdBroadcastDto } from "@/types/broadcast";

export class BroadcastDetails {
   public id: string;
   public name: string;
   public description: string;
   public startDate: Date;
   public endDate: Date;
   public show: {
      id: string;
      name: string;
   }
   public image?: {
      id: string;
      url: string;
   } | null;

   constructor(
      id: string,
      name: string,
      description: string,
      startDate: string,
      endDate: string,
      show: { id: string, name: string },
      image: { id: string, url: string } | null
   ) {
      this.id = id;
      this.name = name;
      this.description = description;
      this.startDate = new Date(startDate);
      this.endDate = new Date(endDate);
      this.show = { id: show.id, name: show.name };
      this.image = image ? { id: image.id, url: image.url } : null;
   }

   public static fromDto(id: string, dto: GetByIdBroadcastDto): BroadcastDetails {
      return new BroadcastDetails(
         id,
         dto.name,
         dto.description,
         dto.startDate,
         dto.endDate,
         dto.show,
         dto.image
      );
   }
}