import React from "react";
import CmsApiService from "@/services/cms-api-service";
import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import Breadcrumbs from "@/components/Breadcrumbs";
import CastGrid from "./CastGrid";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tlis.sk";

export const metadata: Metadata = {
   title: "Účinkujúci | Radio TLIS",
   description: "Zoznam všetkých moderátorov, redaktorov a účinkujúcich na Rádiu TLIS.",
   alternates: { canonical: `${SITE_URL}/ucinkujuci` },
   openGraph: {
      title: "Účinkujúci | Radio TLIS",
      description: "Zoznam všetkých moderátorov, redaktorov a účinkujúcich na Rádiu TLIS.",
      url: `${SITE_URL}/ucinkujuci`,
      siteName: "Radio TLIS",
      locale: "sk_SK",
   },
};

const CastPage = async () => {
   let loadingError = false;
   let cast: any[] = [];

   try {
      cast = await CmsApiService.Cast.listAllCast();
   } catch (error) {
      console.error("Error fetching cast:", error);
      loadingError = true;
   }

   // Create CollectionPage JSON-LD
   const collectionJson = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": "Účinkujúci - Radio TLIS",
      "description": "Zoznam všetkých moderátorov, redaktorov a účinkujúcich na Rádiu TLIS.",
      "url": `${SITE_URL}/ucinkujuci`,
      "publisher": {
         "@type": "Organization",
         "name": "Radio TLIS",
         "url": SITE_URL
      }
   };

   const breadcrumbs = [
      { label: "Účinkujúci", href: "/ucinkujuci" }
   ];

   return (
      <>
         <JsonLd data={collectionJson} />
         <div className="px-8 mb-6">
            <Breadcrumbs items={breadcrumbs} />
         </div>
         <CastGrid cast={cast} loadingError={loadingError} />
      </>
   );
};

export default CastPage;
export const dynamic = "force-dynamic";
