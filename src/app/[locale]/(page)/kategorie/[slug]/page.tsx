import React from "react";
import CmsApiService from "@/services/cms-api-service";
import ArticlesPage from "../../clanky/ArticlesPage";
import NotFound from "@/components/NotFound";
import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tlis.sk";

export async function generateMetadata({ params, searchParams }: { params: Promise<{ slug: string }>, searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }): Promise<Metadata> {
   const { slug } = await params;
   const resolvedSearchParams = await searchParams;
   const pageParam = resolvedSearchParams?.page;
   const page = Array.isArray(pageParam) ? parseInt(pageParam[0] || "1") : parseInt(pageParam || "1");
   
   const canonicalUrl = page === 1 
      ? `${SITE_URL}/kategorie/${slug}`
      : `${SITE_URL}/kategorie/${slug}?page=${page}`;
   
   try {
      const category = await CmsApiService.Article.getCategoryBySlug(slug);
      const title = category?.name ? `${category.name} | Radio TLIS` : `Kategória | Radio TLIS`;
      const description = category?.description || `Články v kategórii ${category?.name || slug} na Radiu TLIS.`;
      
      return {
         title,
         description,
         alternates: { canonical: canonicalUrl },
         openGraph: {
            title,
            description,
            url: canonicalUrl,
            siteName: "Radio TLIS",
            locale: "sk_SK",
         },
      };
   } catch (e) {
      return {
         title: `Kategória | Radio TLIS`,
         description: `Články v kategórii na Radiu TLIS.`,
         alternates: { canonical: canonicalUrl },
         openGraph: { 
            title: `Kategória | Radio TLIS`, 
            description: `Články v kategórii.`, 
            url: canonicalUrl, 
            siteName: "Radio TLIS", 
            locale: "sk_SK" 
         },
      };
   }
}

const CategoryPage = async ({ params, searchParams }: { params: Promise<{ slug: string }>, searchParams?: Promise<{ [key: string]: string | string[] | undefined }> }) => {
   const { slug } = await params;
   const resolvedSearchParams = await searchParams;
   const pageParam = resolvedSearchParams?.page;
   const page = Array.isArray(pageParam) ? parseInt(pageParam[0] || "1") : parseInt(pageParam || "1");
   
   try {
      const category = await CmsApiService.Article.getCategoryBySlug(slug);
      const articlesResult = await CmsApiService.Article.listArticlesPaginated(page, slug);
      
      const breadcrumbs = [
         { label: "Kategórie", href: "/kategorie" },
         { label: category.name, href: `/kategorie/${slug}` }
      ];

      const jsonLd = {
         "@context": "https://schema.org",
         "@type": "CollectionPage",
         "name": category.name,
         "description": category.description,
         "url": `${SITE_URL}/kategorie/${slug}`,
         "publisher": {
            "@type": "Organization",
            "name": "Radio TLIS",
            "url": SITE_URL
         }
      };

      return (
         <>
            <JsonLd data={jsonLd} />
            <div className="px-8 mb-4">
               <Breadcrumbs items={breadcrumbs} />
            </div>
            <div className="flex flex-wrap items-center justify-between mb-8 px-8">
               <h1 className="text-4xl text-white font-semibold">
                  <span className="text-[#d43c4a] italic text-[1.4em] mr-2">TLIS</span> {category.name}
               </h1>
            </div>
            {category.description && (
               <div className="px-8 mb-6">
                  <p className="text-gray-400">{category.description}</p>
               </div>
            )}
            <ArticlesPage 
               articles={articlesResult.articles} 
               totalCount={articlesResult.totalCount} 
               currentPage={page}
               showHeader={false}
            />
         </>
      );
   } catch (error) {
      return <NotFound message={<h2 className="text-2xl text-white mb-2">Kategóriu sa nepodarilo načítať.</h2>} />;
   }
};

export default CategoryPage;
export const dynamic = "force-dynamic";
