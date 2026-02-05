import { CastDto } from "./show";

export type ArticleType = "article" | "event" | "report";

export type ArticleCategory = {
   id: number;
   name: string;
   slug: string;
   description?: string;
   thumbnail: string;
};

export type ArticleCategoryRelation = {
   id: number;
   Article_id: number;
   Article_Category_id: ArticleCategory;
};

export type ArticleFileRelation = {
   id: number;
   Article_id: number;
   directus_files_id: string;
};

export type ArticleDto = {
   id: number;
   status: "draft" | "published" | "archived";
   user_created: string;
   date_created: string;
   user_updated?: string;
   date_updated?: string;
   title: string;
   slug: string;
   description?: string;
   content?: string;
   author?: CastDto;
   published_at?: string;
   thumbnail_image?: string;
   cover_image?: string;
   type: ArticleType;
   event_time?: string;
   event_place?: string;
   categories?: ArticleCategoryRelation[];
   gallery?: ArticleFileRelation[];
};

export type Article = ArticleDto;
