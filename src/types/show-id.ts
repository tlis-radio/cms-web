export type ShowDto = {
   id: string,
   name: string,
   description: string,
   moderators: Array<ShowModeratorDto>,
   createdDate: string,
   profileImage: ShowDtoImage
};

export type ShowModeratorDto = {
   id: string,
   nickname: string
};

export type ShowDtoImage = {
   id: string;
   url: string;
}