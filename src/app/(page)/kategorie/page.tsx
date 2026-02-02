import React from "react";
import CmsApiService from "@/services/cms-api-service";
import Link from "next/link";
import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tlis.sk";

export async function generateMetadata(): Promise<Metadata> {
   return {
      title: "Kategórie | Radio TLIS",
      description: "Prehľad kategórií článkov na Radiu TLIS.",
      alternates: { canonical: `${SITE_URL}/kategorie` },
      openGraph: {
         title: "Kategórie | Radio TLIS",
         description: "Prehľad kategórií článkov na Radiu TLIS.",
         url: `${SITE_URL}/kategorie`,
         siteName: "Radio TLIS",
         locale: "sk_SK",
      },
   };
}

const CategoriesPage: React.FC = async () => {
   let categories: any[] = [];
   let loadingError = false;

   try {
      categories = await CmsApiService.Article.listCategories();
   } catch (error) {
      console.error("Error fetching categories:", error);
      loadingError = true;
   }

   const breadcrumbs = [
      { label: "Kategórie", href: "/kategorie" }
   ];

   const jsonLd = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Kategórie článkov",
      "description": "Prehľad kategórií článkov na Radiu TLIS.",
      "url": `${SITE_URL}/kategorie`,
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
               <span className="text-[#d43c4a] italic text-[1.4em] mr-2">TLIS</span> kategórie
            </h1>
         </div>

         {loadingError && (
            <div className="relative py-8 px-8">
               <h3 className="font-argentumSansMedium text-xl mb-3 text-white">
                  Chyba pri načítaní kategórií
               </h3>
               <p className="text-gray-200 mb-4">Skúste to prosím neskôr.</p>
            </div>
         )}

         <div className="px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((category) => (
               <Link
                  key={category.id}
                  href={`/kategorie/${category.slug}`}
                  className="bg-[#1c1c1c] text-white p-6 rounded-lg border border-gray-700 hover:border-[#d43c4a] hover:bg-[#111] transition-all duration-200 group"
               >
                  <h2 className="text-xl font-semibold mb-2 group-hover:text-[#d43c4a] transition-colors">
                     {category.name}
                  </h2>
                  {category.description && (
                     <p className="text-gray-400 text-sm line-clamp-2">
                        {category.description}
                     </p>
                  )}
               </Link>
            ))}
         </div>

         {categories.length === 0 && !loadingError && (
            <div className="px-8 text-center py-12">
               <p className="text-gray-400">Zatiaľ tu nie sú žiadne kategórie.</p>
            </div>
         )}
      </>
   );
};

export default CategoriesPage;
export const dynamic = "force-dynamic";
