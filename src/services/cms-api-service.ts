import { ShowDto } from "@/types/show";
import { Show } from "@/models/show";
import { EpisodeDto, Tag } from '@/types/episode';
import { Episode } from '@/models/episode';
import { ArticleDto, ArticleCategory, Article } from '@/types/article';

import { aggregate, createDirectus, readItem, readItems, rest, RestClient, staticToken } from '@directus/sdk';
import Config from "@/types/config";

let directusInstance: RestClient<any>;
let publicDirectusInstance: RestClient<any>;

export function getDirectusInstance(): RestClient<any> {
   if (!directusInstance) {
      if (!process.env.DIRECTUS_TOKEN) {
         throw new Error("DIRECTUS_TOKEN environment variable is not set.");
      }

      if (!process.env.NEXT_PUBLIC_DIRECTUS_URL) {
         throw new Error("NEXT_PUBLIC_DIRECTUS_URL environment variable is not set.");
      }
      directusInstance = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL!)
         .with(staticToken(process.env.DIRECTUS_TOKEN!))
         .with(rest({ onRequest: (options) => ({ ...options, cache: "no-store" }), }));
   }
   return directusInstance;
}

export function getPublicDirectusInstance(): RestClient<any> {
   if (!publicDirectusInstance) {
      if (!process.env.NEXT_PUBLIC_DIRECTUS_URL) {
         throw new Error("NEXT_PUBLIC_DIRECTUS_URL environment variable is not set.");
      }
      publicDirectusInstance = createDirectus(process.env.NEXT_PUBLIC_DIRECTUS_URL!)
         .with(rest({ onRequest: (options) => ({ ...options, cache: "no-store" }), }));
   }
   return publicDirectusInstance;
}

const showEndpoints = {
   PAGE_SIZE: 10, // TODO: adjustable page size in future?
   listShows: async (): Promise<Array<Show>> => {
      const shows = await getDirectusInstance().request<Array<ShowDto>>(readItems("Shows", {
         sort: ['-Episodes.Episodes_id.Date'],
         fields: ['*', 'Cast.Cast_id.*', 'Episodes.Episodes_id'],
      }));
      return shows || [];
   },

   listShowsCount: async (filter: string): Promise<number> => {
      const showsCount = await getDirectusInstance().request(aggregate("Shows", {
         aggregate: { count: '*' },
         query: { filter: { Filter: { _eq: filter } } },
      }));
      return parseInt(showsCount[0].count!) || 0;
   },

   listShowsPaginated: async (page: number, filter: string): Promise<{ shows: Array<Show>, totalCount: number }> => {
      const total_count = await showEndpoints.listShowsCount(filter);
      var shows = await getDirectusInstance().request<Array<ShowDto>>(readItems("Shows", {
         sort: ['-Episodes.Episodes_id.Date'],
         fields: ['*', 'Cast.Cast_id.Name', 'Cast.Cast_id.Slug', 'Episodes.Episodes_id'],
         filter: { Filter: { _eq: filter } },
         limit: showEndpoints.PAGE_SIZE,
         page
      }));
      return { shows: shows || [], totalCount: total_count };
   },

   getShowDataById: async (id: number): Promise<Show> => {
      try {
         const data = await getDirectusInstance().request<ShowDto>(readItem("Shows", id, {
            fields: ['*', 'Cast.Cast_id.Name', 'Cast.Cast_id.Slug'],
         }));
         return data;
      } catch (error) {
         console.error("Error fetching show data: (Probably not found)");
         throw error;
      }
   },

   getShowBySlug: async (slug: string): Promise<Show> => {
      const shows = await getDirectusInstance().request<Array<ShowDto>>(readItems("Shows", {
         filter: { Slug: { _eq: slug } },
         fields: ['*', 'Cast.Cast_id.Name', 'Cast.Cast_id.Slug'],
      }));
      if (!shows || shows.length === 0) {
         throw new Error(`Show with slug '${slug}' not found`);
      }
      return shows[0];
   },

   getShowByEpisodeId: async (episodeId: number | string): Promise<Show | null> => {
      const shows = await getDirectusInstance().request<Array<ShowDto>>(readItems("Shows", {
         filter: { Episodes: { Episodes_id: { _eq: Number(episodeId) } } },
         fields: ['*', 'Cast.Cast_id.Name', 'Cast.Cast_id.Slug'],
      }));
      if (!shows || shows.length === 0) return null;
      return shows[0];
   },

   getShowTagsById: async (id: string): Promise<Array<Tag>> => {
      const showData = await getDirectusInstance().request<ShowDto>(readItem("Shows", id, {
         fields: ['Episodes.Episodes_id.Tags.Tags_id.*'],
      }));
      var allTags: Array<Tag> = [];
      for (let junction of showData.Episodes) {
         const episode = junction.Episodes_id as Episode;
         for (let tagRelation of episode.Tags) {
            const tag = tagRelation.Tags_id;
            if (!allTags.find(t => t.id === tag.id)) {
               allTags.push(tag);
            }
         }
      }
      return allTags;
   },

   getEpisodesByTagId: async (tagId: number): Promise<Array<Episode>> => {
      const episodes = await getDirectusInstance().request<Array<EpisodeDto>>(readItems("Episodes", {
         fields: ["*", "Tags.Tags_id.*", "Audio.*"],
         filter: { "Tags.Tags_id.id": { _eq: tagId }, status: { _eq: 'published' } },
      }));
      return episodes || [];
   },

   getShowEpisodesById: async (id: string): Promise<Array<Episode>> => {
      const showData = await getDirectusInstance().request<ShowDto>(readItem("Shows", id, {
         fields: ['Episodes.Episodes_id'],
      }));
      if (!showData.Episodes || showData.Episodes.length === 0) return [];
      const episodeIds = showData.Episodes.map(e => e.Episodes_id);
      var episodeData = await getDirectusInstance().request<Array<EpisodeDto>>(readItems("Episodes", {
         fields: ["*", "Tags.Tags_id.*", "Audio.*"],
         filter: { id: { _in: episodeIds }, status: { _eq: 'published' } },
         sort: ['-Date'],
      }));

      return episodeData || [];
   },

   getEpisodeById: async (id: number): Promise<Episode | null> => {
      const episode = await getDirectusInstance().request<EpisodeDto>(readItem("Episodes", id, {
         fields: ["*", "Tags.Tags_id.*", "Audio.*"],
         filter: { status: { _eq: 'published' } }
      }));
      return episode || null;
   },

   getShowEpisodesCountById: async (id: string): Promise<number> => {
      const showData = await getDirectusInstance().request<ShowDto>(readItem("Shows", id, {
         fields: ['Episodes.Episodes_id'],
      }));
      if (!showData.Episodes || showData.Episodes.length === 0) return 0;
      const episodeIds = showData.Episodes.map(e => e.Episodes_id);
      const showEpisodesCount = await getDirectusInstance().request(aggregate("Episodes", {
         query: { filter: { id: { _in: episodeIds }, status: { _eq: 'published' } }, },
         aggregate: { count: '*' },
      }));
      return parseInt(showEpisodesCount[0].count!) || 0;
   },

   getShowEpisodesByIdPaginated: async (id: string, page: number): Promise<{ show: Show, episodes: Array<Episode>, totalCount: number }> => {
      const showData = await getDirectusInstance().request<ShowDto>(readItem("Shows", id, { fields: ['*', 'Cast.Cast_id.Name', 'Cast.Cast_id.Slug', 'Episodes.Episodes_id' ] }));
      if (!showData.Episodes || showData.Episodes.length === 0) return { show: showData, episodes: [], totalCount: 0 };
      const episodeIds = showData.Episodes.map(e => e.Episodes_id);
      const total_count = await showEndpoints.getShowEpisodesCountById(id);
      var episodeData = await getDirectusInstance().request<Array<EpisodeDto>>(readItems("Episodes", {
         fields: ["*", "Tags.Tags_id.*", "Audio.*"],
         filter: { id: { _in: episodeIds }, status: { _eq: 'published' } },
         sort: ['-Date'],
         limit: showEndpoints.PAGE_SIZE,
         page
      }));
      return { show: showData, episodes: episodeData || [], totalCount: total_count };
   }
};

var memberEndpoints = {
   listMembers: async (): Promise<Array<Object>> => {
      const members = await getDirectusInstance().request<Array<Object>>(readItems("Members", {fields: ['*', 'Cast.*']}));
      return members || [];
   }
};

var castEndpoints = {
   PAGE_SIZE: 10,
   
   listAllCast: async (): Promise<Array<any>> => {
      const cast = await getDirectusInstance().request<Array<any>>(readItems("Cast", {
         fields: ['*'],
         sort: ['Name'],
      }));
      return cast || [];
   },
   
   getCastBySlug: async (slug: string): Promise<any> => {
      const cast = await getDirectusInstance().request<Array<any>>(readItems("Cast", {
         filter: { Slug: { _eq: slug } },
         fields: ['*'],
      }));
      if (!cast || cast.length === 0) {
         throw new Error(`Cast member with slug '${slug}' not found`);
      }
      
      // Fetch related Member data if exists
      const members = await getDirectusInstance().request<Array<any>>(readItems("Members", {
         filter: { Cast: { id: { _eq: cast[0].id } } },
         fields: ['id', 'Picture', 'Role', 'BestOfTheMonth'],
         limit: 1
      }));
      
      // Attach member data to cast if found
      if (members && members.length > 0) {
         cast[0].Member = members[0];
      }
      
      return cast[0];
   },

   getShowsByCastIdCount: async (castId: number): Promise<number> => {
      const showsCount = await getDirectusInstance().request(aggregate("Shows", {
         aggregate: { count: '*' },
         query: { filter: { Cast: { Cast_id: { id: { _eq: castId } } } } }
      }));
      return parseInt(showsCount[0].count!) || 0;
   },

   getShowsByCastIdPaginated: async (castId: number, page: number): Promise<{ shows: Array<Show>, totalCount: number }> => {
      const total_count = await castEndpoints.getShowsByCastIdCount(castId);
      const shows = await getDirectusInstance().request<Array<ShowDto>>(readItems("Shows", {
         sort: ['-Episodes.Episodes_id.Date'],
         fields: ['*', 'Cast.Cast_id.Name', 'Cast.Cast_id.Slug'],
         filter: { Cast: { Cast_id: { id: { _eq: castId } } } },
         limit: castEndpoints.PAGE_SIZE,
         page
      }));
      return { shows: shows || [], totalCount: total_count };
   },
};

var configEndpoints = {
   getConfig: async (): Promise<Config> => {
      const config = await getPublicDirectusInstance().request<Config>(readItems("config", {
         fields: ['links.*']
      }));
      return config;
   }
}

var streamEndpoints = {
   getCurrentStreamTitle: async (): Promise<string> => {
      const stream = await getPublicDirectusInstance().request<{ current_episode: EpisodeDto }>(readItem("stream", 1, {
         fields: ['current_episode.*']
      }));
      var {current_episode} = stream;
      if(!current_episode) return "";
      return current_episode.Title || "";
   },
   getCurrentStream: async (): Promise<{current_episode: Episode, updated_at: string} | null> => {
      const stream = await getPublicDirectusInstance().request<{ current_episode: EpisodeDto,  updated_at: string }>(readItem("stream", 1, {
         fields: ['current_episode.*', 'updated_at']
      }));
      if (!stream.current_episode) return null;
      return stream;
   }
}

var articleEndpoints = {
   PAGE_SIZE: 10,

   listArticlesCount: async (categorySlug?: string): Promise<number> => {
      const filter: any = { status: { _eq: 'published' } };
      if (categorySlug) {
         filter.categories = { Article_Category_id: { slug: { _eq: categorySlug } } };
      }
      const articlesCount = await getDirectusInstance().request(aggregate("Article", {
         aggregate: { count: '*' },
         query: { filter },
      }));
      return parseInt(articlesCount[0].count!) || 0;
   },

   listArticlesPaginated: async (page: number, categorySlug?: string): Promise<{ articles: Array<Article>, totalCount: number }> => {
      const total_count = await articleEndpoints.listArticlesCount(categorySlug);
      const filter: any = { status: { _eq: 'published' } };
      if (categorySlug) {
         filter.categories = { Article_Category_id: { slug: { _eq: categorySlug } } };
      }
      const articles = await getDirectusInstance().request<Array<ArticleDto>>(readItems("Article", {
         sort: ['-published_at'],
         fields: ['*', 'author.*', 'categories.Article_Category_id.*', 'gallery.directus_files_id'],
         filter,
         limit: articleEndpoints.PAGE_SIZE,
         page
      }));
      return { articles: articles || [], totalCount: total_count };
   },

   //here
   getArticleBySlug: async (slug: string): Promise<Article> => {
      const articles = await getDirectusInstance().request<Array<ArticleDto>>(readItems("Article", {
         filter: { slug: { _eq: slug }, status: { _eq: 'published' } },
         fields: ['*', 'author.*', 'categories.Article_Category_id.*', 'gallery.directus_files_id'],
      }));
      if (!articles || articles.length === 0) {
         throw new Error(`Article with slug '${slug}' not found`);
      }
      
      const members = await getDirectusInstance().request<Array<any>>(readItems("Members", {
         filter: { Cast: { id: { _eq: articles[0].author?.id } } },
         fields: ['Picture'],
         limit: 1
      }));

      if (members && members.length > 0) {
         articles[0].author!.Member = members[0];
      }

      return articles[0];
   },

   getArticleById: async (id: number): Promise<Article | null> => {
      const article = await getDirectusInstance().request<ArticleDto>(readItem("Article", id, {
         fields: ['*', 'author.*', 'categories.Article_Category_id.*', 'gallery.directus_files_id'],
      }));
      return article || null;
   },

   getArticlesByEpisodeId: async (episodeId: number): Promise<Array<Article>> => {
      // Search for articles that mention the episode in content using custom tag @[episode:id]
      const articles = await getDirectusInstance().request<Array<ArticleDto>>(readItems("Article", {
         filter: { 
            status: { _eq: 'published' },
            content: { _contains: `@[episode:${episodeId}]` }
         },
         fields: ['id', 'title', 'slug', 'thumbnail_image', 'published_at', 'type'],
         sort: ['-published_at'],
         limit: 5
      }));
      return articles || [];
   },

   listCategories: async (): Promise<Array<ArticleCategory>> => {
      const categories = await getDirectusInstance().request<Array<ArticleCategory>>(readItems("Article_Category", {
         fields: ['*'],
      }));
      return categories || [];
   },

   getCategoryBySlug: async (slug: string): Promise<ArticleCategory> => {
      const categories = await getDirectusInstance().request<Array<ArticleCategory>>(readItems("Article_Category", {
         filter: { slug: { _eq: slug } },
         fields: ['*'],
      }));
      if (!categories || categories.length === 0) {
         throw new Error(`Category with slug '${slug}' not found`);
      }
      return categories[0];
   },

   getArticlesByAuthorIdCount: async (authorId: number): Promise<number> => {
      const articlesCount = await getDirectusInstance().request(aggregate("Article", {
         aggregate: { count: '*' },
         query: { filter: { author: { id: { _eq: authorId } }, status: { _eq: 'published' } } },
      }));
      return parseInt(articlesCount[0].count!) || 0;
   },

   getArticlesByAuthorIdPaginated: async (authorId: number, page: number): Promise<{ articles: Array<Article>, totalCount: number }> => {
      const total_count = await articleEndpoints.getArticlesByAuthorIdCount(authorId);
      const articles = await getDirectusInstance().request<Array<ArticleDto>>(readItems("Article", {
         sort: ['-published_at'],
         fields: ['*', 'author.*', 'categories.Article_Category_id.*', 'gallery.directus_files_id'],
         filter: { author: { id: { _eq: authorId } }, status: { _eq: 'published' } },
         limit: articleEndpoints.PAGE_SIZE,
         page
      }));
      return { articles: articles || [], totalCount: total_count };
   },

   getRecentEvents: async (limit: number = 5): Promise<Array<Article>> => {
      const events = await getDirectusInstance().request<Array<ArticleDto>>(readItems("Article", {
         sort: ['-event_time'],
         fields: ['*', 'author.*', 'categories.Article_Category_id.*', 'gallery.directus_files_id'],
         filter: { 
            status: { _eq: 'published' },
            type: { _in: ['event', 'report'] }
         },
         limit
      }));
      return events || [];
   },
};

class CmsApiService {
   static Show = showEndpoints;
   static Member = memberEndpoints;
   static Cast = castEndpoints;
   static Config = configEndpoints;
   static Stream = streamEndpoints;
   static Article = articleEndpoints;
}

export const SHOWS_PAGE_SIZE = showEndpoints.PAGE_SIZE;
export const CAST_PAGE_SIZE = castEndpoints.PAGE_SIZE;
export const ARTICLES_PAGE_SIZE = articleEndpoints.PAGE_SIZE;

export default CmsApiService;