export type UserDto = {
   id: string,
   cmsAdminAccess: boolean,
   firstname: string,
   lastname: string,
   nickname: string,
   email: string,
   roles: Array<string>,
   status: string
}