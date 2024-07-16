export type BroadcastDto = {
   id: string,
   name: string,
   description: string,
   startDate: string,
   endDate: string,
   showId: string
};

export type GetByIdBroadcastDto = {
   id: string,
   name: string,
   description: string,
   startDate: string,
   endDate: string,
   show: GetByIdBroadcastDtoShow,
   image: GetByIdBroadcastDtoImage | null
};

export type GetByIdBroadcastDtoShow = {
   id: string;
   name: string;
};

export type GetByIdBroadcastDtoImage = {
   id: string;
   url: string;
};