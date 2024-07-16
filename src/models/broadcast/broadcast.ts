import { BroadcastDto } from "@/types/broadcast";

export class Broadcast {
   public id: string;
   public name: string;
   public description: string;
   public startDate: string;
   public endDate: string;

   constructor(
      id: string,
      name: string,
      description: string,
      startDate: string,
      endDate: string
   ) {
      this.id = id;
      this.name = name;
      this.description = description;
      this.startDate = startDate;
      this.endDate = endDate;
   }

   public static fromDto(dto: BroadcastDto): Broadcast {
      return new Broadcast(
         dto.id,
         dto.name,
         dto.description,
         dto.startDate,
         dto.endDate
      );
   }
}