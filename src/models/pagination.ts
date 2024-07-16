export type PaginationDto<TResultDto> = {
   limit: number;
   page: number;
   total: number;
   totalPages: number;
   results: Array<TResultDto>;
};

export class Pagination<TResult> {
   public limit: number;
   public page: number;
   public total: number;
   public totalPages: number;
   public results: Array<TResult>;

   constructor(
      limit: number,
      page: number,
      total: number,
      totalPages: number,
      results: Array<TResult>
   ) {
      this.limit = limit;
      this.page = page;
      this.total = total;
      this.totalPages = totalPages;
      this.results = results;
   }
}