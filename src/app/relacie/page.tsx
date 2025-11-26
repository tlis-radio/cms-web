import React, { useState } from "react";
import CmsApiService from "@/services/cms-api-service";
import ShowsPage from "./ShowsPage";
import type { Metadata } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://tlis.sk";

export const metadata: Metadata = {
   title: "Relácie | Radio TLIS | tlis.sk",
   description: "Prehľad relácií Radia TLIS — vyhľadajte relácie, moderátorov a posledné epizódy.",
   alternates: { canonical: SITE_URL + "/relacie" },
   openGraph: {
      title: "Relácie | Radio TLIS | tlis.sk",
      description: "Prehľad relácií Radia TLIS — vyhľadajte relácie, moderátorov a epizódy.",
      url: SITE_URL + "/relacie",
      siteName: "Radio TLIS",
      locale: "sk_SK",
   },
};

const Shows: React.FC = async ({ searchParams }: { searchParams?: { [key: string]: string | string[] | undefined } }) => {
   let filterValue = searchParams?.filter;
   const filter = Array.isArray(filterValue) ? filterValue[0] ?? "active" : filterValue ?? "active";

   var loadingError = false;
   var showsResult = await CmsApiService.Show.listShowsPaginated(1, filter).catch((error) => {
      console.error("Error fetching shows:", error);
      loadingError = true;
      return null;
   });

   return (<ShowsPage shows={showsResult?.shows || []} totalCount={showsResult?.totalCount || 0} loadingError={loadingError} />);
};

export default Shows;
export const dynamic = "force-dynamic";