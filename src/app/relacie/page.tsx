import React, { useState } from "react";
import CmsApiService from "@/services/cms-api-service";
import ShowsPage from "./ShowsPage";

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