import React from "react";
import ArticleLink from "@/components/ArticleLink";
import CmsApiService from "@/services/cms-api-service";
import { Link } from '@/navigation';
import { getTranslations } from "next-intl/server";

interface LatestArticlesProps {
   limit?: number;
}

const LatestArticles: React.FC<LatestArticlesProps> = async ({ limit = 4 }) => {
   const t = await getTranslations("HomePage");

   const result = await CmsApiService.Article.listArticlesPaginated(1).catch((error) => {
      console.error("Error fetching latest articles:", error);
      return { articles: [], totalCount: 0 };
   });
   const articles = result.articles.slice(0, limit);

   if (articles.length === 0) return null;

   return (
      <div className="mb-12 pb-16">
         <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 px-4 md:px-8 lg:px-16 xl:px-24 pb-2">
            <h2 className="text-4xl text-white font-semibold pb-0">
               <span className="text-[#d43c4a] italic text-[1.4em] mr-2">TLIS</span> {t('articlesTitle')}
            </h2>
            <Link
               href="/clanky"
               className="font-argentumSansBold bg-[#d43c4a] rounded-full px-4 py-2 text-white hover:underline mt-2 md:mt-0"
            >
               {t('viewAll')}
            </Link>
         </div>
         <div className="px-4 md:px-8 lg:px-16 xl:px-24">
            {articles.map((article: any, index: number) => (
               <ArticleLink
                  key={article.id || article.slug || index}
                  article={article}
               />
            ))}
         </div>
      </div>
   );
};

export default LatestArticles;
